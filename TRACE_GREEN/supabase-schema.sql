-- Trace Green Complete Database Schema
-- Run this script in Supabase SQL Editor to create all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    location TEXT,
    bio TEXT,
    carbon_goal_monthly DECIMAL(10,2) DEFAULT 2000.00,
    carbon_goal_yearly DECIMAL(10,2) DEFAULT 24000.00,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT TRUE,
    achievement_alerts BOOLEAN DEFAULT TRUE,
    challenge_reminders BOOLEAN DEFAULT TRUE,
    privacy_profile_visible BOOLEAN DEFAULT TRUE,
    privacy_activity_visible BOOLEAN DEFAULT TRUE,
    privacy_leaderboard_visible BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carbon activities table
CREATE TABLE IF NOT EXISTS public.carbon_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('transportation', 'energy', 'food', 'waste', 'shopping')),
    activity_type TEXT NOT NULL,
    description TEXT,
    carbon_footprint DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carbon goals table
CREATE TABLE IF NOT EXISTS public.carbon_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    criteria JSONB NOT NULL,
    points_reward INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points_earned INTEGER NOT NULL,
    achievement_date DATE DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points_reward INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress DECIMAL(5,2) DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(challenge_id, user_id)
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points_cost INTEGER NOT NULL,
    stock_quantity INTEGER,
    image_url TEXT,
    partner_name TEXT,
    terms_conditions TEXT,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reward redemptions table
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
    redemption_code TEXT,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create educational content table
CREATE TABLE IF NOT EXISTS public.educational_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_read_time INTEGER, -- in minutes
    image_url TEXT,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user content interactions table
CREATE TABLE IF NOT EXISTS public.user_content_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'bookmark', 'share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id, interaction_type)
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('points', 'carbon_saved', 'streak', 'challenges')),
    time_period TEXT NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    leaderboard_id UUID REFERENCES public.leaderboards(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score DECIMAL(10,2) NOT NULL,
    rank INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(leaderboard_id, user_id, period_start)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('achievement', 'challenge', 'reward', 'system', 'social')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Carbon activities policies
CREATE POLICY "Users can manage own activities" ON public.carbon_activities FOR ALL USING (auth.uid() = user_id);

-- Carbon goals policies
CREATE POLICY "Users can manage own goals" ON public.carbon_goals FOR ALL USING (auth.uid() = user_id);

-- User badges policies
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);

-- Challenge participants policies
CREATE POLICY "Users can manage own participation" ON public.challenge_participants FOR ALL USING (auth.uid() = user_id);

-- Reward redemptions policies
CREATE POLICY "Users can manage own redemptions" ON public.reward_redemptions FOR ALL USING (auth.uid() = user_id);

-- User content interactions policies
CREATE POLICY "Users can manage own interactions" ON public.user_content_interactions FOR ALL USING (auth.uid() = user_id);

-- Leaderboard entries policies
CREATE POLICY "Users can view leaderboard entries" ON public.leaderboard_entries FOR SELECT TO authenticated;

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Public read policies for reference tables
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view rewards" ON public.rewards FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view educational content" ON public.educational_content FOR SELECT TO authenticated;
CREATE POLICY "Anyone can view leaderboards" ON public.leaderboards FOR SELECT TO authenticated;

-- Admin policies
CREATE POLICY "Admins can manage badges" ON public.badges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can manage educational content" ON public.educational_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_carbon_goals_updated_at BEFORE UPDATE ON public.carbon_goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON public.educational_content
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial badges
INSERT INTO public.badges (name, description, icon, category, criteria, points_reward, rarity) VALUES
('First Steps', 'Log your first carbon activity', '🌱', 'getting_started', '{"activities_logged": 1}', 50, 'common'),
('Week Warrior', 'Log activities for 7 consecutive days', '🔥', 'consistency', '{"consecutive_days": 7}', 200, 'rare'),
('Carbon Saver', 'Reduce carbon footprint by 100kg', '💚', 'impact', '{"carbon_saved": 100}', 300, 'rare'),
('Challenge Champion', 'Complete 5 challenges', '🏆', 'challenges', '{"challenges_completed": 5}', 500, 'epic'),
('Eco Educator', 'Read 10 educational articles', '📚', 'learning', '{"articles_read": 10}', 150, 'common'),
('Green Streak', 'Maintain a 30-day streak', '⚡', 'consistency', '{"streak_days": 30}', 1000, 'legendary');

-- Insert initial challenges
INSERT INTO public.challenges (title, description, category, difficulty, points_reward, start_date, end_date, max_participants) VALUES
('Plastic-Free Week', 'Avoid single-use plastics for one week', 'waste', 'medium', 200, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 1000),
('Public Transport Challenge', 'Use public transport for all trips this week', 'transportation', 'easy', 150, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 500),
('Energy Saver Month', 'Reduce home energy consumption by 20%', 'energy', 'hard', 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 200),
('Meatless Monday', 'Go vegetarian every Monday for a month', 'food', 'medium', 300, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 800);

-- Insert initial rewards
INSERT INTO public.rewards (title, description, category, points_cost, stock_quantity, partner_name) VALUES
('Eco-Friendly Water Bottle', 'Stainless steel water bottle made from recycled materials', 'lifestyle', 500, 100, 'GreenLife'),
('Organic Cotton T-Shirt', 'Sustainable fashion t-shirt with Trace Green logo', 'fashion', 800, 50, 'EcoWear'),
('Solar Power Bank', 'Portable solar charger for your devices', 'technology', 1200, 25, 'SolarTech'),
('Tree Planting Certificate', 'Plant a tree in your name', 'environment', 300, 1000, 'ForestGreen'),
('Organic Food Voucher', '₹500 voucher for organic groceries', 'food', 1000, 200, 'OrganicMart');

-- Insert initial educational content
INSERT INTO public.educational_content (title, content, category, difficulty, estimated_read_time, is_featured) VALUES
('Understanding Carbon Footprint', 'Learn what carbon footprint means and how to calculate yours...', 'basics', 'beginner', 5, true),
('Sustainable Transportation', 'Discover eco-friendly ways to travel and commute...', 'transportation', 'beginner', 7, true),
('Renewable Energy at Home', 'How to incorporate solar and wind energy in your home...', 'energy', 'intermediate', 10, false),
('Zero Waste Lifestyle', 'Tips and tricks for reducing waste in daily life...', 'waste', 'beginner', 8, true),
('Climate Change Impact', 'Understanding the effects of climate change on our planet...', 'environment', 'intermediate', 12, false);

-- Insert initial leaderboards
INSERT INTO public.leaderboards (name, description, leaderboard_type, time_period) VALUES
('Weekly Points Leaders', 'Top point earners this week', 'points', 'weekly'),
('Monthly Carbon Savers', 'Biggest carbon footprint reducers this month', 'carbon_saved', 'monthly'),
('Streak Masters', 'Longest activity streaks', 'streak', 'all_time'),
('Challenge Champions', 'Most challenges completed', 'challenges', 'all_time');

-- Set admin@tracegreen.com as admin (run after user signs up)
-- UPDATE public.profiles SET is_admin = true WHERE email = 'admin@tracegreen.com';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_carbon_activities_user_date ON public.carbon_activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_carbon_activities_category ON public.carbon_activities(category);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard_period ON public.leaderboard_entries(leaderboard_id, period_start, period_end);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Trace Green database schema created successfully! 🌱' as message;
