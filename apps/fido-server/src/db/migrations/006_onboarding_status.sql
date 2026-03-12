-- Add onboarding-tovalidate status
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'blocked', 'onboarding-tovalidate'));
