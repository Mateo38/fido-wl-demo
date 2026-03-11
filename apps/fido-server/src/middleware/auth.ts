import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type Permission =
  | 'dashboard:read'
  | 'clients:read'
  | 'clients:write'
  | 'admins:read'
  | 'admins:write'
  | 'logs:read'
  | 'health:read';

const ADMIN_ROLES = ['super_admin', 'admin', 'supervisor', 'operator'];

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ['dashboard:read', 'clients:read', 'clients:write', 'admins:read', 'admins:write', 'logs:read', 'health:read'],
  admin: ['dashboard:read', 'clients:read', 'clients:write', 'logs:read', 'health:read'],
  supervisor: ['dashboard:read', 'clients:read', 'clients:write', 'logs:read', 'health:read'],
  operator: ['clients:read', 'logs:read'],
};

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, error: 'Super admin access required' });
  }
  next();
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const userPermissions = getPermissionsForRole(req.user.role);
    const hasAll = permissions.every(p => userPermissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
}
