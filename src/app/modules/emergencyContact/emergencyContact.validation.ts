import z from 'zod';

const createSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required').optional(),
    name: z.string().min(1, 'Name is required'),
    relation: z.string().min(1, 'Relation is required'),
    phoneNumber: z
      .string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number is too long'),
    isDeleted: z.boolean().optional().default(false),
  }),
});
const updateSchema = z.object({
  body: z
    .object({
      userId: z.string().min(1, 'User ID is required').optional(),
      name: z.string().min(1, 'Name is required'),
      relation: z.string().min(1, 'Relation is required'),
      phoneNumber: z
        .string()
        .min(7, 'Phone number must be at least 7 digits')
        .max(20, 'Phone number is too long'),
      isDeleted: z.boolean().optional().default(false),
    })
    .partial(),
});

export const emergencyContactValidator = {
  createSchema,
  updateSchema,
};
