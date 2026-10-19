<?php
// Загружаем секреты из папки ВНЕ public_html - пароли недоступны через HTTP
$secrets = @include rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/../.secrets/config.php';
if (!is_array($secrets)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

define('SMTP_HOST',       $secrets['SMTP_HOST']);
define('SMTP_PORT',       $secrets['SMTP_PORT']);
define('SMTP_SECURE',     $secrets['SMTP_SECURE']);
define('SMTP_USER',       $secrets['SMTP_USER']);
define('SMTP_PASS',       $secrets['SMTP_PASS']);
define('MAIL_FROM',       $secrets['MAIL_FROM']);
define('MAIL_TO_INFO',    $secrets['MAIL_TO_INFO']);
define('MAIL_TO_BOOKING', $secrets['MAIL_TO_BOOKING']);
define('DB_DSN',          $secrets['DB_DSN']);
define('DB_USER',         $secrets['DB_USER']);
define('DB_PASS',         $secrets['DB_PASS']);
define('JWT_SECRET',      $secrets['JWT_SECRET']);
define('JWT_TTL',         30 * 24 * 3600); // 30 дней

// ── Сезон ───────────────────────────────────────────────────────────────────
// false — отель закрыт: бронирование и регистрация заблокированы на сервере.
// Дублирует фронтовый флаг SEASON_OPEN в src/lib/constants.js (значения должны совпадать).
define('SEASON_OPEN', false);

// PHPMailer
require_once __DIR__ . '/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/phpmailer/src/SMTP.php';
require_once __DIR__ . '/phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;

// ── Helpers ───────────────────────────────────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if (!$pdo) {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function json_response(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $code = 400): void {
    json_response(['error' => $message], $code);
}

function cors(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

function make_mailer(string $toEmail, string $toName = ''): PHPMailer {
    $mail = new PHPMailer(true);
    $mail->CharSet   = 'UTF-8';
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;
    if (preg_match('/^(.+?)\s*<([^>]+)>$/', MAIL_FROM, $m)) {
        $mail->setFrom(trim($m[2]), trim($m[1]));
    } else {
        $mail->setFrom(MAIL_FROM);
    }
    $mail->addAddress($toEmail, $toName);
    $mail->isHTML(true);
    return $mail;
}

function e(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

// ── Согласие на обработку персональных данных (152-ФЗ) ────────────────────────
// Часть 1 статьи 9: доказывать наличие согласия обязан оператор. Поэтому вместе
// с заявкой фиксируем момент, источник и редакцию документа, с которой
// согласился пользователь. Время и IP берутся на сервере, клиенту не доверяем.

/** Реальный IP клиента: nginx на хостинге проксирует запрос к Apache. */
function client_ip(): string {
    $xff = trim((string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''));
    if ($xff !== '') {
        $first = trim(explode(',', $xff)[0]);
        if (filter_var($first, FILTER_VALIDATE_IP)) return $first;
    }
    return (string)($_SERVER['REMOTE_ADDR'] ?? '');
}

/** Нормализует переданный клиентом факт согласия в запись для журнала. */
function consent_record(array $body): array {
    return [
        'given'   => !empty($body['consent_given']),
        'version' => mb_substr(trim((string)($body['consent_version'] ?? '')), 0, 40),
        'ip'      => mb_substr(client_ip(), 0, 45),
        'agent'   => mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
        'at'      => date('Y-m-d H:i:s'),
    ];
}

/** Блок подтверждения согласия для письма оператору. */
function consent_email_block(array $c): string {
    $status  = $c['given'] ? 'Дано' : 'НЕ ЗАФИКСИРОВАНО';
    $version = $c['version'] !== '' ? $c['version'] : '-';
    $ip      = $c['ip'] !== '' ? $c['ip'] : '-';

    return '
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
      <tr>
        <td style="padding:12px 16px;background:#FAFAF7;border-radius:10px;border-left:3px solid #1B3A4B;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#1B3A4B;font-family:Arial,sans-serif;">Согласие на обработку персональных данных</p>
          <p style="margin:0;font-size:13px;color:#2C2C2C;font-family:Arial,sans-serif;line-height:1.6;">
            Статус: <strong>' . e($status) . '</strong><br>
            Дата и время: ' . e($c['at']) . '<br>
            IP-адрес: ' . e($ip) . '<br>
            Редакция документа: ' . e($version) . '
          </p>
        </td>
      </tr>
    </table>';
}

// ── JWT ───────────────────────────────────────────────────────────────────────
function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload): string {
    $header  = b64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = b64url_encode(json_encode($payload));
    $sig     = b64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function jwt_decode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $payload, $sig] = $parts;
    $expected = b64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $data = json_decode(b64url_decode($payload), true);
    if (!is_array($data)) return null;
    if (isset($data['exp']) && $data['exp'] < time()) return null;
    return $data;
}

function get_bearer(): ?string {
    // Apache on shared hosting often strips Authorization header.
    // Check all known locations where it might land.
    $h = $_SERVER['HTTP_AUTHORIZATION']
      ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
      ?? apache_request_headers()['Authorization']
      ?? apache_request_headers()['authorization']
      ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $h, $m)) return $m[1];
    return null;
}

// ── IP whitelist ───────────────────────────────────────────────────────────────
define('ALLOWED_IPS', [
    '77.222.40.4',    // Spaceweb server
    '127.0.0.1',      // localhost
    '82.40.37.155',   // developer IP
    '91.146.6.151',   // developer IP
    '92.55.6.165',    // developer IP
]);

// Admin panel: allowed IPs only
define('ADMIN_IPS', [
    '155.212.6.85',
    '92.241.231.106',
    '82.38.67.212',
    '82.40.37.155',
    '127.0.0.1',
    '77.222.40.4',
]);

function get_client_ip(): string {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    if (str_contains($ip, ',')) {
        $ip = trim(explode(',', $ip)[0]);
    }
    return $ip;
}

function ip_allowed(string $ip): bool {
    foreach (ALLOWED_IPS as $allowed) {
        if (str_contains($allowed, '/')) {
            // CIDR range check
            [$subnet, $bits] = explode('/', $allowed);
            $ipLong     = ip2long($ip);
            $subnetLong = ip2long($subnet);
            $mask       = -1 << (32 - (int)$bits);
            if ($ipLong !== false && ($ipLong & $mask) === ($subnetLong & $mask)) return true;
        } elseif ($ip === $allowed) {
            return true;
        }
    }
    return false;
}

/** Разрешить только с доверенных IP, иначе 403 */
function require_ip(): void {
    if (!ip_allowed(get_client_ip())) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

/** Сезон закрыт — блокируем операцию (бронирование/регистрация) с 403 */
function require_season_open(): void {
    if (!SEASON_OPEN) {
        json_error('Отель закрыт на сезон. Операция временно недоступна.', 403);
    }
}

/** Проверяет JWT, возвращает payload или завершает с 401 */
function require_auth(): array {
    $token = get_bearer();
    if (!$token) json_error('Требуется авторизация', 401);
    $payload = jwt_decode($token);
    if (!$payload) json_error('Токен недействителен или истёк', 401);
    return $payload;
}

function ip_allowed_admin(string $ip): bool {
    foreach (ADMIN_IPS as $allowed) {
        if ($ip === $allowed) return true;
    }
    return false;
}

/** Разрешить доступ к admin только с доверенных IP, иначе 403 */
function require_admin_ip(): void {
    if (!ip_allowed_admin(get_client_ip())) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

/** Проверяет JWT + роль admin + IP whitelist, завершает с 401/403 если нет прав */
function require_admin(): array {
    require_admin_ip();
    $payload = require_auth();
    if (($payload['role'] ?? '') !== 'admin') json_error('Недостаточно прав', 403);
    return $payload;
}
