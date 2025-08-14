import { z } from "zod";

const schema = z.object({
  password: z.string()
    .min(1, "Password cannot be empty")
    .refine(val => val.trim().length > 0, { 
      message: "Password cannot be empty or whitespace only" 
    }),
});

export default schema;
