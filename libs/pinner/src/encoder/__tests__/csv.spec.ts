import { describe, expect, it } from "vitest";
import { CsvEncoder, csvToFile } from "../csv";
import { EncoderError } from "../error";

describe("CsvEncoder", () => {
  describe("csvToFile", () => {
    it("should encode CSV string to file", async () => {
      const csvData = "name,age\nJohn,30\nJane,25";
      const result = await csvToFile(csvData, { name: "test.csv" });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.csv");
      expect(result.file.type).toBe("text/csv");
      expect(result.options.name).toBe("test.csv");

      const content = await result.file.text();
      expect(content).toBe(csvData);
    });

    it("should use default name when not provided", async () => {
      const csvData = "name,age\nJohn,30";
      const result = await csvToFile(csvData);

      expect(result.file.name).toBe("data.csv");
    });

    it("should preserve keyvalues in options", async () => {
      const csvData = "name,age\nJohn,30";
      const result = await csvToFile(csvData, {
        name: "test.csv",
        keyvalues: { type: "data" },
      });

      expect(result.options.keyvalues).toEqual({ type: "data" });
    });

    it("should encode array of objects to CSV", async () => {
      const data = [
        { name: "John", age: 30, city: "NYC" },
        { name: "Jane", age: 25, city: "LA" },
      ];
      const result = await csvToFile(data, { name: "users.csv" });

      const content = await result.file.text();
      expect(content).toContain("name,age,city");
      expect(content).toContain("John,30,NYC");
      expect(content).toContain("Jane,25,LA");
    });

    it("should encode array of arrays to CSV", async () => {
      const data = [
        ["name", "age", "city"],
        ["John", 30, "NYC"],
        ["Jane", 25, "LA"],
      ];
      const result = await csvToFile(data, { name: "users.csv" });

      const content = await result.file.text();
      expect(content).toContain("name,age,city");
      expect(content).toContain("John,30,NYC");
      expect(content).toContain("Jane,25,LA");
    });

    it("should handle empty array", async () => {
      const data: object[] = [];
      const result = await csvToFile(data);

      const content = await result.file.text();
      expect(content).toBe("");
    });

    it("should handle special characters in values", async () => {
      const data = [
        { name: 'John "The Boss"', age: 30 },
        { name: "Jane, Smith", age: 25 },
      ];
      const result = await csvToFile(data);

      const content = await result.file.text();
      expect(content).toContain('"John ""The Boss""",30');
      expect(content).toContain('"Jane, Smith",25');
    });

    it("should handle null and undefined values", async () => {
      const data = [
        { name: "John", age: 30, city: null },
        { name: "Jane", age: 25, city: undefined },
      ];
      const result = await csvToFile(data);

      const content = await result.file.text();
      expect(content).toContain("name,age,city");
      expect(content).toContain("John,30,");
      expect(content).toContain("Jane,25,");
    });

    it("should support custom CSV options", async () => {
      const data = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const result = await csvToFile(data, {
        name: "users.csv",
        csv: {
          delimiter: ";",
        },
      });

      const content = await result.file.text();
      expect(content).toContain("name;age");
      expect(content).toContain("John;30");
    });

    it("should handle newlines in values", async () => {
      const data = [
        { name: "John", description: "Line 1\nLine 2" },
      ];
      const result = await csvToFile(data);

      const content = await result.file.text();
      expect(content).toContain('"Line 1\nLine 2"');
    });

    it("should handle invalid input type", async () => {
      const data = { invalid: "object" } as any;

      await expect(csvToFile(data)).rejects.toThrow(EncoderError);
      await expect(csvToFile(data)).rejects.toMatchObject({
        code: "INVALID_CSV",
      });
    });
  });

  describe("CsvEncoder class", () => {
    it("should encode CSV string to file", async () => {
      const encoder = new CsvEncoder();
      const csvData = "name,age\nJohn,30";
      const result = await encoder.encode(csvData, { name: "test.csv" });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.csv");
    });

    it("should encode array of objects to CSV", async () => {
      const encoder = new CsvEncoder();
      const data = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const result = await encoder.encode(data);

      const content = await result.file.text();
      expect(content).toContain("name,age");
      expect(content).toContain("John,30");
      expect(content).toContain("Jane,25");
    });

    it("should encode array of arrays to CSV", async () => {
      const encoder = new CsvEncoder();
      const data = [
        ["name", "age"],
        ["John", 30],
        ["Jane", 25],
      ];
      const result = await encoder.encode(data);

      const content = await result.file.text();
      expect(content).toContain("name,age");
      expect(content).toContain("John,30");
      expect(content).toContain("Jane,25");
    });
  });
});
