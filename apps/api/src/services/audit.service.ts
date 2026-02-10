import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

interface AuditEntry {
  organizationId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditListParams {
  organizationId: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class AuditService {
  /** Fire-and-forget audit log creation */
  log(entry: AuditEntry): void {
    prisma.auditLog
      .create({
        data: {
          organizationId: entry.organizationId,
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: (entry.metadata ?? {}) as Prisma.InputJsonValue,
          ipAddress: entry.ipAddress?.substring(0, 45),
          userAgent: entry.userAgent?.substring(0, 500),
        },
      })
      .catch((err) => {
        logger.error({ err, entry }, 'Failed to write audit log');
      });
  }

  /** Paginated audit log query with filters */
  async list(params: AuditListParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      organizationId: params.organizationId,
    };

    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.userId) where.userId = params.userId;
    if (params.startDate || params.endDate) {
      where.createdAt = {
        ...(params.startDate ? { gte: new Date(params.startDate) } : {}),
        ...(params.endDate ? { lte: new Date(params.endDate) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();
