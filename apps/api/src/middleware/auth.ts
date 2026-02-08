import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Verify JWT
    const secret = new TextEncoder().encode(config.jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.organizationId) {
      throw new UnauthorizedError('Invalid token payload');
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        organizationId: true,
        role: true,
        email: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

// Role-based authorization middleware
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

// Organization scope middleware - ensures user can only access their org data
export function requireOrganizationAccess(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new UnauthorizedError('User not authenticated'));
  }

  // Get organization ID from route params or query
  const orgId = req.params.organizationId || req.query.organizationId || req.body.organizationId;

  if (orgId && orgId !== req.user.organizationId) {
    return next(new ForbiddenError('Access denied to this organization'));
  }

  next();
}
