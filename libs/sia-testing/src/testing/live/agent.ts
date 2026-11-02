/** The SDK agent receives authority over IPC and keeps native SDK work inside its owned process. */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { deserialize, serialize } from "node:v8";
import type { Sdk, SealedObject } from "@siafoundation/sia-storage";
import type { LiveProfileDocument } from "./types.js";
import {
  maximumMetadataBytes,
  maximumSealedObjectBytes,
} from "./resource-limits.js";
let sdk: Sdk | undefined;
let api: typeof import("@siafoundation/sia-storage") | undefined;
let profile: LiveProfileDocument | undefined;
let busy = false;
let uploadedBytes = 0;
let observedShardBytes = 0;
let objects = 0;
let shares = 0;
process.on("message", (message: unknown) => {
  if (
    !message ||
    typeof message !== "object" ||
    !("id" in message) ||
    typeof message.id !== "string" ||
    !("operation" in message) ||
    typeof message.operation !== "string" ||
    !("value" in message)
  )
    return;
  const id = message.id;
  if (
    busy ||
    (message.operation === "authenticate"
      ? sdk !== undefined
      : sdk === undefined)
  ) {
    process.send?.({ code: "invalid-input", id, type: "error" });
    return;
  }
  busy = true;
  const work =
    message.operation === "authenticate"
      ? authenticate(id, message.value as LiveProfileDocument)
      : resource(id, message.operation, message.value);
  void work.finally(() => {
    busy = false;
  });
});
process.on("disconnect", () => process.exit(0));
process.send?.({ type: "ready" });
async function authenticate(
  id: string,
  document: LiveProfileDocument,
): Promise<void> {
  let code = "sdk-version";
  try {
    const entry = createRequire(import.meta.url).resolve(
      "@siafoundation/sia-storage",
    );
    const metadata = JSON.parse(
      await readFile(join(dirname(dirname(entry)), "package.json"), "utf8"),
    ) as { version?: unknown };
    if (metadata.version !== "0.1.4") throw new Error("Unexpected SDK version");
    api = await import("@siafoundation/sia-storage");
    await api.initSia();
    code = "authentication";
    profile = document;
    const builder = new api.Builder(document.apiBaseUrl, {
      description: document.app.description,
      id: Buffer.from(document.app.id, "hex"),
      name: document.app.name,
      serviceUrl: document.app.serviceUrl,
    });
    if (document.auth.kind === "app-key") {
      sdk =
        (await builder.connected(
          new api.AppKey(Buffer.from(document.auth.appKeyHex, "hex")),
        )) ?? undefined;
      if (!sdk) throw new Error("App key is not registered");
    } else if (document.auth.kind === "register") {
      await builder.requestConnection();
      process.send?.({
        name: "approval",
        requestId: id,
        type: "event",
        value: builder.responseUrl(),
      });
      await builder.waitForApproval();
      sdk = await builder.register(document.auth.phrase);
    } else {
      sdk = await builder.connectPreAuthorized(
        Buffer.from(document.auth.preauthorizedKeyHex, "hex"),
        document.auth.phrase,
      );
    }
    code = "not-ready";
    let account = await sdk.account();
    while (!account.ready) {
      if (account.app.id !== document.app.id)
        throw new Error("Account belongs to another app");
      await delay(200);
      account = await sdk.account();
    }
    if (account.app.id !== document.app.id)
      throw new Error("Account belongs to another app");
    process.send?.({
      id,
      type: "result",
      value: {
        accountKey: account.accountKey,
        appId: account.app.id,
        appKeyHex: sdk.appKey().export().toString("hex"),
        maxPinnedData: account.maxPinnedData,
        ready: account.ready,
        remainingStorage: account.remainingStorage,
      },
    });
  } catch {
    process.send?.({ code, id, type: "error" });
  }
}
function expiry(value: unknown): Date {
  if (typeof value !== "string") throw new Error("Invalid expiry");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now())
    throw new Error("Invalid expiry");
  return date;
}
function identifier(value: unknown): string {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value))
    throw new Error("Invalid object ID");
  return value;
}
// A full-message search would misread a 500 response whose body mentions 404.
function notFound(error: unknown): boolean {
  return (
    error instanceof Error && error.message.startsWith("app error: Api(404, ")
  );
}
async function resource(
  id: string,
  operation: string,
  value: unknown,
): Promise<void> {
  let code = "invalid-input";
  try {
    if (
      !sdk ||
      !api ||
      !profile ||
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    )
      throw new Error("Invalid resource request");
    const input = value as Record<string, unknown>;
    let result: unknown = null;
    code = "resource-error";
    if (operation === "upload") {
      code = "invalid-input";
      if (
        !(input.bytes instanceof Uint8Array) ||
        !(input.metadata instanceof Uint8Array) ||
        input.metadata.byteLength > maximumMetadataBytes
      )
        throw new Error("Invalid upload snapshot");
      if (
        objects >= profile.limits.maxObjects ||
        uploadedBytes + input.bytes.byteLength >
          profile.limits.maxLogicalUploadBytes
      ) {
        code = "quota";
        throw new Error("Upload budget exceeded");
      }
      code = "resource-error";
      objects++;
      uploadedBytes += input.bytes.byteLength;
      const initial = new api.PinnedObject();
      initial.updateMetadata(Buffer.from(input.metadata));
      // The SDK checks host availability before reading, even when the object has no payload.
      const uploaded =
        input.bytes.byteLength === 0
          ? initial
          : await sdk.upload(
              initial,
              new Blob([Buffer.from(input.bytes)]).stream(),
              {
                ...profile.encoding,
                onShardUploaded(progress) {
                  observedShardBytes += progress.shardSize;
                  if (
                    !Number.isSafeInteger(observedShardBytes) ||
                    observedShardBytes > profile!.limits.maxObservedShardBytes
                  ) {
                    process.send?.({ code: "quota", id, type: "error" });
                    process.exit(1);
                  }
                },
              },
            );
      const sealed = serialize(uploaded.seal(sdk.appKey())).toString("base64");
      if (sealed.length > maximumSealedObjectBytes)
        throw new Error("Invalid sealed object size");
      result = {
        objectId: uploaded.id(),
        observedShardBytes,
        sealed,
        sizeBytes: Number(uploaded.size()),
      };
    } else if (operation === "pin") {
      const objectId = identifier(input.objectId);
      if (
        typeof input.sealed !== "string" ||
        input.sealed.length > 16 * 1024 * 1024
      )
        throw new Error("Invalid sealed object");
      const sealed = deserialize(
        Buffer.from(input.sealed, "base64"),
      ) as SealedObject;
      const object = api.PinnedObject.open(sdk.appKey(), sealed);
      if (object.id() !== objectId) throw new Error("Object ID mismatch");
      await sdk.pinObject(object);
    } else if (operation === "create-share") {
      if (shares >= profile.limits.maxShares) {
        code = "quota";
        throw new Error("Share budget exceeded");
      }
      if (
        typeof input.description !== "string" ||
        input.description.length > 4096
      )
        throw new Error("Invalid share description");
      shares++;
      const key = await sdk.createSharingKey(
        input.description,
        input.expiresAt === undefined ? undefined : expiry(input.expiresAt),
      );
      result = { seedHex: key.seed().toString("hex"), shareId: key.publicKey };
    } else if (
      operation === "attach" ||
      operation === "detach" ||
      operation === "revoke"
    ) {
      const seedHex = input.seedHex;
      if (typeof seedHex !== "string" || !/^[a-f0-9]{64}$/.test(seedHex))
        throw new Error("Invalid sharing seed");
      const key = api.SharingKey.fromSeed(Buffer.from(seedHex, "hex"));
      if (key.publicKey !== input.shareId) throw new Error("Share ID mismatch");
      if (operation === "attach")
        await sdk.shareObject(
          key,
          await sdk.object(identifier(input.objectId)),
        );
      else if (operation === "detach")
        await sdk.unshareObject(key, identifier(input.objectId));
      else {
        try {
          await sdk.revokeSharingKey(key);
        } catch (error) {
          if (!notFound(error)) throw error;
        }
      }
    } else if (operation === "delete") {
      try {
        await sdk.deleteObject(identifier(input.objectId));
      } catch (error) {
        if (!notFound(error)) throw error;
      }
    } else if (operation === "inspect") {
      try {
        await sdk.object(identifier(input.objectId));
        result = "present";
      } catch (error) {
        if (notFound(error)) result = "missing";
        else throw error;
      }
    } else if (operation === "signed-url") {
      const object = await sdk.object(identifier(input.objectId));
      result = { url: sdk.objectShareUrl(object, expiry(input.expiresAt)) };
    } else {
      code = "invalid-input";
      throw new Error("Unknown resource operation");
    }
    process.send?.({ id, type: "result", value: result });
  } catch {
    process.send?.({ code, id, type: "error" });
  }
}
