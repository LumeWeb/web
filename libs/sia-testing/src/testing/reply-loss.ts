/** A private identity marker lets adapters drop delivery without serializing a new error code. */
const losses = new WeakSet<Error>();
export function isLostReply(error: unknown): boolean {
  return error instanceof Error && losses.has(error);
}
export function lostReply(): Error & { code: "unavailable" } {
  const error = Object.assign(
    new Error("Mock mutation acknowledgement unavailable"),
    {
      code: "unavailable" as const,
    },
  );
  losses.add(error);
  return error;
}
