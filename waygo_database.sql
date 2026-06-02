-- ============================================================
-- WayGo FIXED Database Schema
-- MySQL 8.0+
-- Compatible with the provided server.js:
--   /api/register uses result.insertId, so IDs are INT AUTO_INCREMENT.
-- WARNING: This resets the whole waygo database.
-- ============================================================

DROP DATABASE IF EXISTS waygo;
CREATE DATABASE waygo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE waygo;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash        VARCHAR(255) NOT NULL,
  avatar_url           TEXT,
  level                TINYINT UNSIGNED NOT NULL DEFAULT 1,
  xp_total             INT NOT NULL DEFAULT 0,
  points               INT NOT NULL DEFAULT 0,
  streak_current       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  streak_longest       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  streak_last_date     DATE NULL,
  checkins_total       INT UNSIGNED NOT NULL DEFAULT 0,
  quests_completed     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  explored_pct         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  is_visible_on_map    BOOLEAN NOT NULL DEFAULT TRUE,
  dark_mode            BOOLEAN NOT NULL DEFAULT FALSE,
  language             CHAR(2) NOT NULL DEFAULT 'en',
  account_type         ENUM('user','business','admin') NOT NULL DEFAULT 'user',
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at         DATETIME NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_email (email),
  INDEX idx_users_level (level),
  INDEX idx_users_xp (xp_total DESC)
) ENGINE=InnoDB;

-- ============================================================
-- FRIENDSHIPS
-- ============================================================

CREATE TABLE friendships (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  friend_id   INT UNSIGNED NOT NULL,
  status      ENUM('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_friendship (user_id, friend_id),
  CONSTRAINT chk_friendship_not_self CHECK (user_id <> friend_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_friend_status (user_id, status),
  INDEX idx_friend_incoming (friend_id, status)
) ENGINE=InnoDB;

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(50) NOT NULL UNIQUE,
  label_en    VARCHAR(100) NOT NULL,
  label_bg    VARCHAR(100),
  emoji       VARCHAR(10) NOT NULL,
  color_hex   CHAR(7) NOT NULL DEFAULT '#B090FF',
  is_sight    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO categories (slug, label_en, label_bg, emoji, color_hex, is_sight) VALUES
  ('cafe',     'Cafés',       'Кафенета',       '☕', '#C08457', FALSE),
  ('museum',   'Museums',     'Музеи',          '🏛️', '#8B5CF6', TRUE),
  ('cultural', 'Culture',     'Култура',        '🎭', '#EF4444', TRUE),
  ('bar',      'Bars',        'Барове',         '🍸', '#F59E0B', FALSE),
  ('gallery',  'Galleries',   'Галерии',        '🖼️', '#3B82F6', TRUE),
  ('park',     'Parks',       'Паркове',        '🌳', '#22C55E', TRUE),
  ('restaurant','Restaurants','Ресторанти',     '🍽️', '#EC4899', FALSE),
  ('shop',     'Shops',       'Магазини',       '🛍️', '#14B8A6', FALSE);

-- ============================================================
-- BUSINESSES / MAP PLACES
-- ============================================================

CREATE TABLE businesses (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_user_id     INT UNSIGNED NULL,
  category_id       TINYINT UNSIGNED NOT NULL,
  name              VARCHAR(200) NOT NULL,
  description       TEXT,
  address           VARCHAR(300),
  lat               DECIMAL(10,7) NOT NULL,
  lng               DECIMAL(10,7) NOT NULL,
  phone             VARCHAR(30),
  website           VARCHAR(300),
  cover_image_url   TEXT,
  subscription_tier ENUM('free','basic','featured') NOT NULL DEFAULT 'free',
  total_checkins    INT UNSIGNED NOT NULL DEFAULT 0,
  avg_rating        DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  points_to_redeem  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_biz_category (category_id),
  INDEX idx_biz_tier (subscription_tier),
  INDEX idx_biz_coords (lat, lng),
  INDEX idx_biz_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE business_hours (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  business_id   INT UNSIGNED NOT NULL,
  day_of_week   TINYINT UNSIGNED NOT NULL,
  opens_at      TIME NULL,
  closes_at     TIME NULL,
  is_closed     BOOLEAN NOT NULL DEFAULT FALSE,

  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_biz_day (business_id, day_of_week),
  CONSTRAINT chk_day_of_week CHECK (day_of_week BETWEEN 0 AND 6)
) ENGINE=InnoDB;

CREATE TABLE business_photos (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  business_id  INT UNSIGNED NOT NULL,
  url          TEXT NOT NULL,
  sort_order   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- CHECK-INS / FEED
-- ============================================================

CREATE TABLE checkins (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  business_id       INT UNSIGNED NOT NULL,
  photo_url         TEXT,
  points_earned     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_to_feed  BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count       INT UNSIGNED NOT NULL DEFAULT 0,
  expires_at        DATETIME GENERATED ALWAYS AS (DATE_ADD(created_at, INTERVAL 24 HOUR)) STORED,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  INDEX idx_checkin_user (user_id, created_at DESC),
  INDEX idx_checkin_business (business_id, created_at DESC),
  INDEX idx_checkin_feed (uploaded_to_feed, created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE feed_posts (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  checkin_id   INT UNSIGNED NOT NULL UNIQUE,
  user_id      INT UNSIGNED NOT NULL,
  business_id  INT UNSIGNED NOT NULL,
  photo_url    TEXT,
  likes_count  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  INDEX idx_feed_user (user_id, created_at DESC),
  INDEX idx_feed_time (created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE feed_likes (
  post_id     INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- BADGES
-- ============================================================

CREATE TABLE badges (
  id             VARCHAR(50) NOT NULL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  name_bg        VARCHAR(100),
  description    TEXT,
  description_bg TEXT,
  icon           VARCHAR(10) NOT NULL,
  difficulty     ENUM('Easy','Medium','Hard','Legendary') NOT NULL DEFAULT 'Medium',
  category       VARCHAR(50),
  max_value      INT UNSIGNED NOT NULL DEFAULT 1,
  unit           VARCHAR(50),
  xp_reward      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_badges (
  user_id     INT UNSIGNED NOT NULL,
  badge_id    VARCHAR(50) NOT NULL,
  earned_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, badge_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO badges (id, name, name_bg, description, description_bg, icon, difficulty, category, max_value, unit, xp_reward) VALUES
  ('first-checkin', 'First Check-in', 'Първи check-in', 'Make your first check-in.', 'Направи първия си check-in.', '✅', 'Easy', 'checkin', 1, 'check-in', 50),
  ('coffee-lover', 'Coffee Lover', 'Кафе любител', 'Visit 3 cafés.', 'Посети 3 кафенета.', '☕', 'Easy', 'cafe', 3, 'cafés', 100),
  ('culture-hunter', 'Culture Hunter', 'Ловец на култура', 'Visit 5 sights or museums.', 'Посети 5 забележителности или музеи.', '🏛️', 'Medium', 'sight', 5, 'sights', 200),
  ('social-explorer', 'Social Explorer', 'Социален изследовател', 'Upload 5 check-ins to the feed.', 'Качи 5 check-in снимки във feed-а.', '📸', 'Medium', 'feed', 5, 'posts', 200),
  ('plovdiv-master', 'Plovdiv Master', 'Майстор на Пловдив', 'Reach 1000 XP.', 'Достигни 1000 XP.', '🏆', 'Hard', 'xp', 1000, 'XP', 500);

-- ============================================================
-- QUESTS
-- ============================================================

CREATE TABLE quests (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200) NOT NULL,
  title_bg       VARCHAR(200),
  description    TEXT,
  description_bg TEXT,
  icon           VARCHAR(10),
  difficulty     ENUM('Easy','Medium','Hard','Legendary') NOT NULL DEFAULT 'Medium',
  xp_reward      SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  stops_count    TINYINT UNSIGNED NOT NULL DEFAULT 1,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE quest_stops (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  quest_id     INT UNSIGNED NOT NULL,
  business_id  INT UNSIGNED NOT NULL,
  sort_order   TINYINT UNSIGNED NOT NULL DEFAULT 0,

  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  UNIQUE KEY uq_quest_stop (quest_id, business_id)
) ENGINE=InnoDB;

CREATE TABLE user_quests (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  quest_id      INT UNSIGNED NOT NULL,
  status        ENUM('active','completed','abandoned') NOT NULL DEFAULT 'active',
  progress      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  started_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at  DATETIME NULL,

  UNIQUE KEY uq_user_quest (user_id, quest_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- VOUCHERS / POINTS / TILES / NOTIFICATIONS
-- ============================================================

CREATE TABLE vouchers (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  business_id           INT UNSIGNED NOT NULL,
  discount_description  VARCHAR(300) NOT NULL,
  discount_pct          TINYINT UNSIGNED NULL,
  points_required       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  code                  VARCHAR(30) NOT NULL UNIQUE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from            DATE NULL,
  valid_until           DATE NULL,
  max_uses              INT UNSIGNED NULL,
  times_used            INT UNSIGNED NOT NULL DEFAULT 0,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  INDEX idx_voucher_biz (business_id),
  INDEX idx_voucher_code (code)
) ENGINE=InnoDB;

CREATE TABLE user_vouchers (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  voucher_id   INT UNSIGNED NOT NULL,
  is_redeemed  BOOLEAN NOT NULL DEFAULT FALSE,
  redeemed_at  DATETIME NULL,
  issued_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
  INDEX idx_uv_user (user_id, is_redeemed)
) ENGINE=InnoDB;

CREATE TABLE points_ledger (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  amount         SMALLINT NOT NULL,
  reason         VARCHAR(100) NOT NULL,
  reference_id   INT UNSIGNED NULL,
  balance_after  INT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ledger_user (user_id, created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE explored_tiles (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  center_lat     DECIMAL(10,7) NOT NULL,
  center_lng     DECIMAL(10,7) NOT NULL,
  radius_meters  SMALLINT UNSIGNED NOT NULL DEFAULT 150,
  revealed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_tile (user_id, center_lat, center_lng),
  INDEX idx_tiles_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED NOT NULL,
  type          VARCHAR(50) NOT NULL,
  title         VARCHAR(200),
  body          TEXT,
  reference_id  INT UNSIGNED NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read, created_at DESC)
) ENGINE=InnoDB;

CREATE TABLE business_analytics (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  business_id         INT UNSIGNED NOT NULL,
  date                DATE NOT NULL,
  checkins            SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  unique_visitors     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  vouchers_redeemed   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  feed_posts          SMALLINT UNSIGNED NOT NULL DEFAULT 0,

  UNIQUE KEY uq_biz_date (business_id, date),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  business_id  INT UNSIGNED NOT NULL,
  rating       TINYINT UNSIGNED NOT NULL,
  comment      TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_review (user_id, business_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  INDEX idx_review_biz (business_id, rating),
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER $$

CREATE TRIGGER trg_after_checkin_insert
AFTER INSERT ON checkins
FOR EACH ROW
BEGIN
  UPDATE businesses SET total_checkins = total_checkins + 1 WHERE id = NEW.business_id;
  UPDATE users SET checkins_total = checkins_total + 1 WHERE id = NEW.user_id;
END$$

CREATE TRIGGER trg_after_like_insert
AFTER INSERT ON feed_likes
FOR EACH ROW
BEGIN
  UPDATE feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  UPDATE checkins SET likes_count = likes_count + 1
  WHERE id = (SELECT checkin_id FROM feed_posts WHERE id = NEW.post_id);
END$$

CREATE TRIGGER trg_after_like_delete
AFTER DELETE ON feed_likes
FOR EACH ROW
BEGIN
  UPDATE feed_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  UPDATE checkins SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = (SELECT checkin_id FROM feed_posts WHERE id = OLD.post_id);
END$$

CREATE TRIGGER trg_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE businesses
  SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = NEW.business_id)
  WHERE id = NEW.business_id;
END$$

CREATE TRIGGER trg_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE businesses
  SET avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = NEW.business_id)
  WHERE id = NEW.business_id;
END$$

CREATE TRIGGER trg_after_ledger_insert
AFTER INSERT ON points_ledger
FOR EACH ROW
BEGIN
  UPDATE users SET points = NEW.balance_after WHERE id = NEW.user_id;
  IF NEW.amount > 0 THEN
    UPDATE users SET xp_total = xp_total + (NEW.amount * 2) WHERE id = NEW.user_id;
  END IF;
END$$

CREATE TRIGGER trg_after_user_voucher_redeem
AFTER UPDATE ON user_vouchers
FOR EACH ROW
BEGIN
  IF NEW.is_redeemed = TRUE AND OLD.is_redeemed = FALSE THEN
    UPDATE vouchers SET times_used = times_used + 1 WHERE id = NEW.voucher_id;
  END IF;
END$$

DELIMITER ;

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW v_leaderboard_all AS
SELECT
  u.id,
  u.name,
  u.avatar_url,
  u.level,
  u.xp_total,
  u.streak_current,
  u.checkins_total,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id) AS badges_count
FROM users u
WHERE u.is_active = TRUE AND u.account_type = 'user';

CREATE VIEW v_leaderboard_week AS
SELECT
  u.id,
  u.name,
  u.avatar_url,
  u.level,
  u.streak_current,
  COALESCE(SUM(CASE WHEN pl.amount > 0 THEN pl.amount ELSE 0 END), 0) AS xp_week
FROM users u
LEFT JOIN points_ledger pl
  ON pl.user_id = u.id
  AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
WHERE u.is_active = TRUE AND u.account_type = 'user'
GROUP BY u.id, u.name, u.avatar_url, u.level, u.streak_current;

CREATE VIEW v_leaderboard_month AS
SELECT
  u.id,
  u.name,
  u.avatar_url,
  u.level,
  u.streak_current,
  COALESCE(SUM(CASE WHEN pl.amount > 0 THEN pl.amount ELSE 0 END), 0) AS xp_month
FROM users u
LEFT JOIN points_ledger pl
  ON pl.user_id = u.id
  AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
WHERE u.is_active = TRUE AND u.account_type = 'user'
GROUP BY u.id, u.name, u.avatar_url, u.level, u.streak_current;

CREATE VIEW v_active_feed AS
SELECT
  fp.id,
  fp.photo_url,
  fp.likes_count,
  fp.created_at,
  u.id AS user_id,
  u.name AS user_name,
  u.avatar_url,
  b.id AS business_id,
  b.name AS business_name,
  c.emoji AS category_emoji,
  c.slug AS category_slug
FROM feed_posts fp
JOIN checkins ci ON ci.id = fp.checkin_id
JOIN users u ON u.id = fp.user_id
JOIN businesses b ON b.id = fp.business_id
JOIN categories c ON c.id = b.category_id
WHERE ci.expires_at > NOW()
ORDER BY fp.created_at DESC;

CREATE VIEW v_user_profile AS
SELECT
  u.*,
  (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id) AS badges_count,
  (SELECT COUNT(*) FROM friendships f
   WHERE (f.user_id = u.id OR f.friend_id = u.id)
   AND f.status = 'accepted') AS friends_count,
  (SELECT COUNT(*) FROM user_quests uq
   WHERE uq.user_id = u.id AND uq.status = 'completed') AS quests_completed_count
FROM users u;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$

CREATE PROCEDURE sp_award_points(
  IN p_user_id    INT UNSIGNED,
  IN p_amount     SMALLINT,
  IN p_reason     VARCHAR(100),
  IN p_reference  INT UNSIGNED
)
BEGIN
  DECLARE v_current_balance INT DEFAULT 0;

  SELECT points INTO v_current_balance
  FROM users
  WHERE id = p_user_id;

  INSERT INTO points_ledger (user_id, amount, reason, reference_id, balance_after)
  VALUES (p_user_id, p_amount, p_reason, p_reference, v_current_balance + p_amount);
END$$

CREATE PROCEDURE sp_process_checkin(
  IN p_user_id      INT UNSIGNED,
  IN p_business_id  INT UNSIGNED,
  IN p_photo_url    TEXT,
  IN p_upload_feed  BOOLEAN
)
BEGIN
  DECLARE v_checkin_id INT UNSIGNED DEFAULT 0;
  DECLARE v_is_sight BOOLEAN DEFAULT FALSE;
  DECLARE v_pts SMALLINT DEFAULT 0;

  SELECT c.is_sight INTO v_is_sight
  FROM businesses b
  JOIN categories c ON c.id = b.category_id
  WHERE b.id = p_business_id
  LIMIT 1;

  IF v_is_sight = TRUE AND p_upload_feed = TRUE THEN
    SET v_pts = 50;
  END IF;

  INSERT INTO checkins (user_id, business_id, photo_url, points_earned, uploaded_to_feed)
  VALUES (p_user_id, p_business_id, p_photo_url, v_pts, p_upload_feed);

  SET v_checkin_id = LAST_INSERT_ID();

  IF p_upload_feed = TRUE THEN
    INSERT INTO feed_posts (checkin_id, user_id, business_id, photo_url)
    VALUES (v_checkin_id, p_user_id, p_business_id, p_photo_url);
  END IF;

  IF v_pts > 0 THEN
    CALL sp_award_points(p_user_id, v_pts, 'checkin_upload', v_checkin_id);
  END IF;

  INSERT IGNORE INTO explored_tiles (user_id, center_lat, center_lng)
  SELECT p_user_id, b.lat, b.lng
  FROM businesses b
  WHERE b.id = p_business_id;

  SELECT v_checkin_id AS checkin_id, v_pts AS points_earned;
END$$

DELIMITER ;

-- ============================================================
-- SAMPLE SEED DATA: Plovdiv businesses and quests
-- ============================================================

INSERT INTO businesses (category_id, name, description, address, lat, lng, subscription_tier, points_to_redeem) VALUES
  ((SELECT id FROM categories WHERE slug='cafe'), 'Coffee Trail Cafe', 'Specialty coffee in Kapana.', 'ул. Константин Нунков 5', 42.1432000, 24.7488000, 'featured', 30),
  ((SELECT id FROM categories WHERE slug='cafe'), 'Kapana Craft Beer & Coffee', 'Craft beer and cold brew in the creative district.', 'ул. Петко Д. Петков 3', 42.1428000, 24.7495000, 'basic', 20),
  ((SELECT id FROM categories WHERE slug='museum'), 'Regional History Museum', '6,000 years of Plovdiv history.', 'ул. Съединение 1', 42.1441000, 24.7481000, 'featured', 0),
  ((SELECT id FROM categories WHERE slug='museum'), 'Zlatyu Boyadzhiev House', 'Works of the famous Bulgarian painter.', 'ул. Арменска 20', 42.1435000, 24.7502000, 'basic', 0),
  ((SELECT id FROM categories WHERE slug='cultural'), 'Ancient Theatre of Philippopolis', 'Roman amphitheatre from the 2nd century AD.', 'ул. Хемус', 42.1418000, 24.7483000, 'featured', 0),
  ((SELECT id FROM categories WHERE slug='cultural'), 'Dzhumaya Mosque', 'Ottoman mosque from the 14th century.', 'пл. Джумая', 42.1452000, 24.7497000, 'free', 0),
  ((SELECT id FROM categories WHERE slug='cultural'), 'Nebet Tepe Hill', 'Oldest part of ancient Plovdiv.', 'Старинен Пловдив', 42.1461000, 24.7512000, 'free', 0),
  ((SELECT id FROM categories WHERE slug='bar'), 'Monkey Bar', 'Cocktail bar in the heart of Kapana.', 'ул. Петър Самуил 2', 42.1430000, 24.7491000, 'basic', 25),
  ((SELECT id FROM categories WHERE slug='gallery'), 'Kapana Gallery', 'Contemporary art exhibitions.', 'ул. Братя Пулиеви 2', 42.1425000, 24.7489000, 'free', 0),
  ((SELECT id FROM categories WHERE slug='park'), 'Tsar Simeon Garden', 'The main city garden, opened in 1892.', 'бул. Цар Симеон', 42.1478000, 24.7521000, 'free', 0),
  ((SELECT id FROM categories WHERE slug='restaurant'), 'Rahat Tepe', 'Restaurant near the Old Town with city views.', 'ул. Д-р Стоян Чомаков', 42.1465000, 24.7510000, 'basic', 25),
  ((SELECT id FROM categories WHERE slug='shop'), 'Kapana Concept Store', 'Local design and gifts.', 'Капана', 42.1436000, 24.7490000, 'free', 15);

INSERT INTO business_hours (business_id, day_of_week, opens_at, closes_at, is_closed)
SELECT b.id, d.day_of_week, '09:00:00', '22:00:00', FALSE
FROM businesses b
JOIN (
  SELECT 0 AS day_of_week UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
  UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
) d;

INSERT INTO quests (title, title_bg, description, description_bg, icon, difficulty, xp_reward, stops_count) VALUES
  ('The Coffee Trail', 'Кафе маршрут', 'Visit 3 specialty cafés in Kapana.', 'Посети 3 специални кафенета в Капана.', '☕', 'Easy', 150, 3),
  ('History Hunter', 'Ловец на история', 'Explore 5 museums and ancient sites.', 'Разгледай 5 музея и древни места.', '🏛️', 'Medium', 300, 5),
  ('Kapana Explorer', 'Изследовател на Капана', 'Get lost in the creative Kapana district.', 'Разгледай творческия квартал Капана.', '🗺️', 'Medium', 250, 4),
  ('Plovdiv Grand Tour', 'Гранд тур Пловдив', 'Visit all major attractions.', 'Посети всички основни забележителности.', '🏆', 'Hard', 500, 8),
  ('Night in Plovdiv', 'Нощ в Пловдив', 'Check in at 3 bars after 21:00.', 'Направи check-in в 3 бара след 21:00.', '🌙', 'Medium', 200, 3);

-- Example vouchers for seeded businesses
INSERT INTO vouchers (business_id, discount_description, discount_pct, points_required, code, valid_from, valid_until, max_uses)
SELECT id, '10% off your next order', 10, 30, CONCAT('WAYGO', id), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 100
FROM businesses
WHERE points_to_redeem > 0;

-- Link first few quest stops
INSERT INTO quest_stops (quest_id, business_id, sort_order)
SELECT q.id, b.id, 1
FROM quests q
JOIN businesses b ON b.name = 'Coffee Trail Cafe'
WHERE q.title = 'The Coffee Trail';

INSERT INTO quest_stops (quest_id, business_id, sort_order)
SELECT q.id, b.id, 2
FROM quests q
JOIN businesses b ON b.name = 'Kapana Craft Beer & Coffee'
WHERE q.title = 'The Coffee Trail';

INSERT INTO quest_stops (quest_id, business_id, sort_order)
SELECT q.id, b.id, 1
FROM quests q
JOIN businesses b ON b.name = 'Regional History Museum'
WHERE q.title = 'History Hunter';

INSERT INTO quest_stops (quest_id, business_id, sort_order)
SELECT q.id, b.id, 2
FROM quests q
JOIN businesses b ON b.name = 'Ancient Theatre of Philippopolis'
WHERE q.title = 'History Hunter';

-- ============================================================
-- HEALTH CHECK QUERIES YOU CAN RUN AFTER IMPORT:
-- SELECT COUNT(*) FROM businesses;
-- SELECT * FROM v_leaderboard_all;
-- CALL sp_process_checkin(1, 1, NULL, TRUE);
-- ============================================================
