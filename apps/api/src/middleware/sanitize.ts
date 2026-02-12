import { Request, Response, NextFunction } from 'express';

/** Fields that should NOT be sanitized (passwords can contain any characters) */
const SKIP_FIELDS = new Set(['password', 'currentPassword', 'newPassword']);

/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Preserves the text content but removes all HTML elements.
 */
function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Recursively sanitize all string values in an object,
 * skipping password fields.
 */
function sanitizeValue(value: unknown, key?: string): unknown {
  if (typeof value === 'string') {
    return key && SKIP_FIELDS.has(key) ? value : stripHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v));
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v, k);
    }
    return sanitized;
  }
  return value;
}

/**
 * Express middleware that sanitizes all string values in req.body
 * to prevent stored XSS attacks. Applied to mutation requests.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object' && ['POST', 'PATCH', 'PUT'].includes(req.method)) {
    req.body = sanitizeValue(req.body);
  }
  next();
}
