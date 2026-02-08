import { Request, Response } from 'express';
import { uniformatService } from '../services/uniformat.service.js';

export class UniformatController {
  async list(req: Request, res: Response) {
    const { systemGroup } = req.query;
    const elements = await uniformatService.list(systemGroup as string | undefined);

    res.json({
      success: true,
      data: elements,
    });
  }

  async getSystemGroups(_req: Request, res: Response) {
    const groups = await uniformatService.getSystemGroups();

    res.json({
      success: true,
      data: groups,
    });
  }

  async getByCode(req: Request, res: Response) {
    const element = await uniformatService.getByCode(req.params.code);

    res.json({
      success: true,
      data: element,
    });
  }
}

export const uniformatController = new UniformatController();
