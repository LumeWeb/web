/** Denying a connection must end SDK polling without granting an app account. */
import { expect, test } from "vitest";
import { createIndexdDispatcher } from "../../src/dispatcher.js";
import { createIndexdModel } from "../../src/model/index.js";
import { recipient, signedUrl } from "../fixtures/auth.js";

test.each(['{"approve":"false"}', '{"approve":0}', "{"])(
  "an invalid approval body %s leaves the request pending",
  async (body) => {
    const model = createIndexdModel();
    const { id } = model.requestConnection({
      appId: "app",
      publicKey: recipient,
    });
    const dispatch = createIndexdDispatcher(model);
    const response = await dispatch(
      new Request(`https://indexd.test/auth/connect/${id}`, {
        body,
        headers: { authorization: "Basic dGVzdDp0ZXN0" },
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
    expect(model.connectionRequest(id)?.approved).toBe(false);
  },
);

test("an empty approval body preserves bodyless fixture approval", async () => {
  const model = createIndexdModel();
  const { id } = model.requestConnection({
    appId: "app",
    publicKey: recipient,
  });
  const dispatch = createIndexdDispatcher(model);
  const response = await dispatch(
    new Request(`https://indexd.test/auth/connect/${id}`, {
      body: "",
      headers: { authorization: "Basic dGVzdDp0ZXN0" },
      method: "POST",
    }),
  );
  expect(response.status).toBe(204);
  expect(model.connectionRequest(id)?.approved).toBe(true);
});

function deny(model: ReturnType<typeof createIndexdModel>, id: string) {
  return createIndexdDispatcher(model)(
    new Request(`https://indexd.test/auth/connect/${id}`, {
      body: JSON.stringify({ approve: false }),
      headers: { authorization: "Basic dGVzdDp0ZXN0" },
      method: "POST",
    }),
  );
}

test("denying an unknown request succeeds without creating an account", async () => {
  const model = createIndexdModel();
  expect((await deny(model, "missing")).status).toBe(204);
  expect(model.snapshot().accounts).toEqual([]);
});

test("denial removes an expired request", async () => {
  let now = new Date("2030-01-01T00:00:00Z");
  const model = createIndexdModel({ now: () => now });
  const { id } = model.requestConnection({
    appId: "app",
    publicKey: recipient,
  });
  now = new Date("2030-01-01T00:10:00.001Z");
  expect((await deny(model, id)).status).toBe(204);
  expect(model.connectionRequest(id)).toBeUndefined();
});

test("repeating a denial succeeds after its request was removed", async () => {
  const model = createIndexdModel();
  const { id } = model.requestConnection({
    appId: "app",
    publicKey: recipient,
  });
  expect((await deny(model, id)).status).toBe(204);
  expect((await deny(model, id)).status).toBe(204);
  expect(model.connectionRequest(id)).toBeUndefined();
});

test("denial after registration preserves the registered account", async () => {
  const model = createIndexdModel();
  const { id } = model.requestConnection({
    appId: "app",
    publicKey: recipient,
  });
  model.approveConnection(id, "opaque");
  const account = model.registerConnection(id, recipient);
  expect((await deny(model, id)).status).toBe(204);
  expect(model.caller(recipient)).toEqual(account);
});

test("a denied connection disappears instead of becoming approved", async () => {
  const model = createIndexdModel();
  const { id } = model.requestConnection({
    appId: "app",
    publicKey: recipient,
  });
  const dispatch = createIndexdDispatcher(model);
  const denied = await dispatch(
    new Request(`https://indexd.test/auth/connect/${id}`, {
      body: JSON.stringify({ approve: false }),
      headers: { authorization: "Basic dGVzdDp0ZXN0" },
      method: "POST",
    }),
  );
  expect(denied.status).toBe(204);
  const status = await dispatch(
    new Request(signedUrl(`/auth/connect/${id}/status`, recipient)),
  );
  expect(status.status).toBe(404);
  const register = await dispatch(
    new Request(signedUrl(`/auth/connect/${id}/register`, recipient), {
      body: JSON.stringify({ appKey: recipient }),
      method: "POST",
    }),
  );
  expect(register.status).toBe(404);
  expect(model.caller(recipient)).toBeUndefined();
  const restored = createIndexdModel({ state: model.serialize() });
  expect(restored.connectionRequest(id)).toBeUndefined();
  expect(() => restored.approveConnection(id, "opaque")).toThrow(
    "unknown request",
  );
});
