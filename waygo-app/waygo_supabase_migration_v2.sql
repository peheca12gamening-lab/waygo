-- ── Leaderboard ranking function ──────────────────────────────────────────────
-- Run this in Supabase SQL Editor.
-- Provides server-side ROW_NUMBER() ranking for the leaderboard.

CREATE OR REPLACE FUNCTION get_leaderboard(period TEXT DEFAULT 'weekly')
RETURNS TABLE (
  rank INT,
  user_id UUID,
  name TEXT,
  avatar_url TEXT,
  xp_weekly BIGINT,
  xp_monthly BIGINT,
  xp_total BIGINT,
  checkin_count BIGINT,
  color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY
        CASE period
          WHEN 'weekly'  THEN COALESCE(p.xp_weekly, 0)
          WHEN 'monthly' THEN COALESCE(p.xp_monthly, 0)
          ELSE                COALESCE(p.xp_total, 0)
        END DESC
    )::INT AS rank,
    p.id AS user_id,
    COALESCE(p.full_name, 'Explorer') AS name,
    COALESCE(p.avatar_url, '') AS avatar_url,
    COALESCE(p.xp_weekly, 0) AS xp_weekly,
    COALESCE(p.xp_monthly, 0) AS xp_monthly,
    COALESCE(p.xp_total, 0) AS xp_total,
    COALESCE(p.total_checkins, 0) AS checkin_count,
    COALESCE(p.avatar_color, '#B090FF') AS color
  FROM profiles p
  WHERE p.is_banned IS NOT TRUE
  ORDER BY rank ASC
  LIMIT 100;
END;
$$;
