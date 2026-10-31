/** Runs native SDK host queries against the loopback emulator, never against storage hosts. */
import { expect, it } from 'vitest';
import type { HostQuery } from '@siafoundation/sia-storage';
import { withSdk } from './control.js';
import { createHostInfo } from '../../../src/fixtures/hosts.js';
import { hostDistanceCases } from '../../fixtures/host-distance.js';

const first = `ed25519:${'11'.repeat(32)}`;
const second = `ed25519:${'22'.repeat(32)}`;
const third = `ed25519:${'33'.repeat(32)}`;
it('decodes configured host records through the native SDK', async () => {
  await withSdk(async sdk => {
    const hosts = await sdk.hosts();
    expect(hosts.map(host => host.publicKey)).toEqual([first, second, third]);
    expect(hosts[0]).toEqual({ addresses: [{ address: '127.0.0.1:9101', protocol: 'Quic' }], countryCode: 'DE', goodForUpload: true, latitude: 52, longitude: 13, publicKey: first });
  });
});

it('decodes the default host fixture through the native SDK', async () => {
  await withSdk(async sdk => {
    const hosts = await sdk.hosts();
    expect(hosts).toHaveLength(1);
    expect(hosts[0]).toMatchObject({ addresses: [{ address: 'host.example.test:443', protocol: 'Quic' }], countryCode: 'US', goodForUpload: true });
    expect(hosts[0]?.publicKey).toMatch(/^ed25519:[0-9a-f]{64}$/);
  }, [createHostInfo()]);
});

it('applies country filtering before the SDK page offset and limit', async () => {
  await withSdk(async (sdk, queries) => {
    expect((await sdk.hosts({ country: 'DE', limit: 1, offset: 1 })).map(host => host.publicKey)).toEqual([third]);
    expect(await sdk.hosts({ country: 'GB' })).toEqual([]);
    expect(queries).toContainEqual({ country: 'DE', limit: '1', offset: '1' });
  });
});

it('filters by protocol while retaining the selected host addresses', async () => {
  await withSdk(async (sdk, queries) => {
    // The Node declaration has a const enum, but the package exports no enum object.
    const protocol = 'Quic' as NonNullable<HostQuery['protocol']>;
    const hosts = await sdk.hosts({ protocol });
    expect(hosts.map(host => host.publicKey)).toEqual([first, third]);
    expect(hosts[1]?.addresses).toEqual([{ address: '127.0.0.1:9103', protocol: 'SiaMux' }, { address: '127.0.0.1:9104', protocol: 'Quic' }]);
    expect(queries).toContainEqual({ protocol: 'quic' });
  });
});

it('orders SDK hosts by distance before paging', async () => {
  await withSdk(async sdk => {
    expect((await sdk.hosts({ country: 'DE', limit: 1, location: { latitude: 48, longitude: 11 } })).map(host => host.publicKey)).toEqual([third]);
    expect((await sdk.hosts({ country: 'DE', limit: 1, location: { latitude: 48, longitude: 11 }, offset: 1 })).map(host => host.publicKey)).toEqual([first]);
    expect((await sdk.hosts({ limit: 1, location: { latitude: 40, longitude: -74 } })).map(host => host.publicKey)).toEqual([second]);
  });
});

for (const scenario of hostDistanceCases) {
  it(`orders native ${scenario.name} by point distance before paging`, async () => {
    const ids = [first, third] as const;
    await withSdk(async sdk => {
      const expected = scenario.order.map(index => ids[index]);
      expect((await sdk.hosts({ location: scenario.location })).map(host => host.publicKey)).toEqual(expected);
      expect((await sdk.hosts({ limit: 1, location: scenario.location, offset: 1 })).map(host => host.publicKey)).toEqual([expected[1]]);
    }, scenario.coordinates.map((coordinates, index) => {
      const publicKey = ids[index];
      if (!publicKey) throw new Error('Distance fixture has no public key');
      return { ...coordinates, addresses: ['quic://127.0.0.1:9101'], publicKey };
    }));
  });
}

it('returns an empty exhausted SDK host page', async () => {
  await withSdk(async sdk => {
    expect((await sdk.hosts({ limit: 1, offset: 1 })).map(host => host.publicKey)).toEqual([second]);
    expect(await sdk.hosts({ limit: 1, offset: 3 })).toEqual([]);
  });
});
