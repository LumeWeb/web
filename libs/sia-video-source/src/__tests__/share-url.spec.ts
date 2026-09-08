import { describe, expect, it } from 'vitest';
import { isSiaShareUrl, parseSiaShareUrl } from '../share-url.ts';

// ---- fixture helpers ---------------------------------------------------------

const HEX_KEY = 'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01';

/**
 * Encodes to the padded base64url form both real producers emit (Go
 * `base64.URLEncoding`, Rust `URL_SAFE` keep the `=` padding).
 */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
}

function keyFragment(bytes: Uint8Array): string {
  return `#encryption_key=${base64UrlEncode(bytes)}`;
}

function shareUrlFor(objectKey = HEX_KEY, keyBytes = crypto.getRandomValues(new Uint8Array(32))): string {
  return `https://indexer.example/objects/${objectKey}/shared?req=abc${keyFragment(keyBytes)}`;
}

function siaShareUrl(objectKey = HEX_KEY, keyBytes = crypto.getRandomValues(new Uint8Array(32))): string {
  return shareUrlFor(objectKey, keyBytes).replace('https://', 'sia://');
}

// ---- tests --------------------------------------------------------------------

describe('isSiaShareUrl', () => {
  it('detects the canonical https and sia:// share URL forms', () => {
    expect(isSiaShareUrl(shareUrlFor())).toBe(true);
    expect(isSiaShareUrl(siaShareUrl())).toBe(true);
  });

  it('rejects non-share sources', () => {
    expect(isSiaShareUrl(HEX_KEY)).toBe(false);
    expect(isSiaShareUrl('')).toBe(false);
    expect(isSiaShareUrl('https://indexer.example/objects/abc')).toBe(false);
    expect(isSiaShareUrl('https://indexer.example/pin/objects')).toBe(false);
    expect(isSiaShareUrl('ftp://indexer.example/objects/x/shared#encryption_key=AAAA')).toBe(false);
  });

  it('requires the encryption_key fragment', () => {
    expect(isSiaShareUrl(`https://indexer.example/objects/${HEX_KEY}/shared?req=abc`)).toBe(false);
  });

  it('does not require the key to be valid — parse decides that', () => {
    // Detection is a cheap shape check: a two-byte key fragment still looks
    // like a share URL so the caller gets the descriptive parse error.
    expect(isSiaShareUrl(`https://indexer.example/objects/${HEX_KEY}/shared#encryption_key=AAAA`)).toBe(true);
  });
});

describe('parseSiaShareUrl', () => {
  it('extracts the hex object key and 32-byte encryption key', () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const parsed = parseSiaShareUrl(shareUrlFor(HEX_KEY, key));
    expect(parsed.objectKey).toBe(HEX_KEY);
    expect(parsed.encryptionKey.byteLength).toBe(32);
    expect(Array.from(parsed.encryptionKey)).toEqual(Array.from(key));
  });

  it('normalizes https share URLs to the sia:// fetch form and exposes the indexer origin', () => {
    const url = shareUrlFor();
    const parsed = parseSiaShareUrl(url);
    expect(parsed.fetchForm).toBe(url.replace('https://', 'sia://'));
    expect(parsed.indexerUrl).toBe('https://indexer.example');
  });

  it('treats the sia:// form and its https equivalent as the same share', () => {
    // Both shapes must be built from the SAME key bytes, otherwise the two
    // URLs are genuinely different shares, not scheme variants of one.
    const keyBytes = crypto.getRandomValues(new Uint8Array(32));
    const https = parseSiaShareUrl(shareUrlFor(HEX_KEY, keyBytes));
    const sia = parseSiaShareUrl(siaShareUrl(HEX_KEY, keyBytes));
    expect(sia.fetchForm).toBe(https.fetchForm);
    expect(sia.objectKey).toBe(https.objectKey);
  });

  it('preserves the signed query parameters in the fetch form', () => {
    const parsed = parseSiaShareUrl(shareUrlFor(HEX_KEY, new Uint8Array(32).fill(7)));
    expect(parsed.fetchForm).toContain('?req=abc');
  });

  it('accepts an unpadded base64url key', () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const padded = base64UrlEncode(key);
    const unpadded = padded.replace(/=+$/, '');
    const paddedParsed = parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}/shared#encryption_key=${padded}`);
    const unpaddedParsed = parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}/shared#encryption_key=${unpadded}`);
    expect(Array.from(unpaddedParsed.encryptionKey)).toEqual(Array.from(paddedParsed.encryptionKey));
  });

  it('reads the key out of a query-shaped fragment with extra parameters', () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    const fragment = `expires=soon&encryption_key=${base64UrlEncode(key)}`;
    const parsed = parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}/shared#${fragment}`);
    expect(parsed.encryptionKey.byteLength).toBe(32);
  });

  it('rejects a non-share path', () => {
    expect(() => parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}`)).toThrow('/objects');
    expect(() => parseSiaShareUrl('https://i.example/objects//shared#encryption_key=AAAA')).toThrow('64 hex');
  });

  it('rejects a malformed object key', () => {
    const shortKey = 'aa'.repeat(5);
    expect(() => parseSiaShareUrl(`https://i.example/objects/${shortKey}/shared#encryption_key=AAAA`)).toThrow('64 hex');
    expect(() => parseSiaShareUrl(`https://i.example/objects/${'zz'.repeat(32)}/shared#encryption_key=AAAA`)).toThrow('64 hex');
  });

  it('rejects a missing encryption_key fragment', () => {
    expect(() => parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}/shared?req=abc`)).toThrow('encryption_key');
  });

  it('rejects a key that does not decode to exactly 32 bytes', () => {
    const short = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));
    const long = base64UrlEncode(crypto.getRandomValues(new Uint8Array(33)));
    const shortUrl = `https://i.example/objects/${HEX_KEY}/shared#encryption_key=${short}`;
    const longUrl = `https://i.example/objects/${HEX_KEY}/shared#encryption_key=${long}`;
    expect(() => parseSiaShareUrl(shortUrl)).toThrow('32 bytes');
    expect(() => parseSiaShareUrl(longUrl)).toThrow('32 bytes');
  });

  it('rejects an invalid base64 key', () => {
    expect(() => parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}/shared#encryption_key=@@@`)).toThrow('base64');
    // A single un-padded trailing character can never be a real key.
    expect(() => parseSiaShareUrl(`https://i.example/objects/${HEX_KEY}/shared#encryption_key=A`)).toThrow('base64');
  });

  it('rejects non-http sources', () => {
    expect(() => parseSiaShareUrl(HEX_KEY)).toThrow('share URL');
    expect(() => parseSiaShareUrl(`ftp://i.example/objects/${HEX_KEY}/shared#encryption_key=AAAA`)).toThrow('share URL');
  });
});
