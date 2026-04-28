-- Seed apartments
INSERT INTO apartments (name, description, address, owner_id)
SELECT
    'La sabana house',
    'Beautiful house near La Sabana park',
    'La Sabana, San José, Costa Rica',
    u.id
FROM users u
WHERE u.email = 'john.doe@example.com'
AND NOT EXISTS (
    SELECT 1 FROM apartments WHERE name = 'La sabana house'
);

INSERT INTO apartments (name, description, address, owner_id)
SELECT
    'Escazú apartment',
    'Modern apartment in Escazú',
    'Escazú, San José, Costa Rica',
    u.id
FROM users u
WHERE u.email = 'jane.smith@example.com'
AND NOT EXISTS (
    SELECT 1 FROM apartments WHERE name = 'Escazú apartment'
);

-- Seed rental_offers for 'La sabana house'
-- Each INSERT resolves apartment_id by name to avoid brittle hard-coded IDs.

WITH target_apartment AS (
    SELECT id FROM apartments WHERE name = 'La sabana house'
)
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT
    target_apartment.id,
    'Diego Duarte Fernández',
    '+506 8888-1111',
    '0xABCDEF1234567890',
    '2024-09-12 10:30:00',
    'pending'
FROM target_apartment
WHERE EXISTS (SELECT 1 FROM target_apartment)
AND NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Diego Duarte Fernández'
    AND offer_date = '2024-09-12 10:30:00'
);

WITH target_apartment AS (
    SELECT id FROM apartments WHERE name = 'La sabana house'
)
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT
    target_apartment.id,
    'Diego Duarte Fernández',
    '+506 8888-1111',
    '0xABCDEF1234567890',
    '2024-09-15 14:00:00',
    'accepted'
FROM target_apartment
WHERE EXISTS (SELECT 1 FROM target_apartment)
AND NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Diego Duarte Fernández'
    AND offer_date = '2024-09-15 14:00:00'
);

WITH target_apartment AS (
    SELECT id FROM apartments WHERE name = 'La sabana house'
)
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT
    target_apartment.id,
    'Diego Duarte Fernández',
    '+506 8888-1111',
    '0xABCDEF1234567890',
    '2024-09-20 09:00:00',
    'rejected'
FROM target_apartment
WHERE EXISTS (SELECT 1 FROM target_apartment)
AND NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Diego Duarte Fernández'
    AND offer_date = '2024-09-20 09:00:00'
);

WITH target_apartment AS (
    SELECT id FROM apartments WHERE name = 'La sabana house'
)
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT
    target_apartment.id,
    'María López Vargas',
    '+506 7777-2222',
    '0x1234567890ABCDEF',
    '2024-09-13 11:00:00',
    'pending'
FROM target_apartment
WHERE EXISTS (SELECT 1 FROM target_apartment)
AND NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'María López Vargas'
    AND offer_date = '2024-09-13 11:00:00'
);

WITH target_apartment AS (
    SELECT id FROM apartments WHERE name = 'La sabana house'
)
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT
    target_apartment.id,
    'Carlos Rodríguez Mora',
    '+506 6666-3333',
    NULL,
    '2024-09-14 16:30:00',
    'pending'
FROM target_apartment
WHERE EXISTS (SELECT 1 FROM target_apartment)
AND NOT EXISTS (
    SELECT 1 FROM rental_offers
    WHERE apartment_id = (SELECT id FROM apartments WHERE name = 'La sabana house')
    AND tenant_name = 'Carlos Rodríguez Mora'
    AND offer_date = '2024-09-14 16:30:00'
);
