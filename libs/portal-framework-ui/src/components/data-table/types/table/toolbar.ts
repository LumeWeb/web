import type { FieldType } from "../filter-types";

export interface FilterChip {
  field: string;
  label: string;
  onRemove: () => void;
  type: FieldType;
  value: string;
}
