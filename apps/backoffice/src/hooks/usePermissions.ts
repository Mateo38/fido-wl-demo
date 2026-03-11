import { useMemo } from 'react';

type Permission =
  | 'dashboard:read'
  | 'clients:read'
  | 'clients:write'
  | 'admins:read'
  | 'admins:write'
  | 'logs:read'
  | 'health:read';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ['dashboard:read', 'clients:read', 'clients:write', 'admins:read', 'admins:write', 'logs:read', 'health:read'],
  admin: ['dashboard:read', 'clients:read', 'clients:write', 'logs:read', 'health:read'],
  supervisor: ['dashboard:read', 'clients:read', 'clients:write', 'logs:read', 'health:read'],
  operator: ['clients:read', 'logs:read'],
};

export function usePermissions(role: string | undefined) {
  return useMemo(() => {
    const permissions = role ? (ROLE_PERMISSIONS[role] || []) : [];

    const hasPermission = (p: Permission) => permissions.includes(p);
    const canRead = (feature: string) => permissions.includes(`${feature}:read` as Permission);
    const canWrite = (feature: string) => permissions.includes(`${feature}:write` as Permission);
    const isSuperAdmin = role === 'super_admin';

    return { permissions, hasPermission, canRead, canWrite, isSuperAdmin };
  }, [role]);
}
