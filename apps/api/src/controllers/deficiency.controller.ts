import { Request, Response } from 'express';
import { deficiencyService } from '../services/deficiency.service.js';

export class DeficiencyController {
  async listAll(req: Request, res: Response) {
    const { page, limit, priority, severity, buildingId, search } = req.query;

    const result = await deficiencyService.listAll({
      organizationId: req.user!.organizationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      priority: priority as any,
      severity: severity as any,
      buildingId: buildingId as string | undefined,
      search: search as string | undefined,
    });

    res.json({
      success: true,
      data: result.deficiencies,
      meta: result.meta,
    });
  }

  async list(req: Request, res: Response) {
    const { assessmentElementId } = req.params;
    const { priority, severity } = req.query;

    const deficiencies = await deficiencyService.list(
      assessmentElementId,
      req.user!.organizationId,
      {
        priority: priority as any,
        severity: severity as any,
      },
    );

    res.json({
      success: true,
      data: deficiencies,
    });
  }

  async getById(req: Request, res: Response) {
    const deficiency = await deficiencyService.getById(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      data: deficiency,
    });
  }

  async create(req: Request, res: Response) {
    const { assessmentElementId } = req.params;

    const deficiency = await deficiencyService.create(
      assessmentElementId,
      req.user!.organizationId,
      req.user!.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: deficiency,
    });
  }

  async update(req: Request, res: Response) {
    const deficiency = await deficiencyService.update(
      req.params.id,
      req.user!.organizationId,
      req.body,
    );

    res.json({
      success: true,
      data: deficiency,
    });
  }

  async delete(req: Request, res: Response) {
    await deficiencyService.delete(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      message: 'Deficiency deleted',
    });
  }
}

export const deficiencyController = new DeficiencyController();
