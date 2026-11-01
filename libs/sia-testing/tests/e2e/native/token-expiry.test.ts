/** Each scenario runs in a new native process so no other recipient cache can supply tokens. */
import { randomBytes } from 'node:crypto';
import { withTokenCleanup } from './shared-token-checks.ts';
import { writeRecoveryRecord } from '../../../src/e2e/internal/recovery.mjs';
import { expect, it } from 'vitest';
import type { PinnedObject, Sdk, SharedSdk, SharingKey } from '@siafoundation/sia-storage';
import { approveIndexd, cleanupIndexd, type CleanupOptions, provisionIndexd } from '../../../src/e2e/internal/indexd-provision.mjs';
import { byteSource } from '../support/byte-streams.js';
import { readHostServiceConfig } from '../../../src/e2e/internal/config.js';
import { waitForFundingReady } from '../support/funding-readiness.js';
import { observeHostPayload, observeHostPayloadSettled } from '../support/host-observer.js';
import type { SharedTokenObserver } from '../support/shared-token-observer.js';

type Snapshot = ReturnType<SharedTokenObserver['snapshot']>;
const mode = process.env.SIA_NATIVE_TOKEN_SCENARIO ?? 'routing';

it.runIf(mode === 'routing')('routes an unregistered sharing key to the real app without provisioning', async () => {
  if (process.env.SIA_NATIVE_TOKEN_PROBE !== '1') throw new Error('Use the dedicated native token runner');
  const binding = await import('@siafoundation/sia-storage');
  await binding.initSia();
  binding.setLogger(() => { /* Signed request diagnostics must stay out of the test report. */ }, 'error');
  let unauthorized = false;
  try { await binding.SharedSdk.connect(process.env.SIA_TEST_INDEXD_URL!, randomBytes(32)); }
  catch (error) { unauthorized = String(error).includes('401'); }
  expect(unauthorized, 'The real app must deny an unregistered sharing key').toBe(true);
}, 30_000);

for (const scenario of ['key-expiry', 'revocation'] as const) {
  it.runIf(mode === scenario)(`native retained reads reject after delivered token deadlines following ${scenario}`, async () => {
    const controlURL = process.env.SIA_NATIVE_TOKEN_CONTROL;
    if (process.env.SIA_NATIVE_TOKEN_PROBE !== '1' || !controlURL) throw new Error('Use the dedicated native token runner');
    let record: CleanupOptions | undefined;
    let sdk: Sdk | undefined;
    let key: SharingKey | undefined;
    let revoked = false;
    let noToken = false;
    let keyExpiresAtMs = 0;
    const manifest = process.env.SIA_NATIVE_TOKEN_MANIFEST;
    if (!manifest) throw new Error('Private recovery manifest required');
    await withTokenCleanup(async () => {
      const binding = await import('@siafoundation/sia-storage');
      await binding.initSia();
      binding.setLogger(message => { if (message.includes('no account token for host')) noToken = true; }, 'debug');
      const config = readHostServiceConfig();
      const meta = { description: 'Observed native token deadline', id: randomBytes(32), name: 'Disposable native token test', serviceUrl: 'https://example.invalid' };
      const service = { binaryHash: process.env.SIA_TEST_CLUSTER_SHA256, pid: Number(process.env.SIA_TEST_CLUSTER_PID), started: process.env.SIA_TEST_CLUSTER_START_TICKS };
      await writeRecoveryRecord(manifest, { appID: meta.id.toString('hex'), service });
      const created = await provisionIndexd({ ...config, appID: meta.id.toString('hex'), fundTargetBytes: 67_108_864 });
      const quotaKey = created.quotaKey;
      record = { ...config, created, quotaKey };
      await writeRecoveryRecord(manifest, { created, quotaKey, service });
      const builder = new binding.Builder(config.indexdURL.toString(), meta);
      await builder.requestConnection();
      await approveIndexd({ connectKey: created.connectKey, indexdURL: config.indexdURL, responseURL: builder.responseUrl() });
      await builder.waitForApproval();
      sdk = await builder.register(binding.generateRecoveryPhrase());
      record.accountKey = sdk.appKey().publicKey();
      await writeRecoveryRecord(manifest, { accountKey: record.accountKey, created, quotaKey, service });
      await waitForFundingReady(async () => (await sdk!.account()).ready);
      const object = new binding.PinnedObject();
      object.updateMetadata(Buffer.from('owner'));
      const uploaded = await sdk.upload(object, byteSource([3, 1, 4, 1, 5, 9]), { dataShards: 10, parityShards: 20 });
      await sdk.pinObject(uploaded);
      const pinned = await sdk.account();
      const owner = sdk;
      const preserveOwner = async () => {
        const fresh = await owner.object(uploaded.id());
        expect(fresh.id()).toBe(uploaded.id());
        expect(Buffer.from(fresh.metadata()).toString()).toBe('owner');
        expect(fresh.size()).toBe(6n);
        await readObserved(owner, fresh);
        expect(await owner.account()).toMatchObject({ pinnedData: pinned.pinnedData, pinnedSize: pinned.pinnedSize });
      };
      await preserveOwner();
      const expiresAt = new Date(Date.now() + 15_000);
      keyExpiresAtMs = expiresAt.getTime();
      key = await sdk.createSharingKey('Observed native token deadline', scenario === 'key-expiry' ? expiresAt : undefined);
      await sdk.shareObject(key, uploaded);
      const recipient = await binding.SharedSdk.connect(config.indexdURL.toString(), key.seed());
      const retained = await recipient.object(uploaded.id());
      await readObserved(recipient, retained);
      if (scenario === 'key-expiry') expect(Date.now()).toBeLessThan(expiresAt.getTime());
      let snapshot = await observations();
      expect(snapshot.conservativeMaximumDeliveredExpiryMs).not.toBeNull();
      if (scenario === 'key-expiry') await sleep(Math.max(0, expiresAt.getTime() - Date.now() + 100));
      else { await sdk.revokeSharingKey(key); revoked = true; }
      const authorizationEndedAtMs = Date.now();
      if (scenario === 'key-expiry') expect(authorizationEndedAtMs).toBeGreaterThan(expiresAt.getTime());
      await denied(() => recipient.stats());
      await denied(() => recipient.object(uploaded.id()));
      const seed = key.seed();
      await denied(() => binding.SharedSdk.connect(config.indexdURL.toString(), seed));
      await readObserved(recipient, retained);
      const lastSuccessfulReadCompletedAtMs = Date.now();
      snapshot = await observations();
      const delivered = snapshot.observations.flatMap(item => item.hosts.map(host => host.validUntilMs));
      expect(delivered.length).toBeGreaterThan(0);
      expect(lastSuccessfulReadCompletedAtMs).toBeLessThan(Math.min(...delivered));
      await preserveOwner();
      const waitStarted = Date.now();
      for (;;) {
        snapshot = await observations();
        expect(snapshot.observations.some(item => item.kind === 'delivered' && item.requestStartedAtMs > authorizationEndedAtMs)).toBe(false);
        const maximum = snapshot.conservativeMaximumDeliveredExpiryMs;
        if (maximum === null) throw new Error();
        // Wire timestamps have whole-second boundaries; do not assert admission at equality.
        if (Date.now() > maximum + 1000) break;
        if (Date.now() - waitStarted > 600_000) throw new Error();
        await sleep(Math.min(1000, Math.max(1, maximum + 1001 - Date.now())));
      }
      noToken = false;
      const firstRejectingReadStartedAtMs = Date.now();
      let bytes = 0, chunks = 0, eof = false;
      const late = await observeHostPayloadSettled(process.env.SIA_TEST_CLUSTER_LOG, async () => {
        const reader = (recipient.download(retained) as ReadableStream<Uint8Array>).getReader();
        try {
          for (;;) {
            const item = await reader.read();
            if (item.done) { eof = true; return; }
            chunks++; bytes += item.value.length;
          }
        } finally {
          await reader.cancel().catch(() => undefined);
          reader.releaseLock();
        }
      });
      expect(late.status).toBe('rejected');
      expect(chunks).toBe(0); expect(bytes).toBe(0); expect(eof).toBe(false);
      expect(late.payloadRPCs).toEqual([]);
      expect(noToken).toBe(true);
      snapshot = await observations();
      expect(firstRejectingReadStartedAtMs).toBeGreaterThan(snapshot.conservativeMaximumDeliveredExpiryMs! + 1000);
      await preserveOwner();
      const published = await fetch(controlURL, {
        body: JSON.stringify({ authorizationEndedAtMs, firstRejectingReadStartedAtMs, maximumDeliveredExpiryMs: snapshot.conservativeMaximumDeliveredExpiryMs }),
        method: 'POST', signal: AbortSignal.timeout(10_000),
      });
      expect(published.status).toBe(204);
      console.log(JSON.stringify({ authorizationEndedAtMs, category: 'installed-native-sdk-read-admission', firstRejectingReadStartedAtMs, lastSuccessfulReadCompletedAtMs, maximumDeliveredExpiryMs: snapshot.conservativeMaximumDeliveredExpiryMs, noToken, payloadRPCsAfterDeadline: 0, scenario, statuses: snapshot.observations.map(item => item.status) }));
    }, {
      cleanup: async () => {
        if (!record) return;
        await cleanupIndexd(record);
        console.log(JSON.stringify({ category: 'known-resource-cleanup', kind: 'deleted', stage: 'account-connect-quota' }));
      },
      confirm: async () => {
        if (record) await writeRecoveryRecord(manifest, { accountKey: record.accountKey, cleanupVerified: true, created: record.created, quotaKey: record.quotaKey, service: { binaryHash: process.env.SIA_TEST_CLUSTER_SHA256, pid: Number(process.env.SIA_TEST_CLUSTER_PID), started: process.env.SIA_TEST_CLUSTER_START_TICKS } });
      },
      expired: () => scenario === 'key-expiry' && Date.now() > keyExpiresAtMs,
      revoke: async () => {
        if (!sdk || !key || revoked) return;
        await sdk.revokeSharingKey(key);
        console.log(JSON.stringify({ category: 'known-resource-cleanup', kind: 'deleted', stage: 'sharing-key' }));
      },
    });
  }, 960_000);
}

async function denied(operation: () => Promise<unknown>) {
  let unauthorized = false;
  try { await operation(); } catch (error) { unauthorized = String(error).includes('401'); }
  expect(unauthorized).toBe(true);
}
async function observations(): Promise<Snapshot> {
  const response = await fetch(process.env.SIA_NATIVE_TOKEN_CONTROL!, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error('Private observation failed');
  return await response.json() as Snapshot;
}
async function readObserved(sdk: Sdk | SharedSdk, object: PinnedObject) {
  const observed = await observeHostPayload(process.env.SIA_TEST_CLUSTER_LOG, async () => {
    const reader = (sdk.download(object) as ReadableStream<Uint8Array>).getReader();
    const bytes: number[] = [];
    try {
      for (;;) {
        const item = await reader.read();
        if (item.done) return bytes;
        bytes.push(...item.value);
        if (bytes.length > 6) throw new Error('Unexpected object length');
      }
    } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
  });
  expect(observed.result).toEqual([3, 1, 4, 1, 5, 9]);
  expect(observed.payloadRPCs.some(rpc => rpc.includes('ReadSector'))).toBe(true);
  expect(observed.payloadRPCs.some(rpc => rpc.includes('WriteSector'))).toBe(false);
}
async function sleep(ms: number) { await new Promise(resolve => setTimeout(resolve, ms)); }
