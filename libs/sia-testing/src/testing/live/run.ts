/** A live run owns its fixture mutations and journals their outcomes before returning handles. */
import { randomUUID } from "node:crypto";
import { boundedByteView } from "../byte-view.js";
import { readFixture } from "../files.js";
import type {
  BrowserAccess,
  LiveRun,
  LiveRunSummary,
  ManagedObjects,
  ManagedShares,
  TestObject,
  TestShare,
} from "../types.js";
import { createJournal, type Journal } from "./journal.js";
import { acquireJournalLease } from "./lease.js";
import { cleanupKnownResources } from "./cleanup.js";
import { profileDocument } from "./profile.js";
import {
  closeLiveSession,
  type LiveSession,
  openLiveSession,
  sessionInfo,
  sessionProcess,
} from "./session.js";
import type { LiveProfile } from "./types.js";
import {
  maximumMetadataBytes,
  maximumSealedObjectBytes,
  mutationRecordBytes,
  uploadRecordBytes,
} from "./resource-limits.js";
export interface LiveRunOptions {
  readonly agentModule?: URL;
  readonly beforeCleanup?: () => Promise<void>;
  readonly journalFile: string;
  readonly profile: LiveProfile;
  readonly signal?: AbortSignal;
}
interface OwnedObject {
  deleted: boolean;
  readonly handle: TestObject;
  pinned: boolean;
  readonly sealed: string;
}
interface OwnedShare {
  readonly handle: TestShare;
  revoked: boolean;
  readonly seedHex: string;
}
export async function withLiveRun<T>(
  options: LiveRunOptions,
  use: (run: LiveRun) => Promise<T>,
): Promise<{ readonly summary: LiveRunSummary; readonly value: T }> {
  const document = profileDocument(options.profile);
  const id = randomUUID();
  const lease = await acquireJournalLease(options.journalFile);
  const execution = new AbortController();
  const signal = options.signal
    ? AbortSignal.any([options.signal, execution.signal])
    : execution.signal;
  const timer = setTimeout(
    () => execution.abort(failure("deadline")),
    document.limits.deadlineMs,
  );
  const errors: unknown[] = [];
  const unknownCreations = new Set<string>();
  const objects = new Map<TestObject, OwnedObject>();
  const shares = new Map<TestShare, OwnedShare>();
  const pending = new Set<Promise<unknown>>();
  let journal: Journal | undefined;
  let session: LiveSession | undefined;
  let credential: string | undefined;
  let run: LiveRun | undefined;
  let value!: T;
  let opened = true;
  let reservedBytes = 0;
  let objectAttempts = 0;
  let shareAttempts = 0;
  let logicalUploadedBytes = 0;
  let observedShardBytes = 0;
  let uncertain = false;
  let queue = Promise.resolve();
  const agentOptions = options.agentModule
    ? { agentModule: options.agentModule }
    : {};
  function ensureOpen() {
    if (!opened) throw failure("closed");
    signal.throwIfAborted();
  }
  function ownObject(handle: TestObject): OwnedObject {
    const record = objects.get(handle);
    if (!record) throw failure("foreign-handle");
    return record;
  }
  function ownShare(handle: TestShare): OwnedShare {
    const record = shares.get(handle);
    if (!record) throw failure("foreign-handle");
    return record;
  }
  function track<R>(work: () => Promise<R>): Promise<R> {
    let task: Promise<R>;
    try {
      ensureOpen();
      task = work();
    } catch (error) {
      return Promise.reject(
        error instanceof Error ? error : failure("invalid-input"),
      );
    }
    pending.add(task);
    void task.finally(() => pending.delete(task)).catch(() => undefined);
    return task;
  }
  function request(
    operation: string,
    input: unknown,
    current = session!,
    currentSignal = signal,
  ): Promise<unknown> {
    const result = queue.then(() =>
      sessionProcess(current).request(operation, input, {
        signal: currentSignal,
      }),
    );
    queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
  async function mutate<R>(
    operation: string,
    input: unknown,
    work: () => Promise<R>,
    observed?: (result: R) => void,
    capacity = mutationRecordBytes,
  ): Promise<R> {
    const reservation = journal!.reserve(capacity);
    try {
      const operationId = randomUUID();
      await reservation.append({
        id: operationId,
        input,
        kind: "intent",
        operation,
      });
      if (operation === "upload" || operation === "create-share")
        unknownCreations.add(operationId);
      const result = await work();
      observed?.(result);
      await reservation.append({ id: operationId, kind: "ack", result });
      unknownCreations.delete(operationId);
      return result;
    } finally {
      reservation.release();
    }
  }
  try {
    journal = await createJournal(options.journalFile, {
      apiBaseUrl: document.apiBaseUrl,
      appId: document.app.id,
      kind: "header",
      runId: id,
      version: 1,
    });
    session = await openLiveSession(options.profile, {
      ...agentOptions,
      signal,
    });
    credential = sessionInfo(session).appKeyHex;
    await journal.append({ appKeyHex: credential, kind: "auth" });
    const ownerAccess = opaque("access") as BrowserAccess;
    run = Object.freeze({
      backend: "live" as const,
      id,
      objects: {
        delete(handle) {
          return track(async () => {
            const record = ownObject(handle);
            if (record.deleted) return;
            await mutate(
              "delete",
              { objectId: record.handle.id },
              () => request("delete", { objectId: record.handle.id }),
              () => {
                record.deleted = true;
              },
            );
          });
        },
        inspect(handle) {
          return track(async () => {
            const record = ownObject(handle);
            const result = await request("inspect", {
              objectId: record.handle.id,
            });
            if (result !== "present" && result !== "missing")
              throw failure("agent-protocol");
            return result;
          });
        },
        upload(input) {
          return track(async () => {
            const source = input.file;
            let name = input.name;
            const suppliedMetadata = input.metadata;
            const file = {
              name: source.name,
              open: source.open.bind(source),
              sha256: source.sha256,
              sizeBytes: source.sizeBytes,
            };
            // oxlint-disable-next-line typescript/prefer-nullish-coalescing -- Null must reject rather than select the file label.
            if (name === undefined) name = file.name;
            if (
              typeof name !== "string" ||
              !name ||
              !Number.isSafeInteger(file.sizeBytes) ||
              file.sizeBytes < 0 ||
              !/^[a-f0-9]{64}$/.test(file.sha256)
            )
              throw failure("invalid-input");
            // Caller byteLength overrides must not bypass the client metadata bound.
            let metadata: Uint8Array;
            try {
              metadata = new Uint8Array(
                boundedByteView(suppliedMetadata, maximumMetadataBytes),
              );
            } catch {
              throw failure("invalid-input");
            }
            if (
              objectAttempts >= document.limits.maxObjects ||
              file.sizeBytes >
                document.limits.maxLogicalUploadBytes - reservedBytes
            )
              throw failure("limit");
            objectAttempts++;
            reservedBytes += file.sizeBytes;
            const bytes = await readFixture(file, signal);
            ensureOpen();
            let record!: OwnedObject;
            await mutate(
              "upload",
              { sha256: file.sha256, sizeBytes: file.sizeBytes },
              async () => {
                const result = await request("upload", { bytes, metadata });
                if (
                  !result ||
                  typeof result !== "object" ||
                  !("objectId" in result) ||
                  typeof result.objectId !== "string" ||
                  !/^[a-f0-9]{64}$/.test(result.objectId) ||
                  !("sealed" in result) ||
                  typeof result.sealed !== "string" ||
                  Buffer.byteLength(result.sealed) > maximumSealedObjectBytes ||
                  !("sizeBytes" in result) ||
                  result.sizeBytes !== file.sizeBytes ||
                  !("observedShardBytes" in result) ||
                  !Number.isSafeInteger(result.observedShardBytes) ||
                  (result.observedShardBytes as number) < observedShardBytes
                )
                  throw failure("agent-protocol");
                observedShardBytes = result.observedShardBytes as number;
                return {
                  objectId: result.objectId,
                  observedShardBytes,
                  sealed: result.sealed,
                  sizeBytes: result.sizeBytes,
                };
              },
              (result) => {
                const handle = Object.freeze({
                  id: result.objectId,
                  sha256: file.sha256,
                  sizeBytes: file.sizeBytes,
                }) as TestObject;
                record = {
                  deleted: false,
                  handle,
                  pinned: false,
                  sealed: result.sealed,
                };
                objects.set(handle, record);
              },
              uploadRecordBytes,
            );
            await mutate(
              "pin",
              { objectId: record.handle.id },
              () =>
                request("pin", {
                  objectId: record.handle.id,
                  sealed: record.sealed,
                }),
              () => {
                record.pinned = true;
              },
            );
            logicalUploadedBytes += file.sizeBytes;
            return record.handle;
          });
        },
      } satisfies ManagedObjects,
      ownerAccess,
      shares: {
        attach(share, object) {
          return track(() => attach(ownShare(share), ownObject(object)));
        },
        create(input) {
          return track(async () => {
            const attached = [...input.objects].map((object) =>
              ownObject(object),
            );
            if (attached.some((object) => object.deleted))
              throw failure("not-found");
            const expiresAt = input.expiresAt?.getTime();
            if (
              expiresAt !== undefined &&
              (!Number.isFinite(expiresAt) || expiresAt <= Date.now())
            )
              throw failure("invalid-input");
            if (shareAttempts >= document.limits.maxShares)
              throw failure("limit");
            shareAttempts++;
            let record!: OwnedShare;
            await mutate(
              "create-share",
              {},
              async () => {
                const result = await request("create-share", {
                  description: `sia-testing:${id}:${randomUUID()}`,
                  ...(expiresAt === undefined
                    ? {}
                    : { expiresAt: new Date(expiresAt).toISOString() }),
                });
                if (
                  !result ||
                  typeof result !== "object" ||
                  !("seedHex" in result) ||
                  typeof result.seedHex !== "string" ||
                  !/^[a-f0-9]{64}$/.test(result.seedHex) ||
                  !("shareId" in result) ||
                  typeof result.shareId !== "string" ||
                  !/^(?:ed25519:)?[a-f0-9]{64}$/.test(result.shareId)
                )
                  throw failure("agent-protocol");
                return { seedHex: result.seedHex, shareId: result.shareId };
              },
              (result) => {
                const access = opaque("access") as BrowserAccess;
                const handle = Object.freeze({
                  access,
                  id: result.shareId,
                }) as TestShare;
                record = { handle, revoked: false, seedHex: result.seedHex };
                shares.set(handle, record);
              },
            );
            for (const object of attached) await attach(record, object);
            return record.handle;
          });
        },
        detach(share, object) {
          return track(async () => {
            const sharing = ownShare(share);
            const stored = ownObject(object);
            if (sharing.revoked) throw failure("denied");
            await mutate(
              "detach",
              { objectId: stored.handle.id, shareId: sharing.handle.id },
              () =>
                request("detach", {
                  objectId: stored.handle.id,
                  seedHex: sharing.seedHex,
                  shareId: sharing.handle.id,
                }),
            );
          });
        },
        revoke(share) {
          return track(async () => {
            const record = ownShare(share);
            if (record.revoked) return;
            await mutate(
              "revoke",
              { shareId: record.handle.id },
              () =>
                request("revoke", {
                  seedHex: record.seedHex,
                  shareId: record.handle.id,
                }),
              () => {
                record.revoked = true;
              },
            );
          });
        },
      } satisfies ManagedShares,
    });
    value = await abortable(use(run), signal);
    await abortable(Promise.all([...pending]), signal);
  } catch (error) {
    errors.push(error);
  }
  opened = false;
  execution.abort();
  clearTimeout(timer);
  try {
    if (options.beforeCleanup)
      await abortable(
        Promise.resolve().then(options.beforeCleanup),
        AbortSignal.timeout(document.limits.cleanupDeadlineMs),
      );
  } catch (error) {
    errors.push(error);
    uncertain = true;
  }
  try {
    if (session) await closeLiveSession(session);
  } catch (error) {
    errors.push(error);
    uncertain = true;
  }
  if (credential && !uncertain && (objects.size || shares.size)) {
    try {
      await cleanupKnownResources({
        ...agentOptions,
        appKeyHex: credential,
        journal: journal!,
        objects: [...objects.values()].map((record) => ({
          deleted: record.deleted,
          objectId: record.handle.id,
          pinned: record.pinned,
          sealed: record.sealed,
        })),
        profile: options.profile,
        shares: [...shares.values()].map((record) => ({
          revoked: record.revoked,
          seedHex: record.seedHex,
          shareId: record.handle.id,
        })),
      });
    } catch (error) {
      errors.push(error);
      uncertain = true;
    }
  }
  uncertain ||= unknownCreations.size > 0;
  const summary: LiveRunSummary = Object.freeze({
    backend: "live",
    cleanup: uncertain ? "uncertain" : "clean",
    id,
    journalFile: options.journalFile,
    logicalUploadedBytes,
    observedShardBytes,
  });
  try {
    await journal?.append({ cleanup: summary.cleanup, kind: "complete" });
  } catch (error) {
    errors.push(error);
    uncertain = true;
  }
  try {
    await journal?.close();
  } catch (error) {
    errors.push(error);
    uncertain = true;
  }
  try {
    await lease.release();
  } catch (error) {
    errors.push(error);
    uncertain = true;
  }
  const finalSummary =
    uncertain && summary.cleanup === "clean"
      ? Object.freeze({ ...summary, cleanup: "uncertain" as const })
      : summary;
  if (uncertain && errors.length === 0)
    errors.push(failure("cleanup-uncertain"));
  if (errors.length)
    throw Object.assign(
      new AggregateError(errors, "Sia managed live run failed"),
      { summary: finalSummary },
    );
  return { summary: finalSummary, value };
  async function attach(share: OwnedShare, object: OwnedObject): Promise<void> {
    if (share.revoked) throw failure("denied");
    if (object.deleted) throw failure("not-found");
    await mutate(
      "attach",
      { objectId: object.handle.id, shareId: share.handle.id },
      () =>
        request("attach", {
          objectId: object.handle.id,
          seedHex: share.seedHex,
          shareId: share.handle.id,
        }),
    );
  }
}
async function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted();
  let abort!: () => void;
  const stopped = new Promise<never>((_resolve, reject) => {
    abort = () =>
      reject(
        signal.reason instanceof Error ? signal.reason : failure("cancelled"),
      );
    signal.addEventListener("abort", abort, { once: true });
  });
  try {
    return await Promise.race([work, stopped]);
  } finally {
    signal.removeEventListener("abort", abort);
  }
}
function failure(code: string) {
  return Object.assign(new Error("Sia managed live run operation failed"), {
    code,
    phase: "resources",
  });
}
function opaque(kind: string): object {
  return Object.freeze(
    Object.defineProperties(Object.create(null) as object, {
      [Symbol.for("nodejs.util.inspect.custom")]: {
        value: () => `[Sia ${kind}]`,
      },
      toJSON: { value: () => `[Sia ${kind}]` },
    }),
  );
}
