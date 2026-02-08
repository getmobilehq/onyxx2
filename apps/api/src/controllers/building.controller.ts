import { Request, Response } from 'express';
import { buildingService } from '../services/building.service.js';

export class BuildingController {
  async list(req: Request, res: Response) {
    const { page, limit, branchId, search, fciMin, fciMax } = req.query;

    const result = await buildingService.list({
      organizationId: req.user!.organizationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      branchId: branchId as string | undefined,
      search: search as string | undefined,
      fciMin: fciMin ? Number(fciMin) : undefined,
      fciMax: fciMax ? Number(fciMax) : undefined,
    });

    res.json({
      success: true,
      data: result.buildings,
      meta: result.meta,
    });
  }

  async create(req: Request, res: Response) {
    const building = await buildingService.create(
      req.user!.organizationId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: building,
    });
  }

  async getById(req: Request, res: Response) {
    const building = await buildingService.getById(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: building,
    });
  }

  async update(req: Request, res: Response) {
    const building = await buildingService.update(
      req.params.id,
      req.user!.organizationId,
      req.body,
    );

    res.json({
      success: true,
      data: building,
    });
  }

  async delete(req: Request, res: Response) {
    await buildingService.delete(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      data: { message: 'Building deleted successfully' },
    });
  }

  async getStats(req: Request, res: Response) {
    const stats = await buildingService.getStats(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: stats,
    });
  }

  async getAssessments(req: Request, res: Response) {
    const { page, limit } = req.query;
    const result = await buildingService.getAssessments(
      req.params.id,
      req.user!.organizationId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    res.json({
      success: true,
      data: result.assessments,
      meta: result.meta,
    });
  }
}

export const buildingController = new BuildingController();
