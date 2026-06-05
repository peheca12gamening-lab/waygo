-- Quest system v2 migration
-- Run in Supabase SQL Editor

ALTER TABLE quests ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('bronze','silver','gold','platinum')) DEFAULT 'bronze';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS requirements jsonb DEFAULT '[]'::jsonb;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS icon text DEFAULT 'Sword';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS unlocks_at_level integer DEFAULT 1;

-- Bronze quests (50–150 XP)
INSERT INTO quests (title, description, category, difficulty, tier, xp_reward, stops_count, requirements, icon, unlocks_at_level, is_active)
VALUES
('First Steps', 'Check in anywhere once to take your first step as an explorer.', 'cultural', 'Easy', 'bronze', 50, 1,
 '[{"type":"checkin","count":1,"description":"Check in anywhere once"}]'::jsonb, 'Footprints', 1, true),

('Hill Climber', 'Visit both Nebet Tepe and Sahat Tepe hills.', 'nature', 'Easy', 'bronze', 80, 2,
 '[{"type":"visit","target":["pl-12","pl-13"],"description":"Visit Nebet Tepe and Sahat Tepe"}]'::jsonb, 'Mountain', 1, true),

('River Walker', 'Visit the Maritsa Riverside Walk promenade.', 'nature', 'Easy', 'bronze', 50, 1,
 '[{"type":"visit","target":["pl-18"],"description":"Visit Maritsa Riverside Walk"}]'::jsonb, 'Droplets', 1, true),

('Mosque & Church', 'Visit Dzhumaya Mosque and the Church of Saints Konstantin and Elena.', 'cultural', 'Easy', 'bronze', 100, 2,
 '[{"type":"visit","target":["pl-01","pl-11"],"description":"Visit Dzhumaya Mosque and Church of Saints Konstantin and Elena"}]'::jsonb, 'Church', 1, true),

('Kapana Explorer', 'Check in anywhere in the Kapana Creative District.', 'cultural', 'Easy', 'bronze', 70, 1,
 '[{"type":"visit","target":["pl-03"],"description":"Check in at Kapana Creative District"}]'::jsonb, 'Map', 1, true),

('Garden Stroller', 'Visit Tsar Simeon Garden, the city''s central park.', 'nature', 'Easy', 'bronze', 50, 1,
 '[{"type":"visit","target":["pl-06"],"description":"Visit Tsar Simeon Garden"}]'::jsonb, 'Flower2', 1, true),

('Stadium Seeker', 'Visit the Roman Stadium of Philippopolis.', 'historic', 'Easy', 'bronze', 60, 1,
 '[{"type":"visit","target":["pl-16"],"description":"Visit Roman Stadium of Philippopolis"}]'::jsonb, 'Trophy', 1, true),

-- Silver quests (200–400 XP)
('History Buff', 'Visit 5 historic sites in Plovdiv.', 'historic', 'Medium', 'silver', 250, 5,
 '[{"type":"checkin","count":5,"description":"Visit 5 historic sites"}]'::jsonb, 'ScrollText', 3, true),

('Old Town Conqueror', 'Visit 8 locations in and around the Old Town area.', 'cultural', 'Medium', 'silver', 300, 8,
 '[{"type":"checkin","count":8,"description":"Visit 8 Old Town locations"}]'::jsonb, 'Castle', 3, true),

('Photo Walk', 'Check in at 3 scenic viewpoints — hills and river walks count.', 'nature', 'Medium', 'silver', 200, 3,
 '[{"type":"checkin","count":3,"description":"Check in at 3 scenic viewpoints"}]'::jsonb, 'Camera', 3, true),

('Night Owl', 'Check in at any nightlife location after 8 PM.', 'nightlife', 'Medium', 'silver', 250, 1,
 '[{"type":"checkin","count":1,"description":"Check in at a nightlife spot after 8 PM"}]'::jsonb, 'Moon', 3, true),

('Culture Vulture', 'Visit the Ethnographic Museum, Plovdiv Art Gallery, and the Regional Historical Museum.', 'cultural', 'Medium', 'silver', 350, 3,
 '[{"type":"visit","target":["pl-10","pl-29","pl-05"],"description":"Visit 3 cultural institutions"}]'::jsonb, 'Palette', 3, true),

('The Three Hills', 'Visit Nebet Tepe, Sahat Tepe, and Bunardzhika Hill.', 'nature', 'Medium', 'silver', 300, 3,
 '[{"type":"visit","target":["pl-12","pl-13","pl-22"],"description":"Visit all 3 hills"}]'::jsonb, 'Triangle', 3, true),

-- Gold quests (500–900 XP)
('Plovdiv Insider', 'Visit 15 unique locations across Plovdiv.', 'cultural', 'Hard', 'gold', 600, 15,
 '[{"type":"checkin","count":15,"description":"Visit 15 unique locations"}]'::jsonb, 'Compass', 5, true),

('Grand Tour', 'Visit every museum and gallery in Plovdiv.', 'cultural', 'Hard', 'gold', 700, 5,
 '[{"type":"checkin","count":5,"description":"Visit all museums and galleries"}]'::jsonb, 'Landmark', 5, true),

('Ancient Civilizations', 'Visit the Roman Stadium, Ancient Theatre, and Dzhumaya Mosque.', 'historic', 'Hard', 'gold', 650, 3,
 '[{"type":"visit","target":["pl-16","pl-02","pl-01"],"description":"Visit Roman Stadium, Ancient Theatre, and Dzhumaya Mosque"}]'::jsonb, 'Columns', 5, true),

('Foodie Trail', 'Check in at 5 food or drink businesses.', 'food', 'Hard', 'gold', 500, 5,
 '[{"type":"checkin","count":5,"description":"Check in at 5 food/drink spots"}]'::jsonb, 'UtensilsCrossed', 5, true),

('Weekend Warrior', 'Check in 3 days in a row to earn this badge.', 'cultural', 'Hard', 'gold', 500, 1,
 '[{"type":"streak","count":3,"description":"Maintain a 3-day check-in streak"}]'::jsonb, 'Zap', 5, true),

('Social Butterfly', 'Have 5 friends in the app.', 'cultural', 'Hard', 'gold', 500, 1,
 '[{"type":"friends","count":5,"description":"Have 5 friends in the app"}]'::jsonb, 'Users', 5, true),

-- Platinum quests (1000–2500 XP)
('Plovdiv Master', 'Visit 25 unique locations across Plovdiv.', 'cultural', 'Legendary', 'platinum', 1500, 25,
 '[{"type":"checkin","count":25,"description":"Visit 25 unique locations"}]'::jsonb, 'Award', 10, true),

('Legend of the Old Town', 'Visit every single Old Town landmark and historic location.', 'historic', 'Legendary', 'platinum', 2000, 12,
 '[{"type":"checkin","count":12,"description":"Visit every Old Town landmark"}]'::jsonb, 'Crown', 10, true),

('Conqueror of the Hills', 'Visit all 3 hills plus the Alyosha Monument.', 'nature', 'Legendary', 'platinum', 1800, 4,
 '[{"type":"visit","target":["pl-12","pl-13","pl-22","pl-30"],"description":"Visit all hills and Alyosha Monument"}]'::jsonb, 'FlagTriangleRight', 10, true),

('The Complete Explorer', 'Complete 10 other quests.', 'cultural', 'Legendary', 'platinum', 2500, 1,
 '[{"type":"quests_completed","count":10,"description":"Complete 10 other quests"}]'::jsonb, 'CircleDot', 10, true),

('Century Club', 'Accumulate 100 total check-ins.', 'cultural', 'Legendary', 'platinum', 2000, 1,
 '[{"type":"checkin","count":100,"description":"Accumulate 100 total check-ins"}]'::jsonb, 'Star', 10, true),

('Coffee Connoisseur', 'Visit 3 different cafés in Plovdiv and earn the Coffee Connoisseur badge.', 'food', 'Medium', 'silver', 300, 3,
 '[{"type":"checkin","count":3,"description":"Visit 3 different cafés"}]'::jsonb, 'Coffee', 3, true)
ON CONFLICT DO NOTHING;
