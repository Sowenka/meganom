<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$checkIn  = trim($_GET['check_in']  ?? '');
$checkOut = trim($_GET['check_out'] ?? '');
$guests   = (int) ($_GET['guests']  ?? 1);

if (!$checkIn || !$checkOut) json_error('check_in и check_out обязательны', 400);
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkIn) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkOut)) {
    json_error('Формат даты: YYYY-MM-DD', 400);
}
if ($checkOut <= $checkIn) json_error('check_out должен быть позже check_in', 400);

try {
    $pdo = db();

    // IDs занятых номеров на выбранный период
    $stmt = $pdo->prepare("
        SELECT DISTINCT room_id
        FROM bookings
        WHERE status NOT IN ('cancelled')
          AND check_in  < :check_out
          AND check_out > :check_in
    ");
    $stmt->execute([':check_in' => $checkIn, ':check_out' => $checkOut]);
    $bookedIds = array_column($stmt->fetchAll(), 'room_id');

    // Все активные номера
    $stmt = $pdo->query("SELECT id, capacity FROM rooms WHERE is_active = TRUE");
    $rooms = $stmt->fetchAll();

    $result = [];
    foreach ($rooms as $room) {
        $result[$room['id']] = [
            'available'       => !in_array($room['id'], $bookedIds, true),
            'enough_capacity' => (int) $room['capacity'] >= $guests,
        ];
    }

    json_response(['ok' => true, 'availability' => $result]);

} catch (\Exception $e) {
    json_error('Внутренняя ошибка сервера', 500);
}
