# Uppy Sia upload

`@lumeweb/uppy-sia-upload` uploads local browser `File` objects through an application's existing Sia account controller. It does not connect accounts, store credentials, or own the SDK. An acknowledged `pinObject` call completes the Uppy upload; indexd can delay listing the object until the current second ends. Pin acknowledgement does not promise that hosts will retain the data forever.

```ts
import Uppy, { type Meta } from "@uppy/core";
import SiaUpload, { type SiaUploadBody } from "@lumeweb/uppy-sia-upload";
import { createSiaAccess } from "@lumeweb/sia-app-access/sia";

const access = createSiaAccess({
  application: appMetadata,
  credentials: appCredentialStore,
  indexerUrl,
});
// Connect or register the account through the application's own access flow.
const uppy = new Uppy<Meta, SiaUploadBody>();
uppy.use(SiaUpload, { access });

// A file browser and any other account feature use the same controller.
await access.withSession(async (sdk) => {
  const object = await sdk.object(objectId);
  try {
    return object.size();
  } finally {
    object.free();
  }
});
```

An app can pass `metadata: (file: File) => Uint8Array | Promise<Uint8Array>` to set encrypted object metadata before upload. This package defines no metadata schema or feed protocol. Uppy receives only `{ objectId }` in the response body and a synthetic `200` status required by its response shape; it never receives the SDK, account key, or object handle. `uploadToSia(..., { onProgress })` reports completed encoded shard bytes over the expected encoded size, including parity and padding. A repeated shard acknowledgement does not advance the bar again. The Uppy plugin converts that measured fraction to the file's source size so queued files keep their original weight in Uppy's batch total; its `bytesUploaded` is a file-equivalent value, not network bytes. The transfer bar can reach 100% before `pinObject` acknowledges the object; Uppy marks the file complete only after that acknowledgement. A failed pin can therefore leave a full transfer bar on a failed file. Progress does not promise lasting host retention. Files in one Uppy batch upload sequentially to bound native upload buffering. A batch is bound to the account active when it starts; queued files fail if that account changes. A removed queued file is skipped even if its ID is reused; upload its replacement in a new batch. A removed file re-added while its native call is active waits for that call to finish before another attempt can start. Remote Uppy providers, empty files, Node buffers and generic blobs are not supported. indexd rejects objects with no slabs, so empty files fail before upload. Keep the access controller alive while uploads are running, and await disconnect outside any admitted work.

Cancellation or file removal stops Uppy from reporting a late success. The installed Sia SDK's native upload does not accept an abort signal, so slab uploads may still finish. Before `pinObject` starts, upload failures retain their cause and cancellation reports `SiaUploadCancelledError`; neither creates a pinned object, so the file can be retried. Unattached slabs remain until they are pruned; this package does not request pruning. Once `pinObject` starts, a lost response may hide a committed object. The package reports `SiaUploadUncertainError` rather than retrying or deleting it, and the plugin blocks that Uppy file ID under its original account public key, including after reconnection. A different account can upload a file with the same ID. Pass `onUncertain: (file, error, sessionId) => void` to receive uncertain outcomes even after cancellation or file removal. The callback receives the original account session ID and `error.objectId` when known; a thrown callback error is logged without changing the upload outcome. The application must reconcile an uncertain write under the same account using an authenticated object lookup and its own expected object identity before offering another attempt. After deciding a retry is safe, call `await uppy.getPlugin<SiaUpload>("SiaUpload")?.clearUncertain(fileId)` while that account is active. The method borrows the current SDK to identify its public key and returns whether it cleared a blocked ID; it does not delete a remote object. Reconnecting to the same account does not clear an uncertain outcome. A missing object while an earlier pin is still running is not proof that it cannot commit later. Removing or destroying Uppy does not close the account controller.

## Checks

From the workspace root run `pnpm --filter @lumeweb/sia-testing build && pnpm --filter @lumeweb/sia-session build && pnpm --filter @lumeweb/sia-app-access build`, then run `pnpm --filter @lumeweb/uppy-sia-upload` with `test`, `typecheck`, `build`, `lint`, and `test:package`. The integration tests use a test-only SDK adapter over Sia testing's synthetic application port for staged upload, pin and lost replies. The other tests check handle cleanup with a WASM-shaped fake. These checks do not establish behavior against a deployed indexd, live storage hosts, or a real account.
