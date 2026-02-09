import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export type OrganizationSchemaType = z.infer<typeof organizationSchema>;
