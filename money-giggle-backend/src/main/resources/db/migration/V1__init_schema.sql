-- V1__init_schema.sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100),
    default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(50),
    color       VARCHAR(7),
    type        VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'BOTH')),
    is_default  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Recurring rules
CREATE TABLE recurring_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount          NUMERIC(15, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    description     TEXT,
    frequency       VARCHAR(10) NOT NULL CHECK (frequency IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    next_run_at     DATE NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
    recurring_rule_id   UUID REFERENCES recurring_rules(id) ON DELETE SET NULL,
    type                VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    amount              NUMERIC(15, 2) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    amount_base         NUMERIC(15, 2),
    date                DATE NOT NULL,
    description         TEXT,
    receipt_url         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budgets
CREATE TABLE budgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE CASCADE,
    period          VARCHAR(10) NOT NULL CHECK (period IN ('WEEKLY', 'MONTHLY', 'YEARLY')),
    limit_amount    NUMERIC(15, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    start_date      DATE NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_transactions_user_date    ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_cat     ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type    ON transactions(user_id, type);
CREATE INDEX idx_budgets_user              ON budgets(user_id);
CREATE INDEX idx_recurring_active          ON recurring_rules(is_active, next_run_at);
CREATE INDEX idx_categories_user           ON categories(user_id);
