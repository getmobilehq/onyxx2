import { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { UserRole } from '@prisma/client';

export class UserController {
  async list(req: Request, res: Response) {
    const { page, limit, role, isActive, branchId } = req.query;

    const result = await userService.list({
      organizationId: req.user!.organizationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      role: role as UserRole | undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      branchId: branchId as string | undefined,
    });

    res.json({
      success: true,
      data: result.users,
      meta: result.meta,
    });
  }

  async invite(req: Request, res: Response) {
    const user = await userService.invite(
      req.user!.organizationId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: user,
    });
  }

  async getById(req: Request, res: Response) {
    const user = await userService.getById(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: user,
    });
  }

  async update(req: Request, res: Response) {
    const user = await userService.update(
      req.params.id,
      req.user!.organizationId,
      req.body,
    );

    res.json({
      success: true,
      data: user,
    });
  }

  async deactivate(req: Request, res: Response) {
    await userService.deactivate(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      data: { message: 'User deactivated successfully' },
    });
  }

  async resendInvite(req: Request, res: Response) {
    const result = await userService.resendInvite(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: result,
    });
  }

  async getBranches(req: Request, res: Response) {
    const branches = await userService.getBranches(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: branches,
    });
  }

  async assignToBranch(req: Request, res: Response) {
    const result = await userService.assignToBranch(
      req.params.id,
      req.body.branchId,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: result,
    });
  }

  async removeFromBranch(req: Request, res: Response) {
    const result = await userService.removeFromBranch(
      req.params.id,
      req.params.branchId,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: result,
    });
  }
}

export const userController = new UserController();
