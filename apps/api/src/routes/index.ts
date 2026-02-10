import { Router } from 'express';
import authRoutes from './auth.routes.js';
import organizationRoutes from './organization.routes.js';
import branchRoutes from './branch.routes.js';
import buildingRoutes from './building.routes.js';
import userRoutes from './user.routes.js';
import assessmentRoutes from './assessment.routes.js';
import uniformatRoutes from './uniformat.routes.js';
import deficiencyRoutes from './deficiency.routes.js';
import photoRoutes from './photo.routes.js';
import reportsRoutes from './reports.routes.js';
import auditRoutes from './audit.routes.js';
import syncRoutes from './sync.routes.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { auditLog } from '../middleware/auditLog.js';

const router = Router();

// Rate limiting for all API routes
router.use(apiLimiter);

// Auto-audit mutations
router.use(auditLog);

// Mount all routes
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/branches', branchRoutes);
router.use('/buildings', buildingRoutes);
router.use('/users', userRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/uniformat', uniformatRoutes);
router.use(deficiencyRoutes);
router.use(photoRoutes);
router.use(reportsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/sync', syncRoutes);

// Health check for authenticated API
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
