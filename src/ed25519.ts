import { ed25519 } from "@noble/curves/ed25519";
import { concatBytes } from "@noble/curves/abstract/utils";
import { mkeyEd25519 } from "#constants.js";

export default class KeyPairEd25519 {
  private _bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this._bytes = bytes;
  }

  public get publicKey(): Uint8Array {
    return concatBytes(
      Uint8Array.from([mkeyEd25519]),
      ed25519.getPublicKey(this._bytes),
    );
  }

  public extractBytes(): Uint8Array {
    return this._bytes;
  }
}
