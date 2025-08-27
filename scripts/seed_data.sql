-- Seed initial challenges
INSERT INTO public.challenges (title, description, category, difficulty, points_reward, start_date, end_date, max_participants, status) VALUES
('30-Day Carbon Reduction Challenge', 'Reduce your daily carbon footprint by 20% through sustainable choices', 'general', 'medium', 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1000, 'active'),
('Plastic-Free Week', 'Avoid single-use plastics for one complete week', 'waste', 'easy', 200, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 500, 'active'),
('Public Transport Month', 'Use only public transport for all your commutes this month', 'transportation', 'hard', 800, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 200, 'active'),
('Energy Saver Challenge', 'Reduce home energy consumption by tracking and optimizing usage', 'energy', 'medium', 350, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '17 days', 750, 'draft');

-- Seed initial rewards
INSERT INTO public.rewards (title, description, category, points_cost, stock_quantity, partner_name, terms_conditions, expiry_date) VALUES
('Eco-Friendly Water Bottle', 'Stainless steel water bottle made from recycled materials', 'lifestyle', 500, 100, 'GreenLife', 'Valid for 6 months from redemption', CURRENT_DATE + INTERVAL '180 days'),
('Organic Cotton T-Shirt', 'Sustainable fashion t-shirt with TraceGreen logo', 'fashion', 800, 50, 'EcoWear', 'Size selection available upon redemption', CURRENT_DATE + INTERVAL '90 days'),
('Solar Power Bank', 'Portable solar charger for your mobile devices', 'technology', 1200, 25, 'SolarTech', 'One year warranty included', CURRENT_DATE + INTERVAL '365 days'),
('Tree Planting Certificate', 'Plant a tree in your name with geolocation tracking', 'environment', 300, 1000, 'ForestGreen', 'Certificate with tree location provided', NULL),
('Organic Food Voucher', '₹500 voucher for organic groceries', 'food', 1000, 200, 'OrganicMart', 'Valid at all partner stores', CURRENT_DATE + INTERVAL '60 days'),
('Green Energy Consultation', '1-hour free consultation on home renewable energy', 'service', 1500, 10, 'SolarExperts', 'Booking required within 30 days', CURRENT_DATE + INTERVAL '45 days');

-- Seed initial leaderboards
INSERT INTO public.leaderboards (name, description, leaderboard_type, time_period, is_active) VALUES
('Weekly Points Champions', 'Top point earners this week', 'points', 'weekly', true),
('Monthly Carbon Savers', 'Biggest carbon footprint reducers this month', 'carbon_saved', 'monthly', true),
('Activity Streak Masters', 'Longest consecutive activity logging streaks', 'streak', 'all_time', true),
('Challenge Completers', 'Most challenges completed successfully', 'challenges', 'all_time', true);

-- Seed educational content
INSERT INTO public.educational_content (title, content, category, difficulty, estimated_read_time, is_featured, is_published) VALUES
('Understanding Your Carbon Footprint', 
'Your carbon footprint represents the total amount of greenhouse gases produced directly and indirectly by your activities. Learn how to calculate and reduce it effectively through daily sustainable choices.

Key areas that contribute to your carbon footprint:
• Transportation (cars, flights, public transport)
• Energy use at home (electricity, heating, cooling)
• Food consumption (especially meat and dairy)
• Waste generation and disposal
• Shopping and consumption habits

Start by tracking your activities in each category to understand your baseline, then work on reducing emissions through conscious choices.',
'basics', 'beginner', 8, true, true),

('Sustainable Transportation Guide', 
'Transportation accounts for about 29% of greenhouse gas emissions. Here are effective ways to reduce your transport carbon footprint:

Public Transport: Use buses, trains, and metros instead of private vehicles
Cycling & Walking: Short distances can easily be covered without motorized transport
Electric Vehicles: Consider switching to electric or hybrid vehicles
Carpooling: Share rides to reduce individual emissions
Remote Work: Work from home when possible to eliminate commute emissions

Every small change in your transportation habits can lead to significant carbon savings over time.',
'transportation', 'beginner', 10, true, true),

('Home Energy Efficiency', 
'Your home energy use is one of the easiest areas to optimize for carbon reduction:

Heating & Cooling: Use programmable thermostats, seal air leaks, insulate properly
Lighting: Switch to LED bulbs, use natural light when possible
Appliances: Choose energy-efficient models, unplug when not in use
Renewable Energy: Consider solar panels or renewable energy providers
Smart Home Tech: Use smart plugs and monitors to track consumption

Small changes can reduce your energy footprint by 20-30% without major investments.',
'energy', 'intermediate', 12, false, true),

('Zero Waste Lifestyle Tips', 
'Reducing waste is crucial for environmental sustainability. Follow the 5 Rs:

Refuse: Say no to unnecessary items and single-use products
Reduce: Buy only what you need, choose quality over quantity  
Reuse: Find new purposes for items before discarding
Recycle: Properly sort and recycle materials when possible
Rot: Compost organic waste to reduce landfill impact

Start small with reusable bags, water bottles, and containers. Gradually build sustainable habits that eliminate waste from your daily routine.',
'waste', 'beginner', 9, true, true);

-- Create sample profile data (admin user)
-- Note: This should be run after the admin user signs up
-- UPDATE public.profiles SET 
--   full_name = 'TraceGreen Admin',
--   total_points = 2500,
--   current_level = 5,
--   current_streak = 15,
--   longest_streak = 25,
--   is_admin = true
-- WHERE email = 'admin@tracegreen.com';

SELECT 'Initial data seeded successfully! 🌱' as message;
