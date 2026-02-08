import { Request, Response } from 'express';
import { assessmentService } from '../services/assessment.service.js';
import { assigneeService } from '../services/assignee.service.js';
import { elementService } from '../services/element.service.js';
import { AssessmentStatus } from '@prisma/client';

export class AssessmentController {
  async list(req: Request, res: Response) {
    const { page, limit, buildingId, branchId, status } = req.query;

    const result = await assessmentService.list({
      organizationId: req.user!.organizationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      buildingId: buildingId as string | undefined,
      branchId: branchId as string | undefined,
      status: status as AssessmentStatus | undefined,
    });

    res.json({
      success: true,
      data: result.assessments,
      meta: result.meta,
    });
  }

  async create(req: Request, res: Response) {
    const assessment = await assessmentService.create(
      req.user!.organizationId,
      req.user!.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: assessment,
    });
  }

  async getById(req: Request, res: Response) {
    const assessment = await assessmentService.getById(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  async update(req: Request, res: Response) {
    const assessment = await assessmentService.update(
      req.params.id,
      req.user!.organizationId,
      req.body,
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  async delete(req: Request, res: Response) {
    await assessmentService.delete(req.params.id, req.user!.organizationId);

    res.json({
      success: true,
      data: { message: 'Assessment deleted successfully' },
    });
  }

  // Workflow actions
  async start(req: Request, res: Response) {
    const assessment = await assessmentService.start(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  async submit(req: Request, res: Response) {
    const assessment = await assessmentService.submit(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  async approve(req: Request, res: Response) {
    const assessment = await assessmentService.approve(
      req.params.id,
      req.user!.organizationId,
      req.user!.id,
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  async reject(req: Request, res: Response) {
    const assessment = await assessmentService.reject(
      req.params.id,
      req.user!.organizationId,
      req.body.reason,
    );

    res.json({
      success: true,
      data: assessment,
    });
  }

  // Assignee methods
  async listAssignees(req: Request, res: Response) {
    const assignees = await assigneeService.listAssignees(
      req.params.id,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: assignees,
    });
  }

  async addAssignee(req: Request, res: Response) {
    const assignee = await assigneeService.addAssignee(
      req.params.id,
      req.body.userId,
      req.user!.organizationId,
      req.user!.id,
    );

    res.json({
      success: true,
      data: assignee,
    });
  }

  async removeAssignee(req: Request, res: Response) {
    const result = await assigneeService.removeAssignee(
      req.params.id,
      req.params.userId,
      req.user!.organizationId,
    );

    res.json({
      success: true,
      data: result,
    });
  }

  // Element methods
  async listElements(req: Request, res: Response) {
    const { page, limit } = req.query;
    const result = await elementService.listElements(
      req.params.id,
      req.user!.organizationId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    res.json({
      success: true,
      data: result.elements,
      meta: result.meta,
    });
  }

  async bulkAddElements(req: Request, res: Response) {
    const result = await elementService.bulkAddElements(
      req.params.id,
      req.user!.organizationId,
      req.body.uniformatCodes,
    );

    res.json({
      success: true,
      data: result,
    });
  }
}

export const assessmentController = new AssessmentController();
