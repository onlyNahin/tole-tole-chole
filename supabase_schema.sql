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

-- 6. Reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reported_user_id UUID REFERENCES profiles(id),
  reporter_id UUID REFERENCES profiles(id),
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies (Simple examples, can be refined)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can see their own connections" ON connections FOR SELECT USING (auth.uid() = user_1 OR auth.uid() = user_2);
CREATE POLICY "Users can see messages in their connections" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM connections 
    WHERE id = messages.connection_id 
    AND (user_1 = auth.uid() OR user_2 = auth.uid())
  )
);
