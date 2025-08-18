import { z } from "zod";

export const schema = z
  .object({
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    termsOfService: z
      .boolean({
        required_error: "You must agree to the terms of service",
      })
      .refine((v) => v === true, {
        message: "You must agree to the terms of service",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
    return true;
  });
