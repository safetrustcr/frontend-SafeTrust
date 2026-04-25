-- Create apartments table
CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'not_inhabited',
    promoted BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rental_offers table (bid requests from interested tenants)
CREATE TABLE IF NOT EXISTS rental_offers (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
    tenant_name VARCHAR(255) NOT NULL,
    tenant_phone VARCHAR(50),
    tenant_wallet_address VARCHAR(255),
    offer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bid_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apartments_owner_id ON apartments(owner_id);
CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status);
CREATE INDEX IF NOT EXISTS idx_rental_offers_apartment_id ON rental_offers(apartment_id);
CREATE INDEX IF NOT EXISTS idx_rental_offers_bid_status ON rental_offers(bid_status);

-- Create triggers for updated_at
CREATE TRIGGER update_apartments_updated_at 
    BEFORE UPDATE ON apartments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_offers_updated_at 
    BEFORE UPDATE ON rental_offers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
