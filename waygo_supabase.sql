-- =====================================================
--  WAYGO — Supabase Production Schema
--  Copy entire file into Supabase SQL Editor and run
-- =====================================================

-- =====================================================
--  EXTENSIONS
-- =====================================================
create extension if not exists pgcrypto;
create extension if not exists postgis;

-- =====================================================
--  UPDATED_AT TRIGGER FUNCTION
-- =====================================================
create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
--  PROFILES  (extends Supabase Auth)
-- =====================================================
create table public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  username          text unique not null,
  email             text unique not null,
  full_name         text,
  bio               text,
  profile_image_url text,
  role              text not null default 'user' check (role in ('user','admin','moderator','business')),
  points            integer not null default 0 check (points >= 0),
  xp_total          integer not null default 0,
  current_level     integer not null default 1,
  streak_current    integer not null default 0,
  streak_longest    integer not null default 0,
  streak_last_date  date,
  checkins_total    integer not null default 0,
  quests_completed  integer not null default 0,
  explored_pct      numeric(5,2) not null default 0.00,
  is_visible_on_map boolean not null default true,
  dark_mode         boolean not null default false,
  language          text not null default 'en',
  last_seen_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles for each row execute function handle_updated_at();

-- RLS
alter table profiles enable row level security;
create policy "Profiles are publicly viewable" on profiles
  for select using (true);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- =====================================================
--  CATEGORIES
-- =====================================================
create table public.categories (
  id        integer primary key generated always as identity,
  slug      text not null unique,
  label_en  text not null,
  label_bg  text,
  emoji     text not null,
  color_hex text not null default '#B090FF',
  is_sight  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
create policy "Categories are publicly viewable" on categories
  for select using (true);

-- =====================================================
--  BUSINESSES  (with PostGIS)
-- =====================================================
create table public.businesses (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references profiles(id) on delete set null,
  category_id       integer not null references categories(id),
  name              text not null,
  description       text,
  address           text,
  location          geography(Point, 4326) not null,
  phone             text,
  website           text,
  cover_image_url   text,
  checkin_code      text not null,
  geofence_radius   integer not null default 150,
  subscription_tier text not null default 'free' check (subscription_tier in ('free','basic','featured')),
  total_checkins    integer not null default 0,
  avg_rating        numeric(3,2) not null default 0.00,
  is_active         boolean not null default true,
  is_approved       boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_biz_location on businesses using gist (location);
create index idx_biz_category on businesses (category_id);

create trigger trg_businesses_updated_at
  before update on businesses for each row execute function handle_updated_at();

alter table businesses enable row level security;
create policy "Active businesses are publicly viewable" on businesses
  for select using (is_active = true and is_approved = true);
create policy "Owners can update their businesses" on businesses
  for update using (owner_id = auth.uid());
create policy "Admins can manage businesses" on businesses
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =====================================================
--  BUSINESS HOURS
-- =====================================================
create table public.business_hours (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at    time,
  closes_at   time,
  is_closed   boolean not null default false,
  unique (business_id, day_of_week)
);

alter table business_hours enable row level security;
create policy "Business hours are publicly viewable" on business_hours
  for select using (true);
create policy "Business owners manage hours" on business_hours
  for all using (
    exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
  );

-- =====================================================
--  BUSINESS PHOTOS
-- =====================================================
create table public.business_photos (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  url          text not null,
  sort_order   integer not null default 0,
  uploaded_at  timestamptz not null default now()
);

alter table business_photos enable row level security;
create policy "Business photos are publicly viewable" on business_photos
  for select using (true);

-- =====================================================
--  CHECK-INS
-- =====================================================
create table public.checkins (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  business_id       uuid not null references businesses(id) on delete cascade,
  photo_url         text,
  points_earned     integer not null default 0,
  xp_awarded        integer not null default 0,
  quest_id          uuid,
  validation_method text not null default 'gps' check (validation_method in ('qr','staff_code','gps')),
  gps_lat           numeric(10,7),
  gps_lng           numeric(10,7),
  distance_meters   integer,
  uploaded_to_feed  boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table checkins enable row level security;
create policy "Users can insert own checkins" on checkins
  for insert with check (auth.uid() = user_id);
create policy "Users can view own checkins" on checkins
  for select using (auth.uid() = user_id);
create policy "Business owners can see their checkins" on checkins
  for select using (
    exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
  );

-- =====================================================
--  FEED POSTS
-- =====================================================
create table public.feed_posts (
  id           uuid primary key default gen_random_uuid(),
  checkin_id   uuid not null unique references checkins(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  business_id  uuid not null references businesses(id) on delete cascade,
  photo_url    text,
  caption      text,
  likes_count  integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table feed_posts enable row level security;
create policy "Feed posts are publicly viewable" on feed_posts
  for select using (true);
create policy "Users can insert own feed posts" on feed_posts
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own feed posts" on feed_posts
  for delete using (auth.uid() = user_id);

-- =====================================================
--  FEED LIKES
-- =====================================================
create table public.feed_likes (
  post_id    uuid not null references feed_posts(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table feed_likes enable row level security;
create policy "Feed likes are publicly viewable" on feed_likes
  for select using (true);
create policy "Users can like/unlike" on feed_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can unlike own" on feed_likes
  for delete using (auth.uid() = user_id);

-- =====================================================
--  BADGES
-- =====================================================
create table public.badges (
  id             text primary key,
  name           text not null,
  name_bg        text,
  description    text,
  description_bg text,
  icon           text not null,
  difficulty     text not null default 'Medium' check (difficulty in ('Easy','Medium','Hard','Legendary')),
  category       text,
  max_value      integer not null default 1,
  unit           text,
  xp_reward      integer not null default 0,
  created_at     timestamptz not null default now()
);

alter table badges enable row level security;
create policy "Badges are publicly viewable" on badges
  for select using (true);

-- =====================================================
--  USER BADGES
-- =====================================================
create table public.user_badges (
  user_id    uuid not null references profiles(id) on delete cascade,
  badge_id   text not null references badges(id) on delete cascade,
  earned_at  timestamptz not null default now(),
  primary key (user_id, badge_id)
);

alter table user_badges enable row level security;
create policy "User badges are publicly viewable" on user_badges
  for select using (true);
create policy "Users can insert own badges" on user_badges
  for insert with check (auth.uid() = user_id);

-- =====================================================
--  QUESTS
-- =====================================================
create table public.quests (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  title_bg       text,
  description    text,
  description_bg text,
  category       text,
  difficulty     text not null default 'Medium' check (difficulty in ('Easy','Medium','Hard','Legendary')),
  xp_reward      integer not null default 100,
  stops_count    integer not null default 1,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table quests enable row level security;
create policy "Quests are publicly viewable" on quests
  for select using (true);

-- =====================================================
--  QUEST STOPS
-- =====================================================
create table public.quest_stops (
  id           uuid primary key default gen_random_uuid(),
  quest_id     uuid not null references quests(id) on delete cascade,
  business_id  uuid not null references businesses(id) on delete cascade,
  sort_order   integer not null default 0,
  unique (quest_id, business_id)
);

create index idx_quest_stops_quest on quest_stops (quest_id);

alter table quest_stops enable row level security;
create policy "Quest stops are publicly viewable" on quest_stops
  for select using (true);

-- =====================================================
--  USER QUESTS
-- =====================================================
create table public.user_quests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  quest_id     uuid not null references quests(id) on delete cascade,
  status       text not null default 'active' check (status in ('active','completed','abandoned')),
  progress     integer not null default 0,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, quest_id)
);

alter table user_quests enable row level security;
create policy "Users can view own quests" on user_quests
  for select using (auth.uid() = user_id);
create policy "Users can manage own quests" on user_quests
  for all using (auth.uid() = user_id);

-- FK from checkins (created earlier) to quests
alter table checkins add constraint fk_checkins_quest
  foreign key (quest_id) references quests(id) on delete set null;

-- =====================================================
--  VOUCHERS
-- =====================================================
create table public.vouchers (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references businesses(id) on delete cascade,
  discount_description text not null,
  discount_pct         integer,
  points_required      integer not null default 0,
  code                 text not null unique,
  is_active            boolean not null default true,
  valid_from           date,
  valid_until          date,
  max_uses             integer,
  times_used           integer not null default 0,
  created_at           timestamptz not null default now()
);

alter table vouchers enable row level security;
create policy "Vouchers are publicly viewable" on vouchers
  for select using (true);
create policy "Business owners can manage vouchers" on vouchers
  for all using (
    exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
  );

-- =====================================================
--  USER VOUCHERS
-- =====================================================
create table public.user_vouchers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  voucher_id   uuid not null references vouchers(id) on delete cascade,
  is_redeemed  boolean not null default false,
  redeemed_at  timestamptz,
  issued_at    timestamptz not null default now(),
  expires_at   timestamptz
);

alter table user_vouchers enable row level security;
create policy "Users can view own vouchers" on user_vouchers
  for select using (auth.uid() = user_id);
create policy "Users can redeem own vouchers" on user_vouchers
  for update using (auth.uid() = user_id);

-- =====================================================
--  POINTS LEDGER
-- =====================================================
create table public.points_ledger (
  id            bigint primary key generated always as identity,
  user_id       uuid not null references profiles(id) on delete cascade,
  amount        integer not null,
  reason        text not null,
  reference_id  uuid,
  balance_after integer not null,
  created_at    timestamptz not null default now()
);

alter table points_ledger enable row level security;
create policy "Users can view own ledger" on points_ledger
  for select using (auth.uid() = user_id);
create policy "System inserts ledger entries" on points_ledger
  for insert with check (auth.uid() = user_id);

-- =====================================================
--  EXPLORED TILES  (fog-of-war, with PostGIS)
-- =====================================================
create table public.explored_tiles (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  location       geography(Point, 4326) not null,
  radius_meters  integer not null default 150,
  revealed_at    timestamptz not null default now()
);

create index idx_explored_tiles_user on explored_tiles (user_id);
create index idx_explored_tiles_loc on explored_tiles using gist (location);

alter table explored_tiles enable row level security;
create policy "Users can view own tiles" on explored_tiles
  for select using (auth.uid() = user_id);
create policy "Users can insert tiles" on explored_tiles
  for insert with check (auth.uid() = user_id);

-- =====================================================
--  USER LOCATIONS  (real-time map visibility)
-- =====================================================
create table public.user_locations (
  user_id    uuid primary key references profiles(id) on delete cascade,
  location   geography(Point, 4326) not null,
  heading    integer,
  speed      integer,
  is_online  boolean not null default false,
  updated_at timestamptz not null default now()
);

create index idx_user_locations_loc on user_locations using gist (location);

alter table user_locations enable row level security;
create policy "User locations are publicly viewable" on user_locations
  for select using (exists (
    select 1 from profiles where id = auth.uid() and is_visible_on_map = true
  ));
create policy "Users can insert own location" on user_locations
  for insert with check (auth.uid() = user_id);
create policy "Users can update own location" on user_locations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================
--  FRIENDSHIPS
-- =====================================================
create table public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  friend_id  uuid not null references profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, friend_id)
);

create trigger trg_friendships_updated_at
  before update on friendships for each row execute function handle_updated_at();

alter table friendships enable row level security;
create policy "Users can view own friendships" on friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can send requests" on friendships
  for insert with check (auth.uid() = user_id);
create policy "Users can accept/decline own requests" on friendships
  for update using (auth.uid() = friend_id);

-- =====================================================
--  NOTIFICATIONS
-- =====================================================
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  type         text not null,
  title        text,
  body         text,
  reference_id uuid,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read" on notifications
  for update using (auth.uid() = user_id);

-- =====================================================
--  REVIEWS
-- =====================================================
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (user_id, business_id)
);

alter table reviews enable row level security;
create policy "Reviews are publicly viewable" on reviews
  for select using (true);
create policy "Authenticated users can review" on reviews
  for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews
  for update using (auth.uid() = user_id);

-- =====================================================
--  BUSINESS ANALYTICS  (daily stats)
-- =====================================================
create table public.business_analytics (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references businesses(id) on delete cascade,
  date              date not null,
  checkins          integer not null default 0,
  unique_visitors   integer not null default 0,
  vouchers_redeemed integer not null default 0,
  feed_posts        integer not null default 0,
  unique (business_id, date)
);

alter table business_analytics enable row level security;
create policy "Business owners can view analytics" on business_analytics
  for select using (
    exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
  );

-- =====================================================
--  VIEWS
-- =====================================================

create view v_leaderboard_all as
select
  p.id, p.full_name as name, p.profile_image_url as avatar_url,
  p.current_level as level, p.xp_total, p.streak_current, p.checkins_total,
  (select count(*) from user_badges ub where ub.user_id = p.id) as badges_count
from profiles p
where p.role = 'user'
order by p.xp_total desc;

create view v_leaderboard_week as
select
  p.id, p.full_name as name, p.profile_image_url as avatar_url,
  p.current_level as level, p.streak_current,
  coalesce(
    sum(pl.amount) filter (where pl.amount > 0 and pl.created_at >= now() - interval '7 days'),
    0
  ) as xp_week
from profiles p
left join points_ledger pl on pl.user_id = p.id
where p.role = 'user'
group by p.id, p.full_name, p.profile_image_url, p.current_level, p.streak_current
order by xp_week desc;

create view v_leaderboard_month as
select
  p.id, p.full_name as name, p.profile_image_url as avatar_url,
  p.current_level as level, p.streak_current,
  coalesce(
    sum(pl.amount) filter (where pl.amount > 0 and pl.created_at >= now() - interval '30 days'),
    0
  ) as xp_month
from profiles p
left join points_ledger pl on pl.user_id = p.id
where p.role = 'user'
group by p.id, p.full_name, p.profile_image_url, p.current_level, p.streak_current
order by xp_month desc;

create view v_active_feed as
select
  fp.id, fp.photo_url, fp.caption, fp.likes_count, fp.created_at,
  p.id as user_id, p.full_name as user_name, p.profile_image_url as avatar_url,
  b.id as business_id, b.name as business_name,
  c.emoji as category_emoji, c.slug as category_slug
from feed_posts fp
join profiles   p on p.id = fp.user_id
join businesses b on b.id = fp.business_id
join categories c on c.id = b.category_id
order by fp.created_at desc;

-- =====================================================
--  HELPER FUNCTION: nearby businesses
-- =====================================================
create or replace function nearby_businesses(
  ref_lng double precision,
  ref_lat double precision,
  radius_meters double precision default 500
)
returns table (
  id               uuid,
  name             text,
  description      text,
  category_slug    text,
  category_emoji   text,
  category_color   text,
  lng              double precision,
  lat              double precision,
  distance_m       double precision,
  subscription_tier text,
  total_checkins   integer,
  avg_rating       numeric,
  is_sight         boolean,
  cover_image_url  text
)
language sql stable
as $$
  select
    b.id, b.name, b.description,
    c.slug as category_slug, c.emoji as category_emoji,
    c.color_hex as category_color,
    st_x(b.location::geometry) as lng,
    st_y(b.location::geometry) as lat,
    st_distance(b.location, st_makepoint(ref_lng, ref_lat)::geography) as distance_m,
    b.subscription_tier, b.total_checkins, b.avg_rating,
    c.is_sight, b.cover_image_url
  from businesses b
  join categories c on c.id = b.category_id
  where b.is_active = true
    and b.is_approved = true
    and st_dwithin(b.location, st_makepoint(ref_lng, ref_lat)::geography, radius_meters)
  order by distance_m;
$$;

-- =====================================================
--  SEED DATA
-- =====================================================

-- Categories
insert into categories (slug, label_en, label_bg, emoji, color_hex, is_sight) values
  ('cafe',     'Cafes',    'Кафенета',    '☕', '#FF90B5', false),
  ('museum',   'Museums',  'Музеи',       '🏛', '#7AC8FF', true),
  ('cultural', 'Cultural', 'Културни',    '🕌', '#78E8C8', true),
  ('bar',      'Bars',     'Барове',      '🍺', '#FFB878', false),
  ('shop',     'Shops',    'Магазини',    '🛍', '#B090FF', false),
  ('gallery',  'Galleries','Галерии',     '🎨', '#FF90B5', true),
  ('park',     'Parks',    'Паркове',     '🌳', '#78E8C8', true),
  ('event',    'Events',   'Събития',     '🎭', '#C8A0FF', false);

-- Businesses (Plovdiv)
insert into businesses (id, category_id, name, description, address, location, checkin_code, geofence_radius, subscription_tier, is_approved, is_active) values
  (gen_random_uuid(), (select id from categories where slug='cafe'),     'Coffee Trail Cafe',         'Specialty coffee in Kapana.',                                'ул. Константин Нунков 5', st_makepoint(24.7488, 42.1432)::geography, 'CAF001', 100, 'featured', true, true),
  (gen_random_uuid(), (select id from categories where slug='cafe'),     'Kapana Craft Beer & Coffee','Craft beer and cold brew in the creative district.',        'ул. Петко Д. Петков 3',  st_makepoint(24.7495, 42.1428)::geography, 'KAP001', 150, 'basic',    true, true),
  (gen_random_uuid(), (select id from categories where slug='museum'),   'Regional History Museum',   '6,000 years of Plovdiv history.',                            'ул. Съединение 1',       st_makepoint(24.7501, 42.1441)::geography, 'MUS001', 200, 'featured', true, true),
  (gen_random_uuid(), (select id from categories where slug='museum'),   'Zlatyu Boyadzhiev House',   'Works of the famous Bulgarian painter.',                     'ул. Арменска 20',        st_makepoint(24.7502, 42.1435)::geography, 'ART001', 150, 'basic',    true, true),
  (gen_random_uuid(), (select id from categories where slug='cultural'), 'Ancient Theatre of Philippopolis','Roman amphitheatre from 2nd century AD.',            'ул. Хемус',              st_makepoint(24.7483, 42.1418)::geography, 'CUL001', 150, 'featured', true, true),
  (gen_random_uuid(), (select id from categories where slug='cultural'), 'Džumaya Mosque',            'Ottoman mosque from the 14th century.',                      'пл. Джумая',             st_makepoint(24.7497, 42.1452)::geography, 'CUL002', 150, 'free',     true, true),
  (gen_random_uuid(), (select id from categories where slug='cultural'), 'Nebet Tepe Hill',           'Oldest part of ancient Plovdiv.',                            'Старинен Пловдив',       st_makepoint(24.7512, 42.1461)::geography, 'CUL003', 200, 'free',     true, true),
  (gen_random_uuid(), (select id from categories where slug='bar'),      'Monkey Bar',                'Cocktail bar in the heart of Kapana.',                       'ул. Петър Самуил 2',     st_makepoint(24.7491, 42.1430)::geography, 'BAR001', 100, 'basic',    true, true),
  (gen_random_uuid(), (select id from categories where slug='gallery'),  'Kapana Gallery',            'Contemporary art exhibitions.',                              'ул. Братя Пулиеви 2',    st_makepoint(24.7489, 42.1425)::geography, 'GAL001', 100, 'free',     true, true),
  (gen_random_uuid(), (select id from categories where slug='park'),     'Tsar Simeon Garden',        'The main city garden, opened in 1892.',                      'бул. Цар Симеон',        st_makepoint(24.7521, 42.1478)::geography, 'PRK001', 200, 'free',     true, true);

-- Badges
insert into badges (id, name, name_bg, description, icon, difficulty, category, max_value, unit, xp_reward) values
  ('first-steps',     'First Steps',     'Първи стъпки',     'Complete your first check-in',               '👣', 'Easy',      'Explorer',   1, 'check-in',      50),
  ('coffee-lover',    'Coffee Lover',    'Кафе любител',     'Visit 3 cafés',                              '☕', 'Easy',      'Foodie',     3, 'café visit',    75),
  ('week-warrior',    'Week Warrior',    'Седмичен воин',    'Maintain a 7-day streak',                    '🔥', 'Medium',    'Dedication', 7, 'day streak',   150),
  ('culture-vulture', 'Culture Vulture', 'Културен лешояд',  'Visit 3 museums or cultural sites',          '🏛', 'Medium',    'Culture',    3, 'museum',       200),
  ('night-owl',       'Night Owl',       'Нощна птица',      'Check in after 22:00',                       '🦉', 'Hard',      'Night Life', 1, 'late check-in',100),
  ('early-bird',      'Early Bird',      'Ранна птичка',     'Check in before 08:00',                      '🐦', 'Hard',      'Morning',    1, 'early check-in',100),
  ('quest-master',    'Quest Master',    'Майстор на задачи', 'Complete 5 quests',                          '⚔', 'Hard',      'Quests',     5, 'quest',        300),
  ('explorer',        'Explorer',        'Изследовател',     'Explore 50% of Plovdiv',                     '🗺', 'Legendary', 'Explorer',  50, '% explored',   500);

-- Quests
insert into quests (id, title, title_bg, description, difficulty, xp_reward, stops_count) values
  (gen_random_uuid(), 'The Coffee Trail',      'Кафе маршрут',       'Visit 3 specialty cafés in the Kapana district.', 'Easy',   150, 3),
  (gen_random_uuid(), 'History Hunter',        'Ловец на история',   'Explore 5 museums and ancient sites.',            'Medium', 300, 5),
  (gen_random_uuid(), 'Kapana Explorer',       'Изследовател на Капана','Get lost in the creative Kapana district.',    'Medium', 250, 4),
  (gen_random_uuid(), 'Plovdiv Grand Tour',    'Гранд тур Пловдив',  'Visit all major attractions.',                    'Hard',   500, 8),
  (gen_random_uuid(), 'Night in Plovdiv',      'Нощ в Пловдив',      'Check in at 3 bars after 21:00.',                 'Medium', 200, 3);

-- =====================================================
--  ENABLE REALTIME
-- =====================================================
alter publication supabase_realtime add table user_locations;
alter publication supabase_realtime add table feed_posts;
alter publication supabase_realtime add table feed_likes;
alter publication supabase_realtime add table notifications;

-- =====================================================
--  STORAGE BUCKETS  (uncomment to create via SQL)
-- =====================================================
-- insert into storage.buckets (id, name, public) values
--   ('checkin-photos', 'checkin-photos', true),
--   ('profile-images', 'profile-images', true),
--   ('business-images', 'business-images', true);
