/** Managed mock runs bind readers to owner or recipient access and clean only their own fixtures. */
import { createIndexdModel } from "../model/index.js";
import {
  createMockNetwork,
  type MockNetwork,
  type MockSdk,
} from "../sdk/index.js";
import { readFixture } from "./files.js";
import { createRequestControls } from "./controls.js";
import { createMockAuthentication, fixturePhrase } from "./authentication.js";
import { type MockCredential, registerRuntime } from "./runtime.js";
import type {
  ActorRef,
  BrowserAccess,
  MockOptions,
  MockRun,
  MockRunOptions,
  MockSia,
  ReadObject,
  ReadPort,
  RunLimits,
  TestObject,
  TestShare,
} from "./types.js";
export { bytesFixture } from "./files.js";

interface Context {
  abort: AbortController;
  authentication?: ReturnType<typeof createMockAuthentication>;
  cleanup?: Promise<void>;
  credentials: Set<string>;
  id: string;
  limits: RunLimits;
  network: MockNetwork | undefined;
  objectAttempts: number;
  objects: Map<string, ObjectRecord>;
  pending: Set<Promise<unknown>>;
  reservedBytes: number;
  sdk: MockSdk | undefined;
  shareAttempts: number;
  shares: Map<string, ShareRecord>;
  signal: AbortSignal;
  state: "closed" | "closing" | "open";
  uploadedBytes: number;
}
interface Grant {
  context: Context;
  credential: MockCredential;
  key: null | string;
}
interface ObjectRecord {
  deleted: boolean;
  deletion?: Promise<void>;
  handle: TestObject;
  metadata: Uint8Array;
}
interface ShareRecord {
  handle: TestShare;
  revoked: boolean;
}

/** Store ownership is per run so closing one account cannot reset another active run. */
export function createMockSia(options: MockOptions = {}): MockSia {
  const start =
    options.clock && options.clock !== "realtime"
      ? Date.parse(options.clock.start)
      : undefined;
  if (start !== undefined && !Number.isFinite(start))
    throw failure("invalid-input", "Invalid mock clock");
  let elapsed = 0;
  let closed = false;
  const now = () =>
    new Date(start === undefined ? Date.now() : start + elapsed);
  const active = new Set<Context>();
  const actors = new WeakSet<ActorRef>();
  const controls = createRequestControls();
  const credentials = new Map<string, BrowserAccess>();
  const grants = new WeakMap<BrowserAccess, Grant>();
  const objects = new WeakMap<
    TestObject,
    { context: Context; record: ObjectRecord }
  >();
  const shares = new WeakMap<
    TestShare,
    { context: Context; record: ShareRecord }
  >();

  function environmentOpen(): void {
    if (closed) throw failure("closed", "Mock environment is closed");
  }
  function access(
    context: Context,
    key: null | string,
    registration = false,
  ): BrowserAccess {
    const value = Object.freeze(
      Object.defineProperties(Object.create(null), {
        [Symbol.for("nodejs.util.inspect.custom")]: {
          value: () => "[Sia test access]",
        },
        toJSON: { value: () => "[Sia test access]" },
      }),
    ) as BrowserAccess;
    const credential: MockCredential = {
      keyHex: identifier(),
      kind: registration
        ? "registration"
        : key === null
          ? "app-key"
          : "sharing-key",
    };
    grants.set(value, { context, credential, key });
    credentials.set(credential.keyHex, value);
    context.credentials.add(credential.keyHex);
    return value;
  }
  function ownedObject(context: Context, handle: TestObject): ObjectRecord {
    const value = objects.get(handle);
    if (!value || value.context !== context)
      throw failure("foreign-handle", "Object does not belong to this run");
    return value.record;
  }
  function ownedShare(context: Context, handle: TestShare): ShareRecord {
    const value = shares.get(handle);
    if (!value || value.context !== context)
      throw failure(
        "foreign-handle",
        "Sharing key does not belong to this run",
      );
    return value.record;
  }
  function attach(
    context: Context,
    share: TestShare,
    object: TestObject,
  ): void {
    const sharing = ownedShare(context, share);
    const record = ownedObject(context, object);
    if (sharing.revoked) throw failure("denied", "Sharing key is unavailable");
    if (record.deleted) throw failure("not-found", "Object is missing");
    context.network!.model.attachSharedObject(context.id, share.id, {
      dataSignature: "mock",
      encryptedDataKey: "mock",
      objectID: object.id,
    });
  }

  /** Pending fixture work must settle before its payload store is released. */
  function cleanup(context: Context): Promise<void> {
    if (context.cleanup) return context.cleanup;
    context.state = "closing";
    context.abort.abort();
    context.cleanup = (async () => {
      await Promise.allSettled([...context.pending]);
      const errors: unknown[] = [];
      for (const record of context.shares.values()) {
        if (record.revoked) continue;
        try {
          context.network!.model.revokeSharingKey(context.id, record.handle.id);
          record.revoked = true;
        } catch (error) {
          errors.push(error);
        }
      }
      for (const record of context.objects.values()) {
        try {
          if (context.network!.model.object(context.id, record.handle.id))
            await context.sdk!.deleteObject(record.handle.id);
          record.deleted = true;
        } catch (error) {
          errors.push(error);
        }
        record.metadata = new Uint8Array();
      }
      // The entire account is private to this mock run, including uploads that never reached pinning.
      context.network!.model.reset();
      context.sdk = undefined;
      context.network = undefined;
      for (const key of context.credentials) credentials.delete(key);
      context.credentials.clear();
      context.objects.clear();
      context.shares.clear();
      context.state = "closed";
      active.delete(context);
      if (errors.length)
        throw new AggregateError(errors, "Mock cleanup failed");
    })();
    return context.cleanup;
  }

  const environment: MockSia = {
    actor(label) {
      environmentOpen();
      if (!label.trim())
        throw failure("invalid-input", "Actor label must not be empty");
      const actor = Object.freeze({}) as ActorRef;
      actors.add(actor);
      return actor;
    },
    advanceTime(milliseconds) {
      environmentOpen();
      if (start === undefined)
        throw failure(
          "invalid-input",
          "Advancing time requires a manual clock",
        );
      integer(milliseconds);
      if (!Number.isFinite(new Date(start + elapsed + milliseconds).getTime()))
        throw failure("invalid-input", "Mock clock is outside the date range");
      elapsed += milliseconds;
    },
    async close() {
      closed = true;
      const results = await Promise.allSettled([...active].map(cleanup));
      const errors = results.flatMap((result) =>
        result.status === "rejected" ? [result.reason as unknown] : [],
      );
      if (errors.length)
        throw new AggregateError(errors, "Mock environment cleanup failed");
    },
    faults: controls.control,
    history: controls.history,
    reader({ access: handle, as: actor }) {
      environmentOpen();
      if (!actors.has(actor))
        throw failure("invalid-input", "Unknown mock actor");
      const grant = grants.get(handle);
      if (grant && grant.context.state !== "open")
        throw failure("closed", "Run is closed");
      const abort = new AbortController();
      const signal = grant
        ? AbortSignal.any([grant.context.signal, abort.signal])
        : abort.signal;

      function authorize(id?: string): Context {
        if (abort.signal.aborted || (grant && grant.context.state !== "open"))
          throw failure("closed", "Reader is closed");
        if (!grant) throw failure("denied", "Read access is unavailable");
        const { context, key } = grant;
        if (grant.credential.kind === "registration")
          throw failure("denied", "Read access is unavailable");
        if (key !== null) {
          try {
            if (id === undefined) context.network!.model.sharedStats(key, key);
            else context.network!.model.sharedObject(key, key, id);
          } catch {
            throw failure("denied", "Read access is unavailable");
          }
        }
        return context;
      }
      function describe(context: Context, id: string): ReadObject {
        const record = context.objects.get(id);
        if (!record || record.deleted)
          throw failure("not-found", "Object is missing");
        return {
          id,
          metadata: new Uint8Array(record.metadata),
          sizeBytes: record.handle.sizeBytes,
        };
      }
      const reader: ReadPort = {
        close() {
          abort.abort();
          return Promise.resolve();
        },
        async download(object, range = {}) {
          // Getter-backed descriptors must use the same ID for authorization and the SDK lookup.
          const id = object.id;
          const context = authorize(id);
          describe(context, id);
          const { length, offset, signal: inputSignal } = range;
          if (offset !== undefined) integer(offset);
          if (length !== undefined) integer(length);
          const callSignal = inputSignal
            ? AbortSignal.any([signal, inputSignal])
            : signal;
          const request = await controls.begin(
            actor,
            "download",
            id,
            callSignal,
          );
          try {
            authorize(id);
            const body = await context.sdk!.download(
              { id: () => id },
              {
                ...(offset === undefined ? {} : { offset }),
                ...(length === undefined ? {} : { length }),
                signal: callSignal,
              },
            );
            return controls.observe(request, body, callSignal);
          } catch (error) {
            request.status = callSignal.aborted ? "cancelled" : "failed";
            throw error;
          }
        },
        async object(id) {
          const context = authorize(id);
          describe(context, id);
          const request = await controls.begin(actor, "object", id, signal);
          try {
            await context.sdk!.object(id, { signal });
            authorize(id);
            const object = describe(context, id);
            request.status = "completed";
            return object;
          } catch (error) {
            request.status = signal.aborted ? "cancelled" : "failed";
            throw error;
          }
        },
        objects({ limit, offset }) {
          return Promise.resolve().then(async () => {
            const context = authorize();
            const request = await controls.begin(
              actor,
              "objects",
              undefined,
              signal,
            );
            try {
              integer(offset);
              integer(limit);
              if (limit === 0)
                throw failure("invalid-input", "Page limit must be positive");
              const ids =
                grant!.key === null
                  ? [...context.objects.values()]
                      .filter(
                        (record) =>
                          !record.deleted &&
                          context.network!.model.object(
                            context.id,
                            record.handle.id,
                          ),
                      )
                      .map((record) => record.handle.id)
                  : context
                      .network!.model.listRecipientObjects(
                        grant!.key,
                        grant!.key,
                      )
                      .map((record) => record.objectID);
              const rows = ids
                .slice(offset, offset + limit)
                .map((id) => describe(context, id));
              request.status = "completed";
              return {
                done: rows.length < limit,
                nextOffset: offset + rows.length,
                objects: rows,
              };
            } catch (error) {
              request.status = signal.aborted ? "cancelled" : "failed";
              throw error;
            }
          });
        },
      };
      return reader;
    },
    async run(runOptions, use) {
      environmentOpen();
      validateOptions(runOptions);
      const limits = {
        maxLogicalUploadBytes: 16 * 1024 * 1024,
        maxObjects: 8,
        maxShares: 8,
        ...runOptions.limits,
      };
      for (const value of Object.values(limits)) integer(value);
      const network = createMockNetwork({
        model: createIndexdModel({
          eventPublication: "manual",
          now,
          ...(options.quotaBytes === undefined
            ? {}
            : { quotaBytes: options.quotaBytes }),
        }),
      });
      const id = identifier();
      network.model.createAccount({ publicKey: id });
      const abort = new AbortController();
      const context: Context = {
        abort,
        credentials: new Set(),
        id,
        limits,
        network,
        objectAttempts: 0,
        objects: new Map(),
        pending: new Set(),
        reservedBytes: 0,
        sdk: network.createSdk({ accountId: id }),
        shareAttempts: 0,
        shares: new Map(),
        signal: runOptions.signal
          ? AbortSignal.any([abort.signal, runOptions.signal])
          : abort.signal,
        state: "open",
        uploadedBytes: 0,
      };
      active.add(context);
      const ownerAccess = access(context, null);
      const registrationAccess = access(context, null, true);
      const authentication = createMockAuthentication(
        runOptions.app,
        () => ({ ...grants.get(ownerAccess)!.credential }),
        now,
        context.signal,
      );
      context.authentication = authentication;
      const run: MockRun = {
        auth: {
          approve: authentication.approve,
          deny: authentication.deny,
          fixturePhrase,
          kind: "approval",
          registrationAccess,
        },
        backend: "mock",
        id,
        objects: {
          async delete(handle) {
            return track(context, async () => {
              const record = ownedObject(context, handle);
              if (record.deleted) return;
              const deletion = (record.deletion ??= context
                .sdk!.deleteObject(handle.id, {
                  signal: context.signal,
                })
                .then(() => {
                  record.deleted = true;
                  record.metadata = new Uint8Array();
                }));
              try {
                await deletion;
              } finally {
                if (record.deletion === deletion) delete record.deletion;
              }
            });
          },
          async inspect(handle) {
            return track(context, () => {
              ownedObject(context, handle);
              return context.network!.model.object(id, handle.id)
                ? ("present" as const)
                : ("missing" as const);
            });
          },
          async upload(input) {
            return track(context, async () => {
              // Copy the descriptor before reading; a caller must not change the reserved byte count mid-upload.
              const file = {
                name: input.file.name,
                open: input.file.open.bind(input.file),
                sha256: input.file.sha256,
                sizeBytes: input.file.sizeBytes,
              };
              integer(file.sizeBytes);
              if (
                !input.name ||
                !/^[0-9a-f]{64}$/.test(file.sha256) ||
                !(input.metadata instanceof Uint8Array)
              )
                throw failure("invalid-input", "Invalid upload descriptor");
              if (
                context.objectAttempts >= limits.maxObjects ||
                file.sizeBytes >
                  limits.maxLogicalUploadBytes - context.reservedBytes
              )
                throw failure("limit", "Run upload allowance exceeded");
              context.objectAttempts++;
              context.reservedBytes += file.sizeBytes;
              const metadata = new Uint8Array(input.metadata);
              const bytes = await readFixture(file, context.signal);
              open(context);
              const handle = Object.freeze({
                id: identifier(),
                sha256: file.sha256,
                sizeBytes: bytes.byteLength,
              }) as TestObject;
              const record = { deleted: false, handle, metadata };
              context.objects.set(handle.id, record);
              objects.set(handle, { context, record });
              const uploaded = await context.sdk!.upload(bytes, {
                id: handle.id,
                signal: context.signal,
              });
              context.uploadedBytes += bytes.byteLength;
              await context.sdk!.pinObject(uploaded, {
                signal: context.signal,
              });
              return handle;
            });
          },
        },
        ownerAccess,
        shares: {
          async attach(share, object) {
            return track(context, () => attach(context, share, object));
          },
          async create(input) {
            return track(context, () => {
              for (const object of input.objects) {
                if (ownedObject(context, object).deleted)
                  throw failure("not-found", "Object is missing");
              }
              if (
                input.expiresAt &&
                (!Number.isFinite(input.expiresAt.getTime()) ||
                  input.expiresAt <= now())
              )
                throw failure(
                  "invalid-input",
                  "Sharing expiry must be in the future",
                );
              if (context.shareAttempts >= limits.maxShares)
                throw failure("limit", "Run sharing allowance exceeded");
              context.shareAttempts++;
              const key = identifier();
              const handle = Object.freeze({
                access: access(context, key),
                id: key,
              }) as TestShare;
              context.network!.model.createSharingKey(id, {
                nonce: identifier(),
                publicKey: key,
                ...(input.expiresAt
                  ? { expiresAt: input.expiresAt.toISOString() }
                  : {}),
              });
              const record = { handle, revoked: false };
              context.shares.set(key, record);
              shares.set(handle, { context, record });
              for (const object of input.objects)
                attach(context, handle, object);
              return handle;
            });
          },
          async detach(share, object) {
            return track(context, () => {
              ownedShare(context, share);
              ownedObject(context, object);
              context.network!.model.detachSharedObject(
                id,
                share.id,
                object.id,
              );
            });
          },
          async revoke(share) {
            return track(context, () => {
              const record = ownedShare(context, share);
              if (!record.revoked)
                context.network!.model.revokeSharingKey(id, share.id);
              record.revoked = true;
            });
          },
        },
      };
      let failed = false;
      let cause: unknown;
      let value!: Awaited<ReturnType<typeof use>>;
      try {
        context.signal.throwIfAborted();
        value = await use(run);
        context.signal.throwIfAborted();
      } catch (error) {
        failed = true;
        cause = error;
      }
      let cleanupFailed = false;
      let cleanupError: unknown;
      try {
        await cleanup(context);
      } catch (error) {
        cleanupFailed = true;
        cleanupError = error;
      }
      if (cleanupFailed) {
        if (failed)
          throw new AggregateError(
            [cause, cleanupError],
            "Run and cleanup failed",
            { cause: cleanupError },
          );
        throw cleanupError;
      }
      if (failed) throw cause;
      return {
        summary: {
          backend: "mock",
          cleanup: "clean",
          id,
          logicalUploadedBytes: context.uploadedBytes,
        },
        value,
      };
    },
  };
  registerRuntime(environment, {
    authenticate(credential) {
      environmentOpen();
      const handle = credentials.get(credential.keyHex);
      const grant = handle && grants.get(handle);
      if (
        !handle ||
        !grant ||
        grant.context.state !== "open" ||
        grant.credential.kind !== credential.kind
      )
        throw failure("denied", "Read access is unavailable");
      return handle;
    },
    authentication(credential, operation, input, baseUrl) {
      const handle = credentials.get(credential.keyHex);
      const grant = handle && grants.get(handle);
      if (
        !grant ||
        grant.context.state !== "open" ||
        grant.credential.kind !== credential.kind
      )
        throw failure("denied", "Authentication access is unavailable");
      if (operation === "auth-connected" && credential.kind === "app-key")
        return input.keyHex === credential.keyHex ? { ...credential } : null;
      if (credential.kind !== "registration")
        throw failure("denied", "Authentication access is unavailable");
      return grant.context.authentication!.execute(operation, input, baseUrl);
    },
    credential(handle) {
      environmentOpen();
      const grant = grants.get(handle);
      if (!grant || grant.context.state !== "open")
        throw failure("denied", "Read access is unavailable");
      return { ...grant.credential };
    },
  });
  return environment;
}

function failure(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}
function identifier(): string {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
function integer(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0)
    throw failure("invalid-input", "Expected a nonnegative safe integer");
}
function open(context: Context): void {
  if (context.state !== "open") throw failure("closed", "Run is closed");
  context.signal.throwIfAborted();
}
/** Reservations happen synchronously before the first await, so parallel calls share the same allowance. */
function track<T>(context: Context, action: () => Promise<T> | T): Promise<T> {
  open(context);
  const promise = (async () => action())();
  context.pending.add(promise);
  void promise.then(
    () => context.pending.delete(promise),
    () => context.pending.delete(promise),
  );
  return promise;
}
function validateOptions(options: MockRunOptions): void {
  if (
    !/^[0-9a-f]{64}$/.test(options.app.id) ||
    !options.app.name ||
    !options.app.description
  )
    throw failure("invalid-input", "Invalid application definition");
  const url = new URL(options.app.serviceUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw failure("invalid-input", "Invalid application service URL");
}
