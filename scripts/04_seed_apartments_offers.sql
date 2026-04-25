-- Insert sample apartments
INSERT INTO apartments (name, location, address, bedrooms, bathrooms, price, status, promoted, owner_id) 
SELECT 
    'La sabana house',
    'San José',
    '329 Calle Santos, Paseo Colón, San José',
    2,
    1,
    4058.00,
    'not_inhabited',
    TRUE,
    (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM apartments WHERE name = 'La sabana house');

INSERT INTO apartments (name, location, address, bedrooms, bathrooms, price, status, promoted, owner_id) 
SELECT 
    'Escazú Apartment',
    'Escazú',
    '123 Avenida Escazú',
    3,
    2,
    5200.00,
    'inhabited',
    FALSE,
    (SELECT id FROM users WHERE email = 'jane.smith@example.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM apartments WHERE name = 'Escazú Apartment');

INSERT INTO apartments (name, location, address, bedrooms, bathrooms, price, status, promoted, owner_id) 
SELECT 
    'Santa Ana Condo',
    'Santa Ana',
    '456 Calle Principal',
    2,
    2,
    3800.00,
    'not_inhabited',
    TRUE,
    (SELECT id FROM users WHERE email = 'john.doe@example.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM apartments WHERE name = 'Santa Ana Condo');

-- Insert sample rental offers for apartment ID 1 (La sabana house)
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Diego Duarte Fernández',
    '+506 6483252',
    'XR6...32D',
    '2024-09-12 10:30:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Diego Duarte Fernández' AND tenant_phone = '+506 6483252');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Diego Duarte Fernández',
    '+506 6483252',
    'XR6...32D',
    '2024-09-12 11:15:00',
    'accepted'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Diego Duarte Fernández' AND offer_date = '2024-09-12 11:15:00');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Diego Duarte Fernández',
    '+506 6483252',
    'XR6...32D',
    '2024-09-12 14:20:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Diego Duarte Fernández' AND offer_date = '2024-09-12 14:20:00');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Diego Duarte Fernández',
    '+506 6483252',
    'XR6...32D',
    '2024-09-12 16:45:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Diego Duarte Fernández' AND offer_date = '2024-09-12 16:45:00');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Diego Duarte Fernández',
    '+506 6483252',
    'XR6...32D',
    '2024-09-12 18:30:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Diego Duarte Fernández' AND offer_date = '2024-09-12 18:30:00');

-- Add more offers to reach 10 total
INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'María González',
    '+506 7123456',
    'XR7...45E',
    '2024-09-13 09:00:00',
    'rejected'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'María González');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Carlos Ramírez',
    '+506 8234567',
    'XR8...56F',
    '2024-09-13 11:30:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Carlos Ramírez');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Ana Martínez',
    '+506 9345678',
    'XR9...67G',
    '2024-09-13 14:15:00',
    'accepted'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Ana Martínez');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Luis Hernández',
    '+506 6456789',
    'XR1...78H',
    '2024-09-14 10:00:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Luis Hernández');

INSERT INTO rental_offers (apartment_id, tenant_name, tenant_phone, tenant_wallet_address, offer_date, bid_status)
SELECT 
    1,
    'Sofia Vargas',
    '+506 7567890',
    'XR2...89I',
    '2024-09-14 15:30:00',
    'pending'
WHERE EXISTS (SELECT 1 FROM apartments WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM rental_offers WHERE apartment_id = 1 AND tenant_name = 'Sofia Vargas');
