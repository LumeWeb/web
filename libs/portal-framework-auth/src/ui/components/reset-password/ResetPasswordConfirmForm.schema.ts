import { z } from "zod";

const schema = z
  .object({
    confirmPassword: z.string().min(8),
    email: z.string().email().min(1),
    password: z.string().min(8),
    token: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default schema;
