import { REGISTRY_BYTES } from "./bytes";
import { KeyPairEd25519 } from "./ed25519";
import { ed25519 } from "@noble/curves/ed25519";
import type { SignedRegistryEntry } from "./types";
import { decodeEndian, encodeEndian } from "./util";
import {
  deserializeRegistryEntry,
  serializeRegistryEntry,
  signRegistryEntry,
  verifyRegistryEntry,
} from "./registry";

describe("Registry Entry Functions", () => {
  const testKeyPair = new KeyPairEd25519(ed25519.utils.randomPrivateKey());
  const testData: Uint8Array = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const testRevision: number = 42;

  test("deserializeRegistryEntry", () => {
    const input: Uint8Array = Uint8Array.from([
      REGISTRY_BYTES.RECORD,
      ...testKeyPair.publicKey,
      ...encodeEndian(testRevision, 8),
      testData.length,
      ...testData,
    ]);

    const expectedOutput: SignedRegistryEntry = {
      pk: testKeyPair.publicKey,
      revision: testRevision,
      data: testData,
      signature: new Uint8Array(),
    };

    const output: SignedRegistryEntry = deserializeRegistryEntry(input);
    expect(output).toEqual(expectedOutput);
  });

  test("serializeRegistryEntry", () => {
    const input: SignedRegistryEntry = {
      pk: testKeyPair.publicKey,
      revision: testRevision,
      data: testData,
      signature: new Uint8Array(),
    };

    const expectedOutput: Uint8Array = Uint8Array.from([
      REGISTRY_BYTES.RECORD,
      ...testKeyPair.publicKey,
      ...encodeEndian(testRevision, 8),
      testData.length,
      ...testData,
      ...input.signature,
    ]);

    const output: Uint8Array = serializeRegistryEntry(input);
    expect(output).toEqual(expectedOutput);
  });

  test("signRegistryEntry", () => {
    const input: { kp: KeyPairEd25519; data: Uint8Array; revision: number } = {
      kp: testKeyPair,
      data: testData,
      revision: testRevision,
    };

    const expectedOutput: SignedRegistryEntry = {
      pk: testKeyPair.publicKey,
      revision: testRevision,
      data: testData,
      signature: new Uint8Array(),
    };

    const output: SignedRegistryEntry = signRegistryEntry(input);
    expect(output.signature).not.toEqual(0);
    expect(output.revision).toEqual(expectedOutput.revision);
    expect(output.data).toEqual(expectedOutput.data);
    expect(output.pk).toEqual(expectedOutput.pk);
  });

  test("verifyRegistryEntry", () => {
    const input: SignedRegistryEntry = signRegistryEntry({
      kp: testKeyPair,
      data: testData,
      revision: testRevision,
    });
    const expectedOutput: boolean = true;

    const output: boolean = verifyRegistryEntry(input);
    expect(output).toEqual(expectedOutput);
  });
});
