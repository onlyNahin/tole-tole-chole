-- Tole Tole Chole - Supabase Schema Definition

-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE profiles (
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
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_1, user_2)
);

-- 3. Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Events
CREATE TABLE events (
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
CREATE TABLE support_tickets (
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
CREATE TABLE reports (
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
CREATE TABLE site_config (
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
CREATE TABLE moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT,
  image_url TEXT,
  type TEXT DEFAULT 'Profile Photo',
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. System Logs Table
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT,
  admin_name TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Moderators Table
CREATE TABLE moderators (
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
CREATE TABLE notifications (
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
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Connections access" ON connections FOR SELECT USING (auth.uid() = user_1 OR auth.uid() = user_2);
CREATE POLICY "Messages access" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM connections WHERE id = messages.connection_id AND (user_1 = auth.uid() OR user_2 = auth.uid()))
);

CREATE POLICY "Public events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON events ALL USING (true);

CREATE POLICY "Public site config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Admins update config" ON site_config FOR UPDATE USING (true);

CREATE POLICY "Users can submit support" ON support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage support" ON support_tickets ALL USING (true);

CREATE POLICY "Users can submit reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage reports" ON reports ALL USING (true);

CREATE POLICY "Admins manage moderation" ON moderation_queue ALL USING (true);
CREATE POLICY "Admins manage logs" ON system_logs ALL USING (true);
CREATE POLICY "Admins manage moderators" ON moderators ALL USING (true);

-- Insert default site config
INSERT INTO site_config (id, app_name, primary_color, secondary_color)
VALUES ('default', 'Tole Tole Chole', '#E63946', '#F4A261')
ON CONFLICT (id) DO NOTHING;
