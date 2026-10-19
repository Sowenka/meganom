<?php
// Migration: add booking_number sequential column to bookings table
// Run ONCE: https://meganom-eco.ru/api/setup/add-booking-number.php
require_once dirname(__DIR__) . '/config.php';

try {
    $pdo = db();

    $pdo->exec("
        DO \$\$ BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'bookings' AND column_name = 'booking_number'
            ) THEN
                CREATE SEQUENCE IF NOT EXISTS bookings_booking_number_seq START 1;
                ALTER TABLE bookings
                    ADD COLUMN booking_number INTEGER DEFAULT nextval('bookings_booking_number_seq');
                ALTER SEQUENCE bookings_booking_number_seq
                    OWNED BY bookings.booking_number;
                -- Assign numbers to existing bookings ordered by creation date
                UPDATE bookings b
                SET booking_number = sub.rn
                FROM (
                    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
                    FROM bookings
                ) sub
                WHERE b.id = sub.id;
                -- Set sequence to continue after existing max
                PERFORM setval('bookings_booking_number_seq',
                    COALESCE((SELECT MAX(booking_number) FROM bookings), 0) + 1, false);
                ALTER TABLE bookings ALTER COLUMN booking_number SET NOT NULL;
            END IF;
        END \$\$;
    ");

    $count = $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
    $max   = $pdo->query("SELECT COALESCE(MAX(booking_number), 0) FROM bookings")->fetchColumn();
    json_response(['ok' => true, 'message' => 'booking_number column ready', 'bookings' => (int)$count, 'max_number' => (int)$max]);

} catch (\Exception $e) {
    json_error('Migration failed: ' . $e->getMessage(), 500);
}
