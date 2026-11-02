# Managed runs against an existing server

`withSiaRun` accepts a private live profile and explicit consent. It owns only the fixture objects and sharing keys that its SDK agent creates. It does not deploy services, fund an account or prune an account's slabs.

```ts
import { fileFixture, withSiaRun } from '@lumeweb/sia-testing/node';

await withSiaRun({
  backend: {
    kind: 'live',
    profileFile: '/private/sia/profile.json',
    consent: {
      apiBaseUrl: 'https://indexd.example/',
      mutations: true,
      transfers: true,
    },
  },
  journalFile: '/private/sia/run-unique.jsonl',
}, async (run) => {
  const file = await fileFixture('/fixtures/video.mp4');
  const object = await run.objects.upload({
    file,
    name: file.name,
    metadata: new TextEncoder().encode('video fixture'),
  });
  const share = await run.shares.create({ objects: [object] });
  await run.shares.revoke(share);
});
```

The application callback must await its work and close resources it creates outside the framework. A run deadline stops owned SDK work; arbitrary JavaScript started by the callback can continue. Mutation methods reject after the run closes.

## Profiles and limits

Profiles use the version 1 schema described in [live-auth.md](live-auth.md). Store the profile outside the checkout in an owner-only regular file. The API URL in consent must match the profile's normalized URL. The profile supplies application metadata and upload encoding alongside the authentication mode.

Run-level `maxObjects`, `maxShares` and `maxLogicalUploadBytes` can lower the profile's limits. They cannot raise them. Accepted upload attempts reserve their object count and declared bytes before opening the source, and failed attempts retain those reservations. The source's byte count and SHA-256 digest must match its descriptor before SDK upload starts.

The SDK agent checks observed uploaded-shard progress against the profile's `maxObservedShardBytes`. Progress callbacks do not account for every encrypted byte, retry or charge. No hard financial limit is claimed. Nonempty uploads require compatible, funded hosts on the existing server.

## Cleanup and recovery

Every mutation records an intent before calling the SDK. An acknowledgement is flushed before a fixture handle is returned. Upload acknowledgements include a sealed SDK object, so cleanup can finish pinning a known upload before deleting it. Cleanup revokes recorded sharing keys before deleting recorded objects, using an acknowledged app key rather than consuming another preauthorization.

A clean summary confirms sharing-key revocation and object deletion for the recorded fixtures. Physical sectors and slab pins may remain under the server's retention rules. The framework never invokes account-wide slab pruning.

Journals contain credentials and sealed object data. They are created exclusively with mode `0600` under a private directory outside the checkout. Do not attach them to CI artifacts. The default journal directory is under the operating system's temporary directory; supply a private persistent path if recovery must survive temporary-directory cleanup. Keep the reported journal path when a run fails.

```ts
import { recoverSiaRun } from '@lumeweb/sia-testing/node';

await recoverSiaRun({
  backend: {
    kind: 'live',
    profileFile: '/private/sia/profile.json',
    consent: {
      apiBaseUrl: 'https://indexd.example/',
      mutations: true,
      transfers: true,
    },
  },
  journalFile: '/private/sia/run-unique.jsonl',
});
```

Recovery checks the journal's endpoint and application ID against the profile. It deletes only resource IDs and sharing keys established by acknowledged creation records. A creation without an acknowledgement stays uncertain; recovery preserves its journal and fails instead of scanning or deleting other account resources.

A `.lease` file prevents concurrent run and recovery owners. The framework never removes an existing lease by PID or age. After a process crash, stop all users of the journal and remove its lease before recovery. Removing a lease while an owner is active can allow concurrent mutations.

Offline tests cover the installed SDK's metadata-only pin/share/delete lifecycle on owned loopback services. They do not establish nonempty upload, browser transport or real-server compatibility.
