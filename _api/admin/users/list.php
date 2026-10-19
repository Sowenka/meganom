<?php
require_once dirname(dirname(__DIR__)) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

require_admin();

try {
    $pdo = db();

    $stmt = $pdo->query("
        SELECT
            u.id, u.email, u.name, u.role, u.phone,
            u.avatar_url, u.created_at, u.is_verified,
            (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) AS bookings_count
        FROM users u
        ORDER BY u.created_at DESC
    ");
    $users = $stmt->fetchAll();
    foreach ($users as &$row) {
        $row['bookings_count'] = (int) $row['bookings_count'];
        $row['is_verified']    = (bool) $row['is_verified'];
    }

    json_response(['ok' => true, 'users' => $users]);

} catch (\Exception $e) {
    json_error('Ошибка сервера: ' . $e->getMessage(), 500);
}
