<?php
require_once dirname(dirname(__DIR__)) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

require_admin();

try {
    $pdo = db();

    $status = $_GET['status'] ?? '';
    $validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    $where = '';
    $params = [];
    if ($status && in_array($status, $validStatuses, true)) {
        $where = 'WHERE b.status = :status';
        $params[':status'] = $status;
    }

    $stmt = $pdo->prepare("
        SELECT
            b.id, b.booking_number, b.check_in, b.check_out, b.guests_count,
            b.total_price, b.nights, b.status, b.payment_status,
            b.guest_name, b.guest_email, b.guest_phone,
            b.special_requests, b.created_at,
            r.title AS room_title,
            u.name  AS user_name,
            u.email AS user_email
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        LEFT JOIN users u ON b.user_id = u.id
        $where
        ORDER BY b.created_at DESC
    ");
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();
    foreach ($bookings as &$row) {
        $row['total_price'] = (float) $row['total_price'];
        $row['nights']      = (int) $row['nights'];
        $row['guests_count'] = (int) $row['guests_count'];
    }

    json_response(['ok' => true, 'bookings' => $bookings]);

} catch (\Exception $e) {
    json_error('Внутренняя ошибка сервера', 500);
}
