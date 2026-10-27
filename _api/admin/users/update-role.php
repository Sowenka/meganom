<?php
require_once dirname(dirname(__DIR__)) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$payload = require_admin();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$userId = trim($body['user_id'] ?? '');
$role   = trim($body['role'] ?? '');

if (!$userId) json_error('user_id обязателен', 400);
if (!in_array($role, ['admin', 'user'], true)) json_error('Недопустимая роль', 400);
if ($userId === $payload['sub']) json_error('Нельзя изменить свою роль', 403);

try {
    $pdo  = db();
    $stmt = $pdo->prepare('UPDATE users SET role = :role WHERE id = :id');
    $stmt->execute([':role' => $role, ':id' => $userId]);

    if ($stmt->rowCount() === 0) json_error('Пользователь не найден', 404);

    json_response(['ok' => true]);

} catch (\Exception $e) {
    json_error('Внутренняя ошибка сервера', 500);
}
