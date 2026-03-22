<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$payload = require_auth();

try {
    $pdo  = db();
    $stmt = $pdo->prepare("
        SELECT
            b.id, b.check_in, b.check_out, b.guests_count, b.total_price,
            b.nights, b.status, b.payment_status, b.special_requests, b.created_at,
            r.title AS room_title,
            r.slug  AS room_slug
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.user_id = :user_id
        ORDER BY b.created_at DESC
    ");
    $stmt->execute([':user_id' => $payload['sub']]);
    $bookings = $stmt->fetchAll();

    json_response(['ok' => true, 'bookings' => $bookings]);

} catch (\Exception $e) {
    json_error('Ошибка сервера', 500);
}
