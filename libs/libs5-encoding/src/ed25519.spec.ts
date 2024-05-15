import { KeyPairEd25519 } from "./ed25519";
import { ed25519 } from "@noble/curves/ed25519";
import { concatBytes } from "@noble/hashes/utils";
import { CID_HASH_TYPES } from "./bytes";

describe("KeyPairEd25519", () => {
  let keyPair: KeyPairEd25519;
  let publicKey: Uint8Array;
  let publicKeyRaw: Uint8Array;
  let bytes: Uint8Array;

  beforeEach(() => {
    bytes = ed25519.utils.randomPrivateKey();
    keyPair = new KeyPairEd25519(bytes);
    publicKeyRaw = ed25519.getPublicKey(bytes);
    publicKey = concatBytes(
      Uint8Array.from([CID_HASH_TYPES.ED25519]),
      publicKeyRaw,
    );
  });

  test("extractBytes returns correct bytes", () => {
    expect(keyPair.extractBytes()).toEqual(bytes);
  });

  test("publicKey returns concatenated bytes", () => {
    expect(keyPair.publicKey).toEqual(publicKey);
  });

  test("publicKeyRaw returns correct public key", () => {
    expect(keyPair.publicKeyRaw).toEqual(publicKeyRaw);
  });
});
