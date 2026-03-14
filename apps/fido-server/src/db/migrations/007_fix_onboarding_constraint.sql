-- Fix: ensure onboarding-tovalidate status is allowed (idempotent)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'users_status_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_status_check;
  END IF;

  ALTER TABLE users ADD CONSTRAINT users_status_check
    CHECK (status IN ('active', 'blocked', 'onboarding-tovalidate'));
END $$;
