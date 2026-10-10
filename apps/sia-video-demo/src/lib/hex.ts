/** Decodes a hex string back into bytes. Input must be even-length hex (the
 * store only constructs values via `normalizeSharingSeedHex` /
 * `normalizeObjectKeyHex` / `toHex`, all of which guarantee even-length hex),
 * so a malformed value fails fast instead of being silently re-interpreted.
 */
export function fromHex(hex: string): Uint8Array {
  const value = hex.trim().replace(/^0x/i, "");
  if (value === "" || value.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(value)) {
    throw new Error("expected even-length hex string");
  }
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const offset = i * 2;
    bytes[i] = Number.parseInt(value.slice(offset, offset + 2), 16);
  }
  return bytes;
}

/**
 * Validates and normalizes a 64-hex-char Sia object key (the `<key>` of a
 * `/objects/<key>/shared` share URL, which the keyless player streams via
 * `SharedSdk.object(key)`): strips an optional `0x` prefix and requires
 * exactly 64 hex characters, returned lowercase. Strict by design, the
 * player sends this verbatim as a source, so a malformed key must fail fast
 * with a readable inline error instead of surfacing deep in the pipeline.
 */
export function normalizeObjectKeyHex(input: string): string {
  const value = input.trim().replace(/^0x/i, "");
  if (!/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("object key must be exactly 64 hex characters");
  }
  return value.toLowerCase();
}

/**
 * Validates and normalizes a pasted sharing-key seed (given OUT-OF-BAND by
 * the key's owner, never created by the app): strips an optional `0x` prefix
 * and requires non-empty, even-length, hex-encoded input. The seed is the hex
 * string a sharing key hands out to recipients and `SharedSdk.connect`
 * consumes verbatim, so only its shape is checked here, not whether the key
 * still exists on the indexer (that surfaces when a shared source is played).
 * Returns the lowercase hex form for persisting.
 *
 * The rejection copy is concise, user-facing, and free of implementation
 * jargon (no mention of "hex", "even-length", or character counts) because
 * the store surfaces it verbatim as the inline `sharingError`. The seed is a
 * seed, its shape is not a 64-character key, so the validator deliberately
 * never invents a length requirement beyond even-length hex.
 */
export function normalizeSharingSeedHex(input: string): string {
  const value = input.trim().replace(/^0x/i, "");
  if (value === "") {
    throw new Error("Enter a sharing key.");
  }
  if (!/^[0-9a-fA-F]+$/.test(value)) {
    throw new Error("Enter a valid sharing key.");
  }
  if (value.length % 2 !== 0) {
    throw new Error("Enter a valid sharing key.");
  }
  return value.toLowerCase();
}

/** Hex-encodes bytes for persisting a seed in localStorage (`toHex`
 * round-trips any bytes it produced). */
export function toHex(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) {
    out += byte.toString(16).padStart(2, "0");
  }
  return out;
}
