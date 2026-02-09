import { prisma } from '../lib/prisma.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';

export class ElementService {
  async listElements(assessmentId: string, organizationId: string, page = 1, limit = 50) {
    // Verify assessment belongs to organization
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    const skip = (page - 1) * limit;

    const [elements, total] = await Promise.all([
      prisma.assessmentElement.findMany({
        where: {
          assessmentId,
          deletedAt: null,
        },
        include: {
          uniformatElement: {
            select: {
              code: true,
              name: true,
              systemGroup: true,
            },
          },
          _count: {
            select: {
              deficiencies: { where: { deletedAt: null } },
              photos: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { uniformatCode: 'asc' },
        skip,
        take: limit,
      }),
      prisma.assessmentElement.count({
        where: {
          assessmentId,
          deletedAt: null,
        },
      }),
    ]);

    return {
      elements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async bulkAddElements(
    assessmentId: string,
    organizationId: string,
    uniformatCodes: string[],
  ) {
    // Verify assessment belongs to organization
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    // Get uniformat elements
    const uniformatElements = await prisma.uniformatElement.findMany({
      where: {
        code: { in: uniformatCodes },
        isActive: true,
      },
    });

    if (uniformatElements.length === 0) {
      throw new NotFoundError('Uniformat elements');
    }

    // Check which elements already exist
    const existingElements = await prisma.assessmentElement.findMany({
      where: {
        assessmentId,
        uniformatCode: { in: uniformatCodes },
      },
      select: { uniformatCode: true },
    });

    const existingCodes = new Set(existingElements.map((e) => e.uniformatCode));
    const newElements = uniformatElements.filter((u) => !existingCodes.has(u.code));

    if (newElements.length === 0) {
      return {
        message: 'All elements already exist in this assessment',
        added: 0,
        skipped: uniformatElements.length,
      };
    }

    // Create assessment elements
    await prisma.assessmentElement.createMany({
      data: newElements.map((uniformat) => ({
        assessmentId,
        uniformatElementId: uniformat.id,
        uniformatCode: uniformat.code,
        systemGroup: uniformat.systemGroup,
        lifetimeYears: uniformat.defaultLifetimeYears,
        unitOfMeasure: uniformat.defaultUnitOfMeasure,
      })),
    });

    // Update assessment element counts
    const totalElements = await prisma.assessmentElement.count({
      where: { assessmentId, deletedAt: null },
    });

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { totalElements },
    });

    return {
      message: 'Elements added successfully',
      added: newElements.length,
      skipped: uniformatElements.length - newElements.length,
    };
  }
  async updateElement(
    elementId: string,
    assessmentId: string,
    organizationId: string,
    userId: string,
    data: {
      conditionRating?: number;
      conditionNotes?: string;
      quantity?: number;
      unitOfMeasure?: string;
      costPerUnit?: number;
      yearInstalled?: number;
      lifetimeYears?: number;
      locationDescription?: string;
      floor?: string;
      room?: string;
      manufacturer?: string;
      model?: string;
      serialNumber?: string;
      assetId?: string;
      status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
    },
  ) {
    // Fetch element and verify ownership
    const element = await prisma.assessmentElement.findUnique({
      where: { id: elementId },
      include: { assessment: true },
    });

    if (!element || element.assessmentId !== assessmentId) {
      throw new NotFoundError('Assessment element');
    }

    if (element.assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    if (element.assessment.status !== 'in_progress') {
      throw new ForbiddenError('Assessment must be in progress to update elements');
    }

    // Build update data
    const updateData: Record<string, unknown> = { ...data };

    // Compute derived fields
    const yearInstalled = data.yearInstalled ?? element.yearInstalled;
    const lifetimeYears = data.lifetimeYears ?? element.lifetimeYears;
    if (yearInstalled != null && lifetimeYears != null) {
      const currentYear = new Date().getFullYear();
      updateData.remainingUsefulLife = Math.max(0, lifetimeYears - (currentYear - yearInstalled));
    }

    const quantity = data.quantity ?? (element.quantity ? Number(element.quantity) : null);
    const costPerUnit = data.costPerUnit ?? (element.costPerUnit ? Number(element.costPerUnit) : null);
    const renewalFactor = Number(element.renewalFactor);
    if (quantity != null && costPerUnit != null) {
      updateData.totalReplacementCost = quantity * costPerUnit * renewalFactor;
    }

    // Set assessed metadata when completing
    if (data.status === 'completed') {
      updateData.assessedAt = new Date();
      updateData.assessedById = userId;
    }

    const updated = await prisma.assessmentElement.update({
      where: { id: elementId },
      data: updateData,
      include: {
        uniformatElement: {
          select: { code: true, name: true, systemGroup: true },
        },
        _count: {
          select: {
            deficiencies: { where: { deletedAt: null } },
            photos: { where: { deletedAt: null } },
          },
        },
      },
    });

    // Update assessment progress
    await this.updateAssessmentProgress(assessmentId);

    return updated;
  }

  private async updateAssessmentProgress(assessmentId: string) {
    const completedCount = await prisma.assessmentElement.count({
      where: {
        assessmentId,
        status: 'completed',
        deletedAt: null,
      },
    });

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { completedElements: completedCount },
    });
  }
}

export const elementService = new ElementService();
