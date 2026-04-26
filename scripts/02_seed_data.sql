-- Insert sample users
INSERT INTO users (email, first_name, last_name) VALUES
('john.doe@example.com', 'John', 'Doe'),
('jane.smith@example.com', 'Jane', 'Smith'),
('bob.johnson@example.com', 'Bob', 'Johnson'),
('alice.brown@example.com', 'Alice', 'Brown'),
('charlie.wilson@example.com', 'Charlie', 'Wilson')
ON CONFLICT (email) DO NOTHING;

-- Insert sample escrow transactions
INSERT INTO escrow_transactions (contract_id, status) VALUES
(gen_random_uuid(), 'pending'),
(gen_random_uuid(), 'active'),
(gen_random_uuid(), 'completed'),
(gen_random_uuid(), 'pending'),
(gen_random_uuid(), 'active');

-- Insert sample escrow transaction users (linking users to transactions)
WITH user_ids AS (
    SELECT id FROM users LIMIT 5
),
transaction_ids AS (
    SELECT id FROM escrow_transactions LIMIT 5
)
INSERT INTO escrow_transaction_users (escrow_transaction_id, user_id, funding_status)
SELECT 
    t.id,
    u.id,
    CASE 
        WHEN random() < 0.3 THEN 'funded'
        WHEN random() < 0.6 THEN 'pending'
        ELSE 'partial'
    END
FROM transaction_ids t
CROSS JOIN user_ids u
WHERE random() < 0.7; -- Only create some relationships, not all combinations