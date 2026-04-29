-- Seed apartments
INSERT INTO apartments (name, description, address, location, bedrooms, bathrooms, price, status, promoted, owner_id)
SELECT
    'La sabana house',
    'Beautiful house near La Sabana park',
    'La Sabana, San José, Costa Rica',
    'La Sabana, San José',
    3,
    2,
    1200.00,
    'available',
    true,
    u.id
FROM users u
WHERE u.email = 'john.doe@example.com'
AND NOT EXISTS (
    SELECT 1 FROM apartments WHERE name = 'La sabana house'
);

INSERT INTO apartments (name, description, address, location, bedrooms, bathrooms, price, status, promoted, owner_id)
SELECT
    'Escazú apartment',
    'Modern apartment in Escazú',
    'Escazú, San José, Costa Rica',
    'Escazú, San José',
    2,
    1,
    900.00,
    'available',
    false,
    u.id
FROM users u
WHERE u.email = 'jane.smith@example.com'
AND NOT EXISTS (
    SELECT 1 FROM apartments WHERE name = 'Escazú apartment'
);

INSERT INTO apartments (name, description, address, location, bedrooms, bathrooms, price, status, promoted, owner_id)
SELECT
    'Heredia studio',
    'Cozy studio close to Universidad Nacional',
    'Heredia Centro, Heredia, Costa Rica',
    'Heredia Centro, Heredia',
    1,
    1,
    550.00,
    'available',
    false,
    u.id
FROM users u
WHERE u.email = 'bob.johnson@example.com'
AND NOT EXISTS (
    SELECT 1 FROM apartments WHERE name = 'Heredia studio'
);

-- ---------------------------------------------------------------------------
-- Seed rental_offers
-- Each INSERT resolves apartment_id by name and tenant_id by email.
-- All NOT EXISTS guards check (apartment_id, tenant_name, offer_date).
-- ---------------------------------------------------------------------------

-- La sabana house — offer 1
WITH apt AS (SELECT id FROM apartments WHERE name = 'La sabana house'),
     tnt AS (SELECT id FROM users WHERE email = 'alice.brown@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Diego Duarte Fernández', '+506 8888-1111', '0xABCDEF1234567890', '2024-09-12 10:30:00', 'pending'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Diego Duarte Fernández'
    AND offer_date = '2024-09-12 10:30:00'
);

-- La sabana house — offer 2
WITH apt AS (SELECT id FROM apartments WHERE name = 'La sabana house'),
     tnt AS (SELECT id FROM users WHERE email = 'alice.brown@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Diego Duarte Fernández', '+506 8888-1111', '0xABCDEF1234567890', '2024-09-15 14:00:00', 'accepted'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Diego Duarte Fernández'
    AND offer_date = '2024-09-15 14:00:00'
);

-- La sabana house — offer 3
WITH apt AS (SELECT id FROM apartments WHERE name = 'La sabana house'),
     tnt AS (SELECT id FROM users WHERE email = 'alice.brown@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Diego Duarte Fernández', '+506 8888-1111', '0xABCDEF1234567890', '2024-09-20 09:00:00', 'rejected'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Diego Duarte Fernández'
    AND offer_date = '2024-09-20 09:00:00'
);

-- La sabana house — offer 4
WITH apt AS (SELECT id FROM apartments WHERE name = 'La sabana house'),
     tnt AS (SELECT id FROM users WHERE email = 'charlie.wilson@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'María López Vargas', '+506 7777-2222', '0x1234567890ABCDEF', '2024-09-13 11:00:00', 'pending'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'María López Vargas'
    AND offer_date = '2024-09-13 11:00:00'
);

-- La sabana house — offer 5
WITH apt AS (SELECT id FROM apartments WHERE name = 'La sabana house'),
     tnt AS (SELECT id FROM users WHERE email = 'charlie.wilson@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Carlos Rodríguez Mora', '+506 6666-3333', NULL, '2024-09-14 16:30:00', 'pending'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Carlos Rodríguez Mora'
    AND offer_date = '2024-09-14 16:30:00'
);

-- Escazú apartment — offer 6
WITH apt AS (SELECT id FROM apartments WHERE name = 'Escazú apartment'),
     tnt AS (SELECT id FROM users WHERE email = 'alice.brown@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Sofía Jiménez Castro', '+506 5555-4444', '0xDEADBEEF00001111', '2024-09-16 09:00:00', 'pending'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'Escazú apartment')
    AND tenant_name = 'Sofía Jiménez Castro'
    AND offer_date = '2024-09-16 09:00:00'
);

-- Escazú apartment — offer 7
WITH apt AS (SELECT id FROM apartments WHERE name = 'Escazú apartment'),
     tnt AS (SELECT id FROM users WHERE email = 'charlie.wilson@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Andrés Mora Solano', '+506 4444-5555', NULL, '2024-09-17 15:00:00', 'accepted'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'Escazú apartment')
    AND tenant_name = 'Andrés Mora Solano'
    AND offer_date = '2024-09-17 15:00:00'
);

-- Heredia studio — offer 8
WITH apt AS (SELECT id FROM apartments WHERE name = 'Heredia studio'),
     tnt AS (SELECT id FROM users WHERE email = 'alice.brown@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Valeria Quesada Arias', '+506 3333-6666', '0xCAFEBABE12345678', '2024-09-18 10:00:00', 'pending'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'Heredia studio')
    AND tenant_name = 'Valeria Quesada Arias'
    AND offer_date = '2024-09-18 10:00:00'
);

-- Heredia studio — offer 9
WITH apt AS (SELECT id FROM apartments WHERE name = 'Heredia studio'),
     tnt AS (SELECT id FROM users WHERE email = 'charlie.wilson@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Luis Vargas Pérez', '+506 2222-7777', '0x0000FFFF0000FFFF', '2024-09-19 13:30:00', 'rejected'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'Heredia studio')
    AND tenant_name = 'Luis Vargas Pérez'
    AND offer_date = '2024-09-19 13:30:00'
);

-- Heredia studio — offer 10
WITH apt AS (SELECT id FROM apartments WHERE name = 'Heredia studio'),
     tnt AS (SELECT id FROM users WHERE email = 'alice.brown@example.com')
INSERT INTO rental_offers (apartment_id, tenant_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT apt.id, tnt.id, 'Gabriela Núñez Rojas', '+506 1111-8888', NULL, '2024-09-21 08:00:00', 'pending'
FROM apt, tnt
WHERE NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'Heredia studio')
    AND tenant_name = 'Gabriela Núñez Rojas'
    AND offer_date = '2024-09-21 08:00:00'
);
