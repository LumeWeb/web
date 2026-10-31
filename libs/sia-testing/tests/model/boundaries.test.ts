import { expect, it } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

it("keeps configured hosts separate from later changes to the input", () => {
  const hosts = [{ addresses: ["quic://original"], publicKey: "host" }];
  const model = createIndexdModel({ hosts });
  model.createAccount({ publicKey: "owner" });
  hosts[0]!.addresses.push("quic://changed");
  hosts[0]!.publicKey = "changed";
  hosts.push({ addresses: [], publicKey: "extra" });
  expect(model.hosts("owner")).toEqual([
    { addresses: ["quic://original"], publicKey: "host" },
  ]);
});

it("retains an approved connection when its app account already exists", () => {
  const model = createIndexdModel();
  model.createAccount({ publicKey: "existing" });
  const request = model.requestConnection({
    appId: "app",
    publicKey: "signer",
  });
  model.approveConnection(request.id, "opaque");
  expect(() => model.registerConnection(request.id, "existing")).toThrow(
    "already exists",
  );
  expect(model.connectionRequest(request.id)).toMatchObject({
    approved: true,
    publicKey: "signer",
  });
  expect(model.registerConnection(request.id, "new")).toEqual({
    id: "new",
    publicKey: "new",
  });
  expect(model.connectionRequest(request.id)).toBeUndefined();
});

it("registers a connection without requiring a method receiver", () => {
  const model = createIndexdModel();
  const request = model.requestConnection({
    appId: "app",
    publicKey: "signer",
  });
  model.approveConnection(request.id, "opaque");
  const registerConnection = model.registerConnection.bind(undefined);
  expect(registerConnection(request.id, "account")).toEqual({
    id: "account",
    publicKey: "account",
  });
});

it("uses the same recipient encoding for shared listings and reads", () => {
  const model = createIndexdModel();
  const publicKey = btoa(String.fromCharCode(...new Uint8Array(32).fill(255)));
  const recipient = publicKey.replace(/\//g, "_").replace(/=+$/, "");
  model.createAccount({ publicKey: "owner" });
  model.seedObject("owner", { id: "object" });
  model.createSharingKey("owner", { nonce: "nonce", publicKey });
  const attachment = {
    dataSignature: "signature",
    encryptedDataKey: "key",
    objectID: "object",
  };
  model.attachSharedObject("owner", publicKey, attachment);
  expect(model.sharedObject(recipient, publicKey, "object")).toEqual(
    attachment,
  );
  expect(model.listRecipientObjects(recipient, publicKey)).toEqual([
    attachment,
  ]);
  expect(model.sharedStats(recipient, publicKey).objectCount).toBe(1);
  expect(() => model.listRecipientObjects("another", publicKey)).toThrow(
    "unavailable",
  );
});
