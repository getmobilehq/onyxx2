import { Request, Response } from 'express';
import { auditService } from '../services/audit.service.js';

class AuditController {
  async list(req: Request, res: Response) {
    const { action, entityType, entityId, userId, startDate, endDate, page, limit } = req.query;

    const result = await auditService.list({
      organizationId: req.user!.organizationId,
      action: action as string | undefined,
      entityType: entityType as string | undefined,
      entityId: entityId as string | undefined,
      userId: userId as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    res.json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  }
}

export const auditController = new AuditController();
