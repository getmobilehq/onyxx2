import { z } from 'zod';

export const assessmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  buildingId: z.string().min(1, 'Building is required'),
  description: z.string().optional().or(z.literal('')),
  targetCompletionDate: z.string().optional().or(z.literal('')),
});

export type AssessmentSchemaType = z.infer<typeof assessmentSchema>;
