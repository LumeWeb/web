import { z } from "zod";

export const enable2faSchema = z.object({
  qrcode: z.string().optional(),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

export type Enable2faFormValues = z.infer<typeof enable2faSchema>;
