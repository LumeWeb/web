import { z } from "zod";

const schema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    retypePassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.retypePassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retypePassword"],
        message: "Passwords do not match",
      });
    }
    return true;
  });

export default schema;
