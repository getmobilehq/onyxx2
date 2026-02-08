// User Roles
export enum UserRole {
  ORG_ADMIN = 'org_admin',
  BRANCH_MANAGER = 'branch_manager',
  ASSESSOR = 'assessor',
  VIEWER = 'viewer',
}

// Assessment Status
export enum AssessmentStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Element Status
export enum ElementStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

// Deficiency Priority
export enum DeficiencyPriority {
  IMMEDIATE = 'immediate',    // 0-1 years
  SHORT_TERM = 'short_term',  // 1-3 years
  MEDIUM_TERM = 'medium_term', // 3-5 years
  LONG_TERM = 'long_term',    // 5-10 years
}

// Deficiency Severity
export enum DeficiencySeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

// Sync Status
export enum SyncStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
