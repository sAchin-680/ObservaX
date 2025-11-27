// Redis-based rate limiting middleware
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const WINDOW = 60; // seconds
const LIMIT = 100; // requests per window

export function rateLimit(namespace: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `${namespace}:${req.ip}`;
    const now = Math.floor(Date.now() / 1000);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW);
    }
    if (count > LIMIT) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
  };
}
