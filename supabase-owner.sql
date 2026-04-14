-- ============================================================
-- customers 表新增 owner_id + is_public_pool
-- ============================================================

DO $$ BEGIN
  ALTER TABLE customers ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE customers ADD COLUMN is_public_pool boolean NOT NULL DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 所有现有客户默认为公海池
UPDATE customers SET is_public_pool = true WHERE owner_id IS NULL;
