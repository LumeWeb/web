import { z } from "zod";

export default z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  ip_address: z.union([z.ipv4(), z.ipv6()]),
});
