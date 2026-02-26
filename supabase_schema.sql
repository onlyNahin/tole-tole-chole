-- Tole Tole Chole - Supabase Schema Definition

-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  bio TEXT,
  location TEXT,
  interests TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  coordinates GEOGRAPHY(POINT) -- Requires PostGIS if using for distance
);

-- 2. Connections (Matches)
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_1, user_2)
);

-- 3. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  date DATE,
  time TIME,
  location TEXT,
  image_url TEXT,
  attendees_count INTEGER DEFAULT 0,
  category TEXT,
  status TEXT DEFAULT 'upcoming',
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY, -- e.g. #T-4092
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  email TEXT,
  issue TEXT,
  status TEXT DEFAULT 'Open',
  priority TEXT DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT,
  user_image TEXT,
  reason TEXT,
  date TEXT DEFAULT CURRENT_DATE::TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Site Config Table
CREATE TABLE IF NOT EXISTS site_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  app_name TEXT DEFAULT 'Tole Tole Chole',
  primary_color TEXT DEFAULT '#E63946',
  secondary_color TEXT DEFAULT '#F4A261',
  branding_icon TEXT,
  favicon TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  feature_title TEXT,
  reviews_title TEXT,
  show_user_count BOOLEAN DEFAULT true,
  user_count_text TEXT,
  reviews JSONB DEFAULT '[]'::jsonb,
  terms_and_conditions TEXT,
  premium_plans JSONB DEFAULT '[]'::jsonb,
  premium_features JSONB DEFAULT '[]'::jsonb,
  premium_permissions JSONB DEFAULT '{}'::jsonb,
  payment_gateway_url TEXT,
  footer_text TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  developer_page_url TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  about_page JSONB DEFAULT '{}'::jsonb,
  maintenance_mode BOOLEAN DEFAULT false,
  allow_new_registrations BOOLEAN DEFAULT true,
  global_announcement TEXT,
  free_daily_swipes INTEGER DEFAULT 20,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Moderation Queue Table
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'Profile Photo',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT,
  admin_name TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Moderators Table
CREATE TABLE IF NOT EXISTS moderators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'Moderator',
  status TEXT DEFAULT 'Active',
  image TEXT,
  permissions TEXT[],
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT,
  title TEXT,
  message TEXT,
  image TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public profiles" ON profiles;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Connections access" ON connections;
CREATE POLICY "Connections access" ON connections FOR SELECT USING (auth.uid() = user_1 OR auth.uid() = user_2);

DROP POLICY IF EXISTS "Messages access" ON messages;
CREATE POLICY "Messages access" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM connections WHERE id = messages.connection_id AND (user_1 = auth.uid() OR user_2 = auth.uid()))
);

DROP POLICY IF EXISTS "Public events" ON events;
CREATE POLICY "Public events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage events" ON events;
CREATE POLICY "Admins manage events" ON events FOR ALL USING (true);

DROP POLICY IF EXISTS "Public site config" ON site_config;
CREATE POLICY "Public site config" ON site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update config" ON site_config;
CREATE POLICY "Admins update config" ON site_config FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can submit support" ON support_tickets;
CREATE POLICY "Users can submit support" ON support_tickets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage support" ON support_tickets;
CREATE POLICY "Admins manage support" ON support_tickets FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can submit reports" ON reports;
CREATE POLICY "Users can submit reports" ON reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage reports" ON reports;
CREATE POLICY "Admins manage reports" ON reports FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins manage moderation" ON moderation_queue;
CREATE POLICY "Admins manage moderation" ON moderation_queue FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins manage logs" ON system_logs;
CREATE POLICY "Admins manage logs" ON system_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Admins manage moderators" ON moderators;
CREATE POLICY "Admins manage moderators" ON moderators FOR ALL USING (true);

-- Insert default site config
INSERT INTO site_config (id, app_name, primary_color, secondary_color)
VALUES ('default', 'Tole Tole Chole', '#E63946', '#F4A261')
ON CONFLICT (id) DO NOTHING;
