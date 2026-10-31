/** Connects the installed native SDK to an owned loopback emulator. */
import { beforeAll, expect } from 'vitest';
import type { Sdk } from '@siafoundation/sia-storage';
import { createIndexdHttpServer } from '../../../src/http/index.js';
import type { IndexdModel, IndexdModelOptions } from '../../../src/model/index.js';
const first = `ed25519:${'11'.repeat(32)}`;
const second = `ed25519:${'22'.repeat(32)}`;
const third = `ed25519:${'33'.repeat(32)}`;
let binding: typeof import('@siafoundation/sia-storage');
beforeAll(async () => {
  binding = await import('@siafoundation/sia-storage');
  await binding.initSia();
  const report = process.report.getReport();
  expect('sharedObjects' in report && Array.isArray(report.sharedObjects) && report.sharedObjects.some((path: unknown) => typeof path === 'string' && /sia-storage[^/\\]*\.node$/.test(path))).toBe(true);
});

export async function withSdk(run: (sdk: Sdk, queries: Record<string, string>[], model: IndexdModel, account: string) => Promise<void>, hosts: NonNullable<IndexdModelOptions['hosts']> = [
      { addresses: ['quic://127.0.0.1:9101'], countryCode: 'DE', goodForUpload: true, latitude: 52, longitude: 13, publicKey: first },
      { addresses: ['siamux://127.0.0.1:9102'], countryCode: 'US', goodForUpload: false, latitude: 40, longitude: -74, publicKey: second },
      { addresses: ['siamux://127.0.0.1:9103', 'quic://127.0.0.1:9104'], countryCode: 'DE', goodForUpload: true, latitude: 48, longitude: 11, publicKey: third },
    ]) {
  const queries: Record<string, string>[] = [];
  const server = createIndexdHttpServer({
    modelOptions: { hosts, now: () => new Date("2026-01-01T00:00:00Z") },
    responseOverride(request, response) {
      const url = new URL(request.url);
      if (['/hosts', '/objects'].includes(url.pathname)) queries.push(Object.fromEntries([...url.searchParams].filter(([key]) => ['after', 'country', 'key', 'limit', 'offset', 'protocol'].includes(key))));
      return response;
    },
  });
  try {
    const { port } = await server.listen();
    const key = new binding.AppKey(Buffer.alloc(32, 7));
    server.model.createAccount({ publicKey: key.publicKey() });
    const sdk = await new binding.Builder(`http://127.0.0.1:${port}`, { description: 'Emulated host queries', id: Buffer.alloc(32), name: 'SDK host tests', serviceUrl: 'https://example.invalid' }).connected(key);
    if (!sdk) throw new Error('SDK did not connect to its modeled account');
    await run(sdk, queries, server.model, key.publicKey());
  } finally { await server.close(); server.model.reset(); }
}
