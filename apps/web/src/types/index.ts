/**
 * Shared TypeScript Types
 * Core domain types matching backend Prisma schema
 */

// ============================================
// USER & AUTH
// ============================================

export type UserRole = 'org_admin' | 'branch_manager' | 'assessor' | 'viewer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  branchId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AcceptInviteData {
  firstName: string;
  lastName: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
}

// ============================================
// ORGANIZATION & BRANCH
// ============================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    branches: number;
    buildings: number;
    users: number;
  };
}

export interface Branch {
  id: string;
  name: string;
  code?: string | null;
  organizationId: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    buildings: number;
    users: number;
  };
}

// ============================================
// BUILDING
// ============================================

export interface Building {
  id: string;
  name: string;
  code?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  buildingType?: string | null;
  grossSquareFeet?: number | null;
  yearBuilt?: number | null;
  numFloors?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  organizationId: string;
  branchId: string;
  currentReplacementValue?: number | null;
  totalDeferredMaintenance?: number | null;
  currentFci?: number | null;
  lastAssessmentDate?: string | null;
  createdAt: string;
  updatedAt: string;
  branch?: { id: string; name: string };
  photos?: Photo[];
  _count?: {
    assessments: number;
  };
}

// ============================================
// ASSESSMENT
// ============================================

export type AssessmentStatus = 'draft' | 'in_progress' | 'submitted' | 'in_review' | 'approved' | 'rejected';

export interface Assessment {
  id: string;
  name: string;
  organizationId: string;
  branchId: string;
  buildingId: string;
  description?: string | null;
  status: AssessmentStatus;
  targetCompletionDate?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  approvedById?: string | null;
  rejectionReason?: string | null;
  totalElements: number;
  completedElements: number;
  totalDeficiencies: number;
  totalDeferredMaintenance: number;
  calculatedFci?: number | null;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  building?: { id: string; name: string; code?: string | null };
  branch?: { id: string; name: string };
  assignees?: AssessmentAssignee[];
  _count?: {
    elements: number;
    assignees: number;
  };
}

export interface AssessmentAssignee {
  id: string;
  assessmentId: string;
  userId: string;
  assignedAt: string;
  user?: User;
}

// ============================================
// ASSESSMENT ELEMENT
// ============================================

export interface AssessmentElement {
  id: string;
  assessmentId: string;
  uniformatElementId: string;
  uniformatCode: string;
  systemGroup: string;
  systemName?: string | null;
  lifetimeYears?: number | null;
  yearInstalled?: number | null;
  remainingUsefulLife?: number | null;
  unitOfMeasure?: string | null;
  quantity?: number | null;
  locationDescription?: string | null;
  floor?: string | null;
  room?: string | null;
  costPerUnit?: number | null;
  renewalFactor: number;
  totalReplacementCost?: number | null;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  assetId?: string | null;
  conditionRating?: number | null;
  conditionNotes?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assessedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assessment?: Assessment;
  uniformatElement?: { code: string; name: string; systemGroup: string };
  _count?: {
    deficiencies: number;
    photos: number;
  };
}

// ============================================
// UNIFORMAT
// ============================================

export interface UniformatElement {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  systemGroup: string;
  level: number;
  parentCode?: string | null;
  defaultLifetimeYears?: number | null;
  defaultUnitOfMeasure?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface UniformatGroup {
  systemGroup: string;
  count: number;
}

export interface BulkAddResult {
  message: string;
  added: number;
  skipped: number;
}

// ============================================
// DEFICIENCY
// ============================================

export type DeficiencySeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type DeficiencyPriority = 'immediate' | 'short_term' | 'medium_term' | 'long_term';

export interface Deficiency {
  id: string;
  assessmentElementId: string;
  categoryId?: string | null;
  title: string;
  description?: string | null;
  severity: DeficiencySeverity;
  priority: DeficiencyPriority;
  quantity?: number | null;
  unitOfMeasure?: string | null;
  estimatedCost?: number | null;
  totalCost?: number | null;
  recommendedAction?: string | null;
  targetYear?: number | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  assessmentElement?: AssessmentElement;
  createdBy?: User;
  _count?: {
    photos: number;
  };
}

// ============================================
// PHOTO
// ============================================

export interface Photo {
  id: string;
  organizationId: string;
  buildingId?: string | null;
  assessmentElementId?: string | null;
  deficiencyId?: string | null;
  filename: string;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  url: string;
  storagePath: string;
  thumbnailS3Key?: string | null;
  caption?: string | null;
  sortOrder?: number | null;
  uploadedById?: string | null;
  createdAt: string;
  uploadedBy?: User;
}

export interface PhotoUploadData {
  photo: File;
  buildingId?: string;
  assessmentElementId?: string;
  deficiencyId?: string;
  caption?: string;
  sortOrder?: number;
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardStats {
  summary: {
    totalBuildings: number;
    totalAssessments: number;
    totalDeficiencies: number;
    totalReplacementValue: number;
    totalDeferredMaintenance: number;
    totalSquareFeet: number;
    portfolioFCI: number;
  };
  recentAssessments: Assessment[];
}

export interface BuildingStats {
  totalAssessments: number;
  completedAssessments: number;
  averageConditionRating: number;
}

// ============================================
// FORM TYPES
// ============================================

export interface BuildingFormData {
  name: string;
  code?: string;
  branchId: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  buildingType?: string;
  grossSquareFeet?: number;
  yearBuilt?: number;
  numFloors?: number;
  currentReplacementValue?: number;
  description?: string;
}

export interface AssessmentFormData {
  name: string;
  buildingId: string;
  branchId: string;
  description?: string;
  targetCompletionDate?: string;
}

export interface DeficiencyFormData {
  title: string;
  description?: string;
  severity: DeficiencySeverity;
  priority: DeficiencyPriority;
  quantity?: number;
  unitOfMeasure?: string;
  estimatedCost?: number;
  targetYear?: number;
  recommendedAction?: string;
}

// ============================================
// REPORTS
// ============================================

export interface PortfolioReport {
  buildings: Building[];
  summary: {
    totalBuildings: number;
    totalReplacementValue: number;
    totalDeferredMaintenance: number;
    totalSquareFeet: number;
    portfolioFCI: number;
  };
}

export interface AssessmentSummaryReport {
  assessments: Assessment[];
  statusSummary: { status: string; count: number }[];
}

export interface DeficiencySummaryReport {
  summary: {
    totalDeficiencies: number;
    totalCost: number;
  };
  byPriority: Record<string, {
    count: number;
    totalCost: number;
    deficiencies: Deficiency[];
  }>;
  bySeverity: Record<string, {
    count: number;
    totalCost: number;
  }>;
}

export interface ForecastItem {
  id: string;
  title: string;
  cost: number;
  priority: DeficiencyPriority;
  building: string;
}

export interface ForecastYear {
  year: number;
  totalCost: number;
  count: number;
  items: ForecastItem[];
}

export interface CapitalForecastReport {
  forecast: ForecastYear[];
  totalCost: number;
}

// ============================================
// USER MANAGEMENT FORMS
// ============================================

export interface InviteUserFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  phone?: string;
  branchIds?: string[];
}

export interface UpdateUserFormData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
}

// ============================================
// BRANCH FORM
// ============================================

export interface ElementAssessmentFormData {
  conditionRating?: number;
  conditionNotes?: string;
  quantity?: number;
  unitOfMeasure?: string;
  costPerUnit?: number;
  yearInstalled?: number;
  lifetimeYears?: number;
  locationDescription?: string;
  floor?: string;
  room?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assetId?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

export interface BranchFormData {
  name: string;
  code?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// ============================================
// ORGANIZATION
// ============================================

export interface OrganizationStats {
  totalBuildings: number;
  totalBranches: number;
  totalUsers: number;
  totalAssessments: number;
  averageFci: number;
}
