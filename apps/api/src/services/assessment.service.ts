import { AssessmentStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../lib/errors.js';

interface ListAssessmentsParams {
  organizationId: string;
  page?: number;
  limit?: number;
  buildingId?: string;
  branchId?: string;
  status?: AssessmentStatus;
}

export class AssessmentService {
  async list(params: ListAssessmentsParams) {
    const {
      organizationId,
      page = 1,
      limit = 20,
      buildingId,
      branchId,
      status,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentWhereInput = {
      organizationId,
      deletedAt: null,
      ...(buildingId && { buildingId }),
      ...(branchId && { branchId }),
      ...(status && { status }),
    };

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        include: {
          building: {
            select: {
              id: true,
              name: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          assignees: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.assessment.count({ where }),
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

  async create(
    organizationId: string,
    userId: string,
    data: {
      buildingId: string;
      name: string;
      description?: string;
      targetCompletionDate?: Date;
    },
  ) {
    // Verify building belongs to organization
    const building = await prisma.building.findUnique({
      where: { id: data.buildingId },
      include: { branch: true },
    });

    if (!building || building.organizationId !== organizationId) {
      throw new ForbiddenError('Invalid building');
    }

    return prisma.assessment.create({
      data: {
        ...data,
        organizationId,
        branchId: building.branchId,
        createdById: userId,
      },
      include: {
        building: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getById(id: string, organizationId?: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id, deletedAt: null },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            currentReplacementValue: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            elements: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', id);
    }

    if (organizationId && assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    return assessment;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      description?: string;
      targetCompletionDate?: Date;
    },
  ) {
    await this.getById(id, organizationId);

    return prisma.assessment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    const assessment = await this.getById(id, organizationId);

    // Don't allow deletion of approved assessments
    if (assessment.status === 'approved') {
      throw new ValidationError('Cannot delete approved assessments');
    }

    return prisma.assessment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Workflow methods
  async start(id: string, organizationId: string) {
    const assessment = await this.getById(id, organizationId);

    if (assessment.status !== 'draft') {
      throw new ValidationError('Assessment can only be started from draft status');
    }

    return prisma.assessment.update({
      where: { id },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }

  async submit(id: string, organizationId: string) {
    const assessment = await this.getById(id, organizationId);

    if (assessment.status !== 'in_progress') {
      throw new ValidationError('Assessment must be in progress to submit');
    }

    // Check if there are any elements
    if (assessment._count.elements === 0) {
      throw new ValidationError('Assessment must have at least one element to submit');
    }

    return prisma.assessment.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
  }

  async approve(id: string, organizationId: string, userId: string) {
    const assessment = await this.getById(id, organizationId);

    if (assessment.status !== 'submitted') {
      throw new ValidationError('Assessment must be submitted to approve');
    }

    // Calculate FCI and update building stats
    const fci = await this.calculateFCI(id);

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedById: userId,
        calculatedFci: fci,
      },
    });

    // Update building stats
    await this.updateBuildingStats(assessment.buildingId);

    return updated;
  }

  async reject(id: string, organizationId: string, reason: string) {
    const assessment = await this.getById(id, organizationId);

    if (assessment.status !== 'submitted') {
      throw new ValidationError('Assessment must be submitted to reject');
    }

    return prisma.assessment.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
      },
    });
  }

  // Helper methods
  private async calculateFCI(assessmentId: string): Promise<number> {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        building: {
          select: {
            currentReplacementValue: true,
          },
        },
        elements: {
          include: {
            deficiencies: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!assessment || !assessment.building.currentReplacementValue) {
      return 0;
    }

    // Sum all deficiency costs
    let totalDeferredMaintenance = 0;
    for (const element of assessment.elements) {
      for (const deficiency of element.deficiencies) {
        totalDeferredMaintenance += Number(deficiency.totalCost || 0);
      }
    }

    // FCI = (Total Deferred Maintenance / Current Replacement Value)
    const crv = Number(assessment.building.currentReplacementValue);
    const fci = crv > 0 ? totalDeferredMaintenance / crv : 0;

    return fci;
  }

  private async updateBuildingStats(buildingId: string) {
    // Get latest approved assessment
    const latestAssessment = await prisma.assessment.findFirst({
      where: {
        buildingId,
        status: 'approved',
        deletedAt: null,
      },
      orderBy: { approvedAt: 'desc' },
    });

    if (latestAssessment) {
      await prisma.building.update({
        where: { id: buildingId },
        data: {
          currentFci: latestAssessment.calculatedFci || 0,
          totalDeferredMaintenance: latestAssessment.totalDeferredMaintenance,
          lastAssessmentDate: latestAssessment.approvedAt,
        },
      });
    }
  }
}

export const assessmentService = new AssessmentService();
