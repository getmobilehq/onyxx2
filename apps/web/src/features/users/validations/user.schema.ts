import { z } from 'zod';

export const inviteUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address').max(255),
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  role: z.enum(['org_admin', 'branch_manager', 'assessor', 'viewer'], {
    required_error: 'Role is required',
  }),
  phone: z.string().max(50).optional().or(z.literal('')),
});

export type InviteUserSchemaType = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  role: z.enum(['org_admin', 'branch_manager', 'assessor', 'viewer']).optional(),
  phone: z.string().max(50).optional().or(z.literal('')),
});

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
