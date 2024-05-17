import { Multibase } from "./multibase";

class TestMultibase extends Multibase {
  constructor(private bytes: Uint8Array) {
    super();
  }

  toBytes(): Uint8Array {
    return this.bytes;
  }
}

describe("Multibase", () => {
  const testCases = [
    {
      bytes: new Uint8Array([1, 2, 3, 4]),
      base58: "z2VfUX",
      hex: "f01020304",
      base32: "baebagba",
      base64url: "uAQIDBA",
    },
  ];

  testCases.forEach((testCase) => {
    const multibase = new TestMultibase(testCase.bytes);

    it(`should decode and encode base58 correctly for ${testCase.base58}`, () => {
      expect(Multibase.decodeString(testCase.base58)).toEqual(testCase.bytes);
      expect(multibase.toBase58()).toBe(testCase.base58);
    });

    it(`should decode and encode hex correctly for ${testCase.hex}`, () => {
      expect(Multibase.decodeString(testCase.hex)).toEqual(testCase.bytes);
      expect(multibase.toHex()).toBe(testCase.hex);
    });

    it(`should decode and encode base32 correctly for ${testCase.base32}`, () => {
      expect(Multibase.decodeString(testCase.base32)).toEqual(testCase.bytes);
      expect(multibase.toBase32()).toBe(testCase.base32);
    });

    it(`should decode and encode base64url correctly for ${testCase.base64url}`, () => {
      expect(Multibase.decodeString(testCase.base64url)).toEqual(
        testCase.bytes,
      );
      expect(multibase.toBase64Url()).toBe(testCase.base64url);
    });
  });

  it("should throw an error for unsupported multibase encoding", () => {
    expect(() => Multibase.decodeString("xabcd")).toThrow(
      "Multibase encoding x not supported",
    );
  });
});
