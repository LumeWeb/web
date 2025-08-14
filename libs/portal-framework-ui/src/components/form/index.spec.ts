import { describe, expect, it } from "vitest";

// Import everything from the index file
import * as FormExports from "./index";

describe("Form Package Exports", () => {
  it("should export key components and types", () => {
    // Check for some expected exports
    expect(FormExports.SchemaForm).toBeDefined();
    expect(FormExports.FormRenderer).toBeDefined();
    expect(FormExports.StepSchemaForm).toBeDefined();
    expect(FormExports.registerAllFormComponents).toBeDefined();
    expect(FormExports.adapters).toBeDefined();
    expect(FormExports.FormProvider).toBeDefined();
    expect(FormExports.useFormContext).toBeDefined();
    expect(FormExports.FormFieldType).toBeDefined();
    expect(FormExports.getFormComponent).toBeDefined();
    expect(FormExports.isStepFormConfig).toBeDefined();

    // Check for exported types (these won't exist at runtime, but the import check is sufficient)
    // The type check is done by TypeScript, this runtime test just confirms the export structure.
    // We can't directly assert on types at runtime like `expect(FormExports.FormConfig).toBeDefined()`.
    // A simple check for runtime values is enough for a basic smoke test of the index file.
  });
});
