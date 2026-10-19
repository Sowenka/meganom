<?php
require_once dirname(dirname(__DIR__)) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

require_admin();

$body      = json_decode(file_get_contents('php://input'), true) ?? [];
$bookingId = trim($body['booking_id'] ?? '');

if (!$bookingId) json_error('booking_id обязателен', 400);

try {
    $pdo  = db();
    $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = :id');
    $stmt->execute([':id' => $bookingId]);

    if ($stmt->rowCount() === 0) json_error('Бронирование не найдено', 404);

    json_response(['ok' => true]);

} catch (\Exception $e) {
    json_error('Ошибка сервера: ' . $e->getMessage(), 500);
}
