import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP is required"),
  country: z.string().min(1, "Country is required"),
});

export default schema;
