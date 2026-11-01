/** Keeps a recipient and its metadata alive across sharing authorization changes and token refresh. */
import {
  type PinnedObject,
  type Sdk,
  SharedSdk,
  type SharingKey,
} from "@siafoundation/sia-storage";

import { releaseAll } from "./payload-checks.js";

export function expiryChecks(
  owner: Sdk,
  fixture: PinnedObject,
  indexdURL: string,
) {
  let key: SharingKey | undefined,
    recipient: SharedSdk | undefined,
    retained: PinnedObject | undefined;
  let progress = { bytes: 0, chunks: 0, completed: false, rejected: false };
  async function read(sdk: Sdk | SharedSdk, object: PinnedObject) {
    progress = { bytes: 0, chunks: 0, completed: false, rejected: false };
    const bytes: number[] = [];
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      reader = sdk.download(object).getReader();
      for (;;) {
        const item = await reader.read();
        if (item.done) {
          progress.completed = true;
          return bytes;
        }
        progress.chunks++;
        progress.bytes += item.value.byteLength;
        bytes.push(...item.value);
      }
    } catch (error) {
      progress.rejected = true;
      throw error;
    } finally {
      if (reader) {
        try {
          if (!progress.completed) await reader.cancel().catch(() => undefined);
        } finally {
          reader.releaseLock();
        }
      }
    }
  }
  let closed = false,
    started = false;
  async function snapshot() {
    const account = await owner.account();
    const fresh = await owner.object(fixture.id());
    try {
      return {
        id: fresh.id(),
        metadata: [...fresh.metadata()],
        pinnedData: String(account.pinnedData),
        pinnedSize: String(account.pinnedSize),
        size: fresh.size(),
      };
    } finally {
      fresh.free();
    }
  }
  return {
    close() {
      if (closed) return;
      closed = true;
      const owned = [retained, recipient, key];
      retained = undefined;
      recipient = undefined;
      key = undefined;
      releaseAll(owned.map((value) => () => value?.free()));
    },
    async denyFresh() {
      if (!recipient || !key)
        throw new Error("Expiry recipient is not prepared");
      let connect401 = false,
        metadata401 = false;
      try {
        const fresh = await recipient.object(fixture.id());
        fresh.free();
      } catch (error) {
        if (!String(error).includes("401")) throw error;
        metadata401 = true;
      }
      try {
        const fresh = await SharedSdk.connect(indexdURL, key.seed());
        fresh.free();
      } catch (error) {
        if (!String(error).includes("401")) throw error;
        connect401 = true;
      }
      return { connect401, metadata401 };
    },
    async freshAuthorized() {
      if (!recipient) throw new Error("Expiry recipient is not prepared");
      const fresh = await recipient.object(fixture.id());
      try {
        return (
          fresh.id() === fixture.id() &&
          fresh.size() === 1 &&
          fresh.metadata().length === 0
        );
      } finally {
        fresh.free();
      }
    },
    async prepare(expiresAtMs?: number) {
      if (started || closed)
        throw new Error("Expiry fixture is already prepared or closed");
      started = true;
      key = await owner.createSharingKey(
        "browser retained lifecycle",
        expiresAtMs === undefined ? undefined : new Date(expiresAtMs),
      );
      await owner.shareObject(key, fixture);
      recipient = await SharedSdk.connect(indexdURL, key.seed());
      retained = await recipient.object(fixture.id());
      return { expiresAt: expiresAtMs, owner: await snapshot() };
    },
    progress() {
      return { ...progress };
    },
    readOwner: async () => {
      const fresh = await owner.object(fixture.id());
      try {
        return {
          bytes: await read(owner, fresh),
          owner: await snapshot(),
        };
      } finally {
        fresh.free();
      }
    },
    async readRecipient() {
      if (!recipient || !retained)
        throw new Error("Expiry recipient is not prepared");
      return read(recipient, retained);
    },
    async revoke() {
      if (!key) throw new Error("Expiry recipient is not prepared");
      const revokeStartedAtMs = Date.now();
      await owner.revokeSharingKey(key);
      return { revokeCompletedAtMs: Date.now(), revokeStartedAtMs };
    },
    snapshot,
  };
}
