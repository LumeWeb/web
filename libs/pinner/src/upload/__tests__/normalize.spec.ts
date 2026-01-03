import { describe, expect, it } from "vitest";
import { normalizeUploadInput } from "../normalize";
import { MIME_TYPE_CAR, MIME_TYPE_OCTET_STREAM } from "@/types/mime-types";
import {
  createEmptyReadableStream,
  createTestUploadFile,
} from "./test-fixtures";

describe("normalizeUploadInput", () => {
  describe("with File input", () => {
    it("should return normalized data with file properties", () => {
      const file = createTestUploadFile();

      const result = normalizeUploadInput(file);

      expect(result.data).toBe(file);
      expect(result.name).toBe("test.car");
      expect(result.type).toBe("application/vnd.ipld.car");
      expect(result.size).toBe(12);
    });

    it("should ignore options when input is a File", () => {
      const file = createTestUploadFile(
        "test content",
        "original.car",
        "text/plain",
      );

      const result = normalizeUploadInput(file, { name: "custom.car" });

      expect(result.name).toBe("original.car");
      expect(result.type).toBe("text/plain");
    });
  });

  describe("with ReadableStream input", () => {
    it("should return normalized data with default name and octet-stream type", () => {
      const stream = createEmptyReadableStream();

      const result = normalizeUploadInput(stream);

      expect(result.data).toBe(stream);
      expect(result.name).toBe("upload");
      expect(result.type).toBe(MIME_TYPE_OCTET_STREAM);
      expect(result.size).toBe(0);
    });

    it("should use provided name from options", () => {
      const stream = createEmptyReadableStream();

      const result = normalizeUploadInput(stream, { name: "custom-file.car" });

      expect(result.name).toBe("custom-file.car");
    });

    it("should use MIME_TYPE_CAR when name ends with .car extension", () => {
      const stream = createEmptyReadableStream();

      const result = normalizeUploadInput(stream, { name: "test.car" });

      expect(result.type).toBe(MIME_TYPE_CAR);
    });

    it("should use MIME_TYPE_OCTET_STREAM when name does not end with .car extension", () => {
      const stream = createEmptyReadableStream();

      const result = normalizeUploadInput(stream, { name: "test.txt" });

      expect(result.type).toBe(MIME_TYPE_OCTET_STREAM);
    });

    it("should use MIME_TYPE_OCTET_STREAM when name has .car in the middle", () => {
      const stream = createEmptyReadableStream();

      const result = normalizeUploadInput(stream, { name: "test.car.backup" });

      expect(result.type).toBe(MIME_TYPE_OCTET_STREAM);
    });
  });

  describe("with object input", () => {
    it("should return normalized data with provided properties", () => {
      const stream = createEmptyReadableStream();
      const input = {
        data: stream,
        name: "object-file.car",
        type: "application/vnd.ipld.car",
      };

      const result = normalizeUploadInput(input);

      expect(result.data).toBe(stream);
      expect(result.name).toBe("object-file.car");
      expect(result.type).toBe("application/vnd.ipld.car");
      expect(result.size).toBe(0);
    });

    it("should ignore options when input is an object", () => {
      const stream = createEmptyReadableStream();
      const input = {
        data: stream,
        name: "original.car",
        type: "text/plain",
      };

      const result = normalizeUploadInput(input, { name: "custom.car" });

      expect(result.name).toBe("original.car");
      expect(result.type).toBe("text/plain");
    });

    it("should default size to 0 when not provided", () => {
      const stream = createEmptyReadableStream();
      const input = {
        data: stream,
        name: "test.car",
        type: MIME_TYPE_CAR,
      };

      const result = normalizeUploadInput(input);

      expect(result.size).toBe(0);
    });

    it("should use provided size when available", () => {
      const stream = createEmptyReadableStream();
      const input = {
        data: stream,
        name: "test.car",
        type: MIME_TYPE_CAR,
        size: 1024,
      };

      const result = normalizeUploadInput(input);

      expect(result.size).toBe(1024);
    });
  });
});
