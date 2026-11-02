/** Mock approval state belongs to one run; it never grants authority to another request or phrase. */
import type { AppDefinition } from "./types.js";
import type { MockCredential } from "./runtime.js";
export const fixturePhrase =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
export function createMockAuthentication(
  app: AppDefinition,
  owner: () => MockCredential,
  now: () => Date,
  signal: AbortSignal,
) {
  const requests = new Map<
    string,
    { expires: number; state: "approved" | "denied" | "pending"; url: string }
  >();
  const denied = () =>
    Object.assign(new Error("Mock authentication denied"), { code: "denied" });
  function request(id: unknown) {
    signal.throwIfAborted();
    const record = typeof id === "string" && requests.get(id);
    if (!record || record.expires <= now().getTime()) throw denied();
    return record;
  }
  function settle(url: string, state: "approved" | "denied") {
    signal.throwIfAborted();
    const entry = [...requests.values()].find((record) => record.url === url);
    if (!entry || entry.expires <= now().getTime()) throw denied();
    entry.state = state;
  }
  return {
    approve: (url: string) =>
      Promise.resolve().then(() => settle(url, "approved")),
    deny: (url: string) => Promise.resolve().then(() => settle(url, "denied")),
    execute(
      operation: string,
      input: Record<string, unknown>,
      baseUrl: string,
    ): unknown {
      signal.throwIfAborted();
      if (operation === "auth-request") {
        const definition = input.app as Partial<AppDefinition> | undefined;
        if (definition?.id !== app.id) throw denied();
        const id = crypto.randomUUID();
        const responseUrl = new URL(`approval/${id}`, baseUrl).href;
        requests.set(id, {
          expires: now().getTime() + 600_000,
          state: "pending",
          url: responseUrl,
        });
        return { id, responseUrl };
      }
      if (operation === "auth-connected")
        return input.keyHex === owner().keyHex ? owner() : null;
      const record = request(input.id);
      if (operation === "auth-status") return { state: record.state };
      if (
        operation !== "auth-register" ||
        record.state !== "approved" ||
        input.phrase !== fixturePhrase
      )
        throw denied();
      requests.delete(String(input.id));
      return owner();
    },
  };
}
