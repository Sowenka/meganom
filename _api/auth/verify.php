<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

$email = strtolower(trim($body['email'] ?? ''));
$code  = trim($body['code'] ?? '');

if (!$email || !$code) json_error('Укажите email и код подтверждения');

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

try {
    $pdo = db();

    // Rate limiting: max 10 code attempts per IP per 15 minutes
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
    )");
    $rateCheck = $pdo->prepare("
        SELECT COUNT(*) FROM login_attempts
        WHERE ip = :ip AND attempted_at > NOW() - INTERVAL '15 minutes'
    ");
    $rateCheck->execute([':ip' => $ip]);
    if ((int)$rateCheck->fetchColumn() >= 10) {
        json_error('Слишком много попыток. Подождите 15 минут.', 429);
    }

    $stmt = $pdo->prepare('
        SELECT id, email, name, role, is_verified, verification_code, verification_expires_at
        FROM users WHERE email = :email
    ');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user) json_error('Пользователь не найден', 404);

    if ($user['is_verified']) json_error('Email уже подтверждён. Войдите в аккаунт.', 409);

    if ($user['verification_code'] !== $code) {
        // Record failed attempt
        $pdo->prepare("INSERT INTO login_attempts (ip) VALUES (:ip)")->execute([':ip' => $ip]);
        json_error('Неверный код подтверждения', 400);
    }

    if (!$user['verification_expires_at'] || strtotime($user['verification_expires_at']) < time()) {
        json_error('Срок действия кода истёк. Зарегистрируйтесь снова.', 410);
    }

    // Clear attempts on success
    $pdo->prepare("DELETE FROM login_attempts WHERE ip = :ip")->execute([':ip' => $ip]);

    // Confirm user
    $upd = $pdo->prepare("
        UPDATE users
        SET is_verified = TRUE, verification_code = NULL, verification_expires_at = NULL
        WHERE id = :id
        RETURNING id, email, name, role, phone, avatar_url, created_at
    ");
    $upd->execute([':id' => $user['id']]);
    $confirmed = $upd->fetch();

    $token = jwt_encode([
        'sub'   => $confirmed['id'],
        'email' => $confirmed['email'],
        'name'  => $confirmed['name'],
        'role'  => $confirmed['role'],
        'exp'   => time() + JWT_TTL,
    ]);

    json_response([
        'ok'    => true,
        'token' => $token,
        'user'  => [
            'id'         => $confirmed['id'],
            'email'      => $confirmed['email'],
            'name'       => $confirmed['name'],
            'full_name'  => $confirmed['name'],
            'role'       => $confirmed['role'],
            'phone'      => $confirmed['phone'],
            'avatar_url' => $confirmed['avatar_url'],
            'created_at' => $confirmed['created_at'],
        ],
    ]);

} catch (\Exception $e) {
    json_error('Ошибка сервера. Попробуйте позже.', 500);
}
