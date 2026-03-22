<?php
/**
 * One-time setup: creates rooms + login_attempts tables and seeds room data.
 * Run once: GET /api/setup/init-rooms.php?key=INIT_SECRET
 * Delete or move outside public_html after use.
 */
require_once dirname(__DIR__) . '/config.php';

// Double protection: IP whitelist + secret key
require_ip();

$key = $_GET['key'] ?? '';
if (!hash_equals(JWT_SECRET, $key)) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$pdo = db();
$results = [];

// ── 1. rooms table ────────────────────────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS rooms (
        id              VARCHAR(50)    PRIMARY KEY,
        slug            VARCHAR(100)   UNIQUE NOT NULL,
        title           VARCHAR(255)   NOT NULL,
        price_per_night DECIMAL(10,2)  NOT NULL,
        capacity        INT            NOT NULL DEFAULT 2,
        is_active       BOOLEAN        NOT NULL DEFAULT TRUE
    )
");
$results[] = 'rooms table: OK';

// ── 2. Seed rooms (from static JS data) ───────────────────────────────────────
$rooms = [
    ['static-1', 'eco-standart', 'Эко-домик «Стандарт»',    4500.00, 2],
    ['static-2', 'eco-comfort',  'Эко-домик «Комфорт»',     6500.00, 3],
    ['static-3', 'eco-suite',    'Люкс «Панорама»',         9500.00, 4],
    ['static-4', 'eco-family',   'Семейный домик «Делюкс»', 12000.00, 6],
];

$insert = $pdo->prepare("
    INSERT INTO rooms (id, slug, title, price_per_night, capacity, is_active)
    VALUES (:id, :slug, :title, :price, :cap, TRUE)
    ON CONFLICT (id) DO UPDATE
      SET price_per_night = EXCLUDED.price_per_night,
          title           = EXCLUDED.title
");

foreach ($rooms as [$id, $slug, $title, $price, $cap]) {
    $insert->execute([':id' => $id, ':slug' => $slug, ':title' => $title, ':price' => $price, ':cap' => $cap]);
}
$results[] = 'rooms seeded: ' . count($rooms) . ' rows';

// ── 3. login_attempts table ───────────────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS login_attempts (
        id           SERIAL PRIMARY KEY,
        ip           VARCHAR(45)  NOT NULL,
        attempted_at TIMESTAMP    NOT NULL DEFAULT NOW()
    )
");
$pdo->exec("CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts (ip, attempted_at)");
$results[] = 'login_attempts table: OK';

json_response(['ok' => true, 'results' => $results]);
