import { Router } from 'express';
import { photoController } from '../controllers/photo.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  listPhotosSchema,
  updatePhotoSchema,
  getOrganizationSchema,
} from '../types/validations.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/v1/photos - Upload photo
router.post(
  '/photos',
  uploadLimiter,
  authorize('org_admin', 'branch_manager', 'assessor'),
  upload.single('photo'),
  asyncHandler(photoController.upload.bind(photoController)),
);

// GET /api/v1/photos - List photos
router.get(
  '/photos',
  validate(listPhotosSchema),
  asyncHandler(photoController.list.bind(photoController)),
);

// GET /api/v1/photos/:id - Get photo by ID
router.get(
  '/photos/:id',
  validate(getOrganizationSchema),
  asyncHandler(photoController.getById.bind(photoController)),
);

// PATCH /api/v1/photos/:id - Update photo
router.patch(
  '/photos/:id',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(updatePhotoSchema),
  asyncHandler(photoController.update.bind(photoController)),
);

// DELETE /api/v1/photos/:id - Delete photo
router.delete(
  '/photos/:id',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(getOrganizationSchema),
  asyncHandler(photoController.delete.bind(photoController)),
);

export default router;
