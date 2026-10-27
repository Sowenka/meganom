<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

$email    = strtolower(trim($body['email'] ?? ''));
$code     = trim((string)($body['code'] ?? ''));
$password = (string)($body['password'] ?? '');

if (!$email || !$code || $password === '') json_error('Укажите email, код подтверждения и пароль');

// Код подтверждает только ту регистрацию, чей пароль сейчас записан в аккаунте.
// Иначе любой мог бы повторно зарегистрировать чужой неподтверждённый email со своим
// паролем, и владелец почты, введя пришедший ему код, подтвердил бы аккаунт злоумышленника.
const VERIFY_MAX_ATTEMPTS = 5;
// Один ответ на неизвестный email, неверный код и неверный пароль: по ответу нельзя
// понять, есть ли незавершённая регистрация.
const VERIFY_FAILED = 'Неверный код или пароль. После 5 ошибок код перестаёт действовать - тогда зарегистрируйтесь снова.';

$ip = client_ip();

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

    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_attempts INT NOT NULL DEFAULT 0');

    $stmt = $pdo->prepare('
        SELECT id, email, name, role, is_verified, password_hash,
               verification_code, verification_expires_at, verification_attempts
        FROM users WHERE email = :email
    ');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if ($user && $user['is_verified']) json_error('Email уже подтверждён. Войдите в аккаунт.', 409);

    $valid = $user
        && $user['verification_code'] !== null
        && (int)$user['verification_attempts'] < VERIFY_MAX_ATTEMPTS
        && hash_equals((string)$user['verification_code'], $code)
        && password_verify($password, $user['password_hash']);

    if (!$valid) {
        $pdo->prepare("INSERT INTO login_attempts (ip) VALUES (:ip)")->execute([':ip' => $ip]);
        if ($user) {
            $pdo->prepare('UPDATE users SET verification_attempts = verification_attempts + 1 WHERE id = :id')
                ->execute([':id' => $user['id']]);
        }
        json_error(VERIFY_FAILED, 400);
    }

    if (!$user['verification_expires_at'] || strtotime($user['verification_expires_at']) < time()) {
        json_error('Срок действия кода истёк. Зарегистрируйтесь снова.', 410);
    }

    // Clear attempts on success
    $pdo->prepare("DELETE FROM login_attempts WHERE ip = :ip")->execute([':ip' => $ip]);

    // Confirm user
    $upd = $pdo->prepare("
        UPDATE users
        SET is_verified = TRUE, verification_code = NULL, verification_expires_at = NULL,
            verification_attempts = 0
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
