import { z } from 'zod';

export const branchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().max(50).optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
});

export type BranchSchemaType = z.infer<typeof branchSchema>;
