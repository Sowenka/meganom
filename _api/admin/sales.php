<?php
require_once dirname(__DIR__) . '/config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

require_admin();

try {
    $pdo = db();

    $totalRevenue = (float) $pdo->query("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE status != 'cancelled'")->fetchColumn();
    $paidRevenue  = (float) $pdo->query("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE payment_status = 'paid'")->fetchColumn();
    $unpaidRevenue = (float) $pdo->query("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE payment_status = 'unpaid' AND status != 'cancelled'")->fetchColumn();

    // Revenue by month (last 12 months)
    $stmt = $pdo->query("
        SELECT
            to_char(created_at, 'YYYY-MM') AS month,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) AS revenue
        FROM bookings
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY month
        ORDER BY month ASC
    ");
    $revenueByMonth = [];
    foreach ($stmt->fetchAll() as $row) {
        $revenueByMonth[] = ['month' => $row['month'], 'revenue' => (float) $row['revenue']];
    }

    // Top rooms by revenue
    $stmt = $pdo->query("
        SELECT
            r.title,
            COUNT(b.id) AS bookings_count,
            COALESCE(SUM(b.total_price), 0) AS revenue
        FROM bookings b
        JOIN rooms r ON b.room_id = r.id
        WHERE b.status != 'cancelled'
        GROUP BY r.id, r.title
        ORDER BY revenue DESC
    ");
    $topRooms = [];
    foreach ($stmt->fetchAll() as $row) {
        $topRooms[] = [
            'title'          => $row['title'],
            'bookings_count' => (int) $row['bookings_count'],
            'revenue'        => (float) $row['revenue'],
        ];
    }

    json_response([
        'ok'              => true,
        'total_revenue'   => $totalRevenue,
        'paid_revenue'    => $paidRevenue,
        'unpaid_revenue'  => $unpaidRevenue,
        'revenue_by_month' => $revenueByMonth,
        'top_rooms'        => $topRooms,
    ]);

} catch (\Exception $e) {
    json_error('Внутренняя ошибка сервера', 500);
}
