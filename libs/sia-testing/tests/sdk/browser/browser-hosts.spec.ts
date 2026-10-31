/** Checks browser SDK host queries through the loopback HTTP adapter, not through hosts. */
import { test as base, expect } from '@playwright/test';
import { createIndexdHttpServer } from '../../../src/http/index.js';
import type {} from '../app/hosts-probe.js';
import { hostDistanceCases } from '../../fixtures/host-distance.js';

const first = `ed25519:${'11'.repeat(32)}`;
const second = `ed25519:${'22'.repeat(32)}`;
const third = `ed25519:${'33'.repeat(32)}`;
const test = base.extend<{ emulatorURL: string }>({
  emulatorURL: async ({ page }, use) => {
    const protocols: (null | string)[] = [];
    const server = createIndexdHttpServer({
      allowedOrigin: 'http://127.0.0.1:4179',
      modelOptions: { hosts: [
        { addresses: ['quic://127.0.0.1:9101'], countryCode: 'DE', goodForUpload: true, latitude: 52, longitude: 13, publicKey: first },
        { addresses: ['siamux://127.0.0.1:9102'], countryCode: 'US', goodForUpload: false, latitude: 40, longitude: -74, publicKey: second },
        { addresses: ['siamux://127.0.0.1:9103', 'quic://127.0.0.1:9104'], countryCode: 'DE', goodForUpload: true, latitude: 48, longitude: 11, publicKey: third },
      ] },
      responseOverride(request, response) {
        const url = new URL(request.url);
        if (url.pathname === '/hosts') protocols.push(url.searchParams.get('protocol'));
        return response;
      },
    });
    try {
      const { port } = await server.listen();
      server.model.createAccount({ publicKey: 'ed25519:d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a' });
      await page.goto('/hosts-probe.html');
      await expect(page.locator('#status')).toHaveText('ready');
      await use(`http://127.0.0.1:${port}`);
    } finally {
      await server.close(); server.model.reset();
      expect(protocols.length).toBeGreaterThan(0);
      expect(protocols).toContain('quic');
    }
  },
});

test('decodes QUIC-capable host records through the browser SDK', async ({ emulatorURL, page }) => {
  const hosts = await page.evaluate(url => window.__querySdkHosts(url), emulatorURL);
  expect(hosts.map(host => host.publicKey)).toEqual([first, third]);
  expect(hosts[0]).toEqual({ addresses: [{ address: '127.0.0.1:9101', protocol: 'quic' }], countryCode: 'DE', goodForUpload: true, latitude: 52, longitude: 13, publicKey: first });
});

test('applies browser country filtering before page offset and limit', async ({ emulatorURL, page }) => {
  const hosts = await page.evaluate(url => window.__querySdkHosts(url, { country: 'DE', limit: 1, offset: 1 }), emulatorURL);
  expect(hosts.map(host => host.publicKey)).toEqual([third]);
  expect(await page.evaluate(url => window.__querySdkHosts(url, { country: 'GB' }), emulatorURL)).toEqual([]);
});

test('orders browser hosts by distance before paging', async ({ emulatorURL, page }) => {
  const nearest = await page.evaluate(url => window.__querySdkHosts(url, { country: 'DE', limit: 1, location: { latitude: 48, longitude: 11 } }), emulatorURL);
  expect(nearest.map(host => host.publicKey)).toEqual([third]);
  const following = await page.evaluate(url => window.__querySdkHosts(url, { country: 'DE', limit: 1, location: { latitude: 48, longitude: 11 }, offset: 1 }), emulatorURL);
  expect(following.map(host => host.publicKey)).toEqual([first]);
});

for (const scenario of hostDistanceCases) {
  base(`orders browser ${scenario.name} by point distance before paging`, async ({ page }) => {
    const ids = [first, third] as const;
    const hosts = scenario.coordinates.map((coordinates, index) => {
      const publicKey = ids[index];
      if (!publicKey) throw new Error('Distance fixture has no public key');
      return { ...coordinates, addresses: ['quic://127.0.0.1:9101'], publicKey };
    });
    const server = createIndexdHttpServer({ allowedOrigin: 'http://127.0.0.1:4179', modelOptions: { hosts } });
    try {
      const { port } = await server.listen();
      server.model.createAccount({ publicKey: 'ed25519:d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a' });
      await page.goto('/hosts-probe.html');
      await expect(page.locator('#status')).toHaveText('ready');
      const url = `http://127.0.0.1:${port}`;
      const expected = scenario.order.map(index => ids[index]);
      expect((await page.evaluate(({ location, url }) => window.__querySdkHosts(url, { location }), { location: scenario.location, url })).map(host => host.publicKey)).toEqual(expected);
      expect((await page.evaluate(({ location, url }) => window.__querySdkHosts(url, { limit: 1, location, offset: 1 }), { location: scenario.location, url })).map(host => host.publicKey)).toEqual([expected[1]]);
    } finally { await server.close(); server.model.reset(); }
  });
}

test('returns an empty exhausted browser host page', async ({ emulatorURL, page }) => {
  const hosts = await page.evaluate(url => window.__querySdkHosts(url, { limit: 1, offset: 1 }), emulatorURL);
  expect(hosts.map(host => host.publicKey)).toEqual([third]);
  expect(await page.evaluate(url => window.__querySdkHosts(url, { limit: 1, offset: 2 }), emulatorURL)).toEqual([]);
});
