/** Wire diagnostics contain fixed operation and field names, never callback error messages. */
const fields = new Set([
  "cursor",
  "downloadBytesPerSecond",
  "latencyMs",
  "length",
  "limit",
  "offset",
  "times",
]);
const inputFields = new WeakMap<Error, string>();
const shutdowns = new WeakSet<Error>();
const operations = new Set([
  "app-delete",
  "app-events",
  "app-inspect",
  "app-pin",
  "app-upload-admit",
  "app-upload-body",
  "app-upload-cancel",
  "download",
  "object",
  "objects",
  "owner-share",
  "owner-share-objects",
  "owner-shares",
]);

export function diagnosticField(error: unknown): string | undefined {
  return error instanceof Error ? inputFields.get(error) : undefined;
}
export function domainError(
  operation: string,
  value: unknown,
): Error & { code: string } {
  const record = value && typeof value === "object" ? value : {};
  const code =
    "code" in record && typeof record.code === "string"
      ? record.code
      : "unavailable";
  const field =
    "field" in record &&
    typeof record.field === "string" &&
    fields.has(record.field)
      ? record.field
      : undefined;
  const context = operations.has(operation) ? operation : "request";
  const reason =
    code === "invalid-input"
      ? "invalid input"
      : code === "not-found"
        ? "requested resource not found"
        : code === "closed"
          ? "endpoint is closed"
          : code === "denied"
            ? "access denied"
            : code === "foreign-handle"
              ? "unknown handle"
              : code === "limit"
                ? "allowance exceeded"
                : "request unavailable";
  return Object.assign(
    new Error(`${context}${field ? `.${field}` : ""}: ${reason}`),
    { code },
  );
}
export function endpointShutdown(): Error & { code: string } {
  const error = Object.assign(new Error("Mock endpoint is closed"), {
    code: "closed",
  });
  shutdowns.add(error);
  return error;
}
export function invalidInput(
  field: string,
  message: string,
): Error & { code: string } {
  const error = Object.assign(new Error(message), { code: "invalid-input" });
  if (fields.has(field)) inputFields.set(error, field);
  return error;
}
export function isEndpointShutdown(error: unknown): boolean {
  return error instanceof Error && shutdowns.has(error);
}
