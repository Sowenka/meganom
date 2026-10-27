<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

// ── Сезон закрыт - бронирование недоступно ─────────────────────────────────────
require_season_open();

// ── Auth required ─────────────────────────────────────────────────────────────
$authPayload = require_auth();
$userId = $authPayload['sub'];

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

// ── Валидация ─────────────────────────────────────────────────────────────────
$roomId     = trim($body['room_id']          ?? '');
$checkIn    = trim($body['check_in']         ?? '');
$checkOut   = trim($body['check_out']        ?? '');
$guests     = (int)($body['guests_count']    ?? 1);
$guestName  = trim($body['guest_name']       ?? '');
$guestEmail = trim($body['guest_email']      ?? '');
$guestPhone = trim($body['guest_phone']      ?? '');
$requests   = trim($body['special_requests'] ?? '');
// 152-ФЗ ч.1 ст.9: наличие согласия доказывает оператор.
$consent    = consent_record($body);
// total_price and nights are intentionally NOT read from client - calculated server-side

if (!$roomId)     json_error('Не выбран номер');
if (!$checkIn)    json_error('Укажите дату заезда');
if (!$checkOut)   json_error('Укажите дату выезда');

// Validate date format and logic
$ciDate = DateTime::createFromFormat('Y-m-d', $checkIn);
$coDate = DateTime::createFromFormat('Y-m-d', $checkOut);
if (!$ciDate || !$coDate) json_error('Некорректный формат дат');
if ($coDate <= $ciDate)   json_error('Дата выезда должна быть позже даты заезда');

$nights = (int)$ciDate->diff($coDate)->days;
if ($nights < 1)  json_error('Минимальный срок бронирования - 1 ночь');
if ($nights > 90) json_error('Максимальный срок бронирования - 90 ночей');

if (!$guestName)  json_error('Укажите имя');
if (!$guestEmail || !filter_var($guestEmail, FILTER_VALIDATE_EMAIL) || mb_strlen($guestEmail) > 254) json_error('Некорректный email');
if ($guests < 1)  json_error('Укажите количество гостей');
if (mb_strlen($guestName) > 120)  json_error('Имя слишком длинное');
if (mb_strlen($guestPhone) > 30)  json_error('Телефон слишком длинный');
if (mb_strlen($requests) > 2000)  json_error('Пожелания слишком длинные (максимум 2000 символов)');

// Каждая заявка шлёт два письма (отелю и на guest_email) и занимает даты в календаре.
rate_limit('booking', (string)$userId, 5, 60);

try {
    $pdo = db();

    $pdo->exec('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS consent_pd_at TIMESTAMP NULL');
    $pdo->exec('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS consent_pd_ip VARCHAR(45) NULL');
    $pdo->exec('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS consent_pd_version VARCHAR(40) NULL');

    // ── Проверяем номер и считаем цену на сервере ─────────────────────────────
    $roomStmt = $pdo->prepare("
        SELECT id, title, price_per_night, capacity
        FROM rooms
        WHERE id = :id AND is_active = TRUE
    ");
    $roomStmt->execute([':id' => $roomId]);
    $room = $roomStmt->fetch();

    if (!$room) json_error('Номер не найден или недоступен', 404);
    if ($guests > (int)$room['capacity']) {
        json_error('Количество гостей превышает вместимость номера (' . $room['capacity'] . ' чел.)', 400);
    }

    // Server-side price - client value is ignored
    $totalPrice = round((float)$room['price_per_night'] * $nights, 2);
    $roomTitle  = $room['title'];

    // ── Проверка доступности дат ──────────────────────────────────────────────
    $avail = $pdo->prepare("
        SELECT COUNT(*) AS cnt FROM bookings
        WHERE room_id = :room_id
          AND status NOT IN ('cancelled')
          AND check_in  < :check_out
          AND check_out > :check_in
    ");
    $avail->execute([
        ':room_id'   => $roomId,
        ':check_in'  => $checkIn,
        ':check_out' => $checkOut,
    ]);
    if ((int)$avail->fetchColumn() > 0) {
        json_error('Выбранные даты уже заняты. Пожалуйста, выберите другие даты.', 409);
    }

    // ── Сохраняем в БД ────────────────────────────────────────────────────────
    $stmt = $pdo->prepare("
        INSERT INTO bookings
            (room_id, user_id, check_in, check_out, guests_count, total_price, nights,
             status, payment_status, guest_name, guest_email, guest_phone, special_requests,
             consent_pd_at, consent_pd_ip, consent_pd_version)
        VALUES
            (:room_id, :user_id, :check_in, :check_out, :guests, :total_price, :nights,
             'pending', 'unpaid', :guest_name, :guest_email, :guest_phone, :requests,
             :consent_at, :consent_ip, :consent_version)
        RETURNING id, booking_number, created_at
    ");
    $stmt->execute([
        ':room_id'     => $roomId,
        ':user_id'     => $userId,
        ':check_in'    => $checkIn,
        ':check_out'   => $checkOut,
        ':guests'      => $guests,
        ':total_price' => $totalPrice,
        ':nights'      => $nights,
        ':guest_name'  => $guestName,
        ':guest_email' => $guestEmail,
        ':guest_phone' => $guestPhone ?: null,
        ':requests'    => $requests   ?: null,
        ':consent_at'      => $consent['given'] ? $consent['at'] : null,
        ':consent_ip'      => $consent['given'] ? ($consent['ip'] ?: null) : null,
        ':consent_version' => $consent['given'] ? ($consent['version'] ?: null) : null,
    ]);
    $booking = $stmt->fetch();

} catch (\Exception $ex) {
    json_error('Ошибка сохранения бронирования. Попробуйте позже.', 500);
}

$bookingId = $booking['id'];

// ── Email helper ──────────────────────────────────────────────────────────────
function booking_table(string $bookingId, string $roomTitle, string $checkIn,
    string $checkOut, int $nights, int $guests, float $totalPrice,
    string $guestName, string $guestEmail, string $guestPhone, string $requests): string
{
    $phone = $guestPhone ?: '-';
    $req   = $requests   ?: '-';
    $price = number_format($totalPrice, 0, '.', ' ') . ' ₽';
    $checkInF  = date('d.m.Y', strtotime($checkIn));
    $checkOutF = date('d.m.Y', strtotime($checkOut));
    $id = '#' . strtoupper(substr($bookingId, 0, 8));

    return '
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;vertical-align:top;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Номер брони</p>
          <p style="margin:0;font-size:14px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">' . e($id) . '</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;vertical-align:top;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Домик</p>
          <p style="margin:0;font-size:14px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">' . e($roomTitle) . '</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Заезд (с 14:00)</p>
          <p style="margin:0;font-size:16px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">' . e($checkInF) . '</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Выезд (до 12:00)</p>
          <p style="margin:0;font-size:16px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">' . e($checkOutF) . '</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Ночей / Гостей</p>
          <p style="margin:0;font-size:15px;color:#2C2C2C;font-family:Arial,sans-serif;">' . $nights . ' ночей, ' . $guests . ' гост.</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding:12px 16px;background:#C9A96E;border-radius:10px;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#ffffff90;font-family:Arial,sans-serif;">Сумма</p>
          <p style="margin:0;font-size:18px;color:#ffffff;font-family:Georgia,serif;font-weight:bold;">' . $price . '</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Гость</p>
          <p style="margin:0;font-size:14px;color:#2C2C2C;font-family:Arial,sans-serif;">' . e($guestName) . '</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Телефон</p>
          <p style="margin:0;font-size:14px;color:#2C2C2C;font-family:Arial,sans-serif;">' . e($phone) . '</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Email гостя</p>
          <p style="margin:0;font-size:14px;color:#2C2C2C;font-family:Arial,sans-serif;">' . e($guestEmail) . '</p>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #C9A96E;">
          <p style="margin:0 0 2px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Пожелания</p>
          <p style="margin:0;font-size:14px;color:#2C2C2C;font-family:Arial,sans-serif;">' . e($req) . '</p>
        </td>
      </tr>
    </table>';
}

function wrap_email(string $title, string $subtitle, string $body, string $cta = ''): string {
    return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0EDE6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#1B3A4B;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C9A96E;font-family:Georgia,serif;">ЭКО ДОМ</p>
          <h1 style="margin:0;font-size:28px;font-weight:bold;color:#fff;font-family:Georgia,serif;letter-spacing:2px;">МЕГАНОМ</h1>
        </td></tr>
        <tr><td style="background:#C9A96E;height:3px;"></td></tr>
        <tr><td style="background:#fff;padding:40px;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">' . $title . '</h2>
          <p style="margin:0 0 28px;font-size:13px;color:#9CA3AF;font-family:Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">' . $subtitle . '</p>
          ' . $body . $cta . '
        </td></tr>
        <tr><td style="background:#1B3A4B;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#fff;font-family:Georgia,serif;">Меганом Эко-дом · мыс Меганом, Крым</p>
          <p style="margin:0;font-size:11px;color:#ffffff50;font-family:Arial,sans-serif;">meganom-eco.ru · booking@meganom-eco.ru</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>';
}

$table = booking_table($bookingId, $roomTitle, $checkIn, $checkOut,
    $nights, $guests, $totalPrice, $guestName, $guestEmail, $guestPhone, $requests);

$staffCta = '<div style="margin-top:28px;text-align:center;">
  <a href="mailto:' . e($guestEmail) . '" style="display:inline-block;background:#C9A96E;color:#fff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:1px;">Связаться с гостем</a>
</div>';

$guestIntro = '<p style="margin:0 0 24px;font-size:15px;color:#2C2C2C;font-family:Arial,sans-serif;line-height:1.7;">
  Здравствуйте, <strong>' . e($guestName) . '</strong>!<br>
  Ваша заявка принята. Наш менеджер свяжется с вами в ближайшее время для подтверждения.
</p>';
$guestCta = '';

$staffHtml = wrap_email('Новое бронирование!', 'Поступила заявка · meganom-eco.ru',
    $table . consent_email_block($consent), $staffCta);
$guestHtml = wrap_email('Ваша заявка принята!', 'Подтверждение бронирования · meganom-eco.ru', $guestIntro . $table, $guestCta);

$mailErrors = [];

try {
    $mail = make_mailer(MAIL_TO_BOOKING, 'Меганом Бронирование');
    $mail->addReplyTo($guestEmail, $guestName);
    $mail->Subject = 'Новое бронирование: ' . $roomTitle . ' с ' . date('d.m.Y', strtotime($checkIn));
    $mail->Body    = $staffHtml;
    $mail->AltBody = "Новое бронирование!\nГость: $guestName\nEmail: $guestEmail\nЗаезд: $checkIn\nВыезд: $checkOut\nНомер: $roomTitle\nСумма: $totalPrice руб.";
    $mail->send();
} catch (\Exception $ex) { $mailErrors[] = 'staff_mail'; }

try {
    $mail = make_mailer($guestEmail, $guestName);
    $mail->addReplyTo(MAIL_TO_BOOKING, 'Меганом Эко-дом');
    $mail->Subject = 'Ваша заявка принята - Меганом Эко-дом';
    $mail->Body    = $guestHtml;
    $mail->AltBody = "Здравствуйте, $guestName! Ваша заявка принята.\nЗаезд: $checkIn, выезд: $checkOut\nДомик: $roomTitle";
    $mail->send();
} catch (\Exception $ex) { $mailErrors[] = 'guest_mail'; }

json_response([
    'ok'         => true,
    'booking_id' => $bookingId,
    'mail_errors'=> $mailErrors,
]);
