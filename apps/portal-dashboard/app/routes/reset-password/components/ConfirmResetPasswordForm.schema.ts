import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  token: z.string().min(6, "Token must be at least 6 characters"),
});

export default schema;
