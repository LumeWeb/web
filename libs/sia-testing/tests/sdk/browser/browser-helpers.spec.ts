/** Checks real SDK helpers while allowing only same-origin static asset requests. */
import { createPublicKey, verify } from 'node:crypto';
import { test as base, expect, type Page } from '@playwright/test';
import type {} from '../app/helpers.js';

const seed = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
const publicKey = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
const signature = [
  'e5564300c360ac729086e2cc806e828a',
  '84877f1eb8e5d974d873e06522490155',
  '5fb8821590a33bacc61e39701cf9b46b',
  'd25bf5f0595bbe24655141438e7a100b',
].join('');
const seedBytes = [...Buffer.from(seed, 'hex')];
const signatureBytes = [...Buffer.from(signature, 'hex')];
const test = base.extend<{ helperPage: Page }>({
  helperPage: async ({ page }, use) => {
    const unexpected: string[] = [];
    const wasm: string[] = [];
    await page.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      const asset = request.resourceType() === 'document' ? url.pathname === '/helpers.html' : ['font', 'image', 'script', 'stylesheet'].includes(request.resourceType()) || url.pathname.endsWith('.wasm');
      if (url.origin !== 'http://127.0.0.1:4179' || request.method() !== 'GET' || !asset) {
        unexpected.push(`${request.method()} ${request.url()}`);
        return route.abort();
      }
      return route.continue();
    });
    page.on('response', response => {
      if (/\.wasm(?:\?|$)/.test(response.url()) && response.ok()) wasm.push(response.url());
    });
    try {
      await page.goto('/helpers.html');
      await expect(page.locator('#status')).toHaveText('ready');
      expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
      await use(page);
    } finally {
      expect(unexpected).toEqual([]);
      expect(wasm.length).toBeGreaterThan(0);
    }
  },
});

test('returns false for relay checks in Chromium without HTTP requests', async ({ helperPage }) => {
  const result = await helperPage.evaluate(async () => {
    const first = window.__sdkHelpers.detectPrivateRelay();
    const second = window.__sdkHelpers.detectPrivateRelay();
    return { first: await first, second: await second, userAgent: navigator.userAgent };
  });
  expect(result.userAgent).toMatch(/Chrome\//);
  expect(result).toMatchObject({ first: false, second: false });
});

test('imports and exports browser keys without sharing mutable buffers', async ({ helperPage }) => {
  const result = await helperPage.evaluate(bytes => {
    const input = Uint8Array.from(bytes);
    const key = new window.__sdkHelpers.AppKey(input);
    let restored: InstanceType<typeof window.__sdkHelpers.AppKey> | undefined;
    try {
      input.fill(0);
      const exported = key.export();
      const exportedBytes = [...exported];
      exported.fill(0);
      restored = new window.__sdkHelpers.AppKey(key.export());
      return { exportedBytes, publicKey: key.publicKey(), restored: restored.publicKey() };
    } finally { restored?.free(); key.free(); }
  }, seedBytes);
  expect(Buffer.from(result.exportedBytes).toString('hex')).toBe(seed);
  expect(result.publicKey).toBe(`ed25519:${publicKey}`);
  expect(result.restored).toBe(`ed25519:${publicKey}`);
});

for (const input of [{ bytes: [], name: 'empty' }, { bytes: [1, 2, 3, 4], name: 'nonempty' }]) {
  test(`signs the ${input.name} message for an independent verifier`, async ({ helperPage }) => {
    const signed = await helperPage.evaluate(({ bytes, seedBytes }) => {
      const key = new window.__sdkHelpers.AppKey(Uint8Array.from(seedBytes));
      try { return [...key.sign(Uint8Array.from(bytes))]; }
      finally { key.free(); }
    }, { bytes: input.bytes, seedBytes });
    if (input.name === 'empty') expect(Buffer.from(signed).toString('hex')).toBe(signature);
    const verifier = createPublicKey({ format: 'der', key: Buffer.from(`302a300506032b6570032100${publicKey}`, 'hex'), type: 'spki' });
    expect(verify(null, Buffer.from(input.bytes), verifier, Buffer.from(signed))).toBe(true);
  });
}

for (const input of [
  { altered: false, message: [], name: 'accepts the known browser signature', other: false, want: true },
  { altered: false, message: [1], name: 'rejects a changed browser message', other: false, want: false },
  { altered: true, message: [], name: 'rejects a changed browser signature', other: false, want: false },
  { altered: false, message: [], name: 'rejects another browser signing key', other: true, want: false },
]) {
  test(input.name, async ({ helperPage }) => {
    const result = await helperPage.evaluate(({ input, seedBytes, signatureBytes }) => {
      const key = new window.__sdkHelpers.AppKey(input.other ? new Uint8Array(32).fill(2) : Uint8Array.from(seedBytes));
      const signed = Uint8Array.from(signatureBytes);
      if (input.altered) signed[0] = 0;
      try { return { publicKey: key.publicKey(), valid: key.verifySignature(Uint8Array.from(input.message), signed) }; }
      finally { key.free(); }
    }, { input, seedBytes, signatureBytes });
    expect(result.valid).toBe(input.want);
    if (input.other) expect(result.publicKey).not.toBe(`ed25519:${publicKey}`);
    else expect(result.publicKey).toBe(`ed25519:${publicKey}`);
  });
}

for (const length of [0, 31, 33]) {
  test(`rejects a browser key seed containing ${length} bytes`, async ({ helperPage }) => {
    await expect(helperPage.evaluate(length => {
      const key = new window.__sdkHelpers.AppKey(new Uint8Array(length));
      key.free();
    }, length)).rejects.toThrow();
  });
}
for (const length of [0, 63, 65]) {
  test(`rejects a browser signature containing ${length} bytes`, async ({ helperPage }) => {
    await expect(helperPage.evaluate(({ length, seedBytes }) => {
      const key = new window.__sdkHelpers.AppKey(Uint8Array.from(seedBytes));
      try { return key.verifySignature(new Uint8Array(), new Uint8Array(length)); }
      finally { key.free(); }
    }, { length, seedBytes })).rejects.toThrow();
  });
}

test('opens sealed browser metadata without changing object identity', async ({ helperPage }) => {
  const result = await helperPage.evaluate(seedBytes => {
    const { AppKey, PinnedObject } = window.__sdkHelpers;
    const key = new AppKey(Uint8Array.from(seedBytes));
    const object = new PinnedObject();
    let opened: InstanceType<typeof PinnedObject> | undefined;
    try {
      object.updateMetadata(Uint8Array.from([0, 1, 127, 128, 255]));
      const id = object.id();
      opened = PinnedObject.open(key, structuredClone(object.seal(key)));
      return {
        created: opened.createdAt().getTime(), encoded: opened.encodedSize(), id,
        metadata: [...opened.metadata()], openedID: opened.id(),
        originalCreated: object.createdAt().getTime(), originalUpdated: object.updatedAt().getTime(),
        size: opened.size(), slabs: opened.slabs(), updated: opened.updatedAt().getTime(),
      };
    } finally { opened?.free(); object.free(); key.free(); }
  }, seedBytes);
  expect(result.openedID).toBe(result.id);
  expect(result.metadata).toEqual([0, 1, 127, 128, 255]);
  expect(result.size).toBe(0);
  expect(result.encoded).toBe(0);
  expect(result.slabs).toEqual([]);
  expect(Number.isFinite(result.created)).toBe(true);
  expect(Number.isFinite(result.updated)).toBe(true);
  expect(result.created).toBe(result.originalCreated);
  expect(result.updated).toBe(result.originalUpdated);
});

test('rejects opening a browser object with another app key', async ({ helperPage }) => {
  await expect(helperPage.evaluate(seedBytes => {
    const { AppKey, PinnedObject } = window.__sdkHelpers;
    const key = new AppKey(Uint8Array.from(seedBytes));
    const other = new AppKey(new Uint8Array(32).fill(2));
    const object = new PinnedObject();
    try {
      object.updateMetadata(new TextEncoder().encode('owner metadata'));
      const opened = PinnedObject.open(other, object.seal(key));
      opened.free();
    } finally { object.free(); other.free(); key.free(); }
  }, seedBytes)).rejects.toThrow();
});

for (const field of ['dataSignature', 'encryptedDataKey', 'encryptedMetadata', 'encryptedMetadataKey', 'metadataSignature'] as const) {
  test(`rejects an altered browser ${field}`, async ({ helperPage }) => {
    const result = await helperPage.evaluate(({ field, seedBytes }) => {
      const { AppKey, PinnedObject } = window.__sdkHelpers;
      const key = new AppKey(Uint8Array.from(seedBytes));
      const object = new PinnedObject();
      try {
        object.updateMetadata(new TextEncoder().encode('signed metadata'));
        const sealed = object.seal(key);
        const original = sealed[field];
        if (typeof original !== 'string' || !original.length) return { hasField: false, rejected: false };
        // Signature fields are hex, so digit changes avoid case-only edits.
        const changed = `${original.startsWith('0') ? '1' : '0'}${original.substring(1)}`;
        let opened: InstanceType<typeof PinnedObject>;
        try { opened = PinnedObject.open(key, { ...sealed, [field]: changed }); }
        catch { return { hasField: true, rejected: true }; }
        opened.free();
        return { hasField: true, rejected: false };
      } finally { object.free(); key.free(); }
    }, { field, seedBytes });
    expect(result).toEqual({ hasField: true, rejected: true });
  });
}

test('keeps sealed browser metadata separate from later object updates', async ({ helperPage }) => {
  const result = await helperPage.evaluate(seedBytes => {
    const { AppKey, PinnedObject } = window.__sdkHelpers;
    const key = new AppKey(Uint8Array.from(seedBytes));
    const object = new PinnedObject();
    let opened: InstanceType<typeof PinnedObject> | undefined;
    try {
      object.updateMetadata(new TextEncoder().encode('before'));
      const sealed = object.seal(key);
      object.updateMetadata(new TextEncoder().encode('after'));
      opened = PinnedObject.open(key, sealed);
      return { opened: new TextDecoder().decode(opened.metadata()), original: new TextDecoder().decode(object.metadata()) };
    } finally { opened?.free(); object.free(); key.free(); }
  }, seedBytes);
  expect(result).toEqual({ opened: 'before', original: 'after' });
});

test('copies browser metadata input and output buffers', async ({ helperPage }) => {
  const result = await helperPage.evaluate(() => {
    const object = new window.__sdkHelpers.PinnedObject();
    try {
      const input = Uint8Array.from([10, 20, 30]);
      object.updateMetadata(input);
      input.fill(0);
      const output = object.metadata();
      const before = [...output];
      output.fill(0);
      return { after: [...object.metadata()], before };
    } finally { object.free(); }
  });
  expect(result).toEqual({ after: [10, 20, 30], before: [10, 20, 30] });
});

test('accepts the browser BIP-39 zero-entropy mnemonic', async ({ helperPage }) => {
  await helperPage.evaluate(() => window.__sdkHelpers.validateRecoveryPhrase('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'));
});
for (const input of [
  { name: 'checksum', phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon' },
  { name: 'word', phrase: 'unknownword abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' },
  { name: 'word count', phrase: 'abandon about' },
]) {
  test(`rejects an invalid browser mnemonic ${input.name}`, async ({ helperPage }) => {
    await expect(helperPage.evaluate(phrase => window.__sdkHelpers.validateRecoveryPhrase(phrase), input.phrase)).rejects.toThrow();
  });
}

for (const input of [
  { size: 0, want: 0 },
  { size: 1, want: 125_829_120 },
  { size: 41_943_040, want: 125_829_120 },
  { size: 41_943_041, want: 251_658_240 },
  { size: 83_886_080, want: 251_658_240 },
]) {
  test(`rounds ${input.size} browser bytes to complete encoded slabs`, async ({ helperPage }) => {
    expect(await helperPage.evaluate(size => window.__sdkHelpers.encodedSize(size, 10, 20), input.size)).toBe(input.want);
  });
}
test('uses the requested browser erasure-coding ratio', async ({ helperPage }) => {
  expect(await helperPage.evaluate(() => window.__sdkHelpers.encodedSize(8_388_608, 2, 1))).toBe(12_582_912);
});
test('rejects zero browser data shards', async ({ helperPage }) => {
  await expect(helperPage.evaluate(() => window.__sdkHelpers.encodedSize(1, 0, 20))).rejects.toThrow();
});
