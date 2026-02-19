-- Migration: Add read receipts support to messages
-- This adds read_at timestamp to track when messages are read

-- Add read_at column to messages table
ALTER TABLE messages
  ADD COLUMN read_at TIMESTAMPTZ;

-- Add read_at column to friend_messages table
ALTER TABLE friend_messages
  ADD COLUMN read_at TIMESTAMPTZ;

-- Create index for efficient queries filtering unread messages
CREATE INDEX idx_messages_read_at ON messages(chat_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_friend_messages_read_at ON friend_messages(chat_id, read_at) WHERE read_at IS NULL;

-- Comments for documentation
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the message was read by the recipient';
COMMENT ON COLUMN friend_messages.read_at IS 'Timestamp when the message was read by the recipient';
