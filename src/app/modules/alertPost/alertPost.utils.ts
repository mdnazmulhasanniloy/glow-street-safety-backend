import { z } from 'zod';

const alertSchema = z.object({ 
  alertType: z.string().min(1, 'Alert type is required'), 
  description: z.string().min(1, 'Description is required'),
  isDeleted: z.boolean().optional().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const createAlertSchema = z.object({
  body: alertSchema.omit({
    createdAt: true,
    updatedAt: true,
  }),
});

const updateAlertSchema = z.object({
  body: alertSchema
    .omit({
      createdAt: true,
      updatedAt: true,
    })
    .partial(),
});

export const alertValidator = {
  createAlertSchema,
  updateAlertSchema,
};

export default alertValidator;
