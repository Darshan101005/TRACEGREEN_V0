-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('discount', 'product', 'experience', 'donation', 'digital')),
  points_cost INTEGER NOT NULL,
  monetary_value DECIMAL(10,2),
  currency TEXT DEFAULT 'INR',
  stock_quantity INTEGER,
  unlimited_stock BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  partner_name TEXT,
  partner_logo_url TEXT,
  terms_conditions TEXT,
  expiry_days INTEGER DEFAULT 30, -- Days until reward expires after redemption
  is_active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user reward redemptions table
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  redemption_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'used', 'expired', 'cancelled')),
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reward redemptions
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reward_redemptions_select_own" ON public.reward_redemptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reward_redemptions_insert_own" ON public.reward_redemptions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reward_redemptions_update_own" ON public.reward_redemptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create partner organizations table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  contact_email TEXT,
  partnership_type TEXT CHECK (partnership_type IN ('eco_brand', 'ngo', 'government', 'corporate')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_rewards_updated_at 
  BEFORE UPDATE ON public.rewards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reward_redemptions_updated_at 
  BEFORE UPDATE ON public.reward_redemptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at 
  BEFORE UPDATE ON public.partners 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
