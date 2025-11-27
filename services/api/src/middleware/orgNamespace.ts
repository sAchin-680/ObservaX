// Multi-org & namespace isolation middleware
import { Request, Response, NextFunction } from 'express';

export function requireOrgNamespace() {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;
    if (!auth || !auth.org) {
      return res.status(400).json({ error: 'Missing org/namespace' });
    }
    // Attach org/namespace to request for downstream filtering
    (req as any).org = auth.org;
    next();
  };
}
