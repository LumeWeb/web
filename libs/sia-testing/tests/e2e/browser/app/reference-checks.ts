/** Imports real handles across accounts before removing the owner's reference. */
import {
  Builder,
  PinnedObject,
  type Sdk,
  SharedSdk,
  type SharingKey,
} from "@siafoundation/sia-storage";
import { byteSource, readBytes } from "../../support/byte-streams.js";
import { preservingFailure, releaseAll } from "./payload-checks.js";
import type { PayloadConnection } from "./payload-checks.js";

export function referenceChecks(
  owner: Sdk,
  destination: Sdk,
  connection: PayloadConnection,
  disconnectPeer: () => void,
) {
  const handles = new Set<PinnedObject>();
  const own = (object: PinnedObject) => {
    handles.add(object);
    return object;
  };
  let closed = false,
    finished = false,
    importing = false,
    ready = false,
    started = false;
  function prepared() {
    if (!ready || closed || finished)
      throw new Error("Reference is not prepared or already finished");
  }
  let source!: PinnedObject;
  let importedID!: string;
  let sharingKey: SharingKey | undefined;
  let shared: SharedSdk | undefined;
  return {
    close() {
      if (closed) return;
      closed = true;
      const owned = [...handles, shared, sharingKey];
      handles.clear();
      shared = sharingKey = undefined;
      releaseAll(owned.map((value) => () => value?.free()));
    },
    async destinationContainsSource() {
      prepared();
      try {
        own(await destination.object(source.id()));
        return true;
      } catch (error) {
        if (String(error).includes("Api(404,")) return false;
        throw error;
      }
    },
    async finish() {
      prepared();
      if (!importedID) throw new Error("Reference was not imported");
      finished = true;
      let scopedRevoked = false;
      if (sharingKey) {
        if (!shared) throw new Error("Shared SDK did not connect");
        await owner.revokeSharingKey(sharingKey);
        try {
          await shared.stats();
        } catch {
          scopedRevoked = true;
        }
        if (!scopedRevoked)
          throw new Error("Revoked sharing key still grants access");
      }
      await owner.deleteObject(source.id());
      let ownerDeleted = false;
      try {
        own(await owner.object(source.id()));
      } catch (error) {
        ownerDeleted = /404|not found/i.test(String(error));
      }
      const key = destination.appKey();
      let builder: Builder | undefined;
      let connected: null | Sdk | undefined;
      return preservingFailure(
        async () => {
          disconnectPeer();
          builder = new Builder(connection.indexerUrl, connection.appMeta);
          connected = await builder.connected(key);
          if (!connected)
            throw new Error("Destination app key did not reconnect");
          const imported = own(await connected.object(importedID));
          return {
            bytes: await readBytes(connected, imported),
            metadata: new TextDecoder().decode(imported.metadata()),
            ownerDeleted,
            scopedRevoked,
          };
        },
        () =>
          releaseAll([
            () => connected?.free(),
            () => builder?.free(),
            () => key.free(),
          ]),
      );
    },
    async import(scoped: boolean) {
      prepared();
      if (importing) throw new Error("Reference import is already pending");
      importing = true;
      try {
        let retrieved;
        if (scoped) {
          sharingKey ??= await owner.createSharingKey("reference handoff");
          await owner.shareObject(sharingKey, source);
          shared ??= await SharedSdk.connect(
            connection.indexerUrl,
            sharingKey.seed(),
          );
          retrieved = own(await shared.object(source.id()));
        } else {
          retrieved = own(await owner.object(source.id()));
        }
        retrieved.updateMetadata(new TextEncoder().encode("destination"));
        await destination.pinObject(retrieved);
        importedID = retrieved.id();
        const original = own(await owner.object(source.id()));
        const imported = own(await destination.object(importedID));
        return {
          destinationMetadata: new TextDecoder().decode(imported.metadata()),
          ownerMetadata: new TextDecoder().decode(original.metadata()),
        };
      } finally {
        importing = false;
      }
    },
    async prepare() {
      if (started || closed)
        throw new Error("Reference is already prepared or closed");
      started = true;
      const input = new PinnedObject();
      input.updateMetadata(new TextEncoder().encode("owner"));
      source = own(await owner.upload(input, byteSource([3, 1, 4, 1, 5, 9])));
      await owner.pinObject(source);
      ready = true;
    },
  };
}
