import { UserRole, AssessmentStatus, ElementStatus, DeficiencyPriority, DeficiencySeverity } from './enums.js';

// Organization
export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  subscriptionTier: string;
  subscriptionStatus: string;
  maxBuildings: number;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

// User
export interface User {
  id: string;
  organizationId: string;
  auth0Id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Branch
export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// Building
export interface Building {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  code?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  yearBuilt?: number;
  grossSquareFeet?: number;
  currentReplacementValue?: number;
  buildingType?: string;
  numFloors?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  currentFci: number;
  totalDeferredMaintenance: number;
  lastAssessmentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  photos?: Photo[];
}

// Building with photos (for API responses that include relations)
export interface BuildingWithPhotos extends Building {
  photos: Photo[];
}

// Assessment
export interface Assessment {
  id: string;
  organizationId: string;
  branchId: string;
  buildingId: string;
  name: string;
  description?: string;
  status: AssessmentStatus;
  targetCompletionDate?: Date;
  startedAt?: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedById?: string;
  rejectionReason?: string;
  totalElements: number;
  completedElements: number;
  totalDeficiencies: number;
  totalDeferredMaintenance: number;
  calculatedFci?: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

// Assessment Element
export interface AssessmentElement {
  id: string;
  assessmentId: string;
  uniformatElementId: string;
  systemName?: string;
  uniformatCode: string;
  systemGroup: string;
  lifetimeYears?: number;
  yearInstalled?: number;
  remainingUsefulLife?: number;
  unitOfMeasure?: string;
  quantity?: number;
  locationDescription?: string;
  floor?: string;
  room?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  assetId?: string;
  costPerUnit?: number;
  renewalFactor: number;
  totalReplacementCost?: number;
  conditionRating?: number;
  conditionNotes?: string;
  status: ElementStatus;
  assessedAt?: Date;
  assessedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Deficiency
export interface Deficiency {
  id: string;
  assessmentElementId: string;
  categoryId?: string;
  title: string;
  description?: string;
  priority: DeficiencyPriority;
  severity: DeficiencySeverity;
  estimatedCost?: number;
  quantity: number;
  unitOfMeasure?: string;
  totalCost?: number;
  recommendedAction?: string;
  targetYear?: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

// Photo
export interface Photo {
  id: string;
  organizationId: string;
  buildingId?: string;
  assessmentElementId?: string;
  deficiencyId?: string;
  filename: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  s3Key: string;
  s3Bucket: string;
  thumbnailS3Key?: string;
  caption?: string;
  sortOrder?: number;
  latitude?: number;
  longitude?: number;
  takenAt?: Date;
  createdAt: Date;
  uploadedById?: string;
}
