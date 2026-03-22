<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$payload = require_auth();

$body  = json_decode(file_get_contents('php://input'), true);
if (!$body) json_error('Invalid JSON');

$name  = trim($body['name']  ?? '');
$phone = trim($body['phone'] ?? '');

if (!$name || mb_strlen($name) < 2) json_error('Введите имя (минимум 2 символа)');

try {
    $pdo = db();

    // Ensure phone column exists
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL');

    $stmt = $pdo->prepare("
        UPDATE users SET name = :name, phone = :phone
        WHERE id = :id
        RETURNING id, email, name, role, phone, created_at
    ");
    $stmt->execute([':name' => $name, ':phone' => $phone ?: null, ':id' => $payload['sub']]);
    $user = $stmt->fetch();

    if (!$user) json_error('Пользователь не найден', 404);

    json_response(['ok' => true, 'user' => [
        'id'         => $user['id'],
        'email'      => $user['email'],
        'name'       => $user['name'],
        'full_name'  => $user['name'],
        'role'       => $user['role'],
        'phone'      => $user['phone'],
        'created_at' => $user['created_at'],
    ]]);

} catch (\Exception $e) {
    json_error('Ошибка сервера', 500);
}
