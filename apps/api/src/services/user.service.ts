import { UserRole, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../lib/errors.js';
import { emailService } from '../lib/email.js';
import { config } from '../config/index.js';

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

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: false,
      app_metadata: {
        organizationId,
        role: data.role,
      },
      user_metadata: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    if (authError) {
      throw new ConflictError(`Failed to create auth user: ${authError.message}`);
    }

    // Create internal User record linked to Supabase auth
    const user = await prisma.user.create({
      data: {
        organizationId,
        supabaseAuthId: authUser.user.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        isActive: true,
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

    // Generate invite link via Supabase
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: data.email,
      options: {
        redirectTo: `${config.webUrl}/auth/callback`,
      },
    });

    if (linkError) {
      console.error('Failed to generate invite link:', linkError.message);
    }

    // Send invitation email
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (linkData?.properties?.action_link) {
      await emailService.sendInvitation(data.email, linkData.properties.action_link, org?.name);
    }

    return user;
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
    const user = await this.getById(id, organizationId);

    // If role is changing, update Supabase app_metadata too
    if (data.role && data.role !== user.role && user.supabaseAuthId) {
      await supabaseAdmin.auth.admin.updateUserById(user.supabaseAuthId, {
        app_metadata: { role: data.role },
      });
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string, organizationId: string) {
    const user = await this.getById(id, organizationId);

    // Disable in Supabase Auth
    if (user.supabaseAuthId) {
      await supabaseAdmin.auth.admin.updateUserById(user.supabaseAuthId, {
        ban_duration: 'none',
      });
    }

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

    if (!user.supabaseAuthId) {
      throw new ConflictError('User does not have an auth account');
    }

    // Generate a new invite link via Supabase
    const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: user.email,
      options: {
        redirectTo: `${config.webUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new ConflictError(`Failed to generate invite link: ${error.message}`);
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (linkData?.properties?.action_link) {
      await emailService.sendInvitation(user.email, linkData.properties.action_link, org?.name);
    }

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
