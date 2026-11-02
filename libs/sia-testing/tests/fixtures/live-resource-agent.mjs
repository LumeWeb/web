/** This control-plane fixture persists exact object and share records across owned child lifetimes. */
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
/** @typedef {{calls: string[], objects: {id: string, bytes?: number, pinned: boolean}[], shares: {id: string, objects: string[], seedHex: string}[], crashAfter?: string}} FixtureState */
/** @typedef {{id: string, operation: string, value: {app: {id: string}, bytes: Uint8Array, objectId: string, shareId: string}}} Request */
const stateFile = new URL("./state.json", import.meta.url);
process.send({ type: "ready" });
process.on("message", (message) => {
  const request = /** @type {Request} */ (message);
  void (async () => {
    const state = /** @type {FixtureState} */ (
      JSON.parse(await readFile(stateFile, "utf8"))
    );
    state.calls.push(request.operation);
    const input = request.value;
    /** @type {unknown} */
    let value = null;
    if (request.operation === "authenticate")
      value = {
        accountKey: "ed25519:" + "a".repeat(64),
        appId: input.app.id,
        appKeyHex: "07".repeat(32),
        maxPinnedData: 1000000000n,
        ready: true,
        remainingStorage: 1000000000n,
      };
    else if (request.operation === "upload") {
      const objectId = randomBytes(32).toString("hex");
      state.objects.push({
        bytes: input.bytes.byteLength,
        id: objectId,
        pinned: false,
      });
      value = {
        objectId,
        observedShardBytes: input.bytes.byteLength,
        sealed: "owned-sealed-snapshot",
        sizeBytes: input.bytes.byteLength,
      };
    } else if (request.operation === "pin")
      state.objects.find((object) => object.id === input.objectId).pinned =
        true;
    else if (request.operation === "inspect")
      value = state.objects.some(
        (object) => object.id === input.objectId && object.pinned,
      )
        ? "present"
        : "missing";
    else if (request.operation === "delete")
      state.objects = state.objects.filter(
        (object) => object.id !== input.objectId,
      );
    else if (request.operation === "create-share") {
      const seedHex = randomBytes(32).toString("hex");
      const shareId = "ed25519:" + randomBytes(32).toString("hex");
      state.shares.push({ id: shareId, objects: [], seedHex });
      value = { seedHex, shareId };
    } else if (request.operation === "attach")
      state.shares
        .find((share) => share.id === input.shareId)
        .objects.push(input.objectId);
    else if (request.operation === "detach") {
      const share = state.shares.find((share) => share.id === input.shareId);
      share.objects = share.objects.filter((id) => id !== input.objectId);
    } else if (request.operation === "inspect-share")
      value = state.shares.some((share) => share.id === input.shareId)
        ? "present"
        : "missing";
    else if (request.operation === "revoke")
      state.shares = state.shares.filter((share) => share.id !== input.shareId);
    else throw new Error("Unsupported fixture request");
    await writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
    if (state.crashAfter === request.operation) process.exit(42);
    process.send({ id: request.id, type: "result", value });
  })().catch(() =>
    process.send({ code: "resource-error", id: request.id, type: "error" }),
  );
});
