import z from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  descriptions: z.string().min(1, 'Descriptions is required'),
  price: z.number().gte(0, 'Price must be >= 0'),
  durationDay: z
    .number()
    .int('durationDay must be an integer')
    .gte(0, 'durationDay must be >= 0'),
});

const createSchema = z.object({
  body: schema,
});
const updateSchema = z.object({
  body: schema.partial(),
});

const packageValidator = {
  createSchema,
  updateSchema,
};

export default packageValidator;
