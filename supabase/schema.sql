-- LIA Iron Club - Cloud Database Schema (Supabase / PostgreSQL)

-- 1. GYM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS gym_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    photo_url TEXT,
    plan TEXT NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    last_notified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. OWNER PROFILE TABLE
CREATE TABLE IF NOT EXISTS owner_profile (
    id TEXT PRIMARY KEY DEFAULT 'default_owner',
    gym_name TEXT NOT NULL DEFAULT 'LIA Iron Club',
    owner_name TEXT NOT NULL DEFAULT 'Subba Reddy Palagiri',
    phone TEXT NOT NULL DEFAULT '+91 98765 43210',
    email TEXT NOT NULL DEFAULT 'subbareddy123sub@gmail.com',
    upi_id TEXT NOT NULL DEFAULT 'liaironclub@okhdfcbank',
    monthly_target NUMERIC DEFAULT 180000,
    today_checkins INTEGER DEFAULT 48,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profile ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Allow public read/write for web app client with anon key)
CREATE POLICY "Allow public read access to gym_members"
ON gym_members FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update access to gym_members"
ON gym_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access to owner_profile"
ON owner_profile FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update access to owner_profile"
ON owner_profile FOR ALL USING (true) WITH CHECK (true);

-- 5. INITIAL SEED DATA
INSERT INTO owner_profile (id, gym_name, owner_name, phone, email, upi_id, monthly_target, today_checkins)
VALUES (
    'default_owner',
    'LIA Iron Club',
    'Palagiri Subbareddy',
    '+91 98765 43210',
    'subbareddy123sub@gmail.com',
    'liaironclub@okhdfcbank',
    180000,
    48
)
ON CONFLICT (id) DO NOTHING;
