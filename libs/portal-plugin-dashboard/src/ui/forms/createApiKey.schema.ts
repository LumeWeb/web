import { z } from "zod";

const schema = z.object({
  name: z.string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .refine(val => val.trim().length > 0, {
      message: "Name cannot be empty or whitespace only"
    }),
});

export default schema;
