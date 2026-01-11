import { z } from "zod";

export default z.object({
  sd_hash: z.string().min(1, "SD hash is required"),
});
