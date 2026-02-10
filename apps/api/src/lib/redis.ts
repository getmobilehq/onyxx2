import { createClient, type RedisClientType } from 'redis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let redisClient: RedisClientType;
let connected = false;

export async function initRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: config.redisUrl || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis client error');
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.connect();
    connected = true;
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed — falling back to in-memory stores');
    connected = false;
  }
}

export function isRedisConnected(): boolean {
  return connected;
}

export { redisClient };
