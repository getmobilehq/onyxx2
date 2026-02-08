import { prisma } from '../lib/prisma.js';
import { storageService } from '../lib/storage.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../lib/errors.js';

export class PhotoService {
  async upload(
    organizationId: string,
    userId: string,
    file: Express.Multer.File,
    metadata: {
      buildingId?: string;
      assessmentElementId?: string;
      deficiencyId?: string;
      caption?: string;
      sortOrder?: number;
    },
  ) {
    // Validate that at least one parent is provided
    if (!metadata.buildingId && !metadata.assessmentElementId && !metadata.deficiencyId) {
      throw new ValidationError('Must provide buildingId, assessmentElementId, or deficiencyId');
    }

    // Verify ownership based on parent entity
    if (metadata.buildingId) {
      const building = await prisma.building.findFirst({
        where: { id: metadata.buildingId, organizationId },
      });
      if (!building) {
        throw new ForbiddenError('Invalid building');
      }
    }

    if (metadata.assessmentElementId) {
      const element = await prisma.assessmentElement.findFirst({
        where: {
          id: metadata.assessmentElementId,
          assessment: { organizationId },
        },
      });
      if (!element) {
        throw new ForbiddenError('Invalid assessment element');
      }
    }

    if (metadata.deficiencyId) {
      const deficiency = await prisma.deficiency.findFirst({
        where: {
          id: metadata.deficiencyId,
          assessmentElement: {
            assessment: { organizationId },
          },
        },
      });
      if (!deficiency) {
        throw new ForbiddenError('Invalid deficiency');
      }
    }

    // Upload file to storage
    const { url, path } = await storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Get file size in bytes
    const fileSize = file.size;

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        url,
        storagePath: path,
        filename: file.originalname,
        mimeType: file.mimetype,
        fileSize,
        caption: metadata.caption,
        sortOrder: metadata.sortOrder,
        buildingId: metadata.buildingId,
        assessmentElementId: metadata.assessmentElementId,
        deficiencyId: metadata.deficiencyId,
        uploadedById: userId,
      },
    });

    return photo;
  }

  async list(
    organizationId: string,
    filters: {
      buildingId?: string;
      assessmentElementId?: string;
      deficiencyId?: string;
    },
  ) {
    const where: any = {
      deletedAt: null,
    };

    // Verify ownership and add filters
    if (filters.buildingId) {
      const building = await prisma.building.findFirst({
        where: { id: filters.buildingId, organizationId },
      });
      if (!building) {
        throw new ForbiddenError('Invalid building');
      }
      where.buildingId = filters.buildingId;
    }

    if (filters.assessmentElementId) {
      const element = await prisma.assessmentElement.findFirst({
        where: {
          id: filters.assessmentElementId,
          assessment: { organizationId },
        },
      });
      if (!element) {
        throw new ForbiddenError('Invalid assessment element');
      }
      where.assessmentElementId = filters.assessmentElementId;
    }

    if (filters.deficiencyId) {
      const deficiency = await prisma.deficiency.findFirst({
        where: {
          id: filters.deficiencyId,
          assessmentElement: {
            assessment: { organizationId },
          },
        },
      });
      if (!deficiency) {
        throw new ForbiddenError('Invalid deficiency');
      }
      where.deficiencyId = filters.deficiencyId;
    }

    return prisma.photo.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getById(id: string, organizationId: string) {
    const photo = await prisma.photo.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { building: { organizationId } },
          { assessmentElement: { assessment: { organizationId } } },
          { deficiency: { assessmentElement: { assessment: { organizationId } } } },
        ],
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    return photo;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      caption?: string;
      sortOrder?: number;
    },
  ) {
    await this.getById(id, organizationId);

    return prisma.photo.update({
      where: { id },
      data,
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const photo = await this.getById(id, organizationId);

    // Delete from storage
    if (photo.storagePath) {
      await storageService.deleteFile(photo.storagePath);
    }

    // Soft delete from database
    await prisma.photo.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}

export const photoService = new PhotoService();
