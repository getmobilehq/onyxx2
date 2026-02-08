import { z } from 'zod';

export const deficiencySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional().or(z.literal('')),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  priority: z.enum(['immediate', 'short_term', 'medium_term', 'long_term']),
  estimatedCost: z
    .union([z.number().nonnegative(), z.nan(), z.literal('')])
    .optional()
    .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined)),
  quantity: z
    .union([z.number().positive(), z.nan(), z.literal('')])
    .optional()
    .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined)),
  unitOfMeasure: z.string().max(50).optional().or(z.literal('')),
  targetYear: z
    .union([z.number().int().min(2000).max(2100), z.nan(), z.literal('')])
    .optional()
    .transform((val) => (typeof val === 'number' && !isNaN(val) ? val : undefined)),
  recommendedAction: z.string().optional().or(z.literal('')),
});

export type DeficiencySchemaType = z.infer<typeof deficiencySchema>;
