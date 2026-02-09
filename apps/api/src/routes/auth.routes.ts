import { Router, Request, Response } from 'express';
import { SignJWT } from 'jose';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../lib/errors.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Dev-friendly login: looks up user by email and issues a JWT.
 * In production you would validate password/OAuth here.
 */
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new UnauthorizedError('Email is required');
    }

    const user = await prisma.user.findFirst({
      where: { email, isActive: true, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Sign JWT
    const secret = new TextEncoder().encode(
      config.jwtSecret || 'your-super-secret-jwt-key-min-32-chars-change-this-in-production',
    );
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

export default router;
