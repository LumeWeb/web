/**
 * Sia share URL detection and parsing.
 *
 * A Sia share URL is a pre-signed HTTP(S) URL (or its `sia://` alias, which the
 * WASM SDK emits by rewriting the `https://` prefix) that carries both the
 * object's identity and its decryption key:
 *
 *     https://<indexer>/objects/<objectKey>/shared?<signed-params>#encryption_key=<base64url>
 *     sia://<indexer>/objects/<objectKey>/shared?<signed-params>#encryption_key=<base64url>
 *
 * `objectKey` is the 32-byte hash256 of the object, hex-encoded in the path;
 * `encryption_key` is the 32-byte object master key, base64url-encoded in the
 * fragment (Go `base64.URLEncoding`, Rust `URL_SAFE` — both padded). The
 * signature lives in the query, so the fragment needs no signing: anyone
 * holding the URL can decrypt the object at all, which is why the key is kept
 * out of config fields and React state (see ADR 0006) and only lives inside
 * `src` until the worker consumes it.
 *
 * This mirrors the Go SDK's `SharedObject` parse (path must start `/objects/`
 * and end `/shared`, fragment parsed as a query, key must decode to exactly 32
 * bytes) and the Rust SDK's `shared_object` (scheme must be `sia`, fragment
 * must carry `encryption_key=`).
 */

/** Decoded fields of a validated Sia share URL. */
export interface SiaShareUrl {
  /** 32-byte object master key from the URL fragment. */
  readonly encryptionKey: Uint8Array;
  /**
   * `sia://`-normalized form of the URL. The Sia WASM SDK's `sharedObject`
   * requires the `sia` scheme and converts back to https itself, so callers
   * hand `fetchForm` to the SDK instead of the original string. The caller's
   * bytes are carried verbatim (only the scheme prefix is swapped) because
   * the URL is pre-signed over them.
   */
  readonly fetchForm: string;
  /**
   * Base origin of the indexer that signed the URL. The signed metadata fetch
   * already targets this host via `fetchForm`, so this is an aid for callers
   * that need "the indexer this share came from" (logging, account wiring),
   * not a required input: payment/account access still comes from the
   * configured worker connection.
   */
  readonly indexerUrl: string;
  /** 64-hex-char object key from the path segment, lowercased. */
  readonly objectKey: string;
}

const OBJECT_KEY_HEX_LENGTH = 64;
const OBJECTS_PREFIX = '/objects/';
const SHARED_SUFFIX = '/shared';
const FRAGMENT_PARAM = 'encryption_key';
/** 32-byte master key: every genuine share URL's fragment decodes to this. */
const ENCRYPTION_KEY_LENGTH = 32;
const SIA_SCHEME = 'sia://';
const SIA_FETCH_PREFIX = 'https://';
/**
 * Leading http(s) scheme of a share URL. Matched as a one-shot alternative
 * instead of relying on the fixed `https://` constant alone: the two schemes
 * differ in length (8 vs 7 chars), so slicing by a single constant would
 * mangle the one it doesn't cover.
 */
const HTTP_SCHEME = /^https?:\/\//i;

/**
 * True when `src` is shaped like a Sia share URL: an http(s) URL (or `sia://`
 * alias) whose path matches `/objects/<key>/shared` and whose fragment carries
 * an `encryption_key` parameter. Key validity is NOT checked here — parse
 * rejection with a descriptive error happens once the caller commits to the
 * share path, so detection alone never doubles the validation work.
 */
export function isSiaShareUrl(src: string): boolean {
  const url = asParseable(src);
  if (!url) return false;
  if (!url.pathname.startsWith(OBJECTS_PREFIX) || !url.pathname.endsWith(SHARED_SUFFIX)) return false;
  return new URLSearchParams(url.hash.replace(/^#/, '')).has(FRAGMENT_PARAM);
}

/**
 * Parses and fully validates a Sia share URL. Throws with a descriptive error
 * when the shape is wrong, the object key is not 64 hex chars, or the
 * `encryption_key` fragment is missing or does not decode to exactly 32 bytes.
 */
export function parseSiaShareUrl(src: string): SiaShareUrl {
  const url = asParseable(src);
  if (!url) throw new Error('not a Sia share URL: expected an http(s) or sia:// URL');
  if (!url.pathname.startsWith(OBJECTS_PREFIX) || !url.pathname.endsWith(SHARED_SUFFIX)) {
    throw new Error('not a Sia share URL: path must match /objects/<key>/shared');
  }

  const objectKey = url.pathname.slice(OBJECTS_PREFIX.length, -SHARED_SUFFIX.length).toLowerCase();
  if (objectKey.length !== OBJECT_KEY_HEX_LENGTH || !/^[0-9a-f]+$/.test(objectKey)) {
    throw new Error(`not a Sia share URL: object key must be 64 hex characters, got "${objectKey}"`);
  }

  const key = new URLSearchParams(url.hash.replace(/^#/, '')).get(FRAGMENT_PARAM);
  if (!key) throw new Error('not a Sia share URL: missing encryption_key fragment');

  const encryptionKey = decodeBase64Url(key);
  if (encryptionKey.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(`invalid share URL: encryption key must decode to exactly ${ENCRYPTION_KEY_LENGTH} bytes`);
  }

  return {
    encryptionKey,
    fetchForm: asFetchForm(src),
    indexerUrl: url.origin,
    objectKey,
  };
}

/**
 * Byte-preserving `sia://` form of a share URL. The URL is pre-signed over
 * its exact bytes, so everything — most importantly the signed query — must
 * travel verbatim: rebuilding it from parsed URL components re-encodes
 * values (percent-encoding casing) and drops explicit default ports, which
 * would break the signature at load time. Only the scheme prefix is swapped.
 */
function asFetchForm(src: string): string {
  if (src.startsWith(SIA_SCHEME)) return src;
  return `${SIA_SCHEME}${src.replace(HTTP_SCHEME, '')}`;
}

/**
 * `sia://` srcs are not always accepted by the URL parser (scheme handling
 * varies between environments), so they re-enter parsing as their https
 * equivalent; anything else must already be http(s) to be usable share material.
 */
function asParseable(src: string): null | URL {
  if (typeof src !== 'string' || src.length === 0) return null;
  try {
    const normalized = src.startsWith(SIA_SCHEME)
      ? `${SIA_FETCH_PREFIX}${src.slice(SIA_SCHEME.length)}`
      : src;
    const url = new URL(normalized);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

/**
 * Standard-alphabet base64 decoder, accepting the padded and unpadded
 * base64url forms the real producers emit. `atob` alone cannot be used
 * directly: it only understands the standard alphabet, and share URLs carry
 * the URL-safe alphabet.
 */
function decodeBase64Url(value: string): Uint8Array {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = base64.length % 4;
  if (remainder === 1) throw new Error('invalid base64 encoding for encryption key');
  if (remainder > 0) base64 += '='.repeat(4 - remainder);

  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('invalid base64 encoding for encryption key');
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
