import { decodeEndian, encodeEndian } from "./util";

describe("decodeEndian", () => {
  test("small input", () => {
    const bytes = new Uint8Array([0x01, 0x02, 0x03]);
    const value = decodeEndian(bytes);
    expect(value).toBe(197121);
  });

  test("large input", () => {
    const bytes = new Uint8Array([
      0xff, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09,
    ]);
    const value = decodeEndian(bytes);
    expect(value).toBe(4.26493783959394e22);
  });
});

describe("encodeEndian", () => {
  test("small value", () => {
    const value = 67305984;
    const length = 3;
    const result = encodeEndian(value, length);
    expect(result).toEqual(new Uint8Array([0, 0x02, 0x03]));
  });

  test("large value", () => {
    const value = Number.MAX_SAFE_INTEGER;
    const length = 8;
    const result = encodeEndian(value, length);
    expect(result).toEqual(
      new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
    );
  });
});
