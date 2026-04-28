-- Create apartments table
CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rental_offers table
CREATE TABLE IF NOT EXISTS rental_offers (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_phone VARCHAR(50),
    tenant_wallet_address VARCHAR(255),
    offer_date TIMESTAMP WITH TIME ZONE NOT NULL,
    bid_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apartments_owner_id ON apartments(owner_id);
CREATE INDEX IF NOT EXISTS idx_rental_offers_apartment_id ON rental_offers(apartment_id);
CREATE INDEX IF NOT EXISTS idx_rental_offers_bid_status ON rental_offers(bid_status);

-- Create updated_at trigger function (idempotent via CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate triggers so the script is safe to re-run
DROP TRIGGER IF EXISTS update_apartments_updated_at ON apartments;
CREATE TRIGGER update_apartments_updated_at
    BEFORE UPDATE ON apartments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rental_offers_updated_at ON rental_offers;
CREATE TRIGGER update_rental_offers_updated_at
    BEFORE UPDATE ON rental_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
