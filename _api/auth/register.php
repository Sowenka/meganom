<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

// ── Сезон закрыт — регистрация недоступна ──────────────────────────────────────
require_season_open();

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

$fullName = trim($body['fullName'] ?? '');
$email    = strtolower(trim($body['email']    ?? ''));
$password = $body['password'] ?? '';
$phone    = trim($body['phone'] ?? '');

if (!$fullName || mb_strlen($fullName) < 2) json_error('Введите имя (минимум 2 символа)');
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Некорректный email');
if (!$password || strlen($password) < 6) json_error('Пароль должен содержать минимум 6 символов');
if (mb_strlen($fullName) > 120) json_error('Имя слишком длинное');
if (mb_strlen($phone) > 30) json_error('Телефон слишком длинный');

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
// 152-ФЗ ч.1 ст.9: наличие согласия доказывает оператор.
$consent = consent_record($body);

try {
    $pdo = db();

    // Rate limiting: max 5 registration attempts per IP per 15 minutes
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
    )");
    if (rand(1, 20) === 1) {
        $pdo->exec("DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 hour'");
    }
    $rateCheck = $pdo->prepare("
        SELECT COUNT(*) FROM login_attempts
        WHERE ip = :ip AND attempted_at > NOW() - INTERVAL '15 minutes'
    ");
    $rateCheck->execute([':ip' => $ip]);
    if ((int)$rateCheck->fetchColumn() >= 5) {
        json_error('Слишком много попыток. Подождите 15 минут и попробуйте снова.', 429);
    }
    $pdo->prepare("INSERT INTO login_attempts (ip) VALUES (:ip)")->execute([':ip' => $ip]);

    // Ensure optional columns exist (idempotent)
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL');
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL');
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6) NULL');
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP NULL');
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE');
    // 152-ФЗ ч.1 ст.9: наличие согласия доказывает оператор.
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_pd_at TIMESTAMP NULL');
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_pd_ip VARCHAR(45) NULL');
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_pd_version VARCHAR(40) NULL');

    // Check email uniqueness
    $check = $pdo->prepare('SELECT id, is_verified FROM users WHERE email = :email');
    $check->execute([':email' => $email]);
    $existing = $check->fetch();

    if ($existing) {
        // If already verified - cannot re-register
        if (!empty($existing['is_verified'])) {
            json_error('Пользователь с таким email уже зарегистрирован', 409);
        }
        // If not verified yet - update code and resend email
        $code    = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = date('Y-m-d H:i:s', time() + 15 * 60);
        $hash    = password_hash($password, PASSWORD_BCRYPT);
        $upd = $pdo->prepare("
            UPDATE users
            SET name = :name, password_hash = :hash, phone = :phone,
                verification_code = :code, verification_expires_at = :expires, is_verified = FALSE,
                consent_pd_at = :consent_at, consent_pd_ip = :consent_ip,
                consent_pd_version = :consent_version
            WHERE id = :id
        ");
        $upd->execute([
            ':name'    => $fullName,
            ':hash'    => $hash,
            ':phone'   => $phone ?: null,
            ':code'    => $code,
            ':expires' => $expires,
            ':id'      => $existing['id'],
            ':consent_at'      => $consent['given'] ? $consent['at'] : null,
            ':consent_ip'      => $consent['given'] ? ($consent['ip'] ?: null) : null,
            ':consent_version' => $consent['given'] ? ($consent['version'] ?: null) : null,
        ]);
    } else {
        // New user - insert
        $code    = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = date('Y-m-d H:i:s', time() + 15 * 60); // 15 minutes
        $hash    = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            INSERT INTO users (email, password_hash, name, role, phone, verification_code,
                verification_expires_at, is_verified, consent_pd_at, consent_pd_ip, consent_pd_version)
            VALUES (:email, :hash, :name, 'guest', :phone, :code, :expires, FALSE,
                :consent_at, :consent_ip, :consent_version)
        ");
        $stmt->execute([
            ':email'   => $email,
            ':hash'    => $hash,
            ':name'    => $fullName,
            ':phone'   => $phone ?: null,
            ':code'    => $code,
            ':expires' => $expires,
            ':consent_at'      => $consent['given'] ? $consent['at'] : null,
            ':consent_ip'      => $consent['given'] ? ($consent['ip'] ?: null) : null,
            ':consent_version' => $consent['given'] ? ($consent['version'] ?: null) : null,
        ]);
    }

    // Send verification email
    $html = '<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Подтверждение email - Меганом Эко-дом</title>
</head>
<body style="margin:0;padding:0;background:#F0EDE6;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td style="background:#1B3A4B;border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C9A96E;font-family:Georgia,serif;">ЭКО ДОМ</p>
            <h1 style="margin:0;font-size:28px;font-weight:bold;color:#ffffff;font-family:Georgia,serif;letter-spacing:2px;">МЕГАНОМ</h1>
          </td>
        </tr>
        <tr><td style="background:#C9A96E;height:3px;"></td></tr>

        <tr>
          <td style="background:#ffffff;padding:40px;">
            <h2 style="margin:0 0 8px;font-size:22px;color:#1B3A4B;font-family:Georgia,serif;font-weight:bold;">Подтвердите ваш email</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#6B7280;font-family:Arial,sans-serif;">Здравствуйте, ' . e($fullName) . '! Для завершения регистрации введите код подтверждения:</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center" style="padding:32px;background:#F0EDE6;border-radius:16px;border:2px dashed #C9A96E;">
                  <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A96E;font-family:Arial,sans-serif;">Код подтверждения</p>
                  <p style="margin:0;font-size:48px;font-weight:bold;color:#1B3A4B;font-family:Georgia,serif;letter-spacing:12px;">' . e($code) . '</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#9CA3AF;font-family:Arial,sans-serif;">Код действителен 15 минут. Если вы не регистрировались на нашем сайте - проигнорируйте это письмо.</p>
          </td>
        </tr>

        <tr>
          <td style="background:#1B3A4B;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">© Меганом Эко-дом · meganom-eco.ru</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>';

    $mail = make_mailer($email, $fullName);
    $mail->Subject = 'Код подтверждения - Меганом Эко-дом';
    $mail->Body    = $html;
    $mail->AltBody = "Ваш код подтверждения: $code\n\nКод действителен 15 минут.";
    $mail->send();

    json_response(['ok' => true, 'pending' => true, 'email' => $email], 201);

} catch (\Exception $e) {
    json_error('Ошибка сервера. Попробуйте позже.', 500);
}
