import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, asyncHandler } from '../middleware/validate.js';
import { listAuditLogsSchema } from '../types/validations.js';

const router = Router();

// All audit routes require org_admin
router.use(authenticate);

// GET /api/v1/audit-logs
router.get(
  '/',
  authorize('org_admin'),
  validate(listAuditLogsSchema),
  asyncHandler(auditController.list.bind(auditController)),
);

export default router;
