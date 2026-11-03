/** Fetch uploads buffer bounded bytes only after the remote run reserves its allowance. */
import { readFixture } from "./files.js";
import type { MockCredential } from "./runtime.js";
import type { MockConnection } from "./transport.js";
import type { ApplicationObject, ApplicationPort, EventPage } from "./types.js";
export function createMockApplication(
  connection: MockConnection,
  credential: MockCredential,
): ApplicationPort {
  const root = new URL(connection.url);
  if (
    !/^https?:$/.test(root.protocol) ||
    root.username ||
    root.password ||
    !/^[a-f0-9]{64}$/.test(credential.keyHex)
  )
    throw new Error("Invalid mock connection");
  const lifetime = new AbortController();
  const refs = new WeakMap<ApplicationObject, string>();
  const pending = new Set<Promise<unknown>>();
  const cleanupErrors: unknown[] = [];
  let closing: Promise<void> | undefined;
  function invalid(): never {
    throw Object.assign(new Error("Invalid application response"), {
      code: "unavailable",
    });
  }
  function track<T>(action: () => Promise<T>): Promise<T> {
    const promise = Promise.resolve().then(action);
    pending.add(promise);
    void promise.then(
      () => pending.delete(promise),
      (error: unknown) => {
        pending.delete(promise);
        if (error instanceof AggregateError) cleanupErrors.push(error);
      },
    );
    return promise;
  }
  function signal(input?: AbortSignal) {
    return AbortSignal.any([lifetime.signal, ...(input ? [input] : [])]);
  }
  async function call(
    operation: string,
    body: BodyInit,
    callSignal?: AbortSignal,
    token?: string,
  ): Promise<unknown> {
    const url = new URL(
      `${encodeURIComponent(connection.client)}/${operation}`,
      root,
    );
    if (token) url.searchParams.set("token", token);
    const response = await fetch(url, {
      body,
      headers: { authorization: `Bearer ${credential.keyHex}` },
      method: "POST",
      redirect: "error",
      ...(callSignal ? { signal: callSignal } : {}),
    });
    const value: unknown = await response.json();
    if (!response.ok)
      throw Object.assign(new Error("Mock application request failed"), {
        code:
          value &&
          typeof value === "object" &&
          "code" in value &&
          typeof value.code === "string"
            ? value.code
            : "unavailable",
      });
    return value;
  }
  function ref(object: ApplicationObject) {
    const value = refs.get(object);
    if (!value)
      throw Object.assign(new Error("Unknown application object"), {
        code: "foreign-handle",
      });
    return value;
  }
  return {
    close() {
      lifetime.abort();
      return (closing ??= Promise.allSettled([...pending]).then(() => {
        if (cleanupErrors.length)
          throw new AggregateError(
            cleanupErrors,
            "Application source cleanup failed",
          );
      }));
    },
    delete(object, options = {}) {
      return track(async () => {
        const s = signal(options.signal);
        s.throwIfAborted();
        await call("app-delete", JSON.stringify({ ref: ref(object) }), s);
      });
    },
    events(input) {
      return track(async () => {
        const s = signal(input.signal);
        s.throwIfAborted();
        const value = await call(
          "app-events",
          JSON.stringify({ cursor: input.cursor, limit: input.limit }),
          s,
        );
        if (
          !value ||
          typeof value !== "object" ||
          !("events" in value) ||
          !Array.isArray(value.events) ||
          value.events.length > input.limit ||
          !("done" in value) ||
          typeof value.done !== "boolean" ||
          !("nextCursor" in value)
        )
          invalid();
        let cursor = input.cursor;
        for (const row of value.events as unknown[]) {
          if (
            !row ||
            typeof row !== "object" ||
            !("id" in row) ||
            typeof row.id !== "string" ||
            !/^[a-f0-9]{64}$/.test(row.id) ||
            !("deleted" in row) ||
            typeof row.deleted !== "boolean" ||
            !("updatedAt" in row) ||
            typeof row.updatedAt !== "string" ||
            !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(row.updatedAt) ||
            !Number.isFinite(Date.parse(row.updatedAt)) ||
            new Date(row.updatedAt).toISOString() !== row.updatedAt ||
            (cursor &&
              (row.updatedAt < cursor.after ||
                (row.updatedAt === cursor.after && row.id <= cursor.id)))
          )
            invalid();
          cursor = { after: row.updatedAt, id: row.id };
        }
        const next = value.nextCursor;
        if (
          (cursor === null
            ? next !== null
            : !next ||
              typeof next !== "object" ||
              !("after" in next) ||
              next.after !== cursor.after ||
              !("id" in next) ||
              next.id !== cursor.id) ||
          value.done !== value.events.length < input.limit
        )
          invalid();
        return value as unknown as EventPage;
      });
    },
    inspect(object, options = {}) {
      return track(async () => {
        const s = signal(options.signal);
        s.throwIfAborted();
        const state = await call(
          "app-inspect",
          JSON.stringify({ ref: ref(object) }),
          s,
        );
        if (state !== "uploaded" && state !== "pinned" && state !== "missing")
          invalid();
        return state;
      });
    },
    pin(object, options = {}) {
      return track(async () => {
        const s = signal(options.signal);
        s.throwIfAborted();
        await call("app-pin", JSON.stringify({ ref: ref(object) }), s);
      });
    },
    upload(input) {
      return track(async () => {
        const callSignal = signal(input.signal);
        callSignal.throwIfAborted();
        const file = {
          name: input.file.name,
          open: input.file.open.bind(input.file),
          sha256: input.file.sha256,
          sizeBytes: input.file.sizeBytes,
        };
        const metadata = input.metadata;
        const size: number =
          metadata instanceof Uint8Array
            ? (Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(Uint8Array.prototype),
                "byteLength",
              )!.get!.call(metadata) as number)
            : Infinity;
        const name = input.name;
        if (
          size > 1024 ||
          typeof name !== "string" ||
          !name ||
          name.length > 1024 ||
          new TextEncoder().encode(name).length > 1024 ||
          !Number.isSafeInteger(file.sizeBytes) ||
          file.sizeBytes < 0 ||
          file.sizeBytes > 16 * 1024 * 1024 ||
          !/^[a-f0-9]{64}$/.test(file.sha256)
        )
          throw Object.assign(new Error("Invalid application upload"), {
            code: "invalid-input",
          });
        const descriptor = JSON.stringify({
          metadata: [...new Uint8Array(metadata)],
          name,
          sha256: file.sha256,
          sizeBytes: file.sizeBytes,
        });
        const admission = await call(
          "app-upload-admit",
          descriptor,
          callSignal,
        );
        if (
          !admission ||
          typeof admission !== "object" ||
          !("token" in admission) ||
          typeof admission.token !== "string" ||
          !/^[a-f0-9-]{36}$/.test(admission.token) ||
          !("expiresAt" in admission) ||
          typeof admission.expiresAt !== "number" ||
          !Number.isFinite(admission.expiresAt)
        )
          invalid();
        const token = admission.token;
        const expiry = new AbortController();
        const timer = setTimeout(
          () => expiry.abort(),
          Math.max(0, Math.min(30_000, admission.expiresAt - Date.now())),
        );
        let completed = false;
        try {
          const bodySignal = AbortSignal.any([callSignal, expiry.signal]);
          const bytes = await readFixture(file, bodySignal);
          const value = await call(
            "app-upload-body",
            new Uint8Array(bytes),
            bodySignal,
            token,
          );
          if (
            !value ||
            typeof value !== "object" ||
            !("id" in value) ||
            typeof value.id !== "string" ||
            !/^[a-f0-9]{64}$/.test(value.id) ||
            !("ref" in value) ||
            typeof value.ref !== "string" ||
            !/^[a-f0-9-]{36}$/.test(value.ref)
          )
            invalid();
          const object = Object.freeze({ id: value.id }) as ApplicationObject;
          refs.set(object, value.ref);
          completed = true;
          return object;
        } finally {
          try {
            // A closed client must not wait for remote admission cleanup; the lease also expires server-side.
            if (
              !completed &&
              !lifetime.signal.aborted &&
              !expiry.signal.aborted
            )
              await call(
                "app-upload-cancel",
                "",
                AbortSignal.any([lifetime.signal, expiry.signal]),
                token,
              ).catch(() => undefined);
          } finally {
            clearTimeout(timer);
          }
        }
      });
    },
  };
}
