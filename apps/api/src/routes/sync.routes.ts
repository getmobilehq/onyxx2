import { Router } from 'express';
import { syncController } from '../controllers/sync.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

// POST /api/v1/sync/log — record a completed sync item
router.post('/log', asyncHandler(syncController.logSync.bind(syncController)));

// GET /api/v1/sync/status — get sync status summary
router.get('/status', asyncHandler(syncController.getStatus.bind(syncController)));

// GET /api/v1/sync/history — get recent sync history
router.get('/history', asyncHandler(syncController.getHistory.bind(syncController)));

export default router;
