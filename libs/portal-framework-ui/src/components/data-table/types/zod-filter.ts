import { z } from "zod";

import type { FieldType, FilterField, LogicalOperator } from "./filter-types";

export const convertZodSchemaToFilters = (
  schema: z.ZodObject<any>,
): FilterField[] => {
  const shape = schema.shape;
  return Object.entries(shape).map(([fieldName, fieldSchema]) => {
    const fieldDef = detectZodFieldType(fieldSchema);
    return {
      field: fieldName,
      isFilterable: true,
      isSearchable: fieldDef.type === "string",
      label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
      operators: fieldDef.operators,
      options: fieldDef.options,
      priority: "medium",
      type: fieldDef.type,
    };
  });
};

const detectZodFieldType = (
  schema: unknown,
): {
  operators: LogicalOperator[];
  options?: { label: string; value: any }[];
  type: FieldType;
} => {
  if (!(schema instanceof z.ZodType)) {
    return {
      operators: ["eq", "ne"],
      type: "unknown",
    };
  }
  if (
    schema instanceof z.ZodString ||
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodString
  ) {
    return {
      operators: ["contains", "eq", "ne", "startswith", "endswith"],
      type: "string",
    };
  }

  if (
    schema instanceof z.ZodNumber ||
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodNumber
  ) {
    return {
      operators: ["eq", "ne", "gt", "lt", "gte", "lte", "between"],
      type: "number",
    };
  }

  if (
    schema instanceof z.ZodBoolean ||
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodBoolean
  ) {
    return {
      operators: ["eq"],
      type: "boolean",
    };
  }

  if (
    schema instanceof z.ZodDate ||
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodDate
  ) {
    return {
      operators: ["eq", "ne", "gt", "lt", "gte", "lte", "between"],
      type: "date",
    };
  }

  if (
    schema instanceof z.ZodEnum ||
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodEnum
  ) {
    const options = schema._def.values ? schema._def.values : [];
    return {
      operators: ["eq", "ne"],
      options: options.map((value: any) => ({
        label: String(value), // Safely convert unknown to string
        value,
      })),
      type: "select",
    };
  }

  // Handle extended Zod types
  if (
    schema instanceof z.ZodNativeEnum ||
    schema._def.typeName === z.ZodFirstPartyTypeKind.ZodNativeEnum
  ) {
    const enumValues = Object.values(
      "_def" in schema && "values" in schema._def
        ? schema._def.values
        : (schema as any).enum,
    );
    return {
      operators: ["eq", "ne"],
      options: enumValues.map((value) => ({
        label: String(value),
        value,
      })),
      type: "select",
    };
  }

  return {
    operators: ["eq", "ne"],
    type: "unknown",
  };
};
