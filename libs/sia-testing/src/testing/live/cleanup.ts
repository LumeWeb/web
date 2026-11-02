/** Cleanup reconnects with acknowledged authority and touches only recorded object IDs and sharing seeds. */
import { randomUUID } from "node:crypto";
import type { Journal } from "./journal.js";
import { appKeyProfile, profileDocument } from "./profile.js";
import {
  closeLiveSession,
  type LiveSession,
  openLiveSession,
  sessionProcess,
} from "./session.js";
import type { LiveProfile } from "./types.js";
export interface CleanupObject {
  readonly deleted: boolean;
  readonly objectId: string;
  readonly pinned: boolean;
  readonly sealed: string;
}
export interface CleanupShare {
  readonly revoked: boolean;
  readonly seedHex: string;
  readonly shareId: string;
}
export async function cleanupKnownResources(options: {
  readonly agentModule?: URL;
  readonly appKeyHex: string;
  readonly journal: Journal;
  readonly objects: readonly CleanupObject[];
  readonly profile: LiveProfile;
  readonly shares: readonly CleanupShare[];
}): Promise<void> {
  const objects = options.objects.filter((object) => !object.deleted);
  const shares = options.shares.filter((share) => !share.revoked);
  if (!objects.length && !shares.length) return;
  const profile = appKeyProfile(options.profile, options.appKeyHex, true);
  const signal = AbortSignal.timeout(
    profileDocument(profile).limits.deadlineMs,
  );
  const errors: unknown[] = [];
  let session: LiveSession | undefined;
  try {
    for (const share of [...shares].reverse()) {
      try {
        await mutation(
          "revoke",
          { shareId: share.shareId },
          { seedHex: share.seedHex, shareId: share.shareId },
        );
      } catch (error) {
        errors.push(error);
        await discardSession();
      }
    }
    for (const object of [...objects].reverse()) {
      try {
        if (!object.pinned)
          await mutation(
            "pin",
            { objectId: object.objectId },
            { objectId: object.objectId, sealed: object.sealed },
          );
        await mutation(
          "delete",
          { objectId: object.objectId },
          { objectId: object.objectId },
        );
      } catch (error) {
        errors.push(error);
        await discardSession();
      }
    }
  } catch (error) {
    errors.push(error);
  }
  try {
    if (session) await closeLiveSession(session);
  } catch (error) {
    errors.push(error);
  }
  if (errors.length)
    throw new AggregateError(errors, "Owned resource cleanup failed");
  async function discardSession(): Promise<void> {
    // RPC errors terminate the agent, so later resources need a fresh app-key connection.
    try {
      if (session) await closeLiveSession(session);
    } catch (error) {
      errors.push(error);
    }
    session = undefined;
  }
  async function mutation(
    operation: string,
    input: unknown,
    payload: unknown,
  ): Promise<void> {
    session ??= await openLiveSession(profile, {
      ...(options.agentModule ? { agentModule: options.agentModule } : {}),
      signal,
    });
    const id = randomUUID();
    await options.journal.append(
      { id, input, kind: "intent", operation },
      { cleanup: true },
    );
    await sessionProcess(session).request(operation, payload, { signal });
    await options.journal.append(
      { id, kind: "ack", result: null },
      { cleanup: true },
    );
  }
}
