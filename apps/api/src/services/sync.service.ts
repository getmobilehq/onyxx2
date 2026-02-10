import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

interface SyncLogEntry {
  userId: string;
  entityType: string;
  entityId: string;
  operation: string;
  payload?: Record<string, unknown>;
}

class SyncService {
  /** Fire-and-forget sync log creation */
  logSync(entry: SyncLogEntry): void {
    prisma.syncQueue
      .create({
        data: {
          userId: entry.userId,
          entityType: entry.entityType,
          entityId: entry.entityId,
          operation: entry.operation,
          payload: (entry.payload ?? {}) as any,
          status: 'completed',
          processedAt: new Date(),
        },
      })
      .catch((err) => {
        logger.error({ err, entry }, 'Failed to write sync log');
      });
  }

  async getUserStatus(userId: string) {
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.syncQueue.count({ where: { userId, status: 'pending' } }),
      prisma.syncQueue.count({ where: { userId, status: 'processing' } }),
      prisma.syncQueue.count({ where: { userId, status: 'completed' } }),
      prisma.syncQueue.count({ where: { userId, status: 'failed' } }),
    ]);

    return { pending, processing, completed, failed };
  }

  async getUserHistory(userId: string, limit = 20) {
    return prisma.syncQueue.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const syncService = new SyncService();
