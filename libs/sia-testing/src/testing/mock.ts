import type { MockPayloadBackend, MockPayloadFactory } from "./mock-backend.js";
import type { FinishedPayload } from "../sdk/payload-store.js";
import { collectPayload } from "./streaming-source.js";
/** Managed mock runs bind readers to owner or recipient access and clean only their own fixtures. */
import { createPackedSdk } from "./packed.js";
import { createUploadSdk } from "./sdk-upload.js";
import { digest } from "./files.js";
import { boundedByteView } from "./byte-view.js";
import { snapshotApplicationMetadata } from "./application-metadata.js";
import { createIndexdModel } from "../model/index.js";
import {
  createMockNetwork,
  type MockNetwork,
  type PayloadNetwork,
} from "../sdk/index.js";
import { withAbort } from "../sdk/abort.js";
import { invalidInput } from "./diagnostics.js";
import { createMutationControls } from "./mutations.js";
import type { ApplicationObject, ApplicationPort } from "./types.js";
import { readFixture } from "./files.js";
import {
  createRequestControls,
  type RequestReceipt,
  type RequestSelector,
} from "./controls.js";
import {
  createOwnerSharePort,
  ownerPage,
  validateOwnerPage,
} from "./owner-shares.js";
import { createMockAuthentication, fixturePhrase } from "./authentication.js";
import { type MockCredential, registerRuntime } from "./runtime.js";
import type {
  ActorRef,
  ApplicationShareRef,
  ApplicationShareTarget,
  BrowserAccess,
  MockOptions,
  MockRun,
  MockRunOptions,
  MockShareGrant,
  MockSia,
  OwnerShareDetails,
  OwnerShareRef,
  ReadObject,
  ReadPort,
  RunLimits,
  ShareInspection,
  ShareOperation,
  TestObject,
  TestShare,
} from "./types.js";
export { bytesFixture } from "./files.js";

interface Context {
  abort: AbortController;
  authentication?: ReturnType<typeof createMockAuthentication>;
  cleanup?: Promise<void>;
  cleanupErrors: unknown[];
  credentials: Set<string>;
  id: string;
  limits: RunLimits;
  network: MockNetwork | PayloadNetwork | undefined;
  objectAttempts: number;
  objects: Map<string, ObjectRecord>;
  payload?: MockPayloadBackend;
  pending: Set<Promise<unknown>>;
  reservedBytes: number;
  sdk: ReturnType<MockNetwork["createSdk"]> | undefined;
  shareAttempts: number;
  shares: Map<string, ShareRecord>;
  signal: AbortSignal;
  state: "closed" | "closing" | "open";
  transportCleanup: Set<() => Promise<void>>;
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
interface ShareGrantRecord {
  actor: ActorRef;
  context: Context;
  expiresAt?: string;
  label: string;
  operations: readonly ShareOperation[];
  revoked: boolean;
  share: ShareRecord;
}
interface ShareRecord {
  handle: TestShare;
  ownerRef: OwnerShareRef;
  revoked: boolean;
}

/** Store ownership is per run so closing one account cannot reset another active run. */
export function createMockSia(options: MockOptions = {}): MockSia {
  return createMockSiaWithBackend(options);
}

export function createMockSiaWithBackend(
  options: MockOptions = {},
  payloadFactory?: MockPayloadFactory,
): MockSia {
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
  const actors = new WeakMap<ActorRef, string>();
  const actorLabel = (actor: ActorRef) => actors.get(actor)!;
  const records: RequestReceipt[] = [];
  const controls = createRequestControls(records, actorLabel);
  const credentials = new Map<string, BrowserAccess>();
  const grants = new WeakMap<BrowserAccess, Grant>();
  const objects = new WeakMap<
    TestObject,
    { context: Context; record: ObjectRecord }
  >();
  const applicationObjects = new WeakMap<
    ApplicationObject,
    { context: Context; record: ObjectRecord }
  >();
  const shareGrants = new WeakMap<MockShareGrant, ShareGrantRecord>();
  const mutations = createMutationControls(
    (selector) => {
      if (
        (selector.stage !== "beforeCommit" && selector.stage !== "collect") ||
        (selector.stage === "collect" &&
          (!selector.actor ||
            !["packed-add", "upload"].includes(selector.operation) ||
            !Number.isSafeInteger(selector.afterBytes) ||
            selector.afterBytes < 0)) ||
        Object.keys(selector).some(
          (key) =>
            !(
              selector.stage === "collect"
                ? ["actor", "operation", "stage", "afterBytes"]
                : selector.operation.startsWith("share-")
                  ? ["actor", "operation", "stage", "share"]
                  : ["delete", "pin"].includes(selector.operation)
                    ? ["actor", "operation", "stage", "object"]
                    : ["actor", "operation", "stage"]
            ).includes(key),
        ) ||
        ![
          "delete",
          "metadata",
          "packed-add",
          "packed-finalize",
          "pin",
          "share-add",
          "share-end",
          "share-remove",
          "upload",
        ].includes(selector.operation)
      )
        throw failure("invalid-input", "Invalid mutation selector");
      if (selector.actor && !actors.has(selector.actor))
        throw failure("foreign-handle", "Unknown actor");
      validateShareSelector(selector);
      if (selector.object && !applicationObjects.has(selector.object))
        throw failure("foreign-handle", "Unknown application object");
    },
    records,
    (selector) => {
      if (
        ![
          "delete",
          "pin",
          "share-add",
          "share-end",
          "share-remove",
          "upload",
        ].includes(selector.operation) ||
        !selector.actor ||
        Object.keys(selector).some(
          (key) =>
            !(
              selector.operation.startsWith("share-")
                ? ["actor", "share", "operation"]
                : selector.operation === "upload"
                  ? ["actor", "operation"]
                  : ["actor", "object", "operation"]
            ).includes(key),
        )
      )
        throw failure("invalid-input", "Invalid mutation reply selector");
      if (!actors.has(selector.actor))
        throw failure("foreign-handle", "Unknown actor");
      if (selector.share !== undefined && !shareGrants.has(selector.share))
        throw failure("foreign-handle", "Unknown share grant");
      validateShareSelector(selector);
      if (
        selector.object !== undefined &&
        !applicationObjects.has(selector.object)
      )
        throw failure("foreign-handle", "Unknown application object");
    },
    actorLabel,
  );
  const shares = new WeakMap<
    TestShare,
    { context: Context; record: ShareRecord }
  >();

  // Retained references must not keep a closed run and its payload state alive.
  const ownerReferences = new WeakMap<
    OwnerShareRef,
    { contextId: string; shareId: string }
  >();

  /** Read projections must not let callers mutate the fixture's stored metadata. */
  function describe(context: Context, id: string): ReadObject {
    const record = context.objects.get(id);
    if (
      !record ||
      record.deleted ||
      !context.network!.model.object(context.id, id)
    )
      throw failure("not-found", "Object is missing");
    return {
      id,
      metadata: new Uint8Array(record.metadata),
      sizeBytes: record.handle.sizeBytes,
    };
  }
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
      const transport = await Promise.allSettled(
        [...context.transportCleanup].map((close) => close()),
      );
      for (const result of transport) {
        if (
          result.status === "rejected" &&
          !context.cleanupErrors.includes(result.reason)
        )
          context.cleanupErrors.push(result.reason as unknown);
      }
      context.transportCleanup.clear();
      await Promise.allSettled([...context.pending]);
      const errors: unknown[] = [...context.cleanupErrors];
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
          else if (!record.deleted)
            // Reset invalidates slab identities but does not release the network's cached bytes.
            await context.network!.discardUpload(context.id, record.handle.id);
          record.deleted = true;
        } catch (error) {
          errors.push(error);
        }
        record.metadata = new Uint8Array();
      }
      if (context.payload) {
        try {
          await context.payload.owner.close();
        } catch (error) {
          errors.push(error);
        }
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

  function validateShareSelector(selector: {
    actor?: ActorRef;
    object?: unknown;
    operation: string;
    share?: MockShareGrant;
  }) {
    if (selector.share) {
      const value = shareGrants.get(selector.share);
      if (!value) throw failure("foreign-handle", "Unknown share grant");
      open(value.context);
      if (selector.actor && selector.actor !== value.actor)
        throw failure("foreign-handle", "Grant actor does not match");
      if (
        !["share-add", "share-end", "share-inspect", "share-remove"].includes(
          selector.operation,
        )
      )
        throw failure("invalid-input", "Invalid share selector");
    }
    if (selector.operation.startsWith("share-") && selector.object)
      throw failure("invalid-input", "Invalid share selector");
  }
  function grantAvailable(value: ShareGrantRecord): boolean {
    return (
      !value.revoked &&
      value.context.state === "open" &&
      (!value.expiresAt || now().getTime() < Date.parse(value.expiresAt))
    );
  }
  function installedGrants(
    handle: BrowserAccess,
    actor: ActorRef,
    input: readonly MockShareGrant[],
  ) {
    const owner = grants.get(handle);
    if (!owner || owner.key !== null || owner.credential.kind !== "app-key")
      throw failure("denied", "Owner access is unavailable");
    open(owner.context);
    const labels = new Set<string>();
    return input.map((handle) => {
      const value = shareGrants.get(handle);
      if (!value || value.context !== owner.context || value.actor !== actor)
        throw failure("foreign-handle", "Unknown share grant");
      if (!grantAvailable(value))
        throw failure("denied", "Share grant is unavailable");
      if (labels.has(value.label))
        throw failure("invalid-input", "Duplicate grant label");
      labels.add(value.label);
      return { handle, value };
    });
  }
  function validateReadSelector(selector: RequestSelector) {
    validateShareSelector(selector);
    if (selector.actor && !actors.has(selector.actor))
      throw failure("foreign-handle", "Unknown actor");
    if (selector.object && !objects.has(selector.object))
      throw failure("foreign-handle", "Unknown fixture object");
    if (
      [
        "delete",
        "events",
        "inspect",
        "pin",
        "share-add",
        "share-end",
        "share-remove",
        "upload",
      ].includes(selector.operation)
    )
      throw failure("invalid-input", "Read control required");
  }
  function createApplication(
    handle: BrowserAccess,
    actor: ActorRef,
    bindings: ReturnType<typeof installedGrants>,
  ): ApplicationPort {
    environmentOpen();
    if (!actors.has(actor)) throw failure("foreign-handle", "Unknown actor");
    const shareRefs = new WeakMap<
      ApplicationShareRef,
      (typeof bindings)[number]
    >();
    const targets: ApplicationShareTarget[] = bindings.map((binding) => {
      const ref = Object.freeze(Object.create(null)) as ApplicationShareRef;
      shareRefs.set(ref, binding);
      return {
        label: binding.value.label,
        operations: [...binding.value.operations],
        ref,
        ...(binding.value.expiresAt
          ? { expiresAt: binding.value.expiresAt }
          : {}),
      };
    });
    const grant = grants.get(handle);
    const abort = new AbortController();
    const pending = new Set<Promise<unknown>>();
    let closing: Promise<void> | undefined;
    const cleanupErrors: unknown[] = [];
    function authorize() {
      if (abort.signal.aborted)
        throw failure("closed", "Application port is closed");
      if (!grant || grant.key !== null || grant.credential.kind !== "app-key")
        throw failure("denied", "Owner access is unavailable");
      open(grant.context);
      return grant.context;
    }
    function owned(context: Context, object: ApplicationObject) {
      const value = applicationObjects.get(object);
      if (!value || value.context !== context)
        throw failure("foreign-handle", "Unknown application object");
      return value.record;
    }
    function call<T>(
      signal: AbortSignal | undefined,
      action: (context: Context, signal: AbortSignal) => Promise<T> | T,
      prepare?: () => void,
    ): Promise<T> {
      const callSignal = AbortSignal.any([
        abort.signal,
        ...(grant ? [grant.context.signal] : []),
        ...(signal ? [signal] : []),
      ]);
      let preparationError: unknown;
      let preparationFailed = false;
      const promise = Promise.resolve().then(() => {
        if (preparationFailed) throw preparationError;
        callSignal.throwIfAborted();
        const context = authorize();
        return track(context, () => action(context, callSignal));
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
    async function mutate<T>(
      _context: Context,
      signal: AbortSignal,
      operation: "delete" | "pin" | "upload",
      objectId: string | undefined,
      action: (receipt: RequestReceipt) => Promise<T>,
    ): Promise<T> {
      const receipt = await mutations.begin(actor, operation, objectId, signal);
      try {
        signal.throwIfAborted();
        authorize();
        const value = await action(receipt);
        mutations.afterCommit(receipt);
        receipt.status = "completed";
        return value;
      } catch (error) {
        receipt.status = signal.aborted ? "cancelled" : "failed";
        throw error;
      }
    }
    function shareAuthority(
      context: Context,
      ref: ApplicationShareRef,
      operation?: ShareOperation,
    ) {
      const binding = shareRefs.get(ref);
      if (!binding)
        throw failure("foreign-handle", "Unknown application share");
      const value = binding.value;
      if (value.context !== context || !grantAvailable(value))
        throw failure("denied", "Share grant is unavailable");
      if (operation && !value.operations.includes(operation))
        throw failure("denied", "Share operation is unavailable");
      return binding;
    }
    function lifecycle(
      context: Context,
      value: ShareGrantRecord,
    ): ShareInspection["state"] {
      if (value.share.revoked) return "ended";
      const expiry = context.network!.model.getSharingKey(
        context.id,
        value.share.handle.id,
      ).expiresAt;
      return expiry && now().getTime() >= Date.parse(expiry)
        ? "expired"
        : "active";
    }
    function objectId(id: null | string) {
      if (id !== null && (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)))
        throw failure("invalid-input", "Invalid object ID");
    }
    function shareMutation(
      ref: ApplicationShareRef,
      operation: ShareOperation,
      signal: AbortSignal | undefined,
      object?: ApplicationObject,
      selectedId?: string,
    ) {
      return call(signal, async (context, signal) => {
        const binding = shareAuthority(context, ref, operation);
        if (operation === "remove") {
          if (selectedId === null)
            throw failure("invalid-input", "Invalid object ID");
          objectId(selectedId!);
        }
        const record =
          operation === "add" ? owned(context, object!) : undefined;
        const check = () => {
          signal.throwIfAborted();
          authorize();
          shareAuthority(context, ref, operation);
          const state = lifecycle(context, binding.value);
          if (state === "expired" || (state === "ended" && operation !== "end"))
            throw failure("denied", "Sharing key is unavailable");
          if (
            record &&
            (record.deleted ||
              !context.network!.model.object(context.id, record.handle.id))
          )
            throw failure("denied", "Add requires a pinned object");
          return state;
        };
        check();
        const id = record?.handle.id ?? selectedId;
        const receipt = await mutations.begin(
          actor,
          `share-${operation}`,
          id,
          signal,
          { grant: binding.handle, id: binding.value.share.handle.id },
        );
        try {
          const state = check();
          const model = context.network!.model;
          const shareId = binding.value.share.handle.id;
          // No await may separate current authority, model effects, fixture state and receipt attribution.
          if (operation === "end") {
            if (state !== "ended") {
              model.revokeSharingKey(context.id, shareId);
              binding.value.share.revoked = true;
              receipt.committed = true;
            }
          } else {
            const contains = model.hasOwnedSharedObject(
              context.id,
              shareId,
              id!,
            );
            if (operation === "add" && !contains) {
              model.attachSharedObject(context.id, shareId, {
                dataSignature: "mock",
                encryptedDataKey: "mock",
                objectID: id!,
              });
              receipt.committed = true;
            } else if (operation === "remove" && contains) {
              model.detachSharedObject(context.id, shareId, id!);
              receipt.committed = true;
            }
          }
          mutations.afterCommit(receipt);
          receipt.status = "completed";
        } catch (error) {
          receipt.status = signal.aborted ? "cancelled" : "failed";
          throw error;
        }
      });
    }
    return {
      close() {
        abort.abort();
        return (closing ??= Promise.allSettled([...pending]).then(() => {
          if (cleanupErrors.length)
            throw new AggregateError(
              cleanupErrors,
              "Application source cleanup failed",
            );
        }));
      },
      delete(object, options = {}) {
        return call(options.signal, async (context, signal) => {
          const record = owned(context, object);
          await mutate(
            context,
            signal,
            "delete",
            record.handle.id,
            async (receipt) => {
              // Sharing the SDK call's signal or receipt would attribute one caller's cancellation to another.
              while (record.deletion) {
                await withAbort(
                  record.deletion.catch(() => undefined),
                  signal,
                );
              }
              signal.throwIfAborted();
              authorize();
              if (record.deleted) return;
              const deletion = (record.deletion = (async () => {
                const complete = () => {
                  receipt.committed = true;
                  record.deleted = true;
                  record.metadata = new Uint8Array();
                };
                if (context.network!.model.object(context.id, record.handle.id))
                  await context.sdk!.deleteObject(record.handle.id, {
                    prepareCommit: () => {
                      authorize();
                      return complete;
                    },
                    signal,
                  });
                else {
                  const retirement = context.network!.discardUpload(
                    context.id,
                    record.handle.id,
                  );
                  complete();
                  await retirement;
                }
              })());
              try {
                await deletion;
              } finally {
                if (record.deletion === deletion) delete record.deletion;
              }
            },
          );
        });
      },
      events(input) {
        return call(input.signal, (context) => {
          const { cursor, limit } = input;
          if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000)
            throw invalidInput(
              "limit",
              "limit must be an integer from 1 to 1000",
            );
          if (
            cursor !== null &&
            (!cursor ||
              typeof cursor.after !== "string" ||
              !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(cursor.after) ||
              !Number.isFinite(Date.parse(cursor.after)) ||
              new Date(cursor.after).toISOString() !== cursor.after ||
              typeof cursor.id !== "string" ||
              !/^[a-f0-9]{64}$/.test(cursor.id))
          )
            throw invalidInput("cursor", "Invalid event cursor");
          const events = context
            .network!.model.objectEvents(context.id)
            .map((row) => ({
              deleted: row.deleted,
              id: row.key,
              updatedAt: row.updatedAt,
            }))
            .sort(
              (a, b) =>
                a.updatedAt.localeCompare(b.updatedAt) ||
                a.id.localeCompare(b.id),
            )
            .filter(
              (row) =>
                !cursor ||
                row.updatedAt > cursor.after ||
                (row.updatedAt === cursor.after && row.id > cursor.id),
            )
            .slice(0, limit);
          const last = events.at(-1);
          return {
            done: events.length < limit,
            events,
            nextCursor: last ? { after: last.updatedAt, id: last.id } : cursor,
          };
        });
      },
      inspect(object, options = {}) {
        return call(options.signal, (context) => {
          const record = owned(context, object);
          return record.deleted
            ? "missing"
            : context.network!.model.object(context.id, record.handle.id)
              ? "pinned"
              : "uploaded";
        });
      },
      pin(object, options = {}) {
        let metadata: Uint8Array | undefined;
        return call(
          options.signal,
          async (context, signal) => {
            const record = owned(context, object);
            if (record.deleted) throw failure("not-found", "Object is missing");
            await mutate(
              context,
              signal,
              "pin",
              record.handle.id,
              async (receipt) => {
                if (record.deleted)
                  throw failure("not-found", "Object is missing");
                await context.sdk!.pinObject(
                  { id: () => record.handle.id },
                  {
                    prepareCommit: () => {
                      if (record.deleted)
                        throw failure("not-found", "Object is missing");
                      return () => {
                        if (metadata !== undefined) record.metadata = metadata;
                        receipt.committed = true;
                      };
                    },
                    signal,
                  },
                );
              },
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
          return shareMutation(ref, "add", options.signal, object);
        },
        end(ref, options = {}) {
          return shareMutation(ref, "end", options.signal);
        },
        inspect(ref, id, options = {}) {
          return call(options.signal, async (context, signal) => {
            const binding = shareAuthority(context, ref);
            objectId(id);
            const receipt = await controls.begin(
              actor,
              "share-inspect",
              id ?? undefined,
              signal,
              { grant: binding.handle, id: binding.value.share.handle.id },
            );
            try {
              signal.throwIfAborted();
              authorize();
              shareAuthority(context, ref);
              const state = lifecycle(context, binding.value);
              const contains =
                state === "ended" || id === null
                  ? null
                  : context.network!.model.hasOwnedSharedObject(
                      context.id,
                      binding.value.share.handle.id,
                      id,
                    );
              receipt.status = "completed";
              return { contains, state };
            } catch (error) {
              receipt.status = signal.aborted ? "cancelled" : "failed";
              throw error;
            }
          });
        },
        remove(ref, id, options = {}) {
          return shareMutation(ref, "remove", options.signal, undefined, id);
        },
        targets(options = {}) {
          return call(options.signal, async (_context, signal) => {
            const receipt = await controls.begin(
              actor,
              "share-targets",
              undefined,
              signal,
            );
            try {
              signal.throwIfAborted();
              authorize();
              const result = targets
                .filter((_, index) => grantAvailable(bindings[index]!.value))
                .map((target) => ({
                  ...target,
                  operations: [...target.operations],
                }));
              receipt.status = "completed";
              return result;
            } catch (error) {
              receipt.status = signal.aborted ? "cancelled" : "failed";
              throw error;
            }
          });
        },
      },
      upload(input) {
        return call(input.signal, async (context, signal) => {
          const file = {
            name: input.file.name,
            open: input.file.open.bind(input.file),
            sha256: input.file.sha256,
            sizeBytes: input.file.sizeBytes,
          };
          let name = input.name;
          // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- Null must reject rather than select the file label.
          if (name === undefined) name = file.name;
          const metadata = snapshotApplicationMetadata(input.metadata);
          integer(file.sizeBytes);
          if (
            typeof name !== "string" ||
            !name ||
            name.length > 1024 ||
            new TextEncoder().encode(name).length > 1024 ||
            file.sizeBytes >
              (context.payload
                ? payloadFactory!.limits.maxObjectBytes
                : 16 * 1024 * 1024) ||
            !/^[0-9a-f]{64}$/.test(file.sha256)
          )
            throw failure("invalid-input", "Invalid application upload");
          if (
            context.objectAttempts >= context.limits.maxObjects ||
            file.sizeBytes >
              context.limits.maxLogicalUploadBytes - context.reservedBytes
          )
            throw failure("limit", "Run upload allowance exceeded");
          const reservation = context.payload?.owner.reserveUpload(
            file.sizeBytes,
          );
          context.objectAttempts++;
          context.reservedBytes += file.sizeBytes;
          let committed = false;
          let collected: FinishedPayload | Uint8Array | undefined;
          let result!: ApplicationObject;
          const failures: unknown[] = [];
          try {
            const bytes = await mutations.collect<FinishedPayload | Uint8Array>(
              actor,
              "upload",
              signal,
              (checkpoint) =>
                context.payload
                  ? reservation!.admitSource(file.sizeBytes).then((spool) =>
                      collectPayload(
                        file.open,
                        spool,
                        signal,
                        checkpoint,
                        (error) => {
                          cleanupErrors.push(error);
                          context.cleanupErrors.push(error);
                        },
                        file,
                      ),
                    )
                  : readFixture(file, signal, checkpoint, (error) => {
                      cleanupErrors.push(error);
                      context.cleanupErrors.push(error);
                    }),
            );
            collected = bytes;
            result = await mutate(
              context,
              signal,
              "upload",
              undefined,
              async (receipt) => {
                const id = identifier();
                let object!: ApplicationObject;
                const uploadOptions = {
                  id,
                  prepareCommit: () => {
                    signal.throwIfAborted();
                    authorize();
                    const internal = Object.freeze({
                      id,
                      sha256: file.sha256,
                      sizeBytes: bytes.length,
                    }) as TestObject;
                    const record = {
                      deleted: false,
                      handle: internal,
                      metadata,
                    };
                    object = Object.freeze({ id }) as ApplicationObject;
                    const binding = { context, record };
                    return () => {
                      context.objects.set(id, record);
                      applicationObjects.set(object, binding);
                      context.uploadedBytes += bytes.length;
                      committed = true;
                      receipt.committed = true;
                      receipt.objectId = id;
                    };
                  },
                  signal,
                };
                if (context.payload)
                  await context.payload.network
                    .createSdk({ accountId: context.id })
                    .uploadPayload(bytes as FinishedPayload, uploadOptions);
                else
                  await context.sdk!.upload(bytes as Uint8Array, uploadOptions);
                return object;
              },
            );
          } catch (error) {
            failures.push(error);
          }
          if (!committed) {
            context.reservedBytes -= file.sizeBytes;
            try {
              if (collected && context.payload)
                await context.payload.owner.discardUncommitted(
                  collected as FinishedPayload,
                );
            } catch (error) {
              failures.push(error);
              cleanupErrors.push(error);
              context.cleanupErrors.push(error);
            }
          }
          try {
            reservation?.release();
          } catch (error) {
            failures.push(error);
            cleanupErrors.push(error);
            context.cleanupErrors.push(error);
          }
          if (failures.length === 1) throw failures[0];
          if (failures.length)
            throw new AggregateError(
              failures,
              "Application upload and payload cleanup failed",
            );
          return result;
        });
      },
    };
  }
  const environment: MockSia = {
    actor(label) {
      environmentOpen();
      if (!label.trim())
        throw failure("invalid-input", "Actor label must not be empty");
      const actor = Object.freeze({}) as ActorRef;
      actors.set(actor, label);
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
    application({ access: handle, as: actor, shareGrants: installed = [] }) {
      return createApplication(
        handle,
        actor,
        installed.length ? installedGrants(handle, actor, installed) : [],
      );
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
    faults: {
      fail(selector, options) {
        selector = { ...selector };
        validateReadSelector(selector);
        controls.control.fail(selector, options);
      },
      hold(selector) {
        selector = { ...selector };
        validateReadSelector(selector);
        return controls.control.hold(selector);
      },
      setLink(actor, input) {
        if (!actors.has(actor))
          throw failure("foreign-handle", "Unknown actor");
        controls.control.setLink(actor, input);
      },
    },
    history: controls.history,
    mutationFaults: mutations.control,
    ownerShares({ access: handle, as: actor }) {
      environmentOpen();
      if (!actors.has(actor))
        throw failure("invalid-input", "Unknown mock actor");
      const grant = grants.get(handle);
      function authorize(): Context {
        if (grant && grant.context.state !== "open")
          throw failure("closed", "Run is closed");
        if (!grant || grant.credential.kind !== "app-key" || grant.key !== null)
          throw failure("denied", "Owner access is unavailable");
        return grant.context;
      }
      function project(ref: OwnerShareRef) {
        const context = authorize();
        const identity = ownerReferences.get(ref);
        if (!identity || identity.contextId !== context.id)
          throw failure(
            "foreign-handle",
            "Share reference does not belong to this run",
          );
        const record = context.shares.get(identity.shareId);
        if (!record || record.revoked)
          throw failure("not-found", "Sharing key is missing");
        const key = context.network!.model.getSharingKey(
          context.id,
          identity.shareId,
        );
        const ids = context
          .network!.model.listOwnedSharedObjects(context.id, identity.shareId)
          .map((attachment) => attachment.objectID)
          .sort((a, b) => a.localeCompare(b));
        return { context, ids, key };
      }
      // Statistics use owned sizes so catalogue reads never allocate attachment metadata copies.
      function details(ref: OwnerShareRef): OwnerShareDetails {
        const { context, ids, key } = project(ref);
        return {
          description: key.description,
          ref,
          ...(key.expiresAt === undefined ? {} : { expiresAt: key.expiresAt }),
          statistics: {
            logicalBytes: ids.reduce(
              (bytes, id) => bytes + context.objects.get(id)!.handle.sizeBytes,
              0,
            ),
            objectCount: ids.length,
          },
        };
      }
      return createOwnerSharePort({
        actor,
        authorize,
        controls,
        read: {
          detail(ref) {
            return Promise.resolve(details(ref));
          },
          list(page) {
            validateOwnerPage(page);
            const context = authorize();
            const keys = context
              .network!.model.listSharingKeys(context.id)
              .sort((a, b) => a.publicKey.localeCompare(b.publicKey));
            const selected = ownerPage(keys, page);
            return Promise.resolve({
              ...selected,
              items: selected.items.map((key) =>
                details(context.shares.get(key.publicKey)!.ownerRef),
              ),
            });
          },
          objects(ref, page) {
            validateOwnerPage(page);
            const { context, ids } = project(ref);
            const selected = ownerPage(ids, page);
            return Promise.resolve({
              ...selected,
              items: selected.items.map((id) => describe(context, id)),
            });
          },
        },
        signal: grant?.context.signal ?? new AbortController().signal,
        track: (action) => track(authorize(), action),
      });
    },
    packedSdk(input) {
      environmentOpen();
      const {
        access: handle,
        as: actor,
        maxBytes,
        maxObjects,
        platform,
      } = input;
      if (!actors.has(actor)) throw failure("foreign-handle", "Unknown actor");
      const grant = grants.get(handle);
      if (!grant || grant.key !== null || grant.credential.kind !== "app-key")
        throw failure("denied", "Owner access is unavailable");
      const context = grant.context;
      const authorize = () => {
        environmentOpen();
        open(context);
      };
      authorize();
      if (
        !["browser", "node"].includes(platform) ||
        !Number.isSafeInteger(maxBytes) ||
        maxBytes < 1 ||
        maxBytes >
          (context.payload
            ? payloadFactory!.limits.maxLogicalUploadBytes
            : 16 * 1024 * 1024) ||
        !Number.isSafeInteger(maxObjects) ||
        maxObjects < 1
      )
        throw failure("invalid-input", "Invalid packed allowance");
      if (context.payload && platform !== "node")
        throw failure(
          "unsupported",
          "Temporary-file packed storage requires Node platform",
        );
      return createPackedSdk(
        { access: handle, as: actor, maxBytes, maxObjects, platform },
        {
          afterCommit: (receipt) => mutations.afterCommit(receipt),
          authorize,
          before: (operation, signal, id) =>
            mutations.begin(actor, operation, id, signal),
          cleanupError(error) {
            if (!context.cleanupErrors.includes(error))
              context.cleanupErrors.push(error);
          },
          collect: (signal, work) =>
            mutations.collect(actor, "packed-add", signal, work),
          metadata(id, bytes) {
            authorize();
            const record = context.objects.get(id)!;
            if (record.deleted) throw failure("not-found", "Object is missing");
            record.metadata = bytes;
          },
          async pin(id, signal) {
            await context.sdk!.pinObject({ id: () => id }, { signal });
          },
          register: (close) => {
            context.transportCleanup.add(close);
            return () => {
              context.transportCleanup.delete(close);
            };
          },
          reserve() {
            authorize();
            if (
              context.objectAttempts + maxObjects > context.limits.maxObjects ||
              maxBytes >
                context.limits.maxLogicalUploadBytes - context.reservedBytes
            )
              throw failure("limit", "Run upload allowance exceeded");
            const physical = context.payload?.owner.reserveUpload(maxBytes);
            const sequence = context.objectAttempts;
            context.objectAttempts += maxObjects;
            context.reservedBytes += maxBytes;
            let committed = 0;
            let ordinal = 0;
            let released = false;
            return {
              release() {
                if (released) return;
                released = true;
                physical?.release();
                context.reservedBytes -= maxBytes - committed;
              },
              ...(physical
                ? {
                    admit: (remaining: number) =>
                      physical.admitSource(
                        Math.min(
                          remaining,
                          payloadFactory!.limits.maxObjectBytes,
                        ),
                      ),
                    discard: (token: FinishedPayload) =>
                      context.payload!.owner.discardUncommitted(token),
                  }
                : {}),
              async stage(bytes, signal, onCommit) {
                const id = await digest(
                  new TextEncoder().encode(
                    `${context.id}:packed:${sequence + ordinal++}`,
                  ),
                );
                const sha256 = context.payload
                  ? (bytes as FinishedPayload).sha256
                  : await digest(bytes as Uint8Array);
                const uploadOptions = {
                  id,
                  prepareCommit() {
                    signal.throwIfAborted();
                    authorize();
                    const handle = Object.freeze({
                      id,
                      sha256,
                      sizeBytes: bytes.length,
                    }) as TestObject;
                    const record = {
                      deleted: false,
                      handle,
                      metadata: new Uint8Array(),
                    };
                    return () => {
                      context.objects.set(id, record);
                      objects.set(handle, { context, record });
                      context.uploadedBytes += bytes.length;
                      committed += bytes.length;
                      onCommit?.(id);
                    };
                  },
                  signal,
                };
                if (context.payload)
                  await context.payload.network
                    .createSdk({ accountId: context.id })
                    .uploadPayload(bytes as FinishedPayload, uploadOptions);
                else
                  await context.sdk!.upload(bytes as Uint8Array, uploadOptions);
                return id;
              },
            };
          },
          signal: context.signal,
          track: (work) => track(context, work),
        },
      );
    },
    async publish({ access: handle }) {
      const grant = grants.get(handle);
      if (!grant || grant.key !== null || grant.credential.kind !== "app-key")
        throw failure("denied", "Owner access is unavailable");
      return track(grant.context, () => {
        grant.context.network!.model.publishObjectEvents();
      });
    },
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
      const streams = new Set<ReadableStream<Uint8Array>>();
      const pendingDownloads = new Set<Promise<unknown>>();
      const closeErrors: unknown[] = [];
      let closing: Promise<void> | undefined;
      const reader: ReadPort = {
        close() {
          if (closing) return closing;
          abort.abort();
          if (!grant?.context.payload) return Promise.resolve();
          closing = (async () => {
            await Promise.allSettled(pendingDownloads);
            await Promise.allSettled(
              Array.from(streams, (stream) =>
                grant.context.payload!.network.closeDownload(stream),
              ),
            );
            streams.clear();
            if (closeErrors.length)
              throw new AggregateError(
                closeErrors,
                "Reader descriptor cleanup failed",
              );
          })();
          void closing.catch(() => undefined);
          return closing;
        },
        download(object, range = {}) {
          const operation = (async () => {
            // Getter-backed descriptors must use the same ID for authorization and the SDK lookup.
            const id = object.id;
            const context = authorize(id);
            describe(context, id);
            const { length, offset, signal: inputSignal } = range;
            if (offset !== undefined) integer(offset, "offset");
            if (length !== undefined) integer(length, "length");
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
              if (context.payload) {
                streams.add(body);
                void context.payload.network.downloadDone(body).then(
                  () => streams.delete(body),
                  (error) => {
                    streams.delete(body);
                    closeErrors.push(error);
                  },
                );
              }
              return controls.observe(request, body, callSignal);
            } catch (error) {
              request.status = callSignal.aborted ? "cancelled" : "failed";
              throw error;
            }
          })();
          pendingDownloads.add(operation);
          void operation.then(
            () => pendingDownloads.delete(operation),
            () => pendingDownloads.delete(operation),
          );
          return operation;
        },
        async object(id, options = {}) {
          const context = authorize(id);
          describe(context, id);
          const callSignal = options.signal
            ? AbortSignal.any([signal, options.signal])
            : signal;
          const request = await controls.begin(actor, "object", id, callSignal);
          try {
            await context.sdk!.object(id, { signal: callSignal });
            authorize(id);
            const object = describe(context, id);
            request.status = "completed";
            return object;
          } catch (error) {
            request.status = callSignal.aborted ? "cancelled" : "failed";
            throw error;
          }
        },
        objects({ limit, offset, signal: externalSignal }) {
          return Promise.resolve().then(async () => {
            const context = authorize();
            const request = await controls.begin(
              actor,
              "objects",
              undefined,
              externalSignal
                ? AbortSignal.any([signal, externalSignal])
                : signal,
            );
            try {
              authorize();
              integer(offset, "offset");
              integer(limit, "limit");
              if (limit === 0)
                throw invalidInput("limit", "limit must be positive");
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
      if (grant?.context.payload)
        grant.context.transportCleanup.add(() => reader.close());
      return reader;
    },
    async run(runOptions, use) {
      environmentOpen();
      validateOptions(runOptions);
      const limits = {
        maxLogicalUploadBytes:
          payloadFactory?.limits.maxLogicalUploadBytes ?? 16 * 1024 * 1024,
        maxObjects: 8,
        maxShares: 8,
        ...runOptions.limits,
      };
      for (const value of Object.values(limits)) integer(value);
      if (
        payloadFactory &&
        limits.maxLogicalUploadBytes !==
          payloadFactory.limits.maxLogicalUploadBytes
      )
        throw failure(
          "invalid-input",
          "Run and payload logical budgets must match",
        );
      const model = createIndexdModel({
        eventPublication: "manual",
        now,
        ...(options.quotaBytes === undefined
          ? {}
          : { quotaBytes: options.quotaBytes }),
      });
      const payload = payloadFactory
        ? await payloadFactory.create(model)
        : undefined;
      const network = payload?.network ?? createMockNetwork({ model });
      const id = identifier();
      network.model.createAccount({ publicKey: id });
      const abort = new AbortController();
      const context: Context = {
        abort,
        cleanupErrors: [],
        credentials: new Set(),
        id,
        limits,
        network,
        objectAttempts: 0,
        objects: new Map(),
        ...(payload ? { payload } : {}),
        pending: new Set(),
        reservedBytes: 0,
        sdk: network.createSdk({ accountId: id }),
        shareAttempts: 0,
        shares: new Map(),
        signal: runOptions.signal
          ? AbortSignal.any([abort.signal, runOptions.signal])
          : abort.signal,
        state: "open",
        transportCleanup: new Set(),
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
        mock: environment,
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
              let name = input.name;
              // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- Null must reject rather than select the file label.
              if (name === undefined) name = file.name;
              integer(file.sizeBytes);
              if (
                typeof name !== "string" ||
                !name ||
                !/^[0-9a-f]{64}$/.test(file.sha256)
              )
                throw failure("invalid-input", "Invalid upload descriptor");
              const suppliedMetadata = input.metadata;
              let metadataView: Uint8Array;
              try {
                metadataView = boundedByteView(suppliedMetadata, Infinity);
              } catch {
                throw failure("invalid-input", "Invalid upload descriptor");
              }
              if (
                context.objectAttempts >= limits.maxObjects ||
                file.sizeBytes >
                  limits.maxLogicalUploadBytes - context.reservedBytes
              )
                throw failure("limit", "Run upload allowance exceeded");
              if (
                context.payload &&
                file.sizeBytes > payloadFactory!.limits.maxObjectBytes
              )
                throw failure("limit", "Payload object allowance exceeded");
              const reservation = context.payload?.owner.reserveUpload(
                file.sizeBytes,
              );
              context.objectAttempts++;
              context.reservedBytes += file.sizeBytes;
              const metadata = new Uint8Array(metadataView);
              if (context.payload) {
                const errors: unknown[] = [];
                let token: FinishedPayload | undefined;
                let committed = false;
                let result: TestObject | undefined;
                let spool:
                  | Awaited<
                      ReturnType<NonNullable<typeof reservation>["admitSource"]>
                    >
                  | undefined;
                try {
                  spool = await reservation!.admitSource(file.sizeBytes);
                  const bytes = await readFixture(
                    file,
                    context.signal,
                    undefined,
                    (error) => {
                      context.cleanupErrors.push(error);
                    },
                    "bounded-payload",
                  );
                  for (let offset = 0; offset < bytes.length; offset += 65536)
                    await spool.append(
                      new Uint8Array(
                        bytes.subarray(
                          offset,
                          Math.min(offset + 65536, bytes.length),
                        ),
                      ),
                    );
                  token = await spool.finish();
                  open(context);
                  const handle = Object.freeze({
                    id: identifier(),
                    sha256: token.sha256,
                    sizeBytes: token.length,
                  }) as TestObject;
                  const record = { deleted: false, handle, metadata };
                  const sdk = context.payload.network.createSdk({
                    accountId: context.id,
                  });
                  const uploaded = await sdk.uploadPayload(token, {
                    id: handle.id,
                    prepareCommit() {
                      open(context);
                      return () => {
                        context.objects.set(handle.id, record);
                        objects.set(handle, { context, record });
                        context.uploadedBytes += handle.sizeBytes;
                        committed = true;
                      };
                    },
                    signal: context.signal,
                  });
                  await context.sdk!.pinObject(uploaded, {
                    signal: context.signal,
                  });
                  result = handle;
                } catch (error) {
                  errors.push(error);
                }
                if (!committed) {
                  try {
                    if (token) await context.payload.owner.retire(token);
                    else await spool?.discard();
                  } catch (error) {
                    errors.push(error);
                  }
                }
                try {
                  reservation!.release();
                } catch (error) {
                  errors.push(error);
                }
                if (errors.length === 1) throw errors[0];
                if (errors.length)
                  throw new AggregateError(
                    errors,
                    "Managed upload and payload cleanup failed",
                  );
                return result!;
              }
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
              const description = input.description ?? "";
              if (typeof description !== "string")
                throw failure("invalid-input", "Invalid share description");
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
                description,
                nonce: identifier(),
                publicKey: key,
                ...(input.expiresAt
                  ? { expiresAt: input.expiresAt.toISOString() }
                  : {}),
              });
              const ownerRef = Object.freeze(
                Object.create(null),
              ) as OwnerShareRef;
              const record = { handle, ownerRef, revoked: false };
              ownerReferences.set(ownerRef, { contextId: id, shareId: key });
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
          async grant(share, input) {
            return track(context, () => {
              const record = ownedShare(context, share);
              if (!actors.has(input.as))
                throw failure("foreign-handle", "Unknown actor");
              const expiry = context.network!.model.getSharingKey(
                id,
                share.id,
              ).expiresAt;
              if (
                record.revoked ||
                (expiry && now().getTime() >= Date.parse(expiry))
              )
                throw failure("denied", "Sharing key is unavailable");
              const operations = [...input.operations];
              const deadline = input.expiresAt?.getTime();
              if (
                typeof input.label !== "string" ||
                !input.label.trim() ||
                !operations.length ||
                new Set(operations).size !== operations.length ||
                operations.some(
                  (op) => !["add", "end", "remove"].includes(op),
                ) ||
                (deadline !== undefined &&
                  (!Number.isFinite(deadline) || deadline <= now().getTime()))
              )
                throw failure("invalid-input", "Invalid share grant");
              const handle = Object.freeze(
                Object.create(null),
              ) as MockShareGrant;
              shareGrants.set(handle, {
                actor: input.as,
                context,
                label: input.label,
                operations,
                revoked: false,
                share: record,
                ...(deadline === undefined
                  ? {}
                  : { expiresAt: new Date(deadline).toISOString() }),
              });
              return handle;
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
          async revokeGrant(handle) {
            return track(context, () => {
              const value = shareGrants.get(handle);
              if (!value || value.context !== context)
                throw failure("foreign-handle", "Unknown share grant");
              value.revoked = true;
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
    uploadSdk({ access, as, maxBytes }) {
      environmentOpen();
      if (
        !Number.isSafeInteger(maxBytes) ||
        maxBytes < 1 ||
        maxBytes > 16 * 1024 * 1024
      )
        throw failure("invalid-input", "Invalid upload byte allowance");
      const grant = grants.get(access);
      if (!grant || grant.key !== null || grant.credential.kind !== "app-key")
        throw failure("denied", "Owner access is unavailable");
      const writer = environment.application({ access, as });
      const key = `ed25519:${grant.context.id}`;
      return createUploadSdk(
        writer,
        maxBytes,
        key,
        (close) => {
          grant.context.transportCleanup.add(close);
          return () => {
            grant.context.transportCleanup.delete(close);
          };
        },
        (error) => {
          if (!grant.context.cleanupErrors.includes(error))
            grant.context.cleanupErrors.push(error);
        },
      );
    },
  };
  registerRuntime(environment, {
    assertTransport() {
      if (payloadFactory)
        throw failure(
          "unsupported",
          "Temporary-file payload storage supports direct Node calls only",
        );
    },
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
    installShareGrants(handle, actor, installed) {
      // Lazy sessions retain installed identities; withdrawal changes roster visibility, not installation validity.
      const bindings = installed.length
        ? installedGrants(handle, actor, installed)
        : [];
      return () => createApplication(handle, actor, bindings);
    },
    onRunCleanup(handle, close) {
      const value = grants.get(handle);
      if (!value) throw failure("denied", "Owner access is unavailable");
      open(value.context);
      value.context.transportCleanup.add(close);
      return () => {
        value.context.transportCleanup.delete(close);
      };
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
function integer(value: number, field?: string): void {
  if (!Number.isSafeInteger(value) || value < 0)
    throw field
      ? invalidInput(field, `${field} must be a nonnegative safe integer`)
      : failure("invalid-input", "Expected a nonnegative safe integer");
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
