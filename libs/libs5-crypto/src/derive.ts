import { blake3 } from "@noble/hashes/blake3";
import { concatBytes } from "@noble/hashes/utils";
import { encodeEndian } from "@lumeweb/libs5-encoding";

function deriveHashBlake3(base: number[], tweak: number[]): Uint8Array {
  if (base.length !== 32) {
    throw new Error("Invalid base length");
  }

  return blake3(
    concatBytes(Uint8Array.from(base), blake3(Uint8Array.from(tweak))),
  );
}

function deriveHashBlake3Int(base: number[], tweak: number): Uint8Array {
  if (base.length !== 32) {
    throw new Error("Invalid base length");
  }

  return blake3(concatBytes(Uint8Array.from(base), encodeEndian(tweak, 32)));
}

export { deriveHashBlake3, deriveHashBlake3Int };
