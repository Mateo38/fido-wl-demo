-- RBAC: Add new admin roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'super_admin', 'admin', 'supervisor', 'operator'));

-- Promote existing super admin
UPDATE users SET role = 'super_admin' WHERE email = 'mathieu.barthelemy@wlbank.fr';
