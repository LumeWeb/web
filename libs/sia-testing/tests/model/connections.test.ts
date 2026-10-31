import { describe, expect, it } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

describe("Indexd model connections", () => {
  it("expires an unapproved connection request", () => {
    let now = new Date("2026-01-01T00:00:00Z");
    const model = createIndexdModel({ now: () => now });
    const request = model.requestConnection({ appId: "app", publicKey: "ephemeral" });
    now = new Date("2026-01-01T00:11:00Z");

    expect(() => model.approveConnection(request.id, "connect-key")).toThrow("expired");
  });

  it("rejects an unknown connection request", () => {
    const model = createIndexdModel();

    expect(() => model.approveConnection("missing", "connect-key")).toThrow("unknown request missing");
  });

  it("registers an approved connection under its app key", () => {
    const model = createIndexdModel();
    const request = model.requestConnection({ appId: "app", publicKey: "ephemeral" });
    model.approveConnection(request.id, "connect-key");

    expect(model.registerConnection(request.id, "app-key")).toEqual({ id: "app-key", publicKey: "app-key" });
    expect(model.caller("app-key")?.id).toBe("app-key");
  });
});

it('returns connection signer and approval snapshots without exposing mutable dates', () => {
  const model = createIndexdModel({ now: () => new Date('2030-01-01T00:00:00Z') });
  const request = model.requestConnection({ appId: 'app', publicKey: 'ephemeral' });
  request.expiresAt.setTime(0);
  expect(model.connectionRequest(request.id)).toEqual({ approved: false, expiresAt: new Date('2030-01-01T00:10:00Z'), publicKey: 'ephemeral' });
  const status = model.connectionRequest(request.id)!;
  status.approved = true;
  status.publicKey = 'foreign';
  status.expiresAt.setTime(0);
  expect(model.connectionRequest(request.id)).toEqual({ approved: false, expiresAt: new Date('2030-01-01T00:10:00Z'), publicKey: 'ephemeral' });
  model.approveConnection(request.id, 'opaque');
  expect(model.connectionRequest(request.id)?.approved).toBe(true);
});
it('requires approval and consumes the registered request', () => {
  const model = createIndexdModel();
  const { id } = model.requestConnection({ appId: 'app', publicKey: 'ephemeral' });
  expect(() => model.registerConnection(id, 'app-key')).toThrow('not approved');
  expect(model.caller('app-key')).toBeUndefined();
  model.approveConnection(id, 'opaque');
  model.registerConnection(id, 'app-key');
  expect(model.connectionRequest(id)).toBeUndefined();
  expect(() => model.registerConnection(id, 'other')).toThrow('unknown request');
  expect(() => model.approveConnection(id, 'opaque')).toThrow('unknown request');
});
it('accepts the connection expiry boundary and rejects all operations one millisecond later', () => {
  let now = new Date('2030-01-01T00:00:00Z');
  const model = createIndexdModel({ now: () => now });
  const { id } = model.requestConnection({ appId: 'app', publicKey: 'ephemeral' });
  now = new Date('2030-01-01T00:10:00Z');
  model.approveConnection(id, 'opaque');
  expect(model.connectionRequest(id)?.approved).toBe(true);
  now = new Date('2030-01-01T00:10:00.001Z');
  expect(() => model.connectionRequest(id)).toThrow('expired');
  expect(() => model.approveConnection(id, 'opaque')).toThrow('expired');
  expect(() => model.registerConnection(id, 'app-key')).toThrow('expired');
  expect(model.caller('app-key')).toBeUndefined();
});
