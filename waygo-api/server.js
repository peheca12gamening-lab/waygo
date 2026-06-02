const express = require('express');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── MySQL connection pool ─────────────────────────────────────
const db = mysql.createPool({
  host:             process.env.DB_HOST,
  port:             parseInt(process.env.DB_PORT) || 3305,
  user:             process.env.DB_USER,
  password:         process.env.DB_PASSWORD,
  database:         process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:  10,
});

// Test connection on startup
db.getConnection()
  .then(() => console.log('✅ Connected to MySQL database'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

// ── Auth middleware ───────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── REGISTER ─────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password, avatar_url } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)',
      [name, email.toLowerCase().trim(), hash, avatar_url || null]
    );
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );
    const user = users[0];
    delete user.password_hash;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Акаунт с този имейл вече съществува.' });
    }
    console.error('Register error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (!users.length) {
      return res.status(400).json({ error: 'Няма акаунт с този имейл.' });
    }
    const ok = await bcrypt.compare(password, users[0].password_hash);
    if (!ok) {
      return res.status(400).json({ error: 'Грешна парола.' });
    }
    const user = { ...users[0] };
    delete user.password_hash;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── GET PROFILE ───────────────────────────────────────────────
app.get('/api/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.*,
        (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id) AS badges_count,
        (SELECT COUNT(*) FROM friendships f
         WHERE (f.user_id = u.id OR f.friend_id = u.id) AND f.status = 'accepted') AS friends_count
       FROM users u WHERE u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const user = { ...rows[0] };
    delete user.password_hash;
    res.json(user);
  } catch (e) {
    console.error('Profile error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────
app.patch('/api/profile', auth, async (req, res) => {
  const { avatar_url, dark_mode, language, email } = req.body;
  try {
    await db.execute(
      `UPDATE users SET
        avatar_url  = COALESCE(?, avatar_url),
        dark_mode   = COALESCE(?, dark_mode),
        language    = COALESCE(?, language),
        email       = COALESCE(?, email),
        updated_at  = NOW()
       WHERE id = ?`,
      [avatar_url ?? null, dark_mode ?? null, language ?? null, email ?? null, req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Update profile error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── BUSINESSES / MAP ──────────────────────────────────────────
app.get('/api/businesses', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b.*, c.slug AS category, c.emoji, c.color_hex, c.is_sight
      FROM businesses b
      JOIN categories c ON c.id = b.category_id
      WHERE b.is_active = 1
      ORDER BY b.subscription_tier DESC, b.total_checkins DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error('Businesses error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── CHECK-IN ──────────────────────────────────────────────────
app.post('/api/checkin', auth, async (req, res) => {
  const { business_id, photo_url, upload_to_feed } = req.body;
  if (!business_id) return res.status(400).json({ error: 'business_id is required' });
  try {
    const [rows] = await db.execute(
      'CALL sp_process_checkin(?, ?, ?, ?)',
      [req.user.id, business_id, photo_url || null, upload_to_feed ? 1 : 0]
    );
    res.json(rows[0][0]);
  } catch (e) {
    console.error('Checkin error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── GET USER CHECK-INS ────────────────────────────────────────
app.get('/api/checkins', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ci.*, b.name AS place_name, c.slug AS place_category, c.emoji
       FROM checkins ci
       JOIN businesses b ON b.id = ci.business_id
       JOIN categories c ON c.id = b.category_id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('Checkins error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── FEED ──────────────────────────────────────────────────────
app.get('/api/feed', auth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM v_active_feed LIMIT 50');
    res.json(rows);
  } catch (e) {
    console.error('Feed error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── LIKE / UNLIKE POST ────────────────────────────────────────
app.post('/api/feed/:id/like', auth, async (req, res) => {
  try {
    await db.execute(
      'INSERT INTO feed_likes (post_id, user_id) VALUES (?, ?)',
      [req.params.id, req.user.id]
    );
    res.json({ liked: true });
  } catch {
    // Already liked → unlike
    await db.execute(
      'DELETE FROM feed_likes WHERE post_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ liked: false });
  }
});

// ── LEADERBOARD ───────────────────────────────────────────────
app.get('/api/leaderboard/:period', auth, async (req, res) => {
  const views = {
    all:   'v_leaderboard_all',
    week:  'v_leaderboard_week',
    month: 'v_leaderboard_month',
  };
  const view = views[req.params.period] || 'v_leaderboard_all';
  try {
    const [rows] = await db.execute(`SELECT * FROM ${view} LIMIT 100`);
    res.json(rows);
  } catch (e) {
    console.error('Leaderboard error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── FRIENDS ───────────────────────────────────────────────────
app.get('/api/friends', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.avatar_url, u.level, u.points, u.checkins_total,
              f.id AS friendship_id, f.status, f.created_at
       FROM friendships f
       JOIN users u ON (
         CASE WHEN f.user_id = ? THEN u.id = f.friend_id
              ELSE u.id = f.user_id END
       )
       WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'`,
      [req.user.id, req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('Friends error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── FRIEND REQUESTS (incoming) ────────────────────────────────
app.get('/api/friends/requests', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT f.id, f.created_at, u.id AS from_user_id, u.name, u.avatar_url
       FROM friendships f
       JOIN users u ON u.id = f.user_id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('Friend requests error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── SEND FRIEND REQUEST ───────────────────────────────────────
app.post('/api/friends/request', auth, async (req, res) => {
  const { friend_id } = req.body;
  if (!friend_id) return res.status(400).json({ error: 'friend_id is required' });
  try {
    await db.execute(
      'INSERT IGNORE INTO friendships (user_id, friend_id, status) VALUES (?, ?, "pending")',
      [req.user.id, friend_id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Send friend request error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── ACCEPT FRIEND REQUEST ─────────────────────────────────────
app.patch('/api/friends/:id/accept', auth, async (req, res) => {
  try {
    await db.execute(
      "UPDATE friendships SET status = 'accepted', updated_at = NOW() WHERE id = ? AND friend_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Accept friend error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── DECLINE FRIEND REQUEST ────────────────────────────────────
app.patch('/api/friends/:id/decline', auth, async (req, res) => {
  try {
    await db.execute(
      "UPDATE friendships SET status = 'declined', updated_at = NOW() WHERE id = ? AND friend_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Decline friend error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── BADGES ────────────────────────────────────────────────────
app.get('/api/badges', auth, async (req, res) => {
  try {
    const [all]    = await db.execute('SELECT * FROM badges ORDER BY difficulty');
    const [earned] = await db.execute(
      'SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?',
      [req.user.id]
    );
    const earnedIds = earned.map(r => r.badge_id);
    const result = all.map(b => ({
      ...b,
      earned: earnedIds.includes(b.id),
      earned_at: earned.find(r => r.badge_id === b.id)?.earned_at || null,
    }));
    res.json(result);
  } catch (e) {
    console.error('Badges error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── QUESTS ────────────────────────────────────────────────────
app.get('/api/quests', auth, async (req, res) => {
  try {
    const [quests] = await db.execute('SELECT * FROM quests WHERE is_active = 1');
    const [userQuests] = await db.execute(
      'SELECT * FROM user_quests WHERE user_id = ?',
      [req.user.id]
    );
    const result = quests.map(q => ({
      ...q,
      user_status: userQuests.find(uq => uq.quest_id === q.id) || null,
    }));
    res.json(result);
  } catch (e) {
    console.error('Quests error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── ACCEPT QUEST ──────────────────────────────────────────────
app.post('/api/quests/:id/accept', auth, async (req, res) => {
  try {
    await db.execute(
      'INSERT IGNORE INTO user_quests (user_id, quest_id, status) VALUES (?, ?, "active")',
      [req.user.id, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Accept quest error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── VOUCHERS ──────────────────────────────────────────────────
app.get('/api/vouchers', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT uv.*, v.discount_description, v.code, v.discount_pct,
              b.name AS business_name, b.id AS business_id
       FROM user_vouchers uv
       JOIN vouchers v ON v.id = uv.voucher_id
       JOIN businesses b ON b.id = v.business_id
       WHERE uv.user_id = ?
       ORDER BY uv.issued_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('Vouchers error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── REDEEM VOUCHER ────────────────────────────────────────────
app.patch('/api/vouchers/:id/redeem', auth, async (req, res) => {
  try {
    await db.execute(
      `UPDATE user_vouchers SET is_redeemed = 1, redeemed_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Redeem voucher error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── NOTIFICATIONS ─────────────────────────────────────────────
app.get('/api/notifications', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error('Notifications error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/notifications/read', auth, async (req, res) => {
  try {
    await db.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 WayGo API running on http://localhost:${PORT}`);
});