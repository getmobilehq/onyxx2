import { Request, Response } from 'express';
import { branchService } from '../services/branch.service.js';

export class BranchController {
  async list(req: Request, res: Response) {
    const { page, limit } = req.query;
    const result = await branchService.list(
      req.user!.organizationId,
      Number(page),
      Number(limit),
    );

    res.json({
      success: true,
      data: result.branches,
      meta: result.meta,
    });
  }

  async create(req: Request, res: Response) {
    const branch = await branchService.create(
      req.user!.organizationId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: branch,
    });
  }

  async getById(req: Request, res: Response) {
    const branch = await branchService.getById(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: branch,
    });
  }

  async update(req: Request, res: Response) {
    const branch = await branchService.update(
      req.params.id,
      req.user!.organizationId,
      req.body,
    );

    res.json({
      success: true,
      data: branch,
    });
  }

  async delete(req: Request, res: Response) {
    await branchService.delete(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      data: { message: 'Branch deleted successfully' },
    });
  }

  async getStats(req: Request, res: Response) {
    const stats = await branchService.getStats(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: stats,
    });
  }

  async getBuildings(req: Request, res: Response) {
    const { page, limit } = req.query;
    const result = await branchService.getBuildings(
      req.params.id,
      req.user!.organizationId,
      Number(page),
      Number(limit),
    );

    res.json({
      success: true,
      data: result.buildings,
      meta: result.meta,
    });
  }
}

export const branchController = new BranchController();
