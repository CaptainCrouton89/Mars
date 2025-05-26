-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  time_zone TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  role_title TEXT,
  notes TEXT,
  source TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  website TEXT,
  address TEXT,
  birthday DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Create opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  value NUMERIC,
  currency TEXT DEFAULT 'USD',
  stage TEXT NOT NULL DEFAULT 'Lead',
  expected_close_date DATE,
  actual_close_date DATE,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  date_of_interaction TIMESTAMPTZ DEFAULT NOW(),
  summary TEXT NOT NULL,
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for contacts
CREATE POLICY "Users can view own contacts" ON contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for opportunities
CREATE POLICY "Users can view own opportunities" ON opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own opportunities" ON opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own opportunities" ON opportunities FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for interactions
CREATE POLICY "Users can view own interactions" ON interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interactions" ON interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own interactions" ON interactions FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();