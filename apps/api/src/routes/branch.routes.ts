import { Router } from 'express';
import { branchController } from '../controllers/branch.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import { createBranchSchema, updateBranchSchema, listBranchesSchema, getOrganizationSchema } from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/branches - List branches
router.get(
  '/',
  validate(listBranchesSchema),
  asyncHandler(branchController.list.bind(branchController)),
);

// POST /api/v1/branches - Create branch (Org Admin only)
router.post(
  '/',
  authorize('org_admin'),
  validate(createBranchSchema),
  asyncHandler(branchController.create.bind(branchController)),
);

// GET /api/v1/branches/:id - Get branch details
router.get(
  '/:id',
  validate(getOrganizationSchema),
  asyncHandler(branchController.getById.bind(branchController)),
);

// PATCH /api/v1/branches/:id - Update branch (Org Admin & Branch Manager)
router.patch(
  '/:id',
  authorize('org_admin', 'branch_manager'),
  validate(updateBranchSchema),
  asyncHandler(branchController.update.bind(branchController)),
);

// DELETE /api/v1/branches/:id - Soft delete branch (Org Admin only)
router.delete(
  '/:id',
  authorize('org_admin'),
  validate(getOrganizationSchema),
  asyncHandler(branchController.delete.bind(branchController)),
);

// GET /api/v1/branches/:id/stats - Get branch statistics
router.get(
  '/:id/stats',
  validate(getOrganizationSchema),
  asyncHandler(branchController.getStats.bind(branchController)),
);

// GET /api/v1/branches/:id/buildings - List buildings in branch
router.get(
  '/:id/buildings',
  validate(getOrganizationSchema),
  asyncHandler(branchController.getBuildings.bind(branchController)),
);

export default router;
