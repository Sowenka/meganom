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
    ['room-1', 'veter-peremen-myata', '«Ветер Перемен» - 3-комн. эко-дом (Мятная территория)', 10000.00, 6],
    ['room-2', 'veter-peremen-med',   '«Ветер Перемен» - 3-комн. эко-дом (Медовая территория)', 10000.00, 6],
    ['room-3', 'shale',               '«Шале» - 2-комн. эко-дом с террасой',                    7500.00,  4],
    ['room-4', 'kvartet-grand',       '«Квартет Гранд» - стандартный эко-номер с балконом',      5500.00,  2],
    ['room-5', 'standart-kuhnya',     'Стандартный номер с общей кухней',                        5000.00,  3],
    ['room-6', 'standart-balkon',     'Стандартный номер с балконом',                            6000.00,  4],
    ['room-7', 'semeynyy-balkon',     'Семейный двухкомнатный номер с балконом',                 7000.00,  4],
    ['room-8', 'semeynyy-topcan',     'Семейный двухкомнатный номер с топчаном',                 7000.00,  5],
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
