-- Additional Supabase SQL for Enhanced Streak Functionality
-- Run these in your Supabase SQL Editor to enhance streak tracking

-- 1. Add streak tracking fields to profiles table (if not already present)
DO $$ 
BEGIN
  -- Add last_activity_date to track when user last logged activity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_activity_date'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN last_activity_date DATE;
  END IF;
  
  -- Add weekly_active_days to track this week's active days
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'weekly_active_days'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN weekly_active_days INTEGER DEFAULT 0;
  END IF;
  
  -- Add week_start_date to track when current week started
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'week_start_date'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN week_start_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- 2. Create a function to update streak when activity is logged
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS void AS $$
DECLARE
  last_date DATE;
  today_date DATE := CURRENT_DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
  week_start DATE;
  days_since_week_start INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_activity_date, current_streak, longest_streak, week_start_date
  INTO last_date, current_streak_val, longest_streak_val, week_start
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Calculate days since week started
  days_since_week_start := EXTRACT(DOW FROM today_date) - EXTRACT(DOW FROM week_start);
  
  -- Reset weekly counter if it's a new week
  IF days_since_week_start < 0 OR (today_date - week_start) >= 7 THEN
    week_start := today_date - EXTRACT(DOW FROM today_date) * interval '1 day';
    days_since_week_start := EXTRACT(DOW FROM today_date);
    
    UPDATE public.profiles 
    SET week_start_date = week_start,
        weekly_active_days = 1
    WHERE id = user_uuid;
  ELSE
    -- Increment weekly active days if not already counted today
    IF last_date != today_date THEN
      UPDATE public.profiles 
      SET weekly_active_days = LEAST(weekly_active_days + 1, 7)
      WHERE id = user_uuid;
    END IF;
  END IF;
  
  -- Update streak logic
  IF last_date IS NULL THEN
    -- First activity ever
    current_streak_val := 1;
  ELSIF last_date = today_date THEN
    -- Already logged today, no change needed
    RETURN;
  ELSIF last_date = today_date - 1 THEN
    -- Consecutive day, increment streak
    current_streak_val := current_streak_val + 1;
  ELSIF last_date < today_date - 1 THEN
    -- Missed days, reset streak
    current_streak_val := 1;
  END IF;
  
  -- Update longest streak if current is higher
  IF current_streak_val > longest_streak_val THEN
    longest_streak_val := current_streak_val;
  END IF;
  
  -- Update profile with new streak data
  UPDATE public.profiles 
  SET 
    current_streak = current_streak_val,
    longest_streak = longest_streak_val,
    last_activity_date = today_date,
    updated_at = NOW()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a trigger to automatically update streak when carbon activity is logged
CREATE OR REPLACE FUNCTION trigger_update_streak()
RETURNS trigger AS $$
BEGIN
  -- Only update streak for INSERT operations (new activities)
  IF TG_OP = 'INSERT' THEN
    PERFORM update_user_streak(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS carbon_activity_streak_update ON public.carbon_activities;

-- Create the trigger
CREATE TRIGGER carbon_activity_streak_update
  AFTER INSERT ON public.carbon_activities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak();

-- 4. Create a function to get comprehensive streak data
CREATE OR REPLACE FUNCTION get_user_streak_data(user_uuid UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  last_activity_date DATE,
  weekly_active_days INTEGER,
  today_completed BOOLEAN,
  total_active_days BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.current_streak,
    p.longest_streak,
    p.last_activity_date,
    p.weekly_active_days,
    (p.last_activity_date = CURRENT_DATE) as today_completed,
    (SELECT COUNT(DISTINCT DATE(ca.created_at)) FROM public.carbon_activities ca WHERE ca.user_id = user_uuid) as total_active_days
  FROM public.profiles p
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_streak_data(UUID) TO authenticated;
