import { z } from "zod";

const schema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string(),
    retypePassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.retypePassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retypePassword"],
        message: "Passwords do not match",
      });
    }
    return true;
  });

export default schema;
