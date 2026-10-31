import { describe, expect, it } from "vitest";
import { createIndexdDispatcher } from "../../src/dispatcher.js";
import { createIndexdModel } from "../../src/model/index.js";

import { credentials, other, owner, recipient, signedUrl } from "../fixtures/auth.js";
async function call(dispatch: ReturnType<typeof createIndexdDispatcher>, path: string, init: RequestInit = {}) {
  const url = new URL(path, "https://indexd.test");
  if (url.searchParams.has("auth")) { url.searchParams.delete("auth"); credentials().forEach((value, name) => url.searchParams.set(name, value)); }
  return dispatch(new Request(url, init));
}

describe("Indexd dispatcher slab and sharing routes", () => {
  it("supports slab list/get/delete/prune and object pin", async () => {
    const model = createIndexdModel(); model.createAccount({ publicKey: owner });
    const dispatch = createIndexdDispatcher(model, { baseUrl: "https://indexd.test" });
    const post = await call(dispatch, "/slabs?auth=1", { body: JSON.stringify({ id: "s", size: 4 }), headers: { "content-type": "application/json" }, method: "POST" });
    expect(post.status).toBe(204);
    expect((await call(dispatch, "/slabs?auth=1")).status).toBe(200);
    await expect((await call(dispatch, "/slabs/s?auth=1")).json()).resolves.toEqual({ id: "s", size: 4 });
    await call(dispatch, "/objects?auth=1", { body: JSON.stringify({ id: "o", slabs: [{ id: "s" }] }), headers: { "content-type": "application/json" }, method: "POST" });
    expect((await call(dispatch, "/slabs/prune?auth=1", { method: "POST" })).status).toBe(200);
    expect((await call(dispatch, "/slabs/s?auth=1", { method: "DELETE" })).status).toBe(403);
    await call(dispatch, "/objects/o?auth=1", { method: "DELETE" });
    expect((await call(dispatch, "/slabs/s?auth=1", { method: "DELETE" })).status).toBe(204);
  });

  it("supports owner attachment routes and recipient shared get", async () => {
    const model = createIndexdModel(); model.createAccount({ publicKey: owner }); model.createAccount({ publicKey: recipient });
    model.pinSlab(owner, { id: "s", size: 1 }); model.pinObject(owner, { id: "o", slabs: ["s"] });
    const dispatch = createIndexdDispatcher(model, { baseUrl: "https://indexd.test" });
    const req = (path: string, key = owner, init: RequestInit = {}) => { const url = new URL(path, "https://indexd.test"); credentials(key).forEach((value, name) => url.searchParams.set(name, value)); return new Request(url, init); };
    await dispatch(req("/sharing", owner, { body: JSON.stringify({ nonce: "n", publicKey: recipient }), headers: { "content-type": "application/json" }, method: "POST" }));
    const attached = await dispatch(req(`/sharing/${recipient}/objects`, owner, { body: JSON.stringify({ dataSignature: "sig", encryptedDataKey: "k", objectID: "o" }), headers: { "content-type": "application/json" }, method: "POST" }));
    expect(attached.status).toBe(204);
    expect((await dispatch(req(`/shared/objects/o?key=${recipient}`, recipient))).status).toBe(200);
    expect((await dispatch(req(`/sharing/${recipient}/objects`, owner))).status).toBe(200);
    expect((await dispatch(req(`/sharing/${recipient}/objects/o`, owner, { method: "DELETE" }))).status).toBe(204);
  });

  it("serves share URLs from the signing account without a scoped sharing key", async () => {
    const model = createIndexdModel();
    model.createAccount({ publicKey: owner });
    model.createAccount({ publicKey: other });
    model.pinObject(owner, { encryptedMetadata: "cHJpdmF0ZQ==", id: "o", slabs: [] });
    const dispatch = createIndexdDispatcher(model, { baseUrl: "https://indexd.test" });
    const owned = await call(dispatch, "/objects/o/shared?auth=1");
    expect(owned.status).toBe(200);
    expect(await owned.json()).toEqual({ slabs: [] });
    const unowned = await dispatch(new Request(signedUrl("/objects/o/shared", other)));
    expect(unowned.status).toBe(404);
  });

  it("maps malformed JSON, auth, not-found, conflict and quota failures", async () => {
    const model = createIndexdModel({ quotaBytes: 1 }); model.createAccount({ publicKey: owner });
    const dispatch = createIndexdDispatcher(model, { baseUrl: "https://indexd.test" });
    expect((await call(dispatch, "/objects?auth=1", { body: "{", headers: { "content-type": "application/json" }, method: "POST" })).status).toBe(400);
    expect((await dispatch(new Request("https://indexd.test/account"))).status).toBe(401);
    expect((await call(dispatch, "/objects/missing?auth=1")).status).toBe(404);
    const headers = { "content-type": "application/json" };
    await call(dispatch, "/sharing?auth=1", { body: JSON.stringify({ nonce: "n", publicKey: "k" }), headers, method: "POST" });
    expect((await call(dispatch, "/sharing?auth=1", { body: JSON.stringify({ nonce: "n", publicKey: "k" }), headers, method: "POST" })).status).toBe(409);
    model.pinSlab(owner, { id: "s", size: 2 });
    expect((await call(dispatch, "/objects?auth=1", { body: JSON.stringify({ id: "too-big", slabs: [{ id: "s" }] }), headers, method: "POST" })).status).toBe(429);
  });

  it("allows a post-mutation response override without duplicating pin state", async () => {
    const model = createIndexdModel(); model.createAccount({ publicKey: owner }); model.pinSlab(owner, { id: "s", size: 1 });
    const dispatch = createIndexdDispatcher(model, { baseUrl: "https://indexd.test", responseOverride: () => new Response(JSON.stringify({ error: "lost response" }), { status: 503 }) });
    const response = await call(dispatch, "/objects?auth=1", { body: JSON.stringify({ id: "o", slabs: [{ id: "s" }] }), headers: { "content-type": "application/json" }, method: "POST" });
    expect(response.status).toBe(503);
    expect(model.accountStats(owner)).toEqual({ objectCount: 1, pinnedSize: 1 });
    model.pinObject(owner, { id: "o", slabs: ["s"] });
    expect(model.accountStats(owner)).toEqual({ objectCount: 1, pinnedSize: 1 });
  });
});
