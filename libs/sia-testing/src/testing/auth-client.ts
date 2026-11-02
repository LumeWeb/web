/** Mock sign-in uses the same server state as fixture approval and reconnect. */
import type { MockCredential } from "./runtime.js";
import type { MockConnection } from "./transport.js";
import type { AppDefinition } from "./types.js";
export interface MockAuthRequest {
  readonly id: string;
  readonly responseUrl: string;
}
export function createMockAuth(
  connection: MockConnection,
  suppliedCredential?: MockCredential,
) {
  const credential = suppliedCredential ?? connection.credential;
  if (!credential)
    throw new Error("Mock authentication requires a credential binding");
  const keyHex = credential.keyHex;
  const abort = new AbortController();
  async function call(
    operation: string,
    data: unknown,
    signal?: AbortSignal,
  ): Promise<unknown> {
    const response = await fetch(
      new URL(`${connection.client}/${operation}`, connection.url),
      {
        body: JSON.stringify(data),
        headers: {
          "authorization": `Bearer ${keyHex}`,
          "content-type": "application/json",
        },
        method: "POST",
        redirect: "error",
        signal: signal ? AbortSignal.any([signal, abort.signal]) : abort.signal,
      },
    );
    if (!response.ok)
      throw Object.assign(new Error("Mock authentication failed"), {
        code: "denied",
      });
    return response.json();
  }
  return {
    close() {
      abort.abort();
      return Promise.resolve();
    },
    async connected(keyHex: string) {
      return (await call("auth-connected", {
        keyHex,
      })) as MockCredential | null;
    },
    async register(request: MockAuthRequest, phrase: string) {
      return (await call("auth-register", {
        id: request.id,
        phrase,
      })) as MockCredential;
    },
    async requestConnection(app: AppDefinition) {
      return (await call("auth-request", { app })) as MockAuthRequest;
    },
    async waitForApproval(
      request: MockAuthRequest,
      options: { signal?: AbortSignal } = {},
    ) {
      const signal = options.signal
        ? AbortSignal.any([options.signal, abort.signal])
        : abort.signal;
      for (;;) {
        const result = (await call(
          "auth-status",
          { id: request.id },
          signal,
        )) as { state: string };
        if (result.state === "approved") return;
        if (result.state !== "pending")
          throw Object.assign(new Error("Connection denied"), {
            code: "denied",
          });
        await new Promise<void>((resolve, reject) => {
          const cancelled = () => {
            clearTimeout(timer);
            signal.removeEventListener("abort", cancelled);
            reject(
              signal.reason instanceof Error
                ? signal.reason
                : new DOMException("Operation aborted", "AbortError"),
            );
          };
          const timer = setTimeout(() => {
            signal.removeEventListener("abort", cancelled);
            resolve();
          }, 25);
          signal.addEventListener("abort", cancelled, { once: true });
          if (signal.aborted) cancelled();
        });
      }
    },
  };
}
