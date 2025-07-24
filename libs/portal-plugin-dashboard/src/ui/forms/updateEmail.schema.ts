import { z } from "zod";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    password_confirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.password_confirm) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password_confirm"],
        message: "Passwords do not match",
      });
    }
    return true;
  });
export default schema;
