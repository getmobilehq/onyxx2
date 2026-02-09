import { prisma } from '../lib/prisma.js';
import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import type { DeficiencyPriority, DeficiencySeverity, Prisma } from '@prisma/client';

interface ListAllParams {
  organizationId: string;
  page?: number;
  limit?: number;
  priority?: DeficiencyPriority;
  severity?: DeficiencySeverity;
  buildingId?: string;
  search?: string;
}

export class DeficiencyService {
  async listAll(params: ListAllParams) {
    const {
      organizationId,
      page = 1,
      limit = 20,
      priority,
      severity,
      buildingId,
      search,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.DeficiencyWhereInput = {
      deletedAt: null,
      assessmentElement: {
        assessment: {
          organizationId,
          ...(buildingId && { buildingId }),
        },
      },
      ...(priority && { priority }),
      ...(severity && { severity }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [deficiencies, total] = await Promise.all([
      prisma.deficiency.findMany({
        where,
        include: {
          assessmentElement: {
            include: {
              uniformatElement: true,
              assessment: {
                select: {
                  id: true,
                  name: true,
                  buildingId: true,
                  building: {
                    select: { id: true, name: true },
                  },
                },
              },
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
          _count: {
            select: { photos: true },
          },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.deficiency.count({ where }),
    ]);

    return {
      deficiencies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async list(
    assessmentElementId: string,
    organizationId: string,
    filters: {
      priority?: DeficiencyPriority;
      severity?: DeficiencySeverity;
    } = {},
  ) {
    // Verify the assessment element belongs to the organization
    const element = await prisma.assessmentElement.findFirst({
      where: {
        id: assessmentElementId,
        assessment: {
          organizationId,
        },
      },
    });

    if (!element) {
      throw new ForbiddenError('Invalid assessment element');
    }

    const where: any = {
      assessmentElementId,
      deletedAt: null,
    };

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    return prisma.deficiency.findMany({
      where,
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        photos: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getById(id: string, organizationId: string) {
    const deficiency = await prisma.deficiency.findFirst({
      where: {
        id,
        deletedAt: null,
        assessmentElement: {
          assessment: {
            organizationId,
          },
        },
      },
      include: {
        category: true,
        assessmentElement: {
          include: {
            uniformatElement: true,
            assessment: {
              select: {
                id: true,
                name: true,
                buildingId: true,
              },
            },
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
        photos: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deficiency) {
      throw new NotFoundError('Deficiency not found');
    }

    return deficiency;
  }

  async create(
    assessmentElementId: string,
    organizationId: string,
    userId: string,
    data: {
      categoryId?: string;
      title: string;
      description?: string;
      priority?: DeficiencyPriority;
      severity?: DeficiencySeverity;
      estimatedCost?: number;
      quantity?: number;
      unitOfMeasure?: string;
      recommendedAction?: string;
      targetYear?: number;
    },
  ) {
    // Verify the assessment element belongs to the organization
    const element = await prisma.assessmentElement.findFirst({
      where: {
        id: assessmentElementId,
        assessment: {
          organizationId,
        },
      },
      include: {
        assessment: true,
      },
    });

    if (!element) {
      throw new ForbiddenError('Invalid assessment element');
    }

    // Calculate total cost
    const estimatedCost = data.estimatedCost || 0;
    const quantity = data.quantity || 1;
    const totalCost = estimatedCost * quantity;

    const deficiency = await prisma.deficiency.create({
      data: {
        assessmentElementId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium_term',
        severity: data.severity || 'moderate',
        estimatedCost,
        quantity,
        unitOfMeasure: data.unitOfMeasure,
        totalCost,
        recommendedAction: data.recommendedAction,
        targetYear: data.targetYear,
        createdById: userId,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update assessment totals
    await this.updateAssessmentTotals(element.assessment.id);

    return deficiency;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      categoryId?: string;
      title?: string;
      description?: string;
      priority?: DeficiencyPriority;
      severity?: DeficiencySeverity;
      estimatedCost?: number;
      quantity?: number;
      unitOfMeasure?: string;
      recommendedAction?: string;
      targetYear?: number;
    },
  ) {
    const deficiency = await this.getById(id, organizationId);

    // Recalculate total cost if needed
    const estimatedCost = data.estimatedCost ?? Number(deficiency.estimatedCost || 0);
    const quantity = data.quantity ?? Number(deficiency.quantity);
    const totalCost = estimatedCost * quantity;

    const updated = await prisma.deficiency.update({
      where: { id },
      data: {
        ...data,
        totalCost,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update assessment totals
    await this.updateAssessmentTotals(deficiency.assessmentElement.assessment.id);

    return updated;
  }

  async delete(id: string, organizationId: string) {
    const deficiency = await this.getById(id, organizationId);

    await prisma.deficiency.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Update assessment totals
    await this.updateAssessmentTotals(deficiency.assessmentElement.assessment.id);

    return { success: true };
  }

  // Helper to update assessment totals
  private async updateAssessmentTotals(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        elements: {
          include: {
            deficiencies: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!assessment) return;

    let totalDeficiencies = 0;
    let totalDeferredMaintenance = 0;

    for (const element of assessment.elements) {
      totalDeficiencies += element.deficiencies.length;
      for (const deficiency of element.deficiencies) {
        totalDeferredMaintenance += Number(deficiency.totalCost || 0);
      }
    }

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        totalDeficiencies,
        totalDeferredMaintenance,
      },
    });
  }
}

export const deficiencyService = new DeficiencyService();
