import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export default schema;
