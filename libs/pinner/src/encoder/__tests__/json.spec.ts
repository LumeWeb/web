import { describe, expect, it } from "vitest";
import { JsonEncoder, jsonToFile } from "../json";
import { EncoderError } from "../error";

describe("JsonEncoder", () => {
  describe("jsonToFile", () => {
    it("should encode JSON object to file", async () => {
      const data = { foo: "bar", nested: { value: 123 } };
      const result = await jsonToFile(data, { name: "test.json" });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.json");
      expect(result.file.type).toBe("application/json");
      expect(result.options.name).toBe("test.json");

      const content = await result.file.text();
      expect(content).toBe(JSON.stringify(data, null, 2));
    });

    it("should use default name when not provided", async () => {
      const data = { test: "value" };
      const result = await jsonToFile(data);

      expect(result.file.name).toBe("data.json");
    });

    it("should preserve keyvalues in options", async () => {
      const data = { test: "value" };
      const result = await jsonToFile(data, {
        name: "test.json",
        keyvalues: { type: "config" },
      });

      expect(result.options.keyvalues).toEqual({ type: "config" });
    });

    it("should handle circular references gracefully", async () => {
      const data: any = { test: "value" };
      data.circular = data;

      await expect(jsonToFile(data)).rejects.toThrow(EncoderError);
      await expect(jsonToFile(data)).rejects.toMatchObject({
        code: "INVALID_JSON",
      });
    });

    it("should handle complex nested objects", async () => {
      const data = {
        level1: {
          level2: {
            level3: {
              value: "deep",
            },
          },
        },
        array: [1, 2, 3],
        boolean: true,
        null: null,
      };

      const result = await jsonToFile(data);
      const content = await result.file.text();

      expect(JSON.parse(content)).toEqual(data);
    });
  });

  describe("JsonEncoder class", () => {
    it("should encode JSON object to file", async () => {
      const encoder = new JsonEncoder();
      const data = { foo: "bar" };
      const result = await encoder.encode(data, { name: "test.json" });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.json");
    });
  });
});
