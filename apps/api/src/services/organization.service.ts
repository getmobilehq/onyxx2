import { prisma } from '../lib/prisma.js';
import { NotFoundError, ConflictError } from '../lib/errors.js';

export class OrganizationService {
  async getById(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            users: { where: { deletedAt: null, isActive: true } },
            buildings: { where: { deletedAt: null } },
            branches: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization', id);
    }

    return organization;
  }

  async update(
    id: string,
    data: {
      name?: string;
      settings?: Record<string, unknown>;
      subscriptionTier?: string;
      subscriptionStatus?: string;
      maxBuildings?: number;
      maxUsers?: number;
    },
  ) {
    // Check if organization exists
    await this.getById(id);

    // Prepare update data without settings
    const { settings, ...updateData } = data;

    // If updating slug, check uniqueness
    if (data.name) {
      const slug = this.generateSlug(data.name);
      const existing = await prisma.organization.findFirst({
        where: {
          slug,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictError('Organization with this name already exists');
      }

      return prisma.organization.update({
        where: { id },
        data: {
          ...updateData,
          slug,
          ...(settings && { settings: settings as any }),
        },
      });
    }

    return prisma.organization.update({
      where: { id },
      data: {
        ...updateData,
        ...(settings && { settings: settings as any }),
      },
    });
  }

  async getStats(id: string) {
    // Verify organization exists
    await this.getById(id);

    const [
      totalBuildings,
      totalBranches,
      totalUsers,
      totalAssessments,
      avgFci,
    ] = await Promise.all([
      // Total buildings
      prisma.building.count({
        where: { organizationId: id, deletedAt: null },
      }),

      // Total branches
      prisma.branch.count({
        where: { organizationId: id, deletedAt: null },
      }),

      // Total active users
      prisma.user.count({
        where: {
          organizationId: id,
          deletedAt: null,
          isActive: true,
        },
      }),

      // Total assessments
      prisma.assessment.count({
        where: { organizationId: id, deletedAt: null },
      }),

      // Average FCI
      prisma.building.aggregate({
        where: { organizationId: id, deletedAt: null },
        _avg: { currentFci: true },
      }),
    ]);

    return {
      totalBuildings,
      totalBranches,
      totalUsers,
      totalAssessments,
      averageFci: avgFci._avg.currentFci?.toNumber() || 0,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const organizationService = new OrganizationService();
