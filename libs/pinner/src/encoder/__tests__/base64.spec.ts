import { describe, expect, it } from "vitest";
import { Base64Encoder, base64ToFile } from "../base64";
import { EncoderError } from "../error";

describe("Base64Encoder", () => {
  describe("base64ToFile", () => {
    it("should encode base64 string to file", async () => {
      const base64String = "SGVsbG8gV29ybGQ="; // "Hello World"
      const result = await base64ToFile(base64String, { name: "test.bin" });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.bin");
      expect(result.file.type).toBe("application/octet-stream");
      expect(result.options.name).toBe("test.bin");
      expect(result.file.size).toBe(11);

      const content = await result.file.text();
      expect(content).toBe("Hello World");
    });

    it("should use default name when not provided", async () => {
      const base64String = "SGVsbG8=";
      const result = await base64ToFile(base64String);

      expect(result.file.name).toBe("file.bin");
    });

    it("should preserve keyvalues in options", async () => {
      const base64String = "SGVsbG8=";
      const result = await base64ToFile(base64String, {
        name: "test.bin",
        keyvalues: { type: "binary" },
      });

      expect(result.options.keyvalues).toEqual({ type: "binary" });
    });

    it("should handle empty base64 string", async () => {
      const base64String = "";
      const result = await base64ToFile(base64String);

      expect(result.file.size).toBe(0);
    });

    it("should handle binary data", async () => {
      const binaryData = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0xff]);
      const base64String = btoa(String.fromCharCode(...binaryData));
      const result = await base64ToFile(base64String);

      expect(result.file.size).toBe(5);
      const content = await result.file.arrayBuffer();
      const resultArray = new Uint8Array(content);
      expect(resultArray).toEqual(binaryData);
    });

    it("should throw error for invalid base64", async () => {
      const invalidBase64 = "Invalid!@#$%";

      await expect(base64ToFile(invalidBase64)).rejects.toThrow(EncoderError);
      await expect(base64ToFile(invalidBase64)).rejects.toMatchObject({
        code: "INVALID_BASE64",
      });
    });
  });

  describe("Base64Encoder class", () => {
    it("should encode base64 string to file", async () => {
      const encoder = new Base64Encoder();
      const base64String = "SGVsbG8=";
      const result = await encoder.encode(base64String, { name: "test.bin" });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.bin");
    });
  });
});
