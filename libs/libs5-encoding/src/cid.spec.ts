import { Multihash } from "./multihash";
import { CID } from "./cid";
import { equalBytes } from "@noble/curves/abstract/utils";
import { CID_BYTES, REGISTRY_BYTES, CID_HASH_BYTES } from "./bytes";
import { concatBytes, hexToBytes } from "@noble/hashes/utils";
import { ed25519 } from "@noble/curves/ed25519";
import { signRegistryEntry } from "./registry";
import { KeyPairEd25519 } from "./ed25519";

describe("CID", () => {
  const rawHashBytes = hexToBytes(
    "479693009307376069d47e545e5963f08fa56d8378a11b25c560d7bf2af25b1a",
  );
  const rawHashSize = 1536155487;
  const rawCidString = "uJh9HlpMAkwc3YGnUflReWWPwj6Vtg3ihGyXFYNe_KvJbGl_fj1s";
  const rawCidStringB58 =
    "z6e5mLE5CqXdaPxWaD1h4tCMibSH1adYGAyGrWn5xpNNf4CMVxDxW";
  const rawCidBytes = hexToBytes(
    "261f479693009307376069d47e545e5963f08fa56d8378a11b25c560d7bf2af25b1a5fdf8f5b",
  );
  const rawCidRegistryBytes = concatBytes(
    new Uint8Array([REGISTRY_BYTES.TYPES.CID]),
    rawCidBytes,
  );
  const rawResolverCidBytes = concatBytes(
    new Uint8Array([CID_BYTES.TYPES.RESOLVER]),
    new Uint8Array([CID_HASH_BYTES.TYPES.BLAKE3]),
    rawHashBytes,
  );

  const registryEntry = signRegistryEntry({
    kp: new KeyPairEd25519(ed25519.utils.randomPrivateKey()),
    data: new Uint8Array([1, 2, 3]),
    revision: 1,
  });

  test("can create a CID with valid type, hash, and size", () => {
    const type = CID_BYTES.TYPES.RAW;
    const hash = new Multihash(rawHashBytes.slice());
    const size = rawHashSize;
    const cid = new CID(type, hash, size);

    expect(cid.type).toBe(type);
    expect(cid.hash).toBe(hash);
    expect(cid.size).toBe(size);
  });

  test("can decode a CID string", () => {
    const cid = CID.decode(rawCidString);

    expect(equalBytes(cid.hash.hashBytes, rawHashBytes)).toBe(true);
    expect(equalBytes(cid.toBytes(), rawCidBytes)).toBe(true);
  });

  test("can create a CID from a registry", () => {
    const cid = CID.fromRegistry(
      concatBytes(new Uint8Array([REGISTRY_BYTES.TYPES.CID]), rawCidBytes),
    );

    expect(cid.type).toBe(CID_BYTES.TYPES.RAW);
  });

  test("can create a CID from a signed registry entry", () => {
    const cid = CID.fromSignedRegistryEntry(registryEntry);

    expect(cid.type).toBe(CID_BYTES.TYPES.RESOLVER);
  });

  test("can create a CID from a registry public key", () => {
    const cid = CID.fromRegistryPublicKey(registryEntry.pk);

    expect(cid.type).toBe(CID_BYTES.TYPES.RESOLVER);
  });

  test("can verify a CID", () => {
    expect(CID.verify(rawCidBytes)).toBe(true);
  });

  test("can create a CID with a custom size", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const size = 66;
    const cid = CID.fromBytes(rawCidBytes).copyWith({ size });

    expect(cid.type).toBe(CID_BYTES.TYPES.RAW);
    expect(cid.size).toBe(size);
  });

  test("can convert a CID to bytes", () => {
    const cid = CID.fromBytes(rawCidBytes);

    const result = cid.toBytes();
    expect(equalBytes(result, rawCidBytes)).toBe(true);
  });

  test("can convert a CID to a registry entry", () => {
    const cid = CID.fromBytes(rawCidBytes);

    const result = cid.toRegistryEntry();
    expect(equalBytes(result, rawCidRegistryBytes)).toBe(true);
  });

  test("can convert a CID to a registry CID", () => {
    const cid = CID.fromBytes(rawCidBytes);

    const result = cid.toRegistryCID();
    expect(equalBytes(result, rawResolverCidBytes)).toBe(true);
  });

  test("can convert a CID to a string", () => {
    const cid = CID.fromBytes(rawCidBytes);

    const result = cid.toString();
    expect(result).toBe(rawCidStringB58);
  });

  test("can check if two CIDs are equal", () => {
    const cid1 = CID.fromBytes(rawCidBytes);
    const cid2 = CID.fromBytes(rawCidBytes);

    expect(cid1.equals(cid2)).toBe(true);
  });
});
