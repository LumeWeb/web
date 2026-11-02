/** Recovery uses acknowledged credentials and resource records, preserving creation outcomes it cannot identify. */
import { cleanupKnownResources } from "./cleanup.js";
import {
  type Journal,
  type JournalEvent,
  type JournalSnapshot,
  resumeJournal,
} from "./journal.js";
import { acquireJournalLease } from "./lease.js";
import { profileDocument } from "./profile.js";
import type { LiveRunOptions } from "./run.js";
import type { LiveRunSummary } from "../types.js";
interface Recovered {
  readonly appKeyHex: string | undefined;
  readonly header: Extract<JournalEvent, { kind: "header" }>;
  readonly objects: RecoveredObject[];
  readonly observedShardBytes: number;
  readonly shares: RecoveredShare[];
  readonly unknownCreations: number;
}
interface RecoveredObject {
  deleted: boolean;
  objectId: string;
  pinned: boolean;
  sealed: string;
  sizeBytes: number;
}
interface RecoveredShare {
  revoked: boolean;
  seedHex: string;
  shareId: string;
}
export async function recoverLiveRun(
  options: Omit<LiveRunOptions, "beforeCleanup" | "signal">,
): Promise<LiveRunSummary> {
  const document = profileDocument(options.profile);
  const lease = await acquireJournalLease(options.journalFile);
  const errors: unknown[] = [];
  let journal: Journal | undefined;
  let recovered: Recovered | undefined;
  let uncertain = false;
  try {
    const resumed = await resumeJournal(options.journalFile);
    journal = resumed.journal;
    recovered = replay(resumed.snapshot);
    if (
      recovered.header.apiBaseUrl !== document.apiBaseUrl ||
      recovered.header.appId !== document.app.id
    )
      throw failure("journal-mismatch");
    if (
      !recovered.appKeyHex &&
      (recovered.objects.length || recovered.shares.length)
    )
      throw failure("journal-invalid");
    if (recovered.appKeyHex)
      await cleanupKnownResources({
        ...(options.agentModule ? { agentModule: options.agentModule } : {}),
        appKeyHex: recovered.appKeyHex,
        journal,
        objects: recovered.objects,
        profile: options.profile,
        shares: recovered.shares,
      });
    uncertain = recovered.unknownCreations > 0;
  } catch (error) {
    errors.push(error);
    uncertain = true;
  }
  const summary: LiveRunSummary = Object.freeze({
    backend: "live",
    cleanup: uncertain ? "uncertain" : "clean",
    id: recovered?.header.runId ?? "unknown",
    journalFile: options.journalFile,
    logicalUploadedBytes:
      recovered?.objects
        .filter((object) => object.pinned)
        .reduce((sum, object) => sum + object.sizeBytes, 0) ?? 0,
    observedShardBytes: recovered?.observedShardBytes ?? 0,
  });
  try {
    if (recovered)
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
      new AggregateError(errors, "Sia live resource recovery failed"),
      { summary: finalSummary },
    );
  return finalSummary;
}
function failure(code: string) {
  return Object.assign(new Error("Sia live resource recovery failed"), {
    code,
    phase: "recovery",
  });
}
function identifier(value: unknown, share = false): string {
  if (
    typeof value !== "string" ||
    !(share ? /^(?:ed25519:)?[a-f0-9]{64}$/ : /^[a-f0-9]{64}$/).test(value)
  )
    throw failure("journal-invalid");
  return value;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw failure("journal-invalid");
  return value as Record<string, unknown>;
}
function replay(snapshot: JournalSnapshot): Recovered {
  const header = snapshot.records[0];
  if (header?.kind !== "header") throw failure("journal-invalid");
  const intents = new Map<string, Extract<JournalEvent, { kind: "intent" }>>();
  const acknowledged = new Set<string>();
  const failedWithoutEffect = new Set<string>();
  const objects = new Map<string, RecoveredObject>();
  const shares = new Map<string, RecoveredShare>();
  let appKeyHex: string | undefined;
  let observedShardBytes = 0;
  for (const event of snapshot.records.slice(1)) {
    if (event.kind === "auth") {
      if (appKeyHex) throw failure("journal-invalid");
      appKeyHex = event.appKeyHex;
    } else if (event.kind === "intent") {
      if (
        intents.has(event.id) ||
        ![
          "attach",
          "create-share",
          "delete",
          "detach",
          "pin",
          "revoke",
          "upload",
        ].includes(event.operation)
      )
        throw failure("journal-invalid");
      intents.set(event.id, event);
    } else if (event.kind === "failure") {
      if (!intents.has(event.id)) throw failure("journal-invalid");
      if (!event.uncertain) failedWithoutEffect.add(event.id);
    } else if (event.kind === "ack") {
      const intent = intents.get(event.id);
      if (
        !intent ||
        acknowledged.has(event.id) ||
        failedWithoutEffect.has(event.id)
      )
        throw failure("journal-invalid");
      acknowledged.add(event.id);
      if (intent.operation === "upload") {
        const result = record(event.result);
        const objectId = identifier(result.objectId);
        if (
          objects.has(objectId) ||
          typeof result.sealed !== "string" ||
          !result.sealed ||
          typeof result.sizeBytes !== "number" ||
          !Number.isSafeInteger(result.sizeBytes) ||
          result.sizeBytes < 0 ||
          typeof result.observedShardBytes !== "number" ||
          !Number.isSafeInteger(result.observedShardBytes) ||
          result.observedShardBytes < observedShardBytes
        )
          throw failure("journal-invalid");
        observedShardBytes = result.observedShardBytes;
        objects.set(objectId, {
          deleted: false,
          objectId,
          pinned: false,
          sealed: result.sealed,
          sizeBytes: result.sizeBytes,
        });
      } else if (intent.operation === "create-share") {
        const result = record(event.result);
        const shareId = identifier(result.shareId, true);
        if (
          shares.has(shareId) ||
          typeof result.seedHex !== "string" ||
          !/^[a-f0-9]{64}$/.test(result.seedHex)
        )
          throw failure("journal-invalid");
        shares.set(shareId, {
          revoked: false,
          seedHex: result.seedHex,
          shareId,
        });
      } else {
        const input = record(intent.input);
        if (
          intent.operation === "pin" ||
          intent.operation === "delete" ||
          intent.operation === "attach" ||
          intent.operation === "detach"
        ) {
          const object = objects.get(identifier(input.objectId));
          if (!object) throw failure("journal-invalid");
          if (intent.operation === "pin") object.pinned = true;
          if (intent.operation === "delete") object.deleted = true;
        }
        if (
          intent.operation === "revoke" ||
          intent.operation === "attach" ||
          intent.operation === "detach"
        ) {
          const share = shares.get(identifier(input.shareId, true));
          if (!share) throw failure("journal-invalid");
          if (intent.operation === "revoke") share.revoked = true;
        }
      }
    }
  }
  const unknownCreations = [...intents.values()].filter(
    (intent) =>
      (intent.operation === "upload" || intent.operation === "create-share") &&
      !acknowledged.has(intent.id) &&
      !failedWithoutEffect.has(intent.id),
  ).length;
  return {
    appKeyHex,
    header,
    objects: [...objects.values()],
    observedShardBytes,
    shares: [...shares.values()],
    unknownCreations,
  };
}
