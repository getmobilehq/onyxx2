import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient, isRedisConnected } from '../lib/redis.js';
import type { Request } from 'express';

function createStore(prefix: string) {
  if (!isRedisConnected()) return undefined;
  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`,
  });
}

const rateLimitResponse = {
  success: false,
  error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' },
};

/**
 * Auth limiter: 10 requests per 15 min per IP
 * Applied to login, forgot-password, reset-password, accept-invite
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('auth'),
  message: rateLimitResponse,
});

/**
 * API limiter: 100 requests per 1 min per user/IP
 * Applied to all /api/v1 routes
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('api'),
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: rateLimitResponse,
});

/**
 * Upload limiter: 20 requests per 1 min per user/IP
 * Applied to photo upload endpoint
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('upload'),
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: rateLimitResponse,
});

/**
 * Report limiter: 10 requests per 1 min per user/IP
 * Applied to report generation endpoints (heavier queries)
 */
export const reportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('report'),
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown',
  message: rateLimitResponse,
});
