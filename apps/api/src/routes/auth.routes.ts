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
import { logger } from '../utils/logger.js';

const router = Router();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Validate password complexity: min 8 chars, uppercase, lowercase, number, special char
 */
function validatePasswordComplexity(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

/**
 * Generate a signed JWT access token (15 min expiry)
 */
async function generateAccessToken(user: {
  id: string;
  organizationId: string;
  role: string;
  email: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(config.jwtSecret);
  return new SignJWT({
    sub: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
}

/**
 * Create a refresh token, store its hash in the database, and return the raw token.
 * Invalidates any existing refresh tokens for the user (single-session).
 */
async function createRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = crypto.randomBytes(48).toString('base64url');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Revoke all existing refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  // Create new refresh token
  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });

  return { token: rawToken, expiresAt };
}

/**
 * Set the refresh token as an httpOnly cookie
 */
function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    expires: expiresAt,
  });
}

/**
 * Clear the refresh token cookie
 */
function clearRefreshCookie(res: Response): void {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
  });
}

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

    // Generate access token (15 min)
    const accessToken = await generateAccessToken(user);

    // Generate refresh token (7 days) and set as httpOnly cookie
    const refresh = await createRefreshToken(user.id);
    setRefreshCookie(res, refresh.token, refresh.expiresAt);

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
        token: accessToken,
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
 * POST /api/v1/auth/refresh
 * Issue a new access token using a valid refresh token (from httpOnly cookie).
 * Rotates the refresh token — old one is invalidated, new one issued.
 */
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const rawToken = req.cookies?.refresh_token;

    if (!rawToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: hashedToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            organizationId: true,
            role: true,
            email: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!storedToken) {
      logger.warn({
        action: 'auth.refresh_failed',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        reason: 'invalid_or_expired_token',
      }, 'Failed refresh token attempt');
      clearRefreshCookie(res);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const { user } = storedToken;

    if (!user.isActive || user.deletedAt) {
      // Revoke the token if user is deactivated
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
      clearRefreshCookie(res);
      throw new UnauthorizedError('User account is inactive');
    }

    // Generate new access token
    const accessToken = await generateAccessToken(user);

    // Rotate refresh token — revoke old, create new
    const refresh = await createRefreshToken(user.id);
    setRefreshCookie(res, refresh.token, refresh.expiresAt);

    res.json({
      success: true,
      data: {
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * Revoke the refresh token and clear the cookie
 */
router.post('/logout', async (req: Request, res: Response, next) => {
  try {
    const rawToken = req.cookies?.refresh_token;

    if (rawToken) {
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Look up the token to get user info for audit logging
      const storedToken = await prisma.refreshToken.findFirst({
        where: { token: hashedToken, revokedAt: null },
        select: { userId: true, user: { select: { organizationId: true } } },
      });

      await prisma.refreshToken.updateMany({
        where: { token: hashedToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (storedToken) {
        auditService.log({
          organizationId: storedToken.user.organizationId,
          userId: storedToken.userId,
          action: 'auth.logout',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }
    }

    clearRefreshCookie(res);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
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
    const pwError = validatePasswordComplexity(password);
    if (pwError) {
      throw new ValidationError(pwError);
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

    const pwError = validatePasswordComplexity(password);
    if (pwError) {
      throw new ValidationError(pwError);
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
router.post('/change-password', authenticate, authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }
    const pwError = validatePasswordComplexity(newPassword);
    if (pwError) {
      throw new ValidationError(pwError);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Cannot change password — no password set');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Prevent reuse — new password must differ from current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new ValidationError('New password must be different from current password');
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
