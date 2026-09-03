CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  google_id TEXT UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('register', 'reset_password')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verification_codes_email_purpose_idx
  ON verification_codes (email, purpose, created_at DESC);

CREATE INDEX IF NOT EXISTS verification_codes_expires_at_idx
  ON verification_codes (expires_at);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_key_created_idx
  ON auth_rate_limits (rate_key, created_at DESC);

CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  niche TEXT NOT NULL DEFAULT 'restaurants',
  phone TEXT,
  city TEXT,
  website TEXT,
  address TEXT,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  budget_range TEXT,
  desired_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  team_size TEXT,
  description TEXT,
  onboarding_step INT NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS company_profiles_user_id_idx ON company_profiles(user_id);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Общий вопрос',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('user', 'support')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_idx ON ticket_messages(ticket_id);

CREATE TABLE IF NOT EXISTS user_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  price INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KZT',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  period_months INT NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_orders_user_id_idx ON user_orders(user_id);

CREATE TABLE IF NOT EXISTS site_cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  work JSONB NOT NULL DEFAULT '[]'::jsonb,
  result TEXT NOT NULL DEFAULT '',
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover TEXT NOT NULL DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  instagram TEXT,
  website TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_cases_sort_order_idx ON site_cases(sort_order);

CREATE TABLE IF NOT EXISTS site_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size INT NOT NULL DEFAULT 0,
  data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_uploads_created_at_idx ON site_uploads(created_at DESC);
