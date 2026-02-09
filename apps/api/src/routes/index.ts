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

const router = Router();

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
