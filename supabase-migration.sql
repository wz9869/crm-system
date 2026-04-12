-- ============================================
-- CRM Upgrade: DB changes + RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS level text DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2. Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  content text NOT NULL,
  next_action text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_customer ON follow_ups(customer_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_created_by ON follow_ups(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);

-- 3. Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- 4. RLS for customers — any authenticated user has full access
DROP POLICY IF EXISTS "Users see own customers" ON customers;
DROP POLICY IF EXISTS "Users insert own customers" ON customers;
DROP POLICY IF EXISTS "Users update own customers" ON customers;
DROP POLICY IF EXISTS "Users delete own customers" ON customers;

CREATE POLICY "Authenticated users full access" ON customers
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. RLS for follow_ups — any authenticated user has full access
DROP POLICY IF EXISTS "Users see own follow_ups" ON follow_ups;
DROP POLICY IF EXISTS "Users insert own follow_ups" ON follow_ups;
DROP POLICY IF EXISTS "Users update own follow_ups" ON follow_ups;
DROP POLICY IF EXISTS "Users delete own follow_ups" ON follow_ups;

CREATE POLICY "Authenticated users full access" ON follow_ups
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
