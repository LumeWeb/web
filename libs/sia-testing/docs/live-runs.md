# Managed runs against an existing server

`withSiaRun` accepts a private live profile and explicit consent. It owns only the fixture objects and sharing keys that its SDK agent creates. It does not deploy services, fund an account or prune an account's slabs.

```ts
import { fileFixture, withSiaRun } from "@lumeweb/sia-testing/node";

await withSiaRun(
  {
    backend: {
      kind: "live",
      profileFile: "/private/sia/profile.json",
      consent: {
        apiBaseUrl: "https://indexd.example.invalid/",
        mutations: true,
        transfers: true,
      },
    },
    journalFile: "/private/sia/run-unique.jsonl",
  },
  async (run) => {
    const file = await fileFixture("/fixtures/video.mp4");
    const object = await run.objects.upload({
      file,
      name: file.name,
      metadata: new TextEncoder().encode("video fixture"),
    });
    const share = await run.shares.create({ objects: [object] });
    await run.shares.revoke(share);
  },
);
```

The application callback must await its work and close resources it creates outside the framework. A run deadline stops owned SDK work; arbitrary JavaScript started by the callback can continue. Mutation methods reject after the run closes.

## Profiles and limits

Profiles use the version 1 schema described in [live-auth.md](live-auth.md). Store the profile outside the checkout in an owner-only regular file. The API URL in consent must match the profile's normalized URL. The profile supplies application metadata and upload encoding alongside the authentication mode.

Live upload metadata is limited to 16 KiB. Upload mutations reserve room for a sealed object of up to 1 MiB and their journal record fields before calling the SDK. Other concurrent mutations cannot spend those reserved bytes. Insufficient journal capacity therefore rejects creation before the SDK runs; filesystem write failures can still leave an uncertain result.

Run-level `maxObjects`, `maxShares` and `maxLogicalUploadBytes` can lower the profile's limits. They cannot raise them. Accepted upload attempts reserve their object count and declared bytes before opening the source, and failed attempts retain those reservations. The source's byte count and SHA-256 digest must match its descriptor before SDK upload starts.

The SDK agent checks observed uploaded-shard progress against the profile's `maxObservedShardBytes`. Progress callbacks do not account for every encrypted byte, retry or charge. No hard financial limit is claimed. Nonempty uploads require compatible, funded hosts on the existing server.

## Cleanup and recovery

Every mutation records an intent before calling the SDK. An acknowledgement is flushed before a fixture handle is returned. Upload acknowledgements include a sealed SDK object, so cleanup can finish pinning a known upload before deleting it. Cleanup revokes recorded sharing keys before deleting recorded objects, using an acknowledged app key rather than consuming another preauthorization.

A clean summary confirms sharing-key revocation and object deletion for the recorded fixtures. Physical sectors and slab pins may remain under the server's retention rules. The framework never invokes account-wide slab pruning.

Creation records can use 16 MiB of journal space; cleanup and completion records have a further 1 MiB reserve. A full creation journal can therefore still record revocation and deletion during recovery. Cleanup continues with other recorded resources after a failure, reconnecting with the acknowledged app key when the SDK agent has stopped.

Journals contain credentials and sealed object data. They are created exclusively with mode `0600` under a private directory outside the checkout. Do not attach them to CI artifacts. The default journal directory is under the operating system's temporary directory; supply a private persistent path if recovery must survive temporary-directory cleanup. Keep the reported journal path when a run fails.

```ts
import { recoverSiaRun } from "@lumeweb/sia-testing/node";

await recoverSiaRun({
  backend: {
    kind: "live",
    profileFile: "/private/sia/profile.json",
    consent: {
      apiBaseUrl: "https://indexd.example.invalid/",
      mutations: true,
      transfers: true,
    },
  },
  journalFile: "/private/sia/run-unique.jsonl",
});
```

Recovery checks the journal's endpoint and application ID against the profile. It deletes only resource IDs and sharing keys established by acknowledged creation records. A creation without an acknowledgement stays uncertain; recovery preserves its journal and fails instead of scanning or deleting other account resources.

A `.lease` file prevents concurrent run and recovery owners. The framework never removes an existing lease by PID or age. After a process crash, stop all users of the journal and remove its lease before recovery. Removing a lease while an owner is active can allow concurrent mutations.

Offline tests cover the installed SDK's metadata-only pin/share/delete lifecycle on owned loopback services. They do not establish nonempty upload, browser transport or real-server compatibility.

## Application-write recipe (SDK 0.1.4)

Managed fixture uploads do not execute an application's writer. There is no public application-write driver or assertion helper. Keep the actual application call in its consumer test, and retain every original acknowledgement inside that call before getters, metadata changes, pinning, sealing or delivery. Wrapping a writer that returns only its first ID cannot establish cleanup of all results. Readable rows, IDs and receipts do not grant cleanup authority.

The following Node recipe shows selected SDK calls for one disposable five-byte input. It is an SDK recipe, not proof of a consumer adapter, a live-ready runner or a native completion guarantee. It requires an already authenticated SDK and separately approved endpoint consent, disposable resources and compatible funded services. It has not been executed against a live server. Do not run it as part of ordinary unit or package checks.

```ts
import type { PackedUpload, PinnedObject, Sdk, SealedObject } from "@siafoundation/sia-storage";
import { strict as assert } from "node:assert";

async function oneDisposableWrite(sdk: Sdk) {
  const expected = Uint8Array.of(0x53, 0x69, 0x61, 0, 0xff);
  const expectedMetadata = Buffer.from([7, 8]);
  const sealed: SealedObject[] = [];
  const failures: { phase: "write" | "cleanup"; error: unknown }[] = [];
  let originals: readonly PinnedObject[] = [];
  let packed: PackedUpload | undefined;
  let creationUncertain = false;
  let sent = false;
  let eof = false;
  const source = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (sent) {
          eof = true;
          controller.close();
        } else {
          sent = true;
          controller.enqueue(expected.slice());
        }
      },
    },
    { highWaterMark: 0 },
  );
  try {
    packed = sdk.uploadPacked({
      dataShards: 1,
      parityShards: 1,
      maxBufferedSlabs: 1,
    }); // synchronous, not a Promise
    creationUncertain = true;
    assert.equal(await packed.add(source), 5n);
    originals = await packed.finalize(); // retain the WHOLE batch before any getter
    creationUncertain = false;
    assert.equal(originals.length, 1); // extra originals remain owned on failure
    const object = originals[0]!;
    object.updateMetadata(Buffer.from(expectedMetadata));
    await sdk.updateObjectMetadata(object);
    await sdk.pinObject(object); // upload and pin are separate
    sealed.push(object.seal(sdk.appKey())); // native seal returns SealedObject
    assert.equal(eof, true);
    const row = await sdk.object(object.id());
    assert.deepEqual(row.metadata(), expectedMetadata);
    const download = sdk.download(row); // synchronous stream, asynchronous reads
    const reader = download.getReader();
    let offset = 0;
    let chunks = 0;
    let complete = false;
    let readFailed = false;
    try {
      for (;;) {
        const next = await reader.read().catch((error: unknown) => {
          readFailed = true;
          throw error;
        });
        if (next.done) {
          assert.equal(offset, expected.length);
          complete = true;
          break;
        }
        assert.ok(++chunks <= 32);
        assert.ok(next.value.byteLength <= 65536);
        assert.ok(next.value.buffer.byteLength <= 65536);
        for (const byte of next.value) {
          assert.ok(offset < expected.length); // fail on the first overflow byte
          assert.equal(byte, expected[offset++]);
        }
      }
    } finally {
      if (!complete && !readFailed) {
        try {
          await reader.cancel();
        } catch (error) {
          failures.push({ phase: "cleanup", error });
        }
      }
      reader.releaseLock();
    }
  } catch (error) {
    failures.push({ phase: "write", error });
    // A rejected native finalize has no declared partial-object error contract.
    // Any unacknowledged creation stays unknown; do not read error.objects.
  }
  // The caller must keep this invocation and its originals owned until all work settles.
  // This return is not a cleanup summary or permission to close the session.
  return { creationUncertain, failures, originals, packed, sealed, source };
}
```

Snapshot literal expected bytes and metadata before calling adapter code; never use a writer's returned bytes as the oracle. Count source consumption inline, without an unread tee. The ordinary offline contract profile uses at most 1 MiB combined payload, at most 32 chunks, and 64 KiB chunk/backing buffers; these are test-profile budgets, not new package limits or permission to spend funds. The single-input contract expects one destination. Multiple inputs need an explicit per-input destination mapping; an unexpected result count is not permission to discard acknowledged references.

The returned source and packed operation reference remain available to the caller even when add or finalize rejects; `packed` is undefined if its creation failed. The caller already owns the SDK. Retaining these references does not supply asynchronous join, cancellation completion or native completion, and it does not recover a reader held inside the SDK.

This example awaits exposed SDK calls and download cancellation, but SDK 0.1.4's Node declarations provide no asynchronous packed disposal or SDK close/join method. Browser `free`/`Symbol.dispose` and Node `cancel` are not declared completion joins. Before any live execution, the test owner must establish how source finalization, late acknowledgements, SDK/session and physical work settle on every failure path. Retain that work after caller abort or observation timeout; a discarded `Promise.race` or force-closing the session cannot supply this evidence. Do not treat the example's return as a complete-cleanup summary. If an interrupted source remains locked, its owner must settle it before final reset; the example does not recover a lost reader.

Only after the owner has established that work has settled may its disposable-resource cleanup call `await sdk.deleteObject(object.id())` once for each original retained by this invocation. Keep the original write failures and every observed delete error, and continue with independent objects after a delete failure. Do not take IDs from readable rows or another invocation as ownership claims. The code deliberately does not start deletion or close the session without that missing completion evidence.

Deletion acknowledges an indexer operation, not physical slab reclamation. Unpinned objects may not have a deletable indexer row; record the failure or uncertainty without pinning them for cleanup. Do not retry, resend, inspect, recover or prune automatically. An explicit deletion readback, if required by a future live test, needs its own approved selected-ID observation. The ephemeral application recipe has no crash-recovery journal. The managed agent's journal, lease and forced process deadlines remain managed-fixture policy and do not track external application commits or join arbitrary caller JavaScript.

Private offline tests exercise actual public mock byte/metadata readback and separate controlled bookkeeping failures. Compile-only Node/browser fixtures check selected 0.1.4 declarations without importing native code at runtime. None establishes nonempty native transfer, complete consumer acknowledgement visibility, SDK 0.0.12 compatibility or a live browser/worker path.
