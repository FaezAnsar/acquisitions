import { z } from 'zod';

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must be at most 100 characters long')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email address')
      .max(255)
      .toLowerCase()
      .trim()
      .optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password must be at most 100 characters long')
      .trim()
      .optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a valid number')
    .transform(val => parseInt(val, 10)),
});
