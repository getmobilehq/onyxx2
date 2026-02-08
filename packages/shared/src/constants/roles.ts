import { UserRole } from '../types/enums.js';

export const ROLE_PERMISSIONS = {
  [UserRole.ORG_ADMIN]: {
    label: 'Organization Admin',
    description: 'Full access to all organization resources',
    scope: 'organization',
  },
  [UserRole.BRANCH_MANAGER]: {
    label: 'Branch Manager',
    description: 'Manage assigned branches, buildings, and assessments',
    scope: 'branch',
  },
  [UserRole.ASSESSOR]: {
    label: 'Field Assessor',
    description: 'Perform field assessments on assigned buildings',
    scope: 'assessment',
  },
  [UserRole.VIEWER]: {
    label: 'Executive Viewer',
    description: 'Read-only access to reports and dashboards',
    scope: 'read-only',
  },
} as const;
