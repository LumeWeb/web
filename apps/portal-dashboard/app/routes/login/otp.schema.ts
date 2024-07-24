import { z } from "zod";

const schema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters" }),
});

export default schema;
