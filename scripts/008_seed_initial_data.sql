-- Insert initial badges
INSERT INTO public.badges (name, description, category, criteria, points_reward, rarity) VALUES
('First Steps', 'Log your first carbon footprint activity', 'milestone', '{"activities_logged": 1}', 50, 'common'),
('Week Warrior', 'Track your carbon footprint for 7 consecutive days', 'streak', '{"consecutive_days": 7}', 100, 'common'),
('Month Master', 'Track your carbon footprint for 30 consecutive days', 'streak', '{"consecutive_days": 30}', 500, 'rare'),
('Carbon Saver', 'Reduce your carbon footprint by 10kg CO2 in a month', 'carbon_reduction', '{"carbon_saved": 10}', 200, 'common'),
('Eco Champion', 'Reduce your carbon footprint by 50kg CO2 in a month', 'carbon_reduction', '{"carbon_saved": 50}', 1000, 'epic'),
('Community Helper', 'Complete 5 community challenges', 'community', '{"challenges_completed": 5}', 300, 'rare'),
('Knowledge Seeker', 'Read 10 educational articles', 'education', '{"articles_read": 10}', 150, 'common'),
('Green Guru', 'Achieve level 10 in the app', 'milestone', '{"level_reached": 10}', 2000, 'legendary');

-- Insert initial achievements
INSERT INTO public.achievements (name, description, target_value, achievement_type, points_reward) VALUES
('Carbon Tracker', 'Log 100 carbon footprint activities', 100, 'days_tracked', 500),
('Streak Master', 'Maintain a 30-day tracking streak', 30, 'days_tracked', 1000),
('Challenge Champion', 'Complete 10 community challenges', 10, 'challenges_completed', 750),
('Eco Educator', 'Read 50 educational articles', 50, 'community_actions', 400),
('Carbon Reducer', 'Save 100kg of CO2 emissions', 100, 'carbon_saved', 1500);

-- Insert sample educational content
INSERT INTO public.educational_content (title, content, content_type, category, difficulty_level, estimated_read_time, tags) VALUES
('Understanding Your Carbon Footprint', 'Learn what carbon footprint means and how your daily activities contribute to greenhouse gas emissions...', 'article', 'general', 'beginner', 5, ARRAY['basics', 'carbon', 'environment']),
('Sustainable Transportation Tips', 'Discover eco-friendly ways to get around your city while reducing your carbon emissions...', 'article', 'transportation', 'beginner', 7, ARRAY['transport', 'tips', 'sustainable']),
('Energy Saving at Home', 'Simple changes you can make at home to reduce energy consumption and lower your carbon footprint...', 'article', 'energy', 'beginner', 6, ARRAY['energy', 'home', 'savings']),
('The Impact of Food Choices', 'How your dietary choices affect the environment and tips for sustainable eating...', 'article', 'food', 'intermediate', 8, ARRAY['food', 'diet', 'sustainability']),
('Waste Reduction Strategies', 'Practical approaches to minimize waste and embrace a circular economy mindset...', 'article', 'waste', 'beginner', 5, ARRAY['waste', 'recycling', 'circular-economy']);

-- Insert sample rewards
INSERT INTO public.rewards (name, description, category, points_cost, monetary_value, partner_name, stock_quantity) VALUES
('₹50 Eco Store Discount', 'Get ₹50 off on sustainable products at our partner eco store', 'discount', 500, 50.00, 'Green Living Store', 100),
('Bamboo Water Bottle', 'Sustainable bamboo water bottle to reduce plastic waste', 'product', 1000, 299.00, 'EcoWare India', 50),
('Tree Plantation Certificate', 'Plant a tree in your name and receive a digital certificate', 'donation', 750, 150.00, 'Green Earth Foundation', NULL),
('₹100 Organic Food Voucher', 'Voucher for organic and locally sourced food products', 'discount', 1200, 100.00, 'Organic Harvest', 75),
('Eco-Friendly Tote Bag', 'Reusable cotton tote bag for sustainable shopping', 'product', 600, 199.00, 'Sustainable Living Co', 200);

-- Insert sample partners
INSERT INTO public.partners (name, description, partnership_type, website_url) VALUES
('Green Living Store', 'Leading retailer of sustainable and eco-friendly products', 'eco_brand', 'https://greenlivingstore.in'),
('EcoWare India', 'Manufacturer of sustainable lifestyle products', 'eco_brand', 'https://ecowareindia.com'),
('Green Earth Foundation', 'NGO focused on reforestation and environmental conservation', 'ngo', 'https://greenearthfoundation.org'),
('Organic Harvest', 'Organic food and grocery delivery service', 'eco_brand', 'https://organicharvest.in'),
('Sustainable Living Co', 'Community-focused sustainable products company', 'eco_brand', 'https://sustainableliving.co.in');

-- Insert sample challenges
INSERT INTO public.challenges (title, description, challenge_type, category, target_metric, target_value, points_reward, start_date, end_date, max_participants) VALUES
('Car-Free Week', 'Go car-free for a week and use sustainable transportation alternatives', 'individual', 'transportation', 'days_without_car', 7, 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', NULL),
('Energy Saver Challenge', 'Reduce your home energy consumption by 20% this month', 'individual', 'energy', 'energy_reduction_percent', 20, 1000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', NULL),
('Zero Waste Weekend', 'Minimize waste generation during the weekend', 'community', 'waste', 'waste_reduction_kg', 2, 300, CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', 1000),
('Plant-Based Week', 'Adopt a plant-based diet for one week', 'individual', 'food', 'plant_based_meals', 21, 750, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '10 days', NULL);

-- Insert sample leaderboards
INSERT INTO public.leaderboards (name, description, leaderboard_type, metric, time_period) VALUES
('Global Points Leaders', 'Top users by total points earned', 'global', 'total_points', 'all_time'),
('Weekly Carbon Savers', 'Users who saved the most carbon this week', 'weekly', 'carbon_saved', 'this_week'),
('Monthly Streak Champions', 'Longest tracking streaks this month', 'monthly', 'streak_days', 'this_month'),
('Challenge Completers', 'Users who completed the most challenges', 'global', 'challenges_completed', 'all_time');
