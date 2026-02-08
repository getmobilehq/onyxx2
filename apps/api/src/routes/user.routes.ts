import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  getOrganizationSchema,
} from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/users - List org users (Org Admin only)
router.get(
  '/',
  authorize('org_admin'),
  validate(listUsersSchema),
  asyncHandler(userController.list.bind(userController)),
);

// POST /api/v1/users/invite - Invite new user (Org Admin only)
router.post(
  '/invite',
  authorize('org_admin'),
  validate(createUserSchema),
  asyncHandler(userController.invite.bind(userController)),
);

// GET /api/v1/users/:id - Get user details
router.get(
  '/:id',
  validate(getOrganizationSchema),
  asyncHandler(userController.getById.bind(userController)),
);

// PATCH /api/v1/users/:id - Update user (Org Admin only)
router.patch(
  '/:id',
  authorize('org_admin'),
  validate(updateUserSchema),
  asyncHandler(userController.update.bind(userController)),
);

// DELETE /api/v1/users/:id - Deactivate user (Org Admin only)
router.delete(
  '/:id',
  authorize('org_admin'),
  validate(getOrganizationSchema),
  asyncHandler(userController.deactivate.bind(userController)),
);

// POST /api/v1/users/:id/resend-invite - Resend invitation (Org Admin only)
router.post(
  '/:id/resend-invite',
  authorize('org_admin'),
  validate(getOrganizationSchema),
  asyncHandler(userController.resendInvite.bind(userController)),
);

// GET /api/v1/users/:id/branches - List user's branches
router.get(
  '/:id/branches',
  validate(getOrganizationSchema),
  asyncHandler(userController.getBranches.bind(userController)),
);

// POST /api/v1/users/:id/branches - Assign to branch (Org Admin only)
router.post(
  '/:id/branches',
  authorize('org_admin'),
  validate(getOrganizationSchema),
  asyncHandler(userController.assignToBranch.bind(userController)),
);

// DELETE /api/v1/users/:id/branches/:branchId - Remove from branch (Org Admin only)
router.delete(
  '/:id/branches/:branchId',
  authorize('org_admin'),
  asyncHandler(userController.removeFromBranch.bind(userController)),
);

export default router;
