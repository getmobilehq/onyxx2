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
}

export const elementService = new ElementService();
