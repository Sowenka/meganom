<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

require_admin();

try {
    $pdo = db();

    // Totals
    $totalUsers    = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $totalBookings = (int) $pdo->query('SELECT COUNT(*) FROM bookings')->fetchColumn();
    $totalRevenue  = (float) $pdo->query("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE status != 'cancelled'")->fetchColumn();
    $pendingBookings = (int) $pdo->query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'")->fetchColumn();

    // Bookings by status
    $stmt = $pdo->query("
        SELECT status, COUNT(*) AS cnt
        FROM bookings
        GROUP BY status
    ");
    $byStatus = ['pending' => 0, 'confirmed' => 0, 'completed' => 0, 'cancelled' => 0];
    foreach ($stmt->fetchAll() as $row) {
        $byStatus[$row['status']] = (int) $row['cnt'];
    }

    // Bookings + revenue by month (last 6 months)
    $stmt = $pdo->query("
        SELECT
            to_char(created_at, 'YYYY-MM') AS month,
            COUNT(*) AS cnt,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) AS revenue
        FROM bookings
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month ASC
    ");
    $byMonth = $stmt->fetchAll();
    foreach ($byMonth as &$row) {
        $row['count']   = (int) $row['cnt'];
        $row['revenue'] = (float) $row['revenue'];
        unset($row['cnt']);
    }

    // Recent 5 bookings
    $stmt = $pdo->query("
        SELECT
            b.id, b.guest_name, b.check_in, b.check_out, b.total_price,
            b.status, b.payment_status, b.created_at,
            r.title AS room_title
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        ORDER BY b.created_at DESC
        LIMIT 5
    ");
    $recentBookings = $stmt->fetchAll();
    foreach ($recentBookings as &$row) {
        $row['total_price'] = (float) $row['total_price'];
    }

    json_response([
        'ok'              => true,
        'total_users'     => $totalUsers,
        'total_bookings'  => $totalBookings,
        'total_revenue'   => $totalRevenue,
        'pending_bookings' => $pendingBookings,
        'bookings_by_status' => $byStatus,
        'bookings_by_month'  => $byMonth,
        'recent_bookings'    => $recentBookings,
    ]);

} catch (\Exception $e) {
    json_error('Внутренняя ошибка сервера', 500);
}
