/** Separates real summary metadata calls from fixture uploads and later payload reads. */
import {
  type ObjectSummary,
  PinnedObject,
  type Sdk,
  SharedSdk,
  type SharingKey,
} from "@siafoundation/sia-storage";
import { preservingFailure, releaseAll } from "./payload-checks.js";
import { byteSource, readBytes } from "../../support/byte-streams.js";

export function summaryChecks(
  sdk: Sdk,
  fixture: PinnedObject,
  indexdURL: string,
) {
  let second: PinnedObject | undefined;
  let key: SharingKey | undefined;
  let recipient: SharedSdk | undefined;
  let closed = false,
    ready = false,
    started = false;
  return {
    close() {
      if (closed) return;
      closed = true;
      const owned = [recipient, key, second];
      recipient = undefined;
      key = undefined;
      second = undefined;
      releaseAll(owned.map((value) => () => value?.free()));
    },
    async finish() {
      if (!ready || closed || !second)
        throw new Error("Summary fixture is not prepared");
      const bytes = [];
      for (const id of [fixture.id(), second.id()]) {
        const object = await sdk.object(id);
        try {
          bytes.push(await readBytes(sdk, object));
        } finally {
          object.free();
        }
      }
      return bytes;
    },
    async list() {
      if (!ready || closed || !recipient || !key || !second)
        throw new Error("Summary fixture is not prepared");
      const connected = recipient,
        secondID = second.id(),
        sharingKey = key;
      const owned: ObjectSummary[] = [];
      const rows = (values: ObjectSummary[]) => {
        owned.push(...values);
        return values.map((value) => ({
          createdAt: value.createdAt.getTime(),
          id: value.id,
          metadata: [...value.metadata],
          size: value.size,
          updatedAt: value.updatedAt.getTime(),
        }));
      };
      return preservingFailure(
        async () => {
          const head = rows(await connected.objectSummaries(0, 1));
          const tail = rows(await connected.objectSummaries(1, 1));
          const exhausted = rows(await connected.objectSummaries(2, 1));
          const fullTimes = [];
          for (const row of [...head, ...tail]) {
            const object = await connected.object(row.id);
            try {
              fullTimes.push({
                createdAt: object.createdAt().getTime(),
                id: object.id(),
                updatedAt: object.updatedAt().getTime(),
              });
            } finally {
              object.free();
            }
          }
          await sdk.revokeSharingKey(sharingKey);
          let revoked = false;
          try {
            rows(await connected.objectSummaries(0, 1));
          } catch (error) {
            if (!String(error).includes("401")) throw error;
            revoked = true;
          }
          return {
            exhausted,
            fixtureID: fixture.id(),
            fullTimes,
            head,
            revoked,
            secondID,
            tail,
          };
        },
        () => releaseAll(owned.map((value) => () => value.free())),
      );
    },
    async prepare() {
      if (started || closed)
        throw new Error("Summary fixture is already prepared or closed");
      started = true;
      fixture.updateMetadata(Uint8Array.of(1, 0, 255));
      await sdk.updateObjectMetadata(fixture);
      const input = new PinnedObject();
      input.updateMetadata(Uint8Array.of(2, 0, 255));
      // WASM upload consumes its input even when the promise rejects.
      second = await sdk.upload(input, byteSource([8, 7]));
      await sdk.pinObject(second);
      key = await sdk.createSharingKey("browser summary pages");
      await sdk.shareObject(key, fixture);
      await sdk.shareObject(key, second);
      recipient = await SharedSdk.connect(indexdURL, key.seed());
      ready = true;
    },
  };
}
