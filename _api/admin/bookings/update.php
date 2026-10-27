<?php
require_once dirname(dirname(__DIR__)) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

require_admin();

$body      = json_decode(file_get_contents('php://input'), true) ?? [];
$bookingId = trim($body['booking_id'] ?? '');

if (!$bookingId) json_error('booking_id обязателен', 400);

$validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
$validPayments = ['unpaid', 'paid', 'refunded'];

$sets   = [];
$params = [':id' => $bookingId];

if (isset($body['status'])) {
    if (!in_array($body['status'], $validStatuses, true)) json_error('Недопустимый статус', 400);
    $sets[]            = 'status = :status';
    $params[':status'] = $body['status'];
}

if (isset($body['payment_status'])) {
    if (!in_array($body['payment_status'], $validPayments, true)) json_error('Недопустимый статус оплаты', 400);
    $sets[]                   = 'payment_status = :payment_status';
    $params[':payment_status'] = $body['payment_status'];
}

if (empty($sets)) json_error('Нечего обновлять', 400);

try {
    $pdo  = db();
    $sql  = 'UPDATE bookings SET ' . implode(', ', $sets) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) json_error('Бронирование не найдено', 404);

    json_response(['ok' => true]);

} catch (\Exception $e) {
    json_error('Внутренняя ошибка сервера', 500);
}
