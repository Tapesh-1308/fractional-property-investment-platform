DO $$ BEGIN
    CREATE TYPE investment_status AS ENUM ('ACTIVE', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT wallet_non_negative CHECK (wallet_balance >= 0)
);

CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    total_value NUMERIC(18,2) NOT NULL,
    total_slots INTEGER NOT NULL,
    available_slots INTEGER NOT NULL,
    price_per_slot NUMERIC(18,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT total_value_positive CHECK (total_value > 0),
    CONSTRAINT total_slots_positive CHECK (total_slots > 0),
    CONSTRAINT available_slots_non_negative CHECK (available_slots >= 0),
    CONSTRAINT slots_not_exceed CHECK (available_slots <= total_slots),
    CONSTRAINT price_positive CHECK (price_per_slot > 0)
);

CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);

CREATE TABLE IF NOT EXISTS investments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    slots INTEGER NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    status investment_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    withdrawn_at TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_property FOREIGN KEY(property_id) REFERENCES properties(id),

    CONSTRAINT slots_positive CHECK (slots > 0),
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_property_id ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    type transaction_type NOT NULL,
    reference_investment_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_wallet_user FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_reference_investment 
        FOREIGN KEY(reference_investment_id) REFERENCES investments(id),

    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_unique_investment_type
ON wallet_transactions(reference_investment_id, type)
WHERE reference_investment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_wallet_user_created_at
ON wallet_transactions(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;

CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();