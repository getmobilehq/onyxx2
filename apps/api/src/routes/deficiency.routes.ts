import { Router } from 'express';
import { deficiencyController } from '../controllers/deficiency.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import {
  listDeficienciesSchema,
  createDeficiencySchema,
  updateDeficiencySchema,
  getOrganizationSchema,
} from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/assessment-elements/:assessmentElementId/deficiencies - List deficiencies
router.get(
  '/assessment-elements/:assessmentElementId/deficiencies',
  validate(listDeficienciesSchema),
  asyncHandler(deficiencyController.list.bind(deficiencyController)),
);

// POST /api/v1/assessment-elements/:assessmentElementId/deficiencies - Create deficiency
router.post(
  '/assessment-elements/:assessmentElementId/deficiencies',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(createDeficiencySchema),
  asyncHandler(deficiencyController.create.bind(deficiencyController)),
);

// GET /api/v1/deficiencies/:id - Get deficiency by ID
router.get(
  '/deficiencies/:id',
  validate(getOrganizationSchema),
  asyncHandler(deficiencyController.getById.bind(deficiencyController)),
);

// PATCH /api/v1/deficiencies/:id - Update deficiency
router.patch(
  '/deficiencies/:id',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(updateDeficiencySchema),
  asyncHandler(deficiencyController.update.bind(deficiencyController)),
);

// DELETE /api/v1/deficiencies/:id - Delete deficiency
router.delete(
  '/deficiencies/:id',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(getOrganizationSchema),
  asyncHandler(deficiencyController.delete.bind(deficiencyController)),
);

export default router;
