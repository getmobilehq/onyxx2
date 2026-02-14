import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { ValidationError } from '../lib/errors.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { auditService } from '../services/audit.service.js';

const router = Router();

/**
 * POST /api/v1/auth/callback
 * Called by frontend after successful Supabase login/invite.
 * Updates lastLoginAt, activates invited users, and creates audit log entry.
 */
router.post('/callback', authenticate, async (req: Request, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { isActive: true },
    });

    // If user was inactive (first login after invite), activate them
    if (user && !user.isActive) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { isActive: true, lastLoginAt: new Date() },
      });
    } else {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { lastLoginAt: new Date() },
      });
    }

    auditService.log({
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'auth.login',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const userData = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: userData });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * Audit log the logout event. Supabase handles token invalidation client-side.
 */
router.post('/logout', authenticate, async (req: Request, res: Response, next) => {
  try {
    auditService.log({
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'auth.logout',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user
 */
router.get('/me', authenticate, async (req: Request, res: Response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/change-password
 * Changes password via Supabase Admin API.
 */
router.post('/change-password', authenticate, authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user!.supabaseAuthId,
      { password: newPassword }
    );

    if (error) {
      throw new ValidationError(error.message);
    }

    auditService.log({
      organizationId: req.user!.organizationId,
      userId: req.user!.id,
      action: 'auth.password_changed',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
