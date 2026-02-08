import { Router } from 'express';
import { buildingController } from '../controllers/building.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import {
  createBuildingSchema,
  updateBuildingSchema,
  listBuildingsSchema,
  getOrganizationSchema,
} from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/buildings - List buildings with filters
router.get(
  '/',
  validate(listBuildingsSchema),
  asyncHandler(buildingController.list.bind(buildingController)),
);

// POST /api/v1/buildings - Create building
router.post(
  '/',
  authorize('org_admin', 'branch_manager'),
  validate(createBuildingSchema),
  asyncHandler(buildingController.create.bind(buildingController)),
);

// GET /api/v1/buildings/:id - Get building details
router.get(
  '/:id',
  validate(getOrganizationSchema),
  asyncHandler(buildingController.getById.bind(buildingController)),
);

// PATCH /api/v1/buildings/:id - Update building
router.patch(
  '/:id',
  authorize('org_admin', 'branch_manager'),
  validate(updateBuildingSchema),
  asyncHandler(buildingController.update.bind(buildingController)),
);

// DELETE /api/v1/buildings/:id - Soft delete building
router.delete(
  '/:id',
  authorize('org_admin'),
  validate(getOrganizationSchema),
  asyncHandler(buildingController.delete.bind(buildingController)),
);

// GET /api/v1/buildings/:id/stats - Get building statistics
router.get(
  '/:id/stats',
  validate(getOrganizationSchema),
  asyncHandler(buildingController.getStats.bind(buildingController)),
);

// GET /api/v1/buildings/:id/assessments - List building assessments
router.get(
  '/:id/assessments',
  validate(getOrganizationSchema),
  asyncHandler(buildingController.getAssessments.bind(buildingController)),
);

export default router;
