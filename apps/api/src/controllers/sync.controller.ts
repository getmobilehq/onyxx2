import { Request, Response } from 'express';
import { syncService } from '../services/sync.service.js';

class SyncController {
  async logSync(req: Request, res: Response) {
    const { entityType, entityId, operation, payload } = req.body;

    syncService.logSync({
      userId: req.user!.id,
      entityType,
      entityId,
      operation,
      payload,
    });

    res.json({
      success: true,
      data: { message: 'Sync logged' },
    });
  }

  async getStatus(req: Request, res: Response) {
    const status = await syncService.getUserStatus(req.user!.id);

    res.json({
      success: true,
      data: status,
    });
  }

  async getHistory(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const history = await syncService.getUserHistory(req.user!.id, limit);

    res.json({
      success: true,
      data: history,
    });
  }
}

export const syncController = new SyncController();
