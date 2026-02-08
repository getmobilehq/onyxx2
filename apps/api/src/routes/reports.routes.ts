import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import {
  buildingPortfolioReportSchema,
  assessmentSummaryReportSchema,
  deficiencySummaryReportSchema,
  capitalForecastReportSchema,
} from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/reports/building-portfolio - Building portfolio report
router.get(
  '/reports/building-portfolio',
  validate(buildingPortfolioReportSchema),
  asyncHandler(reportsController.buildingPortfolio.bind(reportsController)),
);

// GET /api/v1/reports/assessment-summary - Assessment summary report
router.get(
  '/reports/assessment-summary',
  validate(assessmentSummaryReportSchema),
  asyncHandler(reportsController.assessmentSummary.bind(reportsController)),
);

// GET /api/v1/reports/deficiency-summary - Deficiency summary report
router.get(
  '/reports/deficiency-summary',
  validate(deficiencySummaryReportSchema),
  asyncHandler(reportsController.deficiencySummary.bind(reportsController)),
);

// GET /api/v1/reports/capital-forecast - Capital forecast report
router.get(
  '/reports/capital-forecast',
  validate(capitalForecastReportSchema),
  asyncHandler(reportsController.capitalForecast.bind(reportsController)),
);

// GET /api/v1/reports/dashboard - Dashboard stats
router.get(
  '/reports/dashboard',
  asyncHandler(reportsController.dashboardStats.bind(reportsController)),
);

export default router;
