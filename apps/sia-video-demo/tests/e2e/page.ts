/** Owns the real SDK registration until Node has finished the consumer assertion. */
import {
  Builder,
  generateRecoveryPhrase,
  initSia,
  PinnedObject,
  type Sdk,
} from "@siafoundation/sia-storage";
import {
  createSharedObjectsClient,
  listSharedObjects,
  type SharedObjectPageView,
} from "../../src/lib/sharingObjects";

let builder: Builder | undefined;
let sdk: Sdk | undefined;
let accountKey: string | undefined;
let indexerUrl = "";
/** Keep operation failures when the owned handles also fail to release. */
async function preservingFailure<T>(
  run: () => Promise<T>,
  cleanup: () => void,
): Promise<T> {
  let outcome: { error: unknown; ok: false } | { ok: true; value: T };
  try {
    outcome = { ok: true, value: await run() };
  } catch (error) {
    outcome = { error, ok: false };
  }
  let cleanupFailure: undefined | { error: unknown };
  try {
    cleanup();
  } catch (error) {
    cleanupFailure = { error };
  }
  if (!outcome.ok) {
    if (cleanupFailure)
      throw new AggregateError(
        [outcome.error, cleanupFailure.error],
        "Consumer operation and cleanup failed",
        { cause: outcome.error },
      );
    throw outcome.error;
  }
  if (cleanupFailure) throw cleanupFailure.error;
  return outcome.value;
}
function release(actions: (() => void)[]) {
  const errors: unknown[] = [];
  for (const action of actions) {
    try {
      action();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length)
    throw new AggregateError(errors, "Consumer page cleanup failed");
}
async function run() {
  if (!sdk) throw new Error("Consumer SDK is not registered");
  const owner = sdk;
  const input = new PinnedObject();
  input.updateMetadata(
    new TextEncoder().encode(
      JSON.stringify({
        filename: "  demo\u0000  clip.mp4  ",
        type: "sialo-object-meta",
        version: 1,
      }),
    ),
  );
  // WASM consumes the upload input even when upload rejects.
  const object = await owner.upload(
    input,
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(Uint8Array.of(7, 8, 9));
        controller.close();
      },
    }),
  );
  let key: Awaited<ReturnType<Sdk["createSharingKey"]>> | undefined;
  let handle: Awaited<ReturnType<typeof createSharedObjectsClient>> | undefined;
  return preservingFailure(
    async () => {
      await owner.pinObject(object);
      key = await owner.createSharingKey("Consumer-owned E2E");
      await owner.shareObject(key, object);
      handle = await createSharedObjectsClient(indexerUrl, key.seed());
      const pages: SharedObjectPageView[] = [];
      const result = await listSharedObjects(handle.client, {
        onPage: (page) => pages.push(page),
        pageSize: 1,
      });
      return { objectID: object.id(), pages, result };
    },
    () => {
      release([
        () => handle?.dispose(),
        () => key?.free(),
        () => object.free(),
      ]);
    },
  );
}
export const consumer = {
  accountKey() {
    return accountKey;
  },
  close() {
    const ownedBuilder = builder,
      ownedSdk = sdk;
    sdk = builder = undefined;
    release([() => ownedSdk?.free(), () => ownedBuilder?.free()]);
  },
  async register() {
    if (!builder || sdk)
      throw new Error("Consumer registration is not available");
    await builder.waitForApproval();
    sdk = await builder.register(generateRecoveryPhrase());
    const key = sdk.appKey();
    try {
      accountKey = key.publicKey();
    } finally {
      key.free();
    }
    await window.recordConsumerAccount(accountKey);
  },
  async request(url: string, appID: string) {
    if (builder) throw new Error("Consumer page is already requested");
    await initSia();
    indexerUrl = url;
    builder = new Builder(url, {
      appId: appID,
      callbackUrl: undefined,
      description: "Disposable consumer test",
      logoUrl: undefined,
      name: "Consumer E2E",
      serviceUrl: "https://example.invalid",
    });
    await builder.requestConnection();
    return builder.responseUrl();
  },
  run,
  async waitForFunding() {
    if (!sdk) throw new Error("Consumer SDK is not registered");
    const deadline = Date.now() + 7 * 60_000;
    while (!(await sdk.account()).ready) {
      if (Date.now() >= deadline) throw new Error("Consumer funding timed out");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  },
};
declare global {
  interface Window {
    consumer: typeof consumer;
    recordConsumerAccount(key: string): Promise<void>;
  }
}
window.consumer = consumer;
document.querySelector("#status")!.textContent = "ready";
