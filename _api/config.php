<?php
// Загружаем секреты из папки ВНЕ public_html — пароли недоступны через HTTP
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
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/^Bearer\s+(.+)$/i', $h, $m)) return $m[1];
    return null;
}

// ── IP whitelist ───────────────────────────────────────────────────────────────
define('ALLOWED_IPS', [
    '77.222.62.71',   // Spaceweb server
    '127.0.0.1',      // localhost
    '82.40.37.155',   // developer IP
    '91.146.6.151',   // developer IP
    '92.55.6.165',    // developer IP
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

/** Проверяет JWT, возвращает payload или завершает с 401 */
function require_auth(): array {
    $token = get_bearer();
    if (!$token) json_error('Требуется авторизация', 401);
    $payload = jwt_decode($token);
    if (!$payload) json_error('Токен недействителен или истёк', 401);
    return $payload;
}
