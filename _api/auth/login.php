<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

$email    = strtolower(trim($body['email']    ?? ''));
$password = $body['password'] ?? '';

if (!$email || !$password) json_error('Введите email и пароль');

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

try {
    $pdo = db();

    // ── Rate limiting: max 5 failed attempts per IP per 15 minutes ────────────
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
    )");

    // Cleanup old records (older than 1 hour) — runs occasionally
    if (rand(1, 20) === 1) {
        $pdo->exec("DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 hour'");
    }

    $rateCheck = $pdo->prepare("
        SELECT COUNT(*) FROM login_attempts
        WHERE ip = :ip AND attempted_at > NOW() - INTERVAL '15 minutes'
    ");
    $rateCheck->execute([':ip' => $ip]);
    if ((int)$rateCheck->fetchColumn() >= 5) {
        json_error('Слишком много попыток входа. Подождите 15 минут и попробуйте снова.', 429);
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    $stmt = $pdo->prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = :email');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Record failed attempt
        $pdo->prepare("INSERT INTO login_attempts (ip) VALUES (:ip)")->execute([':ip' => $ip]);
        json_error('Неверный email или пароль', 401);
    }

    // Successful login — clear attempts for this IP
    $pdo->prepare("DELETE FROM login_attempts WHERE ip = :ip")->execute([':ip' => $ip]);

    $token = jwt_encode([
        'sub'   => $user['id'],
        'email' => $user['email'],
        'name'  => $user['name'],
        'role'  => $user['role'],
        'exp'   => time() + JWT_TTL,
    ]);

    json_response([
        'ok'    => true,
        'token' => $token,
        'user'  => [
            'id'    => $user['id'],
            'email' => $user['email'],
            'name'  => $user['name'],
            'role'  => $user['role'],
        ],
    ]);

} catch (\Exception $e) {
    json_error('Ошибка сервера. Попробуйте позже.', 500);
}
