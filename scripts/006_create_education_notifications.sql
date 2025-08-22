-- Create educational content table
CREATE TABLE IF NOT EXISTS public.educational_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'tip', 'video', 'infographic', 'quiz')),
  category TEXT NOT NULL CHECK (category IN ('transportation', 'energy', 'food', 'waste', 'general', 'climate_science')),
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_read_time INTEGER, -- in minutes
  image_url TEXT,
  video_url TEXT,
  tags TEXT[],
  author TEXT,
  source_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user content interactions table
CREATE TABLE IF NOT EXISTS public.user_content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.educational_content(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'bookmark', 'share', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, interaction_type)
);

-- Enable RLS for user content interactions
ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_content_interactions_select_own" ON public.user_content_interactions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_insert_own" ON public.user_content_interactions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_update_own" ON public.user_content_interactions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_content_interactions_delete_own" ON public.user_content_interactions 
  FOR DELETE USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('achievement', 'challenge', 'reminder', 'social', 'system', 'reward')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications 
  FOR DELETE USING (auth.uid() = user_id);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_settings JSONB DEFAULT '{
    "push_notifications": true,
    "email_notifications": true,
    "achievement_alerts": true,
    "challenge_reminders": true,
    "daily_tips": true,
    "weekly_reports": true
  }',
  privacy_settings JSONB DEFAULT '{
    "profile_visibility": "public",
    "leaderboard_visibility": true,
    "activity_sharing": true,
    "data_analytics": true
  }',
  app_settings JSONB DEFAULT '{
    "theme": "system",
    "language": "en",
    "units": "metric",
    "currency": "INR"
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own" ON public.user_preferences 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own" ON public.user_preferences 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own" ON public.user_preferences 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_educational_content_updated_at 
  BEFORE UPDATE ON public.educational_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON public.user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
