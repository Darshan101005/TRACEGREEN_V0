-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('individual', 'community', 'team')),
  category TEXT NOT NULL CHECK (category IN ('transportation', 'energy', 'food', 'waste', 'general')),
  target_metric TEXT NOT NULL, -- e.g., 'carbon_reduction', 'days_tracked', 'activities_logged'
  target_value DECIMAL(10,2) NOT NULL,
  points_reward INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  image_url TEXT,
  rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS for challenge participants
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_participants_select_own" ON public.challenge_participants 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "challenge_participants_insert_own" ON public.challenge_participants 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "challenge_participants_update_own" ON public.challenge_participants 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('global', 'weekly', 'monthly', 'challenge')),
  metric TEXT NOT NULL, -- e.g., 'total_points', 'carbon_saved', 'streak_days'
  time_period TEXT, -- e.g., 'this_week', 'this_month', 'all_time'
  challenge_id UUID REFERENCES public.challenges(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES public.leaderboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(leaderboard_id, user_id)
);

-- Enable RLS for leaderboard entries (public read for leaderboards)
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_entries_select_public" ON public.leaderboard_entries 
  FOR SELECT USING (TRUE); -- Public read access for leaderboards

CREATE POLICY "leaderboard_entries_insert_system" ON public.leaderboard_entries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "leaderboard_entries_update_system" ON public.leaderboard_entries 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_challenges_updated_at 
  BEFORE UPDATE ON public.challenges 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at 
  BEFORE UPDATE ON public.leaderboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
