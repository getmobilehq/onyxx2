import { Request, Response } from 'express';
import { reportsService } from '../services/reports.service.js';

export class ReportsController {
  async buildingPortfolio(req: Request, res: Response) {
    const { branchId } = req.query;

    const report = await reportsService.getBuildingPortfolio(
      req.user!.organizationId,
      branchId as string | undefined,
    );

    res.json({
      success: true,
      data: report,
    });
  }

  async assessmentSummary(req: Request, res: Response) {
    const { status } = req.query;

    const report = await reportsService.getAssessmentSummary(req.user!.organizationId, {
      status: status as string | undefined,
    });

    res.json({
      success: true,
      data: report,
    });
  }

  async deficiencySummary(req: Request, res: Response) {
    const { buildingId } = req.query;

    const report = await reportsService.getDeficiencySummary(
      req.user!.organizationId,
      buildingId as string | undefined,
    );

    res.json({
      success: true,
      data: report,
    });
  }

  async capitalForecast(req: Request, res: Response) {
    const { branchId } = req.query;

    const report = await reportsService.getCapitalForecast(
      req.user!.organizationId,
      branchId as string | undefined,
    );

    res.json({
      success: true,
      data: report,
    });
  }

  async dashboardStats(req: Request, res: Response) {
    const stats = await reportsService.getDashboardStats(req.user!.organizationId);

    res.json({
      success: true,
      data: stats,
    });
  }
}

export const reportsController = new ReportsController();
