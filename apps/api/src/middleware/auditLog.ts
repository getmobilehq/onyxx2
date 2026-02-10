import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const METHOD_ACTION_MAP: Record<string, string> = {
  POST: 'create',
  PATCH: 'update',
  PUT: 'update',
  DELETE: 'delete',
};

function deriveEntityType(path: string): string {
  // Strip /api/v1/ prefix and extract the resource name
  const cleaned = path.replace(/^\/api\/v1\//, '');
  const segments = cleaned.split('/').filter(Boolean);

  // Find the first non-UUID segment
  for (const seg of segments) {
    if (!UUID_REGEX.test(seg)) {
      // Convert plural to singular (simple approach)
      const singular = seg.endsWith('ies')
        ? seg.slice(0, -3) + 'y'
        : seg.endsWith('s')
          ? seg.slice(0, -1)
          : seg;
      return singular;
    }
  }
  return 'unknown';
}

function extractEntityId(path: string): string | undefined {
  const match = path.match(UUID_REGEX);
  return match?.[0];
}

/**
 * Auto-logs mutations (POST/PATCH/PUT/DELETE) by intercepting res.json()
 * Only logs when req.user exists (authenticated) and response is 2xx
 */
export function auditLog(req: Request, res: Response, next: NextFunction) {
  if (!MUTATION_METHODS.has(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function (body: unknown) {
    // Fire audit log on successful responses
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const entityType = deriveEntityType(req.originalUrl);
      const action = `${entityType}.${METHOD_ACTION_MAP[req.method] || req.method.toLowerCase()}`;
      const entityId = extractEntityId(req.originalUrl);

      auditService.log({
        organizationId: req.user.organizationId,
        userId: req.user.id,
        action,
        entityType,
        entityId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    return originalJson(body);
  };

  next();
}
