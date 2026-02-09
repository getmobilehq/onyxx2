import { UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../lib/errors.js';
import { emailService } from '../lib/email.js';
import crypto from 'crypto';

interface ListUsersParams {
  organizationId: string;
  page?: number;
  limit?: number;
  role?: UserRole;
  isActive?: boolean;
  branchId?: string;
}

export class UserService {
  async list(params: ListUsersParams) {
    const {
      organizationId,
      page = 1,
      limit = 20,
      role,
      isActive,
      branchId,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      organizationId,
      deletedAt: null,
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(branchId && {
        userBranches: {
          some: { branchId },
        },
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userBranches: {
            include: {
              branch: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async invite(
    organizationId: string,
    data: {
      email: string;
      firstName?: string;
      lastName?: string;
      role: UserRole;
      phone?: string;
      branchIds?: string[];
    },
  ) {
    // Check for duplicate email
    const existing = await prisma.user.findFirst({
      where: {
        organizationId,
        email: data.email,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days

    // Create user
    const user = await prisma.user.create({
      data: {
        organizationId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        inviteToken,
        inviteExpiresAt,
        isActive: false, // Will be activated when they accept invite
      },
    });

    // Assign to branches if provided
    if (data.branchIds && data.branchIds.length > 0) {
      await prisma.userBranch.createMany({
        data: data.branchIds.map((branchId) => ({
          userId: user.id,
          branchId,
        })),
      });
    }

    // Send invitation email
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });
    await emailService.sendInvitation(user.email, inviteToken, org?.name);

    return user;
  }

  async acceptInvite(
    token: string,
    data: { firstName: string; lastName: string; password: string },
  ) {
    const user = await prisma.user.findFirst({
      where: { inviteToken: token, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('Invitation');
    }

    if (user.isActive) {
      throw new ConflictError('This invitation has already been accepted');
    }

    if (user.inviteExpiresAt && user.inviteExpiresAt < new Date()) {
      throw new ConflictError('This invitation has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        isActive: true,
        inviteToken: null,
        inviteExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async getById(id: string, organizationId?: string) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        userBranches: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User', id);
    }

    if (organizationId && user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this user');
    }

    return user;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      phone?: string;
      isActive?: boolean;
    },
  ) {
    await this.getById(id, organizationId);

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string, organizationId: string) {
    await this.getById(id, organizationId);

    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async resendInvite(id: string, organizationId: string) {
    const user = await this.getById(id, organizationId);

    if (user.isActive) {
      throw new ConflictError('User has already accepted invitation');
    }

    // Generate new invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    await prisma.user.update({
      where: { id },
      data: {
        inviteToken,
        inviteExpiresAt,
      },
    });

    // Send invitation email
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });
    await emailService.sendInvitation(user.email, inviteToken, org?.name);

    return { message: 'Invitation resent successfully' };
  }

  async getBranches(id: string, organizationId?: string) {
    await this.getById(id, organizationId);

    const userBranches = await prisma.userBranch.findMany({
      where: { userId: id },
      include: {
        branch: true,
      },
    });

    return userBranches.map((ub) => ub.branch);
  }

  async assignToBranch(userId: string, branchId: string, organizationId: string) {
    // Verify user exists and belongs to organization
    await this.getById(userId, organizationId);

    // Verify branch belongs to organization
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.organizationId !== organizationId) {
      throw new ForbiddenError('Invalid branch');
    }

    // Check if already assigned
    const existing = await prisma.userBranch.findFirst({
      where: { userId, branchId },
    });

    if (existing) {
      throw new ConflictError('User is already assigned to this branch');
    }

    await prisma.userBranch.create({
      data: { userId, branchId },
    });

    return { message: 'User assigned to branch successfully' };
  }

  async removeFromBranch(userId: string, branchId: string, organizationId: string) {
    // Verify user exists and belongs to organization
    await this.getById(userId, organizationId);

    const userBranch = await prisma.userBranch.findFirst({
      where: { userId, branchId },
    });

    if (!userBranch) {
      throw new NotFoundError('User branch assignment');
    }

    await prisma.userBranch.delete({
      where: { id: userBranch.id },
    });

    return { message: 'User removed from branch successfully' };
  }
}

export const userService = new UserService();
