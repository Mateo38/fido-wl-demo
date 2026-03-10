ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active','blocked'));
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
