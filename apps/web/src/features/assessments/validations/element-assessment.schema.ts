import { z } from 'zod';

const optionalNumber = z
  .union([z.number(), z.nan(), z.literal('')])
  .optional()
  .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined));

const optionalPositiveInt = z
  .union([z.number().int().positive(), z.nan(), z.literal('')])
  .optional()
  .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined));

export const elementAssessmentSchema = z.object({
  // Condition
  conditionRating: z
    .union([z.number().int().min(1).max(5), z.nan(), z.literal('')])
    .optional()
    .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined)),
  conditionNotes: z.string().optional().or(z.literal('')),

  // Quantity & Financial
  quantity: optionalNumber,
  unitOfMeasure: z.string().max(50).optional().or(z.literal('')),
  costPerUnit: optionalNumber,

  // Lifecycle
  yearInstalled: z
    .union([z.number().int().min(1800).max(2100), z.nan(), z.literal('')])
    .optional()
    .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined)),
  lifetimeYears: optionalPositiveInt,

  // Location
  locationDescription: z.string().optional().or(z.literal('')),
  floor: z.string().max(50).optional().or(z.literal('')),
  room: z.string().max(100).optional().or(z.literal('')),

  // Equipment
  manufacturer: z.string().max(255).optional().or(z.literal('')),
  model: z.string().max(255).optional().or(z.literal('')),
  serialNumber: z.string().max(255).optional().or(z.literal('')),
  assetId: z.string().max(255).optional().or(z.literal('')),
});

export type ElementAssessmentSchemaType = z.infer<typeof elementAssessmentSchema>;
