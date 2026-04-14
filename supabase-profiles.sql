-- ============================================================
-- profiles 表：存储用户角色信息
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  role       text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS：登录即可读取所有 profiles，只能更新自己的
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles: anyone logged in can read' AND tablename = 'profiles') THEN
    CREATE POLICY "Profiles: anyone logged in can read" ON profiles
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles: users can insert own' AND tablename = 'profiles') THEN
    CREATE POLICY "Profiles: users can insert own" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Profiles: users can update own' AND tablename = 'profiles') THEN
    CREATE POLICY "Profiles: users can update own" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- ============================================================
-- 自动创建 profile：新用户注册后触发
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN lower(NEW.email) = 'zed@smartwingshome.com' THEN 'admin' ELSE 'staff' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 为已有用户补建 profile（如果还没有）
-- ============================================================

INSERT INTO profiles (id, email, role)
SELECT
  id,
  email,
  CASE WHEN lower(email) = 'zed@smartwingshome.com' THEN 'admin' ELSE 'staff' END
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
