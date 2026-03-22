<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$payload = require_auth();

try {
    $pdo  = db();
    // Ensure phone column exists (idempotent)
    $pdo->exec('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL');

    $stmt = $pdo->prepare('SELECT id, email, name, role, phone, created_at FROM users WHERE id = :id');
    $stmt->execute([':id' => $payload['sub']]);
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
