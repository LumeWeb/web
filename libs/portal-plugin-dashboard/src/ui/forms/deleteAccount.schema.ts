import { z } from "zod";

const stepOneSchema = z.object({
  confirmText: z.literal("DELETE", {
    errorMap: () => ({ message: "Please type DELETE to confirm" }),
  }),
});

const stepTwoSchema = z.object({
  confirmText: z.literal("I UNDERSTAND", {
    errorMap: () => ({ message: "Please type I UNDERSTAND to confirm" }),
  }),
});

export { stepOneSchema, stepTwoSchema };
