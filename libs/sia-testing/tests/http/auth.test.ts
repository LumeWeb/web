/** Caller scopes at the HTTP boundary, without cryptographic signature verification. */
import { expect, it } from 'vitest';
import { createIndexdDispatcher } from '../../src/dispatcher.js';
import { createIndexdModel } from '../../src/model/index.js';
import { credentials, other, owner, recipient, signedUrl } from '../fixtures/auth.js';

function setup() {
  const model = createIndexdModel();
  model.createAccount({ publicKey: owner });
  model.createAccount({ publicKey: other });
  const dispatch = createIndexdDispatcher(model, { now: () => new Date('2030-01-01T00:00:00.000Z') });
  return { dispatch, model };
}
it.each([
  ['browser metadata', 'https://indexd.test/account', { 'sec-fetch-mode': 'cors' }],
  ['browser agent', 'https://indexd.test/account', { 'user-agent': 'Mozilla' }],
  ['localhost', 'http://localhost/account', {}],
  ['loopback', 'http://127.0.0.1/account', {}],
  ['Basic header', 'https://indexd.test/account', { authorization: 'Basic dGVzdDp0ZXN0' }],
  ['Bearer header', 'https://indexd.test/account', { authorization: 'Bearer anything' }],
] as const)('rejects unidentified callers with %s', async (_name, url, headers) => {
  expect((await setup().dispatch(new Request(url, { headers }))).status).toBe(401);
});
it.each([
  ['missing credential', 'sc', null], ['missing signature', 'ss', null], ['missing expiry', 'sv', null],
  ['raw key', 'sc', owner], ['short key', 'sc', 'b3duZXI='],
  ['long key', 'sc', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'],
  ['bad key encoding', 'sc', '!'.repeat(44)],
  ['unpadded key', 'sc', 'ERERERERERERERERERERERERERERERERERERERERERE'],
  ['unknown key', 'sc', 'MzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM='],
  ['short signature', 'ss', 'AAAA'], ['65-byte signature', 'ss', 'A'.repeat(87) + '='],
  ['bad signature encoding', 'ss', '!'.repeat(88)],
  ['unpadded signature', 'ss', 'A'.repeat(86)], ['long signature', 'ss', 'A'.repeat(92)],
  ['fractional expiry', 'sv', '1893456000.5'], ['invalid expiry', 'sv', 'tomorrow'],
  ['overflow expiry', 'sv', '9223372036854775808'], ['expired', 'sv', '1893455999'],
] as const)('rejects %s', async (_name, field, value) => {
  const url = signedUrl('/account');
  if (value === null) url.searchParams.delete(field); else url.searchParams.set(field, value);
  expect((await setup().dispatch(new Request(url))).status).toBe(401);
});
it('accepts the exact expiry boundary and rejects one millisecond after it', async () => {
  const { dispatch, model } = setup();
  const url = signedUrl('/account'); url.searchParams.set('sv', '1893456000');
  expect((await dispatch(new Request(url))).status).toBe(200);
  const after = createIndexdDispatcher(model, { now: () => new Date('2030-01-01T00:00:00.001Z') });
  expect((await after(new Request(url))).status).toBe(401);
});
it('keeps account reads and mutations under the signer rather than query-selected keys', async () => {
  const { dispatch, model } = setup();
  model.pinObject(owner, { id: 'private', slabs: [] });
  const url = signedUrl(`/objects/private?key=${owner}&publicKey=${owner}`, other);
  expect((await dispatch(new Request(url))).status).toBe(404);
  expect((await dispatch(new Request(url, { method: 'DELETE' }))).status).toBe(404);
  expect(model.object(owner, 'private')).toEqual({ id: 'private', slabs: [] });
  expect(await (await dispatch(new Request(signedUrl('/account', other)))).json()).toMatchObject({ accountKey: 'ed25519:2222222222222222222222222222222222222222222222222222222222222222' });
  expect((await dispatch(new Request(signedUrl('/auth/check', recipient)))).status).toBe(401);
});
it('requires the active sharing signer on every recipient route', async () => {
  const { dispatch, model } = setup();
  model.pinObject(owner, { id: 'private', slabs: [] });
  model.createSharingKey(owner, { nonce: 'n', publicKey: recipient });
  model.attachSharedObject(owner, recipient, { dataSignature: 's', encryptedDataKey: 'k', objectID: 'private' });
  for (const path of ['/shared', '/shared/hosts', '/shared/objects', '/shared/objects/private']) {
    expect((await dispatch(new Request(signedUrl(`${path}?key=${recipient}&publicKey=${recipient}`, other)))).status).toBe(401);
    expect((await dispatch(new Request(signedUrl(`${path}?key=${other}`, recipient)))).status).toBe(200);
  }
  model.revokeSharingKey(owner, recipient);
  expect((await dispatch(new Request(signedUrl('/shared/hosts', recipient)))).status).toBe(401);
});
it('rejects expired sharing signers', async () => {
  const { dispatch, model } = setup();
  model.createSharingKey(owner, { expiresAt: '2000-01-01T00:00:00Z', nonce: 'n', publicKey: recipient });
  expect((await dispatch(new Request(signedUrl('/shared/hosts', recipient)))).status).toBe(401);
});
it('binds connection status and registration to the ephemeral request signer', async () => {
  const { dispatch, model } = setup();
  const response = await dispatch(new Request(signedUrl('/auth/connect', recipient), { body: JSON.stringify({ appId: 'app', publicKey: owner }), method: 'POST' }));
  expect(response.status).toBe(200);
  const { id } = await response.json() as { id: string };
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, other)))).status).toBe(401);
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, recipient)))).status).toBe(200);
  const approval = new Request(`https://indexd.test/auth/connect/${id}`, { headers: { authorization: 'Basic dGVzdDp0ZXN0' }, method: 'POST' });
  expect((await dispatch(approval)).status).toBe(204);
  const register = (key: string) => new Request(signedUrl(`/auth/connect/${id}/register`, key), { body: JSON.stringify({ appKey: recipient }), method: 'POST' });
  expect((await dispatch(register(other))).status).toBe(401);
  expect((await dispatch(register(recipient))).status).toBe(204);
  expect(model.caller(recipient)?.publicKey).toBe('ed25519:3333333333333333333333333333333333333333333333333333333333333333');
  expect((await dispatch(new Request(signedUrl('/auth/check', recipient)))).status).toBe(204);
});
it('requires signed credentials for connection requests and status', async () => {
  const { dispatch } = setup();
  expect((await dispatch(new Request('https://indexd.test/auth/connect', { method: 'POST' }))).status).toBe(401);
  expect((await dispatch(new Request('https://indexd.test/auth/connect/unknown/status'))).status).toBe(401);
  const url = new URL('https://indexd.test/account');
  credentials().forEach((value, name) => url.searchParams.set(name, value));
  url.searchParams.set('sc', 'ERERERERERERERERERERERERERERERERERERERERERE=');
  expect((await dispatch(new Request(url))).status).toBe(200);
});
it('keeps status pending without a secret until Basic approval', async () => {
  const { dispatch } = setup();
  const response = await dispatch(new Request(signedUrl('/auth/connect', recipient), { method: 'POST' }));
  const { id } = await response.json() as { id: string };
  const status = () => dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, recipient)));
  expect(await (await status()).json()).toEqual({ approved: false, reconnecting: false });
  expect((await dispatch(new Request(`https://indexd.test/auth/connect/${id}`, { method: 'POST' }))).status).toBe(401);
  expect(await (await status()).json()).toEqual({ approved: false, reconnecting: false });
  expect((await dispatch(new Request(`https://indexd.test/auth/connect/${id}`, { headers: { authorization: 'Basic dGVzdDp0ZXN0' }, method: 'POST' }))).status).toBe(204);
  expect(await (await status()).json()).toEqual({ approved: true, reconnecting: false, userSecret: '0000000000000000000000000000000000000000000000000000000000000000' });
});
it('clears dispatcher-visible approval and signer state on model reset', async () => {
  const { dispatch, model } = setup();
  const request = model.requestConnection({ appId: 'app', publicKey: recipient });
  // Create through the dispatcher too so stale adapter state is observable.
  const response = await dispatch(new Request(signedUrl('/auth/connect', recipient), { method: 'POST' }));
  const { id } = await response.json() as { id: string };
  model.approveConnection(id, 'opaque');
  model.reset();
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, recipient)))).status).not.toBe(200);
  const reused = model.requestConnection({ appId: 'app', publicKey: other });
  expect(reused.id).toBe(request.id);
  const next = model.requestConnection({ appId: 'app', publicKey: other });
  expect(next.id).toBe(id);
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, recipient)))).status).toBe(401);
  expect(await (await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, other)))).json()).toEqual({ approved: false, reconnecting: false });
});
it('rejects registration before approval and removes consumed status', async () => {
  const { dispatch, model } = setup();
  const { id } = model.requestConnection({ appId: 'app', publicKey: recipient });
  const register = () => dispatch(new Request(signedUrl(`/auth/connect/${id}/register`, recipient), { body: JSON.stringify({ appKey: recipient }), method: 'POST' }));
  expect((await register()).status).toBe(401);
  expect(model.caller(recipient)).toBeUndefined();
  model.approveConnection(id, 'opaque');
  expect((await register()).status).toBe(204);
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, recipient)))).status).toBe(401);
  expect((await register()).status).toBe(401);
  expect((await dispatch(new Request(`https://indexd.test/auth/connect/${id}`, { headers: { authorization: 'Basic dGVzdDp0ZXN0' }, method: 'POST' }))).status).toBe(404);
});
it('rejects expired connection status, approval and registration', async () => {
  let now = new Date('2030-01-01T00:00:00Z');
  const model = createIndexdModel({ now: () => now });
  const dispatch = createIndexdDispatcher(model, { now: () => now });
  const { id } = model.requestConnection({ appId: 'app', publicKey: recipient });
  model.approveConnection(id, 'opaque');
  now = new Date('2030-01-01T00:10:00.001Z');
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/status`, recipient)))).status).toBe(401);
  expect((await dispatch(new Request(`https://indexd.test/auth/connect/${id}`, { headers: { authorization: 'Basic dGVzdDp0ZXN0' }, method: 'POST' }))).status).toBe(401);
  expect((await dispatch(new Request(signedUrl(`/auth/connect/${id}/register`, recipient), { body: JSON.stringify({ appKey: recipient }), method: 'POST' }))).status).toBe(401);
  expect(model.caller(recipient)).toBeUndefined();
});

it.each([['GET', '/auth/unknown'], ['POST', '/auth/check'], ['GET', '/auth']] as const)('rejects registered caller route %s %s', async (method, path) => {
  const { dispatch } = setup();
  const response = await dispatch(new Request(signedUrl(path), { method }));
  expect(response.status).toBe(404);
  const body = await response.json() as { error: string };
  expect(body.error).toContain('unsupported route');
  expect((await dispatch(new Request(`https://indexd.test${path}`, { method }))).status).toBe(401);
});
