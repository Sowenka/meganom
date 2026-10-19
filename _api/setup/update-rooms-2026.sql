-- =============================================================================
-- Migration: replace 4 placeholder rooms with 8 real ones
-- Run once on production DB via psql
-- =============================================================================

-- 1. Remove old placeholder rooms (real UUIDs from DB)
DELETE FROM bookings WHERE room_id IN (
  'c29cbb5b-894f-4858-92fb-2049cacfde04',
  '2f3dade2-6a70-41d2-9ace-4f4fff593e7d',
  '717e3558-30e4-4bd6-bbf8-fd194ee10070',
  '27ef296b-8ede-4819-a262-a7d77d379353'
);
DELETE FROM rooms WHERE id IN (
  'c29cbb5b-894f-4858-92fb-2049cacfde04',
  '2f3dade2-6a70-41d2-9ace-4f4fff593e7d',
  '717e3558-30e4-4bd6-bbf8-fd194ee10070',
  '27ef296b-8ede-4819-a262-a7d77d379353'
);

-- 2. Insert 8 real rooms
INSERT INTO rooms (id, slug, title, price_per_night, capacity, is_active) VALUES
  ('a1b2c3d4-e5f6-4789-ab01-100000000001', 'veter-peremen-myata', '«Ветер Перемен» - 3-комн. эко-дом (Мятная территория)', 10000.00, 6, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-200000000002', 'veter-peremen-med',   '«Ветер Перемен» - 3-комн. эко-дом (Медовая территория)', 10000.00, 6, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-300000000003', 'shale',               '«Шале» - 2-комн. эко-дом с террасой',                   7500.00,  4, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-400000000004', 'kvartet-grand',       '«Квартет Гранд» - стандартный эко-номер с балконом',     5500.00,  2, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-500000000005', 'standart-kuhnya',     'Стандартный номер с общей кухней',                       5000.00,  3, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-600000000006', 'standart-balkon',     'Стандартный номер с балконом',                           6000.00,  4, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-700000000007', 'semeynyy-balkon',     'Семейный двухкомнатный номер с балконом',                7000.00,  4, TRUE),
  ('a1b2c3d4-e5f6-4789-ab01-800000000008', 'semeynyy-topcan',     'Семейный двухкомнатный номер с топчаном',                7000.00,  5, TRUE)
ON CONFLICT (id) DO UPDATE
  SET slug            = EXCLUDED.slug,
      title           = EXCLUDED.title,
      price_per_night = EXCLUDED.price_per_night,
      capacity        = EXCLUDED.capacity,
      is_active       = EXCLUDED.is_active;

-- 3. Verify
SELECT id, slug, price_per_night, capacity FROM rooms ORDER BY price_per_night, slug;
