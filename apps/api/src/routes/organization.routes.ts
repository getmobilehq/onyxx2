import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/validate.js';
import { getOrganizationSchema, updateOrganizationSchema } from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/organizations/:id - Get organization details
router.get(
  '/:id',
  validate(getOrganizationSchema),
  asyncHandler(organizationController.getById.bind(organizationController)),
);

// PATCH /api/v1/organizations/:id - Update organization (Org Admin only)
router.patch(
  '/:id',
  authorize('org_admin'),
  validate(updateOrganizationSchema),
  asyncHandler(organizationController.update.bind(organizationController)),
);

// GET /api/v1/organizations/:id/stats - Get organization statistics
router.get(
  '/:id/stats',
  validate(getOrganizationSchema),
  asyncHandler(organizationController.getStats.bind(organizationController)),
);

export default router;
