import { z } from "zod";

export const enable2faSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters"),
  qrcode: z.string().optional(),
});

export type Enable2faFormValues = z.infer<typeof enable2faSchema>;
