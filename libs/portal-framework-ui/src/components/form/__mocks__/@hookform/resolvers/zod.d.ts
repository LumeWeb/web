import { ZodType } from "zod";
import { FieldValues, UseFormReturn } from "react-hook-form";

// Augment the original module's types to include our mock exports
declare module "@hookform/resolvers/zod" {
  export const zodResolverSymbol: Symbol;
  // We can also refine the zodResolver mock's type if needed,
  // but for this fix, just declaring the symbol is sufficient.
  // export const zodResolver: import("vitest").Mock<any, any>;
}
