import { z } from 'zod';

// Common validations
export const uuidSchema = z.string().uuid();
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Organization validations
export const updateOrganizationSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    settings: z.record(z.unknown()).optional(),
    subscriptionTier: z.enum(['starter', 'professional', 'enterprise']).optional(),
    subscriptionStatus: z.enum(['active', 'suspended', 'cancelled']).optional(),
    maxBuildings: z.number().int().positive().optional(),
    maxUsers: z.number().int().positive().optional(),
  }),
});

export const getOrganizationSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// Branch validations
export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    code: z.string().max(50).optional(),
    addressLine1: z.string().max(255).optional(),
    addressLine2: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).default('USA'),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    code: z.string().max(50).optional(),
    addressLine1: z.string().max(255).optional(),
    addressLine2: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }),
});

export const listBranchesSchema = z.object({
  query: paginationSchema,
});

// Building validations
export const createBuildingSchema = z.object({
  body: z.object({
    branchId: uuidSchema,
    name: z.string().min(1).max(255),
    code: z.string().max(50).optional(),
    addressLine1: z.string().max(255).optional(),
    addressLine2: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).default('USA'),
    yearBuilt: z.number().int().min(1800).max(2100).optional(),
    grossSquareFeet: z.number().positive().optional(),
    currentReplacementValue: z.number().positive().optional(),
    buildingType: z.string().max(100).optional(),
    numFloors: z.number().int().positive().optional(),
    description: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    imageUrl: z.string().max(500).url().optional(),
  }),
});

export const updateBuildingSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    branchId: uuidSchema.optional(),
    name: z.string().min(1).max(255).optional(),
    code: z.string().max(50).optional(),
    addressLine1: z.string().max(255).optional(),
    addressLine2: z.string().max(255).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
    yearBuilt: z.number().int().min(1800).max(2100).optional(),
    grossSquareFeet: z.number().positive().optional(),
    currentReplacementValue: z.number().positive().optional(),
    buildingType: z.string().max(100).optional(),
    numFloors: z.number().int().positive().optional(),
    description: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    imageUrl: z.string().max(500).url().optional(),
  }),
});

export const listBuildingsSchema = z.object({
  query: paginationSchema.extend({
    branchId: uuidSchema.optional(),
    search: z.string().optional(),
    fciMin: z.coerce.number().min(0).max(100).optional(),
    fciMax: z.coerce.number().min(0).max(100).optional(),
  }),
});

// User validations
export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email().max(255),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    role: z.enum(['org_admin', 'branch_manager', 'assessor', 'viewer']),
    phone: z.string().max(50).optional(),
    branchIds: z.array(uuidSchema).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    role: z.enum(['org_admin', 'branch_manager', 'assessor', 'viewer']).optional(),
    phone: z.string().max(50).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listUsersSchema = z.object({
  query: paginationSchema.extend({
    role: z.enum(['org_admin', 'branch_manager', 'assessor', 'viewer']).optional(),
    isActive: z.coerce.boolean().optional(),
    branchId: uuidSchema.optional(),
  }),
});

// Assessment validations
export const createAssessmentSchema = z.object({
  body: z.object({
    buildingId: uuidSchema,
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    targetCompletionDate: z.coerce.date().optional(),
  }),
});

export const updateAssessmentSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    targetCompletionDate: z.coerce.date().optional(),
  }),
});

export const listAssessmentsSchema = z.object({
  query: paginationSchema.extend({
    buildingId: uuidSchema.optional(),
    branchId: uuidSchema.optional(),
    status: z.enum(['draft', 'in_progress', 'submitted', 'in_review', 'approved', 'rejected']).optional(),
  }),
});

export const rejectAssessmentSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    reason: z.string().min(1),
  }),
});

// Assessment Element schemas
export const updateAssessmentElementSchema = z.object({
  params: z.object({
    id: uuidSchema,
    elementId: uuidSchema,
  }),
  body: z.object({
    conditionRating: z.number().int().min(1).max(5).optional(),
    conditionNotes: z.string().optional(),
    quantity: z.number().nonnegative().optional(),
    unitOfMeasure: z.string().max(50).optional(),
    costPerUnit: z.number().nonnegative().optional(),
    yearInstalled: z.number().int().min(1800).max(2100).optional(),
    lifetimeYears: z.number().int().positive().optional(),
    locationDescription: z.string().optional(),
    floor: z.string().max(50).optional(),
    room: z.string().max(100).optional(),
    manufacturer: z.string().max(255).optional(),
    model: z.string().max(255).optional(),
    serialNumber: z.string().max(255).optional(),
    assetId: z.string().max(255).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
  }),
});

// Deficiency schemas
export const listAllDeficienciesSchema = z.object({
  query: paginationSchema.extend({
    priority: z.enum(['immediate', 'short_term', 'medium_term', 'long_term']).optional(),
    severity: z.enum(['minor', 'moderate', 'major', 'critical']).optional(),
    buildingId: uuidSchema.optional(),
    search: z.string().optional(),
  }),
});

export const listDeficienciesSchema = z.object({
  params: z.object({
    assessmentElementId: uuidSchema,
  }),
  query: z.object({
    priority: z.enum(['immediate', 'short_term', 'medium_term', 'long_term']).optional(),
    severity: z.enum(['minor', 'moderate', 'major', 'critical']).optional(),
  }),
});

export const createDeficiencySchema = z.object({
  params: z.object({
    assessmentElementId: uuidSchema,
  }),
  body: z.object({
    categoryId: uuidSchema.optional(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    priority: z.enum(['immediate', 'short_term', 'medium_term', 'long_term']).default('medium_term'),
    severity: z.enum(['minor', 'moderate', 'major', 'critical']).default('moderate'),
    estimatedCost: z.number().nonnegative().optional(),
    quantity: z.number().positive().default(1),
    unitOfMeasure: z.string().max(50).optional(),
    recommendedAction: z.string().optional(),
    targetYear: z.number().int().min(2000).max(2100).optional(),
  }),
});

export const updateDeficiencySchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    categoryId: uuidSchema.optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    priority: z.enum(['immediate', 'short_term', 'medium_term', 'long_term']).optional(),
    severity: z.enum(['minor', 'moderate', 'major', 'critical']).optional(),
    estimatedCost: z.number().nonnegative().optional(),
    quantity: z.number().positive().optional(),
    unitOfMeasure: z.string().max(50).optional(),
    recommendedAction: z.string().optional(),
    targetYear: z.number().int().min(2000).max(2100).optional(),
  }),
});

// Photo schemas
export const listPhotosSchema = z.object({
  query: z.object({
    buildingId: uuidSchema.optional(),
    assessmentElementId: uuidSchema.optional(),
    deficiencyId: uuidSchema.optional(),
  }),
});

export const updatePhotoSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    caption: z.string().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

// Reports schemas
export const buildingPortfolioReportSchema = z.object({
  query: z.object({
    branchId: uuidSchema.optional(),
  }),
});

export const assessmentSummaryReportSchema = z.object({
  query: z.object({
    status: z.enum(['draft', 'in_progress', 'submitted', 'in_review', 'approved', 'rejected']).optional(),
  }),
});

export const deficiencySummaryReportSchema = z.object({
  query: z.object({
    buildingId: uuidSchema.optional(),
  }),
});

export const capitalForecastReportSchema = z.object({
  query: z.object({
    branchId: uuidSchema.optional(),
  }),
});

// Audit log validations
export const listAuditLogsSchema = z.object({
  query: paginationSchema.extend({
    action: z.string().max(50).optional(),
    entityType: z.string().max(50).optional(),
    entityId: uuidSchema.optional(),
    userId: uuidSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
