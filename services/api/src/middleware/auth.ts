// JWT Auth & RBAC middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export type Role = 'admin' | 'user' | 'readonly';

export interface AuthPayload {
  sub: string;
  org: string;
  role: Role;
  exp: number;
}

export function requireAuth(roles: Role[] = ['user', 'admin']) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    try {
      const token = auth.slice(7);
      const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
      if (!roles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient role' });
      }
      (req as any).auth = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
