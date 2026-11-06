/** Fetch-backed ports own local refs and request lifetimes; upload sources open only after admission. */
import { snapshotApplicationMetadata } from "./application-metadata.js";
import { domainError } from "./diagnostics.js";
import { readFixture } from "./files.js";
import type { MockCredential } from "./runtime.js";
import type { MockConnection } from "./transport.js";
import type {
  ApplicationObject,
  ApplicationPort,
  ApplicationShareRef,
  ApplicationShareTarget,
  EventPage,
  ShareInspection,
  ShareOperation,
} from "./types.js";
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
  let shareRefs = new WeakMap<ApplicationShareRef, string>();
  const tokenRefs = new Map<string, ApplicationShareRef>();
  let session: string | undefined;
  let bootstrap:
    | undefined
    | {
        abort: AbortController;
        waiters: number;
        work: Promise<readonly ApplicationShareTarget[]>;
      };
  const pending = new Set<Promise<unknown>>();
  const cleanupErrors: unknown[] = [];
  let closing: Promise<void> | undefined;
  function invalid(): never {
    throw Object.assign(new Error("Invalid application response"), {
      code: "unavailable",
    });
  }
  function track<T>(
    action: () => Promise<T>,
    prepare?: () => void,
  ): Promise<T> {
    let preparationError: unknown;
    let preparationFailed = false;
    const promise = Promise.resolve().then(() => {
      if (preparationFailed) throw preparationError;
      return action();
    });
    pending.add(promise);
    try {
      prepare?.();
    } catch (error) {
      preparationFailed = true;
      preparationError = error;
    }
    void promise.then(
      () => pending.delete(promise),
      () => {
        pending.delete(promise);
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
    if (!response.ok) throw domainError(operation, value);
    return value;
  }
  function objectRef(object: ApplicationObject) {
    const value = refs.get(object);
    if (!value)
      throw Object.assign(new Error("Unknown application object"), {
        code: "foreign-handle",
      });
    return value;
  }
  function shareRef(ref: ApplicationShareRef) {
    const token = shareRefs.get(ref);
    if (!token)
      throw Object.assign(new Error("Unknown application share"), {
        code: "foreign-handle",
      });
    return token;
  }
  async function targets(
    s: AbortSignal,
  ): Promise<readonly ApplicationShareTarget[]> {
    const value = await call(
      "app-share-targets",
      JSON.stringify({ session }),
      s,
    );
    if (
      !value ||
      typeof value !== "object" ||
      !("session" in value) ||
      typeof value.session !== "string" ||
      !/^[a-f0-9-]{36}$/.test(value.session) ||
      (session && session !== value.session) ||
      !("targets" in value) ||
      !Array.isArray(value.targets)
    )
      invalid();
    const labels = new Set<string>();
    const tokens = new Set<string>();
    const result = value.targets.map(
      (target: unknown): ApplicationShareTarget => {
        if (
          !target ||
          typeof target !== "object" ||
          !("ref" in target) ||
          typeof target.ref !== "string" ||
          !/^[a-f0-9-]{36}$/.test(target.ref) ||
          tokens.has(target.ref) ||
          !("label" in target) ||
          typeof target.label !== "string" ||
          !target.label.trim() ||
          labels.has(target.label) ||
          !("operations" in target) ||
          !Array.isArray(target.operations) ||
          !target.operations.length ||
          new Set(target.operations).size !== target.operations.length ||
          target.operations.some(
            (op: unknown) =>
              typeof op !== "string" || !["add", "end", "remove"].includes(op),
          ) ||
          ("expiresAt" in target &&
            (typeof target.expiresAt !== "string" ||
              !Number.isFinite(Date.parse(target.expiresAt)) ||
              new Date(target.expiresAt).toISOString() !== target.expiresAt))
        )
          invalid();
        labels.add(target.label);
        tokens.add(target.ref);
        let ref = tokenRefs.get(target.ref);
        if (!ref) {
          ref = Object.freeze(Object.create(null)) as ApplicationShareRef;
          tokenRefs.set(target.ref, ref);
          shareRefs.set(ref, target.ref);
        }
        return {
          label: target.label,
          operations: [...(target.operations as ShareOperation[])],
          ref,
          ...("expiresAt" in target
            ? { expiresAt: target.expiresAt as string }
            : {}),
        };
      },
    );
    s.throwIfAborted();
    session = value.session;
    return result;
  }
  function waitForTargets(
    current: NonNullable<typeof bootstrap>,
    signal: AbortSignal,
  ) {
    current.waiters++;
    return new Promise<readonly ApplicationShareTarget[]>((resolve, reject) => {
      let waiting = true;
      const detach = () => {
        if (!waiting) return false;
        waiting = false;
        signal.removeEventListener("abort", abort);
        current.waiters--;
        return true;
      };
      const abort = () => {
        if (!detach()) return;
        if (!current.waiters) {
          if (bootstrap === current) bootstrap = undefined;
          current.abort.abort(signal.reason);
        }
        // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Preserve caller cancellation identity, including values from other realms.
        reject(signal.reason);
      };
      signal.addEventListener("abort", abort, { once: true });
      void current.work.then(
        (value) => {
          if (detach()) resolve(value);
        },
        (error: unknown) => {
          if (!detach()) return;
          // oxlint-disable-next-line typescript/prefer-promise-reject-errors -- Native Fetch failures must reach callers without translation.
          reject(error);
        },
      );
      if (signal.aborted) abort();
    });
  }
  function shareCall(
    operation: string,
    ref: ApplicationShareRef,
    body: Record<string, unknown>,
    input?: AbortSignal,
  ) {
    return track(async () => {
      const s = signal(input);
      s.throwIfAborted();
      const value = await call(
        operation,
        JSON.stringify({ ...body, ref: shareRef(ref), session }),
        s,
      );
      return value;
    });
  }
  return {
    close() {
      lifetime.abort();
      return (closing ??= Promise.allSettled([...pending]).then(() => {
        shareRefs = new WeakMap();
        tokenRefs.clear();
        session = undefined;
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
        await call("app-delete", JSON.stringify({ ref: objectRef(object) }), s);
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
          JSON.stringify({ ref: objectRef(object) }),
          s,
        );
        if (state !== "uploaded" && state !== "pinned" && state !== "missing")
          invalid();
        return state;
      });
    },
    pin(object, options = {}) {
      let metadata: Uint8Array | undefined;
      return track(
        async () => {
          const s = signal(options.signal);
          s.throwIfAborted();
          await call(
            "app-pin",
            JSON.stringify({
              metadata: metadata === undefined ? undefined : [...metadata],
              ref: objectRef(object),
            }),
            s,
          );
        },
        () => {
          const source = options.metadata;
          if (source !== undefined)
            metadata = snapshotApplicationMetadata(source);
        },
      );
    },
    shares: {
      add(ref, object, options = {}) {
        return track(async () => {
          signal(options.signal).throwIfAborted();
          await shareCall(
            "app-share-add",
            ref,
            { object: objectRef(object) },
            options.signal,
          );
        });
      },
      async end(ref, options = {}) {
        await shareCall("app-share-end", ref, {}, options.signal);
      },
      inspect(ref, objectId, options = {}) {
        return track(async () => {
          const value = await shareCall(
            "app-share-inspect",
            ref,
            { objectId },
            options.signal,
          );
          if (
            !value ||
            typeof value !== "object" ||
            !("state" in value) ||
            !["active", "ended", "expired"].includes(value.state as string) ||
            !("contains" in value) ||
            (value.contains !== null && typeof value.contains !== "boolean") ||
            ((objectId === null || value.state === "ended") &&
              value.contains !== null) ||
            (objectId !== null &&
              value.state !== "ended" &&
              typeof value.contains !== "boolean")
          )
            invalid();
          return value as ShareInspection;
        });
      },
      async remove(ref, objectId, options = {}) {
        await shareCall("app-share-remove", ref, { objectId }, options.signal);
      },
      targets(options = {}) {
        return track(async () => {
          const s = signal(options.signal);
          s.throwIfAborted();
          if (session) return targets(s);
          if (!bootstrap) {
            const abort = new AbortController();
            const current = {
              abort,
              waiters: 0,
              work: track(() =>
                targets(AbortSignal.any([lifetime.signal, abort.signal])),
              ),
            };
            bootstrap = current;
            const settled = () => {
              if (bootstrap === current) bootstrap = undefined;
            };
            void current.work.then(settled, settled);
          }
          return waitForTargets(bootstrap, s);
        });
      },
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
        const metadata = snapshotApplicationMetadata(input.metadata);
        let name = input.name;
        // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- Null must reject rather than select the file label.
        if (name === undefined) name = file.name;
        if (
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
          const bytes = await readFixture(
            file,
            bodySignal,
            undefined,
            (error) => {
              cleanupErrors.push(error);
            },
          );
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
