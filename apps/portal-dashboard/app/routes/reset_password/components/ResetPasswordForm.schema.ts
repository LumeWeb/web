import { z } from "zod";

const RecoverPasswordSchema = z.object({
  email: z.string().email(),
});

export default RecoverPasswordSchema;
