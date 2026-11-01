/** Genuine native SDK checks require a supplied disposable service. */
import { describe, expect, it } from "vitest";
import {
  account,
  binding,
  config,
  diagnostics,
  upload,
  withAccounts,
} from "./session.js";
import type { SharedSdk, SharingKey } from "@siafoundation/sia-storage";
import { readBytes } from "../support/byte-streams.js";
import { observeHostPayload } from "../support/host-observer.js";

describe("real native reference imports", () => {
  for (const scoped of [false, true]) {
    it(
      scoped
        ? "keeps a scoped import after revocation and owner deletion"
        : "keeps an imported handle after owner deletion without payload transfers",
      async () => {
        await withAccounts(2, async (sessions) => {
          const a = account(sessions, 0),
            b = account(sessions, 1);
          const object = await upload(a);
          let key: SharingKey | undefined, shared: SharedSdk | undefined;
          const before = diagnostics.snapshot().transfers;
          const { payloadRPCs, result: importedID } = await observeHostPayload(
            process.env.SIA_TEST_CLUSTER_LOG,
            async () => {
              if (scoped) {
                key = await a.sdk.createSharingKey("native import");
                await a.sdk.shareObject(key, object);
                shared = await binding.SharedSdk.connect(
                  config.indexdURL.toString(),
                  key.seed(),
                );
              }
              const retrieved = await (shared ?? a.sdk).object(object.id());
              retrieved.updateMetadata(Buffer.from("destination"));
              await b.sdk.pinObject(retrieved);
              return retrieved.id();
            },
          );
          expect(payloadRPCs).toHaveLength(0);
          expect(diagnostics.snapshot().transfers - before).toBe(0);
          expect(
            Buffer.from(
              (await a.sdk.object(object.id())).metadata(),
            ).toString(),
          ).toBe("owner");
          if (key) {
            if (!shared) throw new Error("Native SharedSdk did not connect");
            await a.sdk.revokeSharingKey(key);
            await expect(shared.stats()).rejects.toThrow();
          }
          await a.sdk.deleteObject(object.id());
          await expect(a.sdk.object(object.id())).rejects.toThrow();
          const connected = await new binding.Builder(
            config.indexdURL.toString(),
            b.meta,
          ).connected(b.sdk.appKey());
          if (!connected)
            throw new Error("Native destination key did not reconnect");
          const imported = await connected.object(importedID);
          expect(Buffer.from(imported.metadata()).toString()).toBe(
            "destination",
          );
          expect(await readBytes(connected, imported)).toEqual([
            3, 1, 4, 1, 5, 9,
          ]);
        });
      },
      900_000,
    );
  }
});
