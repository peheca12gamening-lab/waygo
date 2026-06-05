-- Chat system v2 migration
-- Run in Supabase SQL Editor

-- Extend messages table for full chat support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS type text DEFAULT 'text';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_data text;

-- Index for fast conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- Typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
  conversation_id text PRIMARY KEY,
  user_id text NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Enable realtime for typing_indicators (if not already)
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
