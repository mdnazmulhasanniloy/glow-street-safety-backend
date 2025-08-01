import z from 'zod';

const createSchema = z.object({
  body: z.object({
    description: z.string().min(1, 'Description is required'),
    expectedReturnTime: z.string().datetime('Invalid return time format'),
    notification: z.boolean().optional().default(true),
    isDeleted: z.boolean().optional().default(false),

    startLocation: z
      .object({
        type: z.literal('Point').default('Point'),
        coordinates: z
          .array(z.number())
          .min(2, 'Start coordinates must have at least [lng, lat]'),
      })
      .optional(),

    endLocation: z
      .object({
        type: z.literal('Point').default('Point'),
        coordinates: z
          .array(z.number())
          .min(2, 'End coordinates must have at least [lng, lat]'),
      })
      .optional(),
  }),
});
const updateSchema = z.object({
  body: z
    .object({
      description: z.string().min(1, 'Description is required'),
      expectedReturnTime: z.string().datetime('Invalid return time format'),
      notification: z.boolean().optional().default(true),
      isDeleted: z.boolean().optional().default(false),

      startLocation: z
        .object({
          type: z.literal('Point').default('Point'),
          coordinates: z
            .array(z.number())
            .min(2, 'Start coordinates must have at least [lng, lat]'),
        })
        .optional(),

      endLocation: z
        .object({
          type: z.literal('Point').default('Point'),
          coordinates: z
            .array(z.number())
            .min(2, 'End coordinates must have at least [lng, lat]'),
        })
        .optional(),
    })
    .partial(),
});

export const safeZoneValidator = {
  createSchema,
  updateSchema,
};
