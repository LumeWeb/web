import { encryptMutableBytes, decryptMutableBytes } from "./mutable";

const key = new Uint8Array([
  111, 186, 136, 74, 42, 200, 101, 116, 172, 139, 35, 148, 80, 66, 251, 49, 246,
  8, 189, 26, 240, 67, 231, 203, 241, 60, 32, 244, 238, 37, 32, 56,
]);
const data = new Uint8Array([
  24, 74, 220, 104, 149, 41, 171, 194, 105, 66, 39, 35, 220, 16, 222, 167, 15,
  31, 229, 144, 235, 38, 197, 140, 130, 167, 135, 130, 247, 41, 173, 222, 196,
  142, 79, 151, 241, 34, 56, 50, 78, 155, 108, 21, 209, 179, 55, 210, 52, 215,
  106, 252, 253, 208, 109, 144, 88, 246, 237, 118, 128, 18, 188, 186,
]);
const nonce = new Uint8Array([
  171, 20, 123, 142, 196, 55, 157, 235, 228, 141, 62, 196, 54, 9, 29, 74, 62,
  171, 63, 25, 114, 240, 0, 28,
]);
const expectedEncryptedData = new Uint8Array(
  Buffer.from(
    "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",
    "base64",
  ),
);

describe("encryptMutableBytes", () => {
  it("should encrypt the data correctly", () => {
    const encryptedData = encryptMutableBytes(data, key, nonce);
    expect(encryptedData).toEqual(expectedEncryptedData);
  });
});

describe("decryptMutableBytes", () => {
  it("should decrypt the encrypted data correctly", () => {
    const decryptedData = decryptMutableBytes(expectedEncryptedData, key);
    expect(decryptedData).toEqual(data);
  });

  it("should throw an error for invalid key length", () => {
    const invalidKey = new Uint8Array(16);
    expect(() =>
      decryptMutableBytes(expectedEncryptedData, invalidKey),
    ).toThrowError("wrong encryptionKeyLength (16 != 32)");
  });

  it("should throw an error for invalid padded data length", () => {
    const invalidData = new Uint8Array(expectedEncryptedData.length - 1);
    expect(() => decryptMutableBytes(invalidData, key)).toThrowError(
      /Expected parameter 'data' to be padded encrypted data/,
    );
  });

  it("should throw an error for invalid version", () => {
    const invalidData = new Uint8Array(expectedEncryptedData);
    invalidData[1] = 0x02;
    expect(() => decryptMutableBytes(invalidData, key)).toThrowError(
      "Invalid version",
    );
  });
});
