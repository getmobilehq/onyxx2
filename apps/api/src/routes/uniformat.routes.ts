import { Router } from 'express';
import { uniformatController } from '../controllers/uniformat.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/uniformat - Get all Uniformat elements
router.get(
  '/',
  asyncHandler(uniformatController.list.bind(uniformatController)),
);

// GET /api/v1/uniformat/groups - Get system groups
router.get(
  '/groups',
  asyncHandler(uniformatController.getSystemGroups.bind(uniformatController)),
);

// GET /api/v1/uniformat/:code - Get element by code
router.get(
  '/:code',
  asyncHandler(uniformatController.getByCode.bind(uniformatController)),
);

export default router;
