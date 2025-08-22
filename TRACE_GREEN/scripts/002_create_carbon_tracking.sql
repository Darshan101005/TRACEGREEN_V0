-- Create carbon footprint entries table
CREATE TABLE IF NOT EXISTS public.carbon_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('transportation', 'energy', 'food', 'waste', 'shopping', 'other')),
  subcategory TEXT,
  activity_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  carbon_footprint DECIMAL(10,2) NOT NULL, -- in kg CO2
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  location TEXT,
  metadata JSONB, -- For storing additional activity-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.carbon_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carbon entries
CREATE POLICY "carbon_entries_select_own" ON public.carbon_entries 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "carbon_entries_insert_own" ON public.carbon_entries 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carbon_entries_update_own" ON public.carbon_entries 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "carbon_entries_delete_own" ON public.carbon_entries 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_carbon_entries_user_date ON public.carbon_entries(user_id, date);
CREATE INDEX idx_carbon_entries_category ON public.carbon_entries(category);

-- Create updated_at trigger
CREATE TRIGGER update_carbon_entries_updated_at 
  BEFORE UPDATE ON public.carbon_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create carbon goals table
CREATE TABLE IF NOT EXISTS public.carbon_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  target_amount DECIMAL(10,2) NOT NULL, -- in kg CO2
  current_amount DECIMAL(10,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for carbon goals
ALTER TABLE public.carbon_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carbon_goals_select_own" ON public.carbon_goals 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "carbon_goals_insert_own" ON public.carbon_goals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carbon_goals_update_own" ON public.carbon_goals 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "carbon_goals_delete_own" ON public.carbon_goals 
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_carbon_goals_updated_at 
  BEFORE UPDATE ON public.carbon_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
