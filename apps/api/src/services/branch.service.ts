import { prisma } from '../lib/prisma.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../lib/errors.js';

export class BranchService {
  async list(organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              buildings: { where: { deletedAt: null } },
              assessments: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.branch.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
    ]);

    return {
      branches,
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
      name: string;
      code?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    },
  ) {
    // Check for duplicate name within organization
    const existing = await prisma.branch.findFirst({
      where: {
        organizationId,
        name: data.name,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictError('Branch with this name already exists in your organization');
    }

    return prisma.branch.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async getById(id: string, organizationId?: string) {
    const branch = await prisma.branch.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            buildings: { where: { deletedAt: null } },
            assessments: { where: { deletedAt: null } },
            userBranches: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundError('Branch', id);
    }

    // Verify organization access if provided
    if (organizationId && branch.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this branch');
    }

    return branch;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      code?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    },
  ) {
    const branch = await this.getById(id, organizationId);

    // Check for duplicate name if name is being updated
    if (data.name && data.name !== branch.name) {
      const existing = await prisma.branch.findFirst({
        where: {
          organizationId,
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictError('Branch with this name already exists in your organization');
      }
    }

    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    await this.getById(id, organizationId);

    // Soft delete
    return prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getStats(id: string, organizationId?: string) {
    await this.getById(id, organizationId);

    const [totalBuildings, totalAssessments, avgFci] = await Promise.all([
      prisma.building.count({
        where: { branchId: id, deletedAt: null },
      }),
      prisma.assessment.count({
        where: { branchId: id, deletedAt: null },
      }),
      prisma.building.aggregate({
        where: { branchId: id, deletedAt: null },
        _avg: { currentFci: true },
      }),
    ]);

    return {
      totalBuildings,
      totalAssessments,
      averageFci: avgFci._avg.currentFci?.toNumber() || 0,
    };
  }

  async getBuildings(id: string, organizationId?: string, page = 1, limit = 20) {
    await this.getById(id, organizationId);

    const skip = (page - 1) * limit;

    const [buildings, total] = await Promise.all([
      prisma.building.findMany({
        where: {
          branchId: id,
          deletedAt: null,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.building.count({
        where: {
          branchId: id,
          deletedAt: null,
        },
      }),
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
}

export const branchService = new BranchService();
