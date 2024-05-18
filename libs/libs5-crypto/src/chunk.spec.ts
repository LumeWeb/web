import { encryptChunk, decryptChunk } from "./chunk";

// test data
const key = new Uint8Array([
  155, 243, 222, 72, 89, 44, 208, 33, 131, 146, 2, 111, 65, 63, 107, 238, 217,
  196, 33, 168, 7, 56, 207, 110, 108, 130, 159, 93, 70, 108, 36, 97,
]);
const plaintext = new Uint8Array([
  147, 141, 27, 15, 13, 102, 57, 56, 4, 252, 160, 7, 48, 15, 224, 181, 220, 114,
  52, 96, 22, 214, 225, 66, 93, 16, 184, 242, 12, 18, 231, 26, 53, 98, 81, 113,
  11, 80, 215, 95, 193, 144, 82, 171, 146, 205, 47, 26, 63, 95, 45, 113, 201,
  22, 125, 179, 116, 231, 229, 85, 206, 90, 193, 25,
]);
const index = 1;
const expectedCiphertext = new Uint8Array(
  Buffer.from(
    "iCrCNIX68geUz+JLkG8nURiYLjGAd4dtwancF5sFDhSCyFWsRyIlW6gxdzZ1GKwCXI1MMLDfKmk6LYpmVfuQpr1IYsRqzMH6JN8vQ6SveIs=",
    "base64",
  ),
);

describe("encryptChunk", () => {
  it("should encrypt the plaintext correctly", async () => {
    const ciphertext = await encryptChunk({ key, plaintext, index });
    expect(ciphertext).toEqual(expectedCiphertext);
  });
});

describe("decryptChunk", () => {
  it("should decrypt the ciphertext correctly", async () => {
    const decryptedPlaintext = await decryptChunk({
      key,
      ciphertext: expectedCiphertext,
      index,
    });
    expect(decryptedPlaintext).toEqual(plaintext);
  });
});
