import { Request, Response } from 'express';
import { organizationService } from '../services/organization.service.js';

export class OrganizationController {
  async getById(req: Request, res: Response) {
    const organization = await organizationService.getById(req.params.id);

    res.json({
      success: true,
      data: organization,
    });
  }

  async update(req: Request, res: Response) {
    const organization = await organizationService.update(
      req.params.id,
      req.body,
    );

    res.json({
      success: true,
      data: organization,
    });
  }

  async getStats(req: Request, res: Response) {
    const stats = await organizationService.getStats(req.params.id);

    res.json({
      success: true,
      data: stats,
    });
  }
}

export const organizationController = new OrganizationController();
