import { ed25519 } from "@noble/curves/ed25519";
import { KeyPairEd25519 } from "./ed25519";
import type { SignedRegistryEntry } from "./types";
import { decodeEndian, encodeEndian } from "./util";
import { REGISTRY_BYTES } from "./bytes";

export function deserializeRegistryEntry(
  event: Uint8Array,
): SignedRegistryEntry {
  const dataLength = event[42];
  return {
    pk: event.slice(1, 34),
    revision: decodeEndian(event.slice(34, 42)),
    data: event.slice(43, 43 + dataLength),
    signature: event.slice(43 + dataLength),
  };
}

export function verifyRegistryEntry(sre: SignedRegistryEntry): boolean {
  const list: Uint8Array = Uint8Array.from([
    REGISTRY_BYTES.RECORD,
    ...encodeEndian(sre.revision, 8),
    sre.data.length, // 1 byte
    ...sre.data,
  ]);

  return ed25519.verify(sre.signature, list, sre.pk.slice(1));
}

export function serializeRegistryEntry(sre: SignedRegistryEntry): Uint8Array {
  return Uint8Array.from([
    REGISTRY_BYTES.RECORD,
    ...sre.pk,
    ...encodeEndian(sre.revision, 8),
    sre.data.length,
    ...sre.data,
    ...sre.signature,
  ]);
}

export function signRegistryEntry({
  kp,
  data,
  revision,
}: {
  kp: KeyPairEd25519;
  data: Uint8Array;
  revision: number;
}): SignedRegistryEntry {
  const list = new Uint8Array([
    REGISTRY_BYTES.RECORD,
    ...encodeEndian(revision, 8),
    data.length,
    ...data,
  ]);

  const signature = ed25519.sign(list, kp.extractBytes());

  return {
    pk: kp.publicKey,
    revision,
    data,
    signature: new Uint8Array(signature),
  };
}
