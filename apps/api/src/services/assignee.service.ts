import { prisma } from '../lib/prisma.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../lib/errors.js';

export class AssigneeService {
  async listAssignees(assessmentId: string, organizationId: string) {
    // Verify assessment belongs to organization
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    const assignees = await prisma.assessmentAssignee.findMany({
      where: { assessmentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    return assignees;
  }

  async addAssignee(
    assessmentId: string,
    userId: string,
    organizationId: string,
    assignedById: string,
  ) {
    // Verify assessment belongs to organization
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    // Verify user belongs to organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('User not found in organization');
    }

    // Check if already assigned
    const existing = await prisma.assessmentAssignee.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('User is already assigned to this assessment');
    }

    return prisma.assessmentAssignee.create({
      data: {
        assessmentId,
        userId,
        assignedById,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async removeAssignee(
    assessmentId: string,
    userId: string,
    organizationId: string,
  ) {
    // Verify assessment belongs to organization
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this assessment');
    }

    const assignee = await prisma.assessmentAssignee.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId,
        },
      },
    });

    if (!assignee) {
      throw new NotFoundError('Assessment assignee');
    }

    await prisma.assessmentAssignee.delete({
      where: { id: assignee.id },
    });

    return { message: 'Assignee removed successfully' };
  }
}

export const assigneeService = new AssigneeService();
