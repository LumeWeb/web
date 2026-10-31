/**
 * Named model faults and the regression tests expected to detect them.
 * Compiler callbacks remain private so callers select faults by name.
 */
export const modelMutations: readonly { name: string; testFile: string }[];
/**
 * Returns TypeScript source with the named fault applied to one syntax node.
 * Throws for unknown names or missing or ambiguous targets; does not write files.
 */
export function mutateModelSource(source: string, name: string): string;
