import { Router } from 'express';
import { assessmentController } from '../controllers/assessment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  listAssessmentsSchema,
  getOrganizationSchema,
  rejectAssessmentSchema,
  updateAssessmentElementSchema,
} from '../types/validations.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/v1/assessments - List assessments
router.get(
  '/',
  validate(listAssessmentsSchema),
  asyncHandler(assessmentController.list.bind(assessmentController)),
);

// POST /api/v1/assessments - Create assessment
router.post(
  '/',
  authorize('org_admin', 'branch_manager'),
  validate(createAssessmentSchema),
  asyncHandler(assessmentController.create.bind(assessmentController)),
);

// GET /api/v1/assessments/:id - Get assessment details
router.get(
  '/:id',
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.getById.bind(assessmentController)),
);

// PATCH /api/v1/assessments/:id - Update assessment
router.patch(
  '/:id',
  authorize('org_admin', 'branch_manager'),
  validate(updateAssessmentSchema),
  asyncHandler(assessmentController.update.bind(assessmentController)),
);

// DELETE /api/v1/assessments/:id - Soft delete assessment
router.delete(
  '/:id',
  authorize('org_admin', 'branch_manager'),
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.delete.bind(assessmentController)),
);

// Workflow actions
// POST /api/v1/assessments/:id/start - Start assessment
router.post(
  '/:id/start',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.start.bind(assessmentController)),
);

// POST /api/v1/assessments/:id/submit - Submit for review
router.post(
  '/:id/submit',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.submit.bind(assessmentController)),
);

// POST /api/v1/assessments/:id/approve - Approve assessment
router.post(
  '/:id/approve',
  authorize('org_admin', 'branch_manager'),
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.approve.bind(assessmentController)),
);

// POST /api/v1/assessments/:id/reject - Reject assessment
router.post(
  '/:id/reject',
  authorize('org_admin', 'branch_manager'),
  validate(rejectAssessmentSchema),
  asyncHandler(assessmentController.reject.bind(assessmentController)),
);

// Assignee management
// GET /api/v1/assessments/:id/assignees - List assignees
router.get(
  '/:id/assignees',
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.listAssignees.bind(assessmentController)),
);

// POST /api/v1/assessments/:id/assignees - Add assignee
router.post(
  '/:id/assignees',
  authorize('org_admin', 'branch_manager'),
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.addAssignee.bind(assessmentController)),
);

// DELETE /api/v1/assessments/:id/assignees/:userId - Remove assignee
router.delete(
  '/:id/assignees/:userId',
  authorize('org_admin', 'branch_manager'),
  asyncHandler(assessmentController.removeAssignee.bind(assessmentController)),
);

// Element management
// GET /api/v1/assessments/:id/elements - List assessment elements
router.get(
  '/:id/elements',
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.listElements.bind(assessmentController)),
);

// POST /api/v1/assessments/:id/elements - Bulk add elements
router.post(
  '/:id/elements',
  authorize('org_admin', 'branch_manager'),
  validate(getOrganizationSchema),
  asyncHandler(assessmentController.bulkAddElements.bind(assessmentController)),
);

// PATCH /api/v1/assessments/:id/elements/:elementId - Update assessment element
router.patch(
  '/:id/elements/:elementId',
  authorize('org_admin', 'branch_manager', 'assessor'),
  validate(updateAssessmentElementSchema),
  asyncHandler(assessmentController.updateElement.bind(assessmentController)),
);

export default router;
