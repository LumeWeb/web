import type { FieldValues } from "react-hook-form";
import type { FormAutosaveConfig, FormConfig } from "../types";

export function computeAutoSaveConfig<T extends FieldValues>(
  autoSave: FormConfig<T>["autoSave"],
): FormAutosaveConfig<T> {
  if (autoSave === true) {
    return { debounce: 1000, enabled: true };
  }

  if (typeof autoSave === "object" && autoSave !== null) {
    // Spread first, then apply defaults/overrides so defaults are enforced
    return {
      ...autoSave,
      debounce: autoSave.debounce ?? 1000,
      enabled: true,
    };
  }

  return { enabled: false };
}
