import { z } from "zod";

const schema = z
  .object({
    current_password: z.string(),
    new_password: z.string(),
    retype_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.new_password !== data.retype_password) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["retype_password"],
      });
    }
    return true;
  });

export default schema;
