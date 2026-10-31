/** Exercises caller selection through MSW without opening a network listener. */
import { expect, it } from 'vitest';
import { setupIndexdServer } from '../../src/msw/node.js';
import { other, owner, signedUrl } from '../fixtures/auth.js';

it('rejects ambient browser and Basic credentials through the MSW adapter', async () => {
  const server = setupIndexdServer();
  server.model.createAccount({ publicKey: owner });
  server.listen({ onUnhandledRequest: 'error' });
  try {
    const response = await fetch('http://localhost/account', { headers: { authorization: 'Basic dGVzdDp0ZXN0', 'sec-fetch-mode': 'cors', 'user-agent': 'Mozilla' } });
    expect(response.status).toBe(401);
  } finally { server.close(); }
});
it('mutates only the signed account through the MSW adapter', async () => {
  const server = setupIndexdServer();
  server.model.createAccount({ publicKey: owner });
  server.model.createAccount({ publicKey: other });
  server.listen({ onUnhandledRequest: 'error' });
  try {
    const response = await fetch(signedUrl(`/objects?key=${owner}`, other), { body: JSON.stringify({ id: 'other-object', slabs: [] }), method: 'POST' });
    expect(response.status).toBe(204);
    expect(server.model.accountStats(owner)).toEqual({ objectCount: 0, pinnedSize: 0 });
    expect(server.model.accountStats(other)).toEqual({ objectCount: 1, pinnedSize: 0 });
    expect(await (await fetch(signedUrl('/account', other))).json()).toMatchObject({ accountKey: 'ed25519:2222222222222222222222222222222222222222222222222222222222222222' });
  } finally { server.close(); }
});
it('keeps pending approval and reset visible through the MSW adapter', async () => {
  const server = setupIndexdServer();
  server.listen({ onUnhandledRequest: 'error' });
  try {
    const response = await fetch(signedUrl('/auth/connect', other), { method: 'POST' });
    const { id } = await response.json() as { id: string };
    const status = () => fetch(signedUrl(`/auth/connect/${id}/status`, other));
    expect(await (await status()).json()).toEqual({ approved: false, reconnecting: false });
    expect((await fetch(`https://indexd.test/auth/connect/${id}`, { headers: { authorization: 'Basic dGVzdDp0ZXN0' }, method: 'POST' })).status).toBe(204);
    expect(await (await status()).json()).toMatchObject({ approved: true });
    server.model.reset();
    expect((await status()).status).toBe(401);
  } finally { server.close(); }
});
