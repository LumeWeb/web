import { Multihash } from "./multihash";
import { CID_HASH_TYPES, CID_TYPES } from "./bytes";
import { concatBytes, hexToBytes } from "@noble/hashes/utils";

describe("Multihash", () => {
  const testCases = [
    {
      fullBytes: concatBytes(
        Uint8Array.from([CID_HASH_TYPES.BLAKE3]),
        hexToBytes(
          "479693009307376069d47e545e5963f08fa56d8378a11b25c560d7bf2af25b1a",
        ),
      ),
      base64url: "H0eWkwCTBzdgadR-VF5ZY_CPpW2DeKEbJcVg178q8lsa",
      base32: "d5dzneyasmdtoydj2r7fixszmpyi7jlnqn4kcgzfyvqnppzk6jnru",
    },
  ];

  describe("constructor", () => {
    it("should create a Multihash instance with the provided fullBytes", () => {
      const fullBytes = new Uint8Array([1, 2, 3]);
      const multihash = new Multihash(fullBytes);

      expect(multihash.fullBytes).toEqual(fullBytes);
    });
  });

  describe("functionType", () => {
    it("should return the function type of the Multihash", () => {
      const fullBytes = testCases[0].fullBytes;
      const multihash = new Multihash(fullBytes);

      expect(multihash.functionType).toBe(CID_HASH_TYPES.BLAKE3);
    });
  });

  describe("hashBytes", () => {
    it("should return the hash bytes of the Multihash", () => {
      const fullBytes = testCases[0].fullBytes;
      const multihash = new Multihash(fullBytes);

      expect(multihash.hashBytes).toEqual(fullBytes.subarray(1));
    });
  });

  describe("fromBase64Url", () => {
    testCases.forEach((testCase) => {
      it(`should create a Multihash instance from base64url for ${testCase.base64url}`, () => {
        const multihash = Multihash.fromBase64Url(testCase.base64url);

        expect(multihash.fullBytes).toEqual(testCase.fullBytes);
      });
    });
  });

  describe("toBase64Url", () => {
    testCases.forEach((testCase) => {
      it(`should return the base64url representation of the Multihash for ${testCase.base64url}`, () => {
        const multihash = new Multihash(testCase.fullBytes);

        expect(multihash.toBase64Url()).toBe(testCase.base64url);
      });
    });
  });

  describe("toBase32", () => {
    testCases.forEach((testCase) => {
      it(`should return the base32 representation of the Multihash for ${testCase.base32}`, () => {
        const multihash = new Multihash(testCase.fullBytes);

        expect(multihash.toBase32()).toBe(testCase.base32);
      });
    });
  });

  describe("toString", () => {
    it("should return the base64url representation for non-BRIDGE function types", () => {
      const fullBytes = testCases[0].fullBytes;
      const multihash = new Multihash(fullBytes);

      expect(multihash.toString()).toBe(testCases[0].base64url);
    });

    it("should return the decoded string for BRIDGE function type", () => {
      const fullBytes = new Uint8Array([
        CID_TYPES.BRIDGE,
        72,
        101,
        108,
        108,
        111,
      ]);
      const multihash = new Multihash(fullBytes);

      expect(multihash.toString()).toBe(":Hello");
    });
  });

  describe("equals", () => {
    it("should return true for equal Multihash instances", () => {
      const fullBytes = testCases[0].fullBytes;
      const multihash1 = new Multihash(fullBytes);
      const multihash2 = new Multihash(fullBytes);

      expect(multihash1.equals(multihash2)).toBe(true);
    });

    it("should return false for non-equal Multihash instances", () => {
      const fullBytes1 = testCases[0].fullBytes;
      const fullBytes2 = new Uint8Array([4, 5, 6]);
      const multihash1 = new Multihash(fullBytes1);
      const multihash2 = new Multihash(fullBytes2);

      expect(multihash1.equals(multihash2)).toBe(false);
    });

    it("should return false for non-Multihash instances", () => {
      const fullBytes = testCases[0].fullBytes;
      const multihash = new Multihash(fullBytes);

      expect(multihash.equals({})).toBe(false);
    });
  });
});
