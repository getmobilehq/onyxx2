import { Router, Request, Response } from 'express';
import { SignJWT } from 'jose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { UnauthorizedError, ValidationError } from '../lib/errors.js';
import { authenticate } from '../middleware/auth.js';
import { userService } from '../services/user.service.js';
import { emailService } from '../lib/email.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { auditService } from '../services/audit.service.js';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Authenticate user with email and password
 */
router.post('/login', authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new UnauthorizedError('Email and password are required');
    }

    const user = await prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError('Please set your password using the invitation link or reset your password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      auditService.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'auth.login_failed',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { email },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Sign JWT
    const secret = new TextEncoder().encode(config.jwtSecret);
    const token = await new SignJWT({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'auth.login',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organizationId: user.organizationId,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/accept-invite/:token
 * Accept an invitation, set password, and activate the user account
 */
router.post('/accept-invite/:token', authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { token } = req.params;
    const { firstName, lastName, password } = req.body;

    if (!firstName || !lastName) {
      throw new ValidationError('First name and last name are required');
    }
    if (!password || password.length < 8) {
      throw new ValidationError('Password is required and must be at least 8 characters');
    }

    const user = await userService.acceptInvite(token, { firstName, lastName, password });

    res.json({
      success: true,
      data: user,
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/forgot-password
 * Public endpoint — generates reset token and sends email
 */
router.post('/forgot-password', authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetExpiresAt = new Date();
      resetExpiresAt.setHours(resetExpiresAt.getHours() + 1);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpiresAt: resetExpiresAt,
        },
      });

      // Send plaintext token to user via email
      await emailService.sendPasswordReset(email, resetToken);

      auditService.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'auth.password_reset_requested',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    // Always return the same response to prevent user enumeration
    res.json({
      success: true,
      data: { message: 'If an account with that email exists, a password reset link has been sent.' },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/reset-password/:token
 * Public endpoint — validates token and sets new password
 */
router.post('/reset-password/:token', authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      throw new ValidationError('Password is required and must be at least 8 characters');
    }

    // Hash incoming token before querying
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: { gte: new Date() },
        isActive: true,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    res.json({
      success: true,
      data: { message: 'Password reset successfully. You can now sign in.' },
    });
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
 * Change password for the authenticated user
 */
router.post('/change-password', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Cannot change password — no password set');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    auditService.log({
      organizationId: req.user!.organizationId,
      userId,
      action: 'auth.password_changed',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: true,
      data: { message: 'Password changed successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
