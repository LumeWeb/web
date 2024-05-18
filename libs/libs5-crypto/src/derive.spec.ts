import { deriveHashBlake3, deriveHashBlake3Int } from "./derive";

// Global test data
const validBase = Array.from(
  new Uint8Array([
    229, 188, 77, 239, 140, 59, 156, 131, 203, 241, 52, 60, 13, 202, 247, 79,
    124, 0, 164, 157, 114, 105, 138, 58, 162, 241, 137, 166, 227, 205, 95, 127,
  ]),
);
const invalidBase = Array.from(new Uint8Array(31));
const validTweakHash = Array.from(
  new Uint8Array(
    Buffer.from("BfVj0TDbnIQyFASBqGFipspaKsnZozDH+P1x/+yBuJg=", "base64"),
  ),
);
const validTweakInt = 1;
const expectedHash1 = new Uint8Array(
  Buffer.from("2Z3HyI5SoJlOMhM6tVBg1ot3JDDuzOSGcEdRW83wbOY=", "base64"),
);
const expectedHash2 = new Uint8Array(
  Buffer.from("gA1uoZCXJGqUoR5BwnfbmtVeluy9R53ftXMb5YFZABA=", "base64"),
);

describe("deriveHashBlake3", () => {
  it("should compute the correct hash", () => {
    const result = deriveHashBlake3(validBase, validTweakHash);
    expect(result).toEqual(expectedHash1);
  });

  it("should throw an error for invalid base length", () => {
    expect(() => deriveHashBlake3(invalidBase, validTweakHash)).toThrow(
      "Invalid base length",
    );
  });
});

describe("deriveHashBlake3Int", () => {
  it("should compute the correct hash", () => {
    const result = deriveHashBlake3Int(validBase, validTweakInt);
    expect(result).toEqual(expectedHash2);
  });

  it("should throw an error for invalid base length", () => {
    expect(() => deriveHashBlake3Int(invalidBase, validTweakInt)).toThrow(
      "Invalid base length",
    );
  });
});
