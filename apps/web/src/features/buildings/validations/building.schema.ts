import { z } from 'zod';

export const buildingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  branchId: z.string().min(1, 'Branch is required'),
  code: z.string().max(50).optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  buildingType: z.string().max(100).optional().or(z.literal('')),
  yearBuilt: z.coerce.number().int().min(1600).max(2100).optional().or(z.literal('')),
  numFloors: z.coerce.number().int().min(1).max(200).optional().or(z.literal('')),
  grossSquareFeet: z.coerce.number().min(0).optional().or(z.literal('')),
  currentReplacementValue: z.coerce.number().min(0).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
});

export type BuildingSchemaType = z.infer<typeof buildingSchema>;
