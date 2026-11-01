/** A timeout or decoding error must not pass the access check; require the expected metadata denial. */
export function isSharedObjectDenial(
  response: { method: string; status: number; url: string },
  endpoint: string,
  objectId: string,
): boolean {
  if (response.method !== "GET" || ![401, 403, 404].includes(response.status))
    return false;
  try {
    const actual = new URL(response.url);
    const expected = new URL(`shared/objects/${objectId}`, endpoint);
    return (
      actual.origin === expected.origin && actual.pathname === expected.pathname
    );
  } catch {
    return false;
  }
}
