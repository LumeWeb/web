import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  remember: z.boolean().optional(),
});

export default LoginSchema;
