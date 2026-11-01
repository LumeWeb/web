/** Encodes signed preauthorization policies using the service's Sia binary contract. */
import { blake2b } from "@noble/hashes/blake2.js";

export interface PreauthorizationPolicy {
  allowedAppID?: string;
  connectKey: string;
  expiration: Date;
  publicKey: string;
  totalUses: number;
}

export function preauthorizationHash(
  policy: PreauthorizationPolicy,
): Uint8Array {
  if (!/^ed25519:[0-9a-fA-F]{64}$/.test(policy.publicKey))
    throw new Error("Invalid preauthorization public key");
  if (
    policy.allowedAppID !== undefined &&
    !/^[0-9a-f]{64}$/i.test(policy.allowedAppID)
  )
    throw new Error("Invalid allowed app ID");
  if (
    !policy.connectKey ||
    !Number.isSafeInteger(policy.totalUses) ||
    policy.totalUses < 1
  )
    throw new Error("Invalid preauthorization policy");
  const seconds = Math.floor(policy.expiration.getTime() / 1000);
  if (!Number.isSafeInteger(seconds) || seconds < 0)
    throw new Error("Invalid preauthorization expiration");
  const uint64 = (value: number) => {
    const bytes = new Uint8Array(8);
    new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
    return bytes;
  };
  const hex = (value: string) =>
    Uint8Array.from(value.match(/../g) ?? [], (pair) =>
      Number.parseInt(pair, 16),
    );
  const text = (value: string) => {
    const bytes = new TextEncoder().encode(value);
    return [uint64(bytes.length), bytes];
  };
  const parts = [
    ...text("indexd/preauthorized-key/create/v1"),
    hex(policy.publicKey.slice(8)),
    ...text(policy.connectKey),
    uint64(seconds),
    uint64(policy.totalUses),
    Uint8Array.of(policy.allowedAppID === undefined ? 0 : 1),
    ...(policy.allowedAppID === undefined ? [] : [hex(policy.allowedAppID)]),
  ];
  const encoded = new Uint8Array(
    parts.reduce((sum, part) => sum + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    encoded.set(part, offset);
    offset += part.length;
  }
  return blake2b(encoded, { dkLen: 32 });
}
