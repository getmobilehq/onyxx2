import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../lib/errors.js';

interface ListBuildingsParams {
  organizationId: string;
  page?: number;
  limit?: number;
  branchId?: string;
  search?: string;
  fciMin?: number;
  fciMax?: number;
}

export class BuildingService {
  async list(params: ListBuildingsParams) {
    const {
      organizationId,
      page = 1,
      limit = 20,
      branchId,
      search,
      fciMin,
      fciMax,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.BuildingWhereInput = {
      organizationId,
      deletedAt: null,
      ...(branchId && { branchId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(fciMin !== undefined && {
        currentFci: { gte: fciMin },
      }),
      ...(fciMax !== undefined && {
        currentFci: { lte: fciMax },
      }),
    };

    const [buildings, total] = await Promise.all([
      prisma.building.findMany({
        where,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          photos: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            take: 3,
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.building.count({ where }),
    ]);

    return {
      buildings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(
    organizationId: string,
    data: {
      branchId: string;
      name: string;
      code?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      yearBuilt?: number;
      grossSquareFeet?: number;
      currentReplacementValue?: number;
      buildingType?: string;
      numFloors?: number;
      description?: string;
      latitude?: number;
      longitude?: number;
      imageUrl?: string;
    },
  ) {
    // Verify branch belongs to organization
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branch || branch.organizationId !== organizationId) {
      throw new ForbiddenError('Invalid branch');
    }

    // Check for duplicate name within branch
    const existing = await prisma.building.findFirst({
      where: {
        branchId: data.branchId,
        name: data.name,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictError('Building with this name already exists in this branch');
    }

    return prisma.building.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        photos: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          take: 3,
        },
      },
    });
  }

  async getById(id: string, organizationId?: string) {
    const building = await prisma.building.findUnique({
      where: { id, deletedAt: null },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          take: 3,
        },
        _count: {
          select: {
            assessments: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundError('Building', id);
    }

    if (organizationId && building.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this building');
    }

    return building;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      branchId?: string;
      name?: string;
      code?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      yearBuilt?: number;
      grossSquareFeet?: number;
      currentReplacementValue?: number;
      buildingType?: string;
      numFloors?: number;
      description?: string;
      latitude?: number;
      longitude?: number;
      imageUrl?: string;
    },
  ) {
    const building = await this.getById(id, organizationId);

    // If updating branch, verify it belongs to organization
    if (data.branchId && data.branchId !== building.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: data.branchId },
      });

      if (!branch || branch.organizationId !== organizationId) {
        throw new ForbiddenError('Invalid branch');
      }
    }

    // Check for duplicate name if name or branch is being updated
    if (data.name || data.branchId) {
      const checkBranchId = data.branchId || building.branchId;
      const checkName = data.name || building.name;

      const existing = await prisma.building.findFirst({
        where: {
          branchId: checkBranchId,
          name: checkName,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictError('Building with this name already exists in this branch');
      }
    }

    return prisma.building.update({
      where: { id },
      data,
      include: {
        photos: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          take: 3,
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);

    return prisma.building.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats(id: string, organizationId?: string) {
    await this.getById(id, organizationId);

    const [totalAssessments, completedAssessments, avgCondition] = await Promise.all([
      prisma.assessment.count({
        where: { buildingId: id, deletedAt: null },
      }),
      prisma.assessment.count({
        where: { buildingId: id, deletedAt: null, status: 'approved' },
      }),
      prisma.assessmentElement.aggregate({
        where: {
          assessment: { buildingId: id },
          conditionRating: { not: null },
        },
        _avg: { conditionRating: true },
      }),
    ]);

    return {
      totalAssessments,
      completedAssessments,
      averageConditionRating: avgCondition._avg.conditionRating || 0,
    };
  }

  async getAssessments(id: string, organizationId?: string, page = 1, limit = 20) {
    await this.getById(id, organizationId);

    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where: {
          buildingId: id,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.assessment.count({
        where: {
          buildingId: id,
          deletedAt: null,
        },
      }),
    ]);

    return {
      assessments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const buildingService = new BuildingService();
