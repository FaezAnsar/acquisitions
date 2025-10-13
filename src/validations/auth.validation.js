import {z} from 'zod';

export const signUpSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name must be at most 100 characters long').trim()  ,
    email: z.email('Invalid email address').max(255).toLowerCase().trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(100, 'Password must be at most 100 characters long').trim(),
    role: z.enum(['user', 'admin']).default('user'),
});


export const signInSchema = z.object({
    email: z.email('Invalid email address').max(255).toLowerCase().trim(),
    password: z.string().min(1, 'Password must be at least 6 characters long').max(100, 'Password must be at most 100 characters long').trim(),});
