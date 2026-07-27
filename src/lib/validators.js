import { z } from 'zod';

export const optionalUrl = z.union([z.literal(''), z.string().url('Enter a valid URL')]).optional();
export const numberValue = (min = 0, max) => {
  let schema = z.coerce.number().min(min, `Must be at least ${min}`);
  if (max !== undefined) schema = schema.max(max, `Must be ${max} or less`);
  return schema;
};
