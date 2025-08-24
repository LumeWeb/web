import type { WidgetDefinition } from "../types/widget";

export function sortWidgets(widgets: WidgetDefinition[]): WidgetDefinition[] {
  return [...widgets].sort((a, b) => {
    // Prefer explicit order if specified
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

    // Fall back to column position with safe defaults
    const colA = a.position.location?.column ?? Number.MAX_SAFE_INTEGER;
    const colB = b.position.location?.column ?? Number.MAX_SAFE_INTEGER;

    // Final fallback to ID comparison
    return orderA - orderB || colA - colB || a.id.localeCompare(b.id);
  });
}
