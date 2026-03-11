ALTER TABLE passkeys ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE passkeys ADD COLUMN IF NOT EXISTS authenticator_name VARCHAR(255);
UPDATE passkeys SET status = 'active' WHERE status IS NULL;
ALTER TABLE passkeys ADD CONSTRAINT passkeys_status_check CHECK (status IN ('active','blocked','revoked'));
CREATE INDEX IF NOT EXISTS idx_passkeys_status ON passkeys(status);
