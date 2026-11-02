/** The SDK agent receives authority over IPC and keeps native SDK work inside its owned process. */
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import type { Sdk } from "@siafoundation/sia-storage";
import type { LiveProfileDocument } from "./types.js";
let sdk: Sdk | undefined;
let authenticating = false;
process.on("message", (message: unknown) => {
  if (
    !message ||
    typeof message !== "object" ||
    !("id" in message) ||
    typeof message.id !== "string" ||
    !("operation" in message) ||
    !("value" in message)
  )
    return;
  const id = message.id;
  if (message.operation !== "authenticate" || sdk || authenticating) {
    process.send?.({ code: "invalid-input", id, type: "error" });
    return;
  }
  authenticating = true;
  void authenticate(id, message.value as LiveProfileDocument);
});
process.on("disconnect", () => process.exit(0));
process.send?.({ type: "ready" });
async function authenticate(
  id: string,
  profile: LiveProfileDocument,
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
    const api = await import("@siafoundation/sia-storage");
    await api.initSia();
    code = "authentication";
    const builder = new api.Builder(profile.apiBaseUrl, {
      description: profile.app.description,
      id: Buffer.from(profile.app.id, "hex"),
      name: profile.app.name,
      serviceUrl: profile.app.serviceUrl,
    });
    if (profile.auth.kind === "app-key") {
      sdk =
        (await builder.connected(
          new api.AppKey(Buffer.from(profile.auth.appKeyHex, "hex")),
        )) ?? undefined;
      if (!sdk) throw new Error("App key is not registered");
    } else if (profile.auth.kind === "register") {
      await builder.requestConnection();
      process.send?.({
        name: "approval",
        requestId: id,
        type: "event",
        value: builder.responseUrl(),
      });
      await builder.waitForApproval();
      sdk = await builder.register(profile.auth.phrase);
    } else {
      sdk = await builder.connectPreAuthorized(
        Buffer.from(profile.auth.preauthorizedKeyHex, "hex"),
        profile.auth.phrase,
      );
    }
    code = "not-ready";
    let account = await sdk.account();
    while (!account.ready) {
      if (account.app.id !== profile.app.id)
        throw new Error("Account belongs to another app");
      await delay(200);
      account = await sdk.account();
    }
    if (account.app.id !== profile.app.id)
      throw new Error("Account belongs to another app");
    const appKeyHex = sdk.appKey().export().toString("hex");
    process.send?.({
      id,
      type: "result",
      value: {
        accountKey: account.accountKey,
        appId: account.app.id,
        appKeyHex,
        maxPinnedData: account.maxPinnedData,
        ready: account.ready,
        remainingStorage: account.remainingStorage,
      },
    });
  } catch {
    process.send?.({ code, id, type: "error" });
  } finally {
    authenticating = false;
  }
}
