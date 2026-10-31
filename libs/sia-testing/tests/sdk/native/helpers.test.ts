/** Checks SDK helpers in Node with public crypto vectors and observes the relay fallback without HTTP. */
import { spawnSync } from 'node:child_process';
import { createPublicKey, verify } from 'node:crypto';
import { channel } from 'node:diagnostics_channel';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const seed = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
const publicKey = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
const signature = [
  'e5564300c360ac729086e2cc806e828a',
  '84877f1eb8e5d974d873e06522490155',
  '5fb8821590a33bacc61e39701cf9b46b',
  'd25bf5f0595bbe24655141438e7a100b',
].join('');
let binding: typeof import('@siafoundation/sia-storage');

beforeAll(async () => {
  binding = await import('@siafoundation/sia-storage');
  await binding.initSia();
  const report = process.report.getReport();
  expect('sharedObjects' in report && Array.isArray(report.sharedObjects) && report.sharedObjects.some((path: unknown) => typeof path === 'string' && /sia-storage[^/\\]*\.node$/.test(path))).toBe(true);
});

it('returns false for Node relay checks without HTTP requests', async () => {
  const requests: unknown[] = [];
  const record = (message: unknown) => { requests.push(message); };
  const channels = [channel('undici:request:create'), channel('http.client.request.start')];
  for (const observed of channels) observed.subscribe(record);
  try {
    expect(await binding.detectPrivateRelay()).toBe(false);
    expect(await binding.detectPrivateRelay()).toBe(false);
    expect(requests).toEqual([]);
  } finally { for (const observed of channels) observed.unsubscribe(record); }
});

it('constructs the installed Node Builder with Buffer id without sending requests', () => {
  const requests: unknown[] = [];
  const record = (message: unknown) => { requests.push(message); };
  const channels = [channel('undici:request:create'), channel('http.client.request.start')];
  for (const observed of channels) observed.subscribe(record);
  try {
    const builder = new binding.Builder('http://127.0.0.1:1/', {
      description: 'Native ABI check', id: Buffer.alloc(32),
      name: 'Offline Builder', serviceUrl: 'https://example.invalid',
    });
    expect(builder).toBeInstanceOf(binding.Builder);
    expect(requests).toEqual([]);
  } finally { for (const observed of channels) observed.unsubscribe(record); }
});

describe('native AppKey helpers', () => {
  it('imports and exports seeds without sharing mutable buffers', () => {
    const input = Buffer.from(seed, 'hex');
    const key = new binding.AppKey(input);
    input.fill(0);
    expect(key.export().toString('hex')).toBe(seed);
    const exported = key.export();
    exported.fill(0);
    expect(key.publicKey()).toBe(`ed25519:${publicKey}`);
    const restored = new binding.AppKey(key.export());
    expect(restored.publicKey()).toBe(`ed25519:${publicKey}`);
  });

  it('signs the RFC 8032 empty-message vector for an independent verifier', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    const signed = key.sign(Buffer.alloc(0));
    expect(signed.toString('hex')).toBe(signature);
    const verifier = createPublicKey({ format: 'der', key: Buffer.from(`302a300506032b6570032100${publicKey}`, 'hex'), type: 'spki' });
    expect(verify(null, Buffer.alloc(0), verifier, signed)).toBe(true);
  });

  it('signs nonempty messages for an independent verifier', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    const message = Buffer.from([1, 2, 3, 4]);
    const verifier = createPublicKey({ format: 'der', key: Buffer.from(`302a300506032b6570032100${publicKey}`, 'hex'), type: 'spki' });
    expect(verify(null, message, verifier, key.sign(message))).toBe(true);
  });

  it('verifies the known empty-message signature', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    expect(key.verifySignature(Buffer.alloc(0), Buffer.from(signature, 'hex'))).toBe(true);
  });

  it('rejects a signature for a different message', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    expect(key.verifySignature(Buffer.from([1]), Buffer.from(signature, 'hex'))).toBe(false);
  });

  it('rejects an altered signature', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    const altered = Buffer.from(signature, 'hex');
    altered[0] = 0;
    expect(key.verifySignature(Buffer.alloc(0), altered)).toBe(false);
  });

  it('rejects a signature made by another key', () => {
    const other = new binding.AppKey(Buffer.alloc(32, 2));
    expect(other.publicKey()).not.toBe(`ed25519:${publicKey}`);
    expect(other.verifySignature(Buffer.alloc(0), Buffer.from(signature, 'hex'))).toBe(false);
  });

  it.each([0, 31, 33])('rejects a seed containing %i bytes', length => {
    expect(() => new binding.AppKey(Buffer.alloc(length))).toThrow();
  });

  it.each([0, 63, 65])('rejects a signature containing %i bytes', length => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    expect(() => key.verifySignature(Buffer.alloc(0), Buffer.alloc(length))).toThrow();
  });
});

describe('native sealed-object helpers', () => {
  it('opens sealed metadata without changing object identity', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    const object = new binding.PinnedObject();
    object.updateMetadata(Buffer.from([0, 1, 127, 128, 255]));
    const id = object.id();
    const opened = binding.PinnedObject.open(key, object.seal(key));
    expect(opened.id()).toBe(id);
    expect([...opened.metadata()]).toEqual([0, 1, 127, 128, 255]);
    expect(opened.size()).toBe(0n);
    expect(opened.encodedSize()).toBe(0n);
    expect(opened.slabs()).toEqual([]);
    expect(Number.isFinite(opened.createdAt().getTime())).toBe(true);
    expect(Number.isFinite(opened.updatedAt().getTime())).toBe(true);
    expect(opened.createdAt().getTime()).toBe(object.createdAt().getTime());
    expect(opened.updatedAt().getTime()).toBe(object.updatedAt().getTime());
  });

  it('rejects opening an object with another app key', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    const other = new binding.AppKey(Buffer.alloc(32, 2));
    const object = new binding.PinnedObject();
    object.updateMetadata(Buffer.from('owner metadata'));
    expect(() => binding.PinnedObject.open(other, object.seal(key))).toThrow();
  });

  for (const field of ['dataSignature', 'encryptedDataKey', 'encryptedMetadata', 'encryptedMetadataKey', 'metadataSignature'] as const) {
    it(`rejects an altered native ${field}`, () => {
      const key = new binding.AppKey(Buffer.from(seed, 'hex'));
      const object = new binding.PinnedObject();
      object.updateMetadata(Buffer.from('signed metadata'));
      const sealed = object.seal(key);
      const changed = Buffer.from(sealed[field]);
      changed[0] = changed[0] === 0 ? 1 : 0;
      expect(() => binding.PinnedObject.open(key, { ...sealed, [field]: changed })).toThrow();
    });
  }

  it('keeps sealed metadata separate from later object updates', () => {
    const key = new binding.AppKey(Buffer.from(seed, 'hex'));
    const object = new binding.PinnedObject();
    object.updateMetadata(Buffer.from('before'));
    const sealed = object.seal(key);
    object.updateMetadata(Buffer.from('after'));
    expect(binding.PinnedObject.open(key, sealed).metadata().toString()).toBe('before');
    expect(object.metadata().toString()).toBe('after');
  });

  it('copies metadata input and output buffers', () => {
    const object = new binding.PinnedObject();
    const input = Buffer.from([10, 20, 30]);
    object.updateMetadata(input);
    input.fill(0);
    const output = object.metadata();
    expect([...output]).toEqual([10, 20, 30]);
    output.fill(0);
    expect([...object.metadata()]).toEqual([10, 20, 30]);
  });
});

describe('native mnemonic validation', () => {
  it('accepts the BIP-39 zero-entropy mnemonic', () => {
    expect(() => binding.validateRecoveryPhrase('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about')).not.toThrow();
  });

  it.each([
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon',
    'unknownword abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    'abandon about',
  ])('rejects the invalid mnemonic %s', phrase => {
    expect(() => binding.validateRecoveryPhrase(phrase)).toThrow();
  });
});

describe('native encoded-size estimates', () => {
  it.each([
    { size: 0n, want: 0n },
    { size: 1n, want: 125_829_120n },
    { size: 41_943_040n, want: 125_829_120n },
    { size: 41_943_041n, want: 251_658_240n },
    { size: 83_886_080n, want: 251_658_240n },
  ])('rounds $size bytes to complete encoded slabs', ({ size, want }) => {
    expect(binding.encodedSize(size, 10, 20)).toBe(want);
  });

  it('uses the requested erasure-coding ratio', () => {
    expect(binding.encodedSize(8_388_608n, 2, 1)).toBe(12_582_912n);
  });

  it('rejects zero data shards without aborting the process', () => {
    // A native panic would kill Vitest, so this invalid input runs in a child.
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      import { initSia, encodedSize } from '@siafoundation/sia-storage';
      await initSia();
      try {
        encodedSize(1n, 0, 20);
        console.log(JSON.stringify({ rejected: false }));
      } catch {
        console.log(JSON.stringify({ rejected: true }));
      }
    `], { cwd: fileURLToPath(new URL('../../../', import.meta.url)), encoding: 'utf8', timeout: 30_000 });
    expect(result.error).toBeUndefined();
    expect(result.signal).toBeNull();
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ rejected: true });
  });
});
