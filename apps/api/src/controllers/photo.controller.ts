import { Request, Response } from 'express';
import { photoService } from '../services/photo.service.js';
import { ValidationError } from '../lib/errors.js';

export class PhotoController {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const { buildingId, assessmentElementId, deficiencyId, caption, sortOrder } = req.body;

    const photo = await photoService.upload(
      req.user!.organizationId,
      req.user!.id,
      req.file,
      {
        buildingId,
        assessmentElementId,
        deficiencyId,
        caption,
        sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
      },
    );

    res.status(201).json({
      success: true,
      data: photo,
    });
  }

  async list(req: Request, res: Response) {
    const { buildingId, assessmentElementId, deficiencyId } = req.query;

    const photos = await photoService.list(req.user!.organizationId, {
      buildingId: buildingId as string | undefined,
      assessmentElementId: assessmentElementId as string | undefined,
      deficiencyId: deficiencyId as string | undefined,
    });

    res.json({
      success: true,
      data: photos,
    });
  }

  async getById(req: Request, res: Response) {
    const photo = await photoService.getById(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      data: photo,
    });
  }

  async update(req: Request, res: Response) {
    const { caption, sortOrder } = req.body;

    const photo = await photoService.update(req.params.id, req.user!.organizationId, {
      caption,
      sortOrder,
    });

    res.json({
      success: true,
      data: photo,
    });
  }

  async delete(req: Request, res: Response) {
    await photoService.delete(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      message: 'Photo deleted',
    });
  }
}

export const photoController = new PhotoController();
