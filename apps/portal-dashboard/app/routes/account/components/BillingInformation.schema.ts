import { z } from "zod";

const baseSchema = {
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(56, "Country must not exceed 56 characters"),
};

const conditionalFields = {
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters"),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(50, "State must not exceed 50 characters"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  organization: z
    .union([
      z.string().min(2, "Organization must be at least 2 characters"),
      z.string().max(100, "Organization must not exceed 100 characters"),
    ])
    .optional()
    .transform((e) => (e === "" ? undefined : e)),
  dependentLocality: z
    .string()
    .min(2, "Dependent locality must be at least 2 characters")
    .max(100, "Dependent locality must not exceed 100 characters"),
  sortingCode: z
    .string()
    .min(2, "Sorting code must be at least 2 characters")
    .max(20, "Sorting code must not exceed 20 characters"),
};

export type EntityCode = "A" | "C" | "S" | "Z" | "O" | "D" | "X";
export type FieldName = keyof typeof conditionalFields;

export const fieldMapping: Record<EntityCode, FieldName> = {
  O: "organization",
  A: "address",
  C: "city",
  S: "state",
  Z: "zip",
  D: "dependentLocality",
  X: "sortingCode",
};

type SchemaType = typeof baseSchema & {
  [K in keyof typeof conditionalFields]?: (typeof conditionalFields)[K];
};

export const createBillingInfoSchema = (
  supportedEntities: EntityCode[] = [],
) => {
  const schema: SchemaType = { ...baseSchema };

  supportedEntities.forEach((entity) => {
    const field = fieldMapping[entity];
    if (field) {
      schema[field] = conditionalFields[field];
    }
  });

  return z.object(schema);
};

export type BillingInfoSchema = ReturnType<typeof createBillingInfoSchema>;
export type BillingInfoFields = z.infer<BillingInfoSchema>;
