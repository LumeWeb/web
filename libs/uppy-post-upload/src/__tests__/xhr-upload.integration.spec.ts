/**
 * Integration tests for XHRUpload plugin
 * These tests use MSW to mock HTTP responses and are agnostic to the network driver
 * They can run in both browser (with XHR) and Node.js (with ky) environments
 */

import { test as it } from "./int-test";
import { describe, expect, vi } from "vitest";
import Core from "@uppy/core";
import XHRUpload from "../index";
import {
  badRequestHandler,
  createCustomHeaderSpyHandler,
  createCustomUploadHandler,
  createFileNameHeaderSpyHandler,
  createMetadataEchoHandler,
  createMetadataFilterHandler,
  networkErrorHandler,
  optionsHandler,
  rateLimitHandler,
  serverErrorHandler,
  shouldRetryTestHandler,
  unauthorizedHandler,
  uploadBundleHandler,
  uploadSuccessHandler,
  uploadWithOptionsHandler,
} from "./msw-handlers";

describe("XHRUpload Integration Tests (Agnostic)", () => {
  describe("successful upload", () => {
    it("should upload a file successfully", async ({ worker }) => {
      worker.use(optionsHandler, uploadSuccessHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(successSpy).toHaveBeenCalled();
      const [, response] = successSpy.mock.calls[0];
      expect(response.body).toHaveProperty("url");
      expect(response.body.url).toBe("https://api.test.com/files/random-id");
    });

    it("should upload multiple files", async ({ worker }) => {
      worker.use(optionsHandler, uploadSuccessHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(successSpy).toHaveBeenCalledTimes(2);
    });

    it("should use custom endpoint function", async ({ worker }) => {
      worker.use(uploadWithOptionsHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: (fileOrBundle) => {
          const file = Array.isArray(fileOrBundle) ? fileOrBundle[0] : fileOrBundle;
          return `https://api.test.com/upload/${file.name}`;
        },
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(successSpy).toHaveBeenCalled();
      const [, response] = successSpy.mock.calls[0];
      expect(response.body.url).toBe("https://api.test.com/files/test.jpg");
    });

    it("should upload files as bundle", async ({ worker }) => {
      worker.use(uploadBundleHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: (fileOrBundle) => {
          const files = Array.isArray(fileOrBundle)
            ? fileOrBundle
            : [fileOrBundle];
          const names = files.map((f: any) => f.name).join(",");
          return `https://api.test.com/upload-bundle/${names}`;
        },
        bundle: true,
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(successSpy).toHaveBeenCalledTimes(2);
      const [, response] = successSpy.mock.calls[0];
      expect(response.body.url).toContain("test1.jpg,test2.jpg");
    });
  });

  describe("error handling", () => {
    it("should handle unauthorized errors", async ({ worker }) => {
      worker.use(optionsHandler, unauthorizedHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const errorSpy = vi.fn();
      uppy.on("upload-error", errorSpy);

      await uppy.upload();

      expect(errorSpy).toHaveBeenCalled();
      const [, error] = errorSpy.mock.calls[0];
      expect(error).toBeInstanceOf(Error);
    });

    it("should handle rate limit errors", async ({ worker }) => {
      worker.use(optionsHandler, rateLimitHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const errorSpy = vi.fn();
      uppy.on("upload-error", errorSpy);

      await uppy.upload();

      expect(errorSpy).toHaveBeenCalled();
    }, 30000);

    it("should handle server errors", async ({ worker }) => {
      worker.use(optionsHandler, serverErrorHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const errorSpy = vi.fn();
      uppy.on("upload-error", errorSpy);

      await uppy.upload();

      expect(errorSpy).toHaveBeenCalled();
    });

    it("should handle bad request errors", async ({ worker }) => {
      worker.use(optionsHandler, badRequestHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        limit: 0, // Disable retries to avoid timing issues with MSW worker lifecycle
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const errorSpy = vi.fn();
      uppy.on("upload-error", errorSpy);

      await uppy.upload();

      expect(errorSpy).toHaveBeenCalled();
      const [, error] = errorSpy.mock.calls[0];
      expect(error.message).toContain("400");
    });

    it("should handle network errors", async ({ worker }) => {
      worker.use(optionsHandler, networkErrorHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const errorSpy = vi.fn();
      uppy.on("upload-error", errorSpy);

      await uppy.upload();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe("headers", () => {
    it("should send custom headers", async ({ worker }) => {
      const customHeaderSpy = vi.fn();
      worker.use(createCustomHeaderSpyHandler(customHeaderSpy));

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        headers: {
          "X-Custom-Header": "custom-value",
        },
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await uppy.upload();

      expect(customHeaderSpy).toHaveBeenCalledWith("custom-value");
    });

    it("should support headers as a function", async ({ worker }) => {
      const customHeaderSpy = vi.fn();
      worker.use(createFileNameHeaderSpyHandler(customHeaderSpy));

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        headers: (file) => ({
          "X-File-Name": file.name,
        }),
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await uppy.upload();

      expect(customHeaderSpy).toHaveBeenCalledWith("test.jpg");
    });
  });

  describe("getResponseData", () => {
    it("should use getResponseData to parse response", async ({ worker }) => {
      worker.use(
        optionsHandler,
        createCustomUploadHandler("plain text response", 200),
      );

      const getResponseData = vi.fn((xhr: any) => ({
        url: xhr.responseText,
      }));

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        getResponseData,
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(getResponseData).toHaveBeenCalled();
      const [, response] = successSpy.mock.calls[0];
      expect(response.body).toEqual({
        url: "plain text response",
      });
    });
  });

  describe("hooks", () => {
    it("should call onBeforeRequest hook", async ({ worker }) => {
      worker.use(optionsHandler, uploadSuccessHandler);

      const onBeforeRequest = vi.fn();
      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        onBeforeRequest,
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await uppy.upload();

      expect(onBeforeRequest).toHaveBeenCalled();
    });

    it("should call onAfterResponse hook", async ({ worker }) => {
      worker.use(optionsHandler, uploadSuccessHandler);

      const onAfterResponse = vi.fn();
      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        onAfterResponse,
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await uppy.upload();

      expect(onAfterResponse).toHaveBeenCalled();
    });

    it("should call shouldRetry hook", async ({ worker }) => {
      worker.use(optionsHandler, shouldRetryTestHandler);

      const shouldRetry = vi.fn(() => true);
      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        shouldRetry,
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await uppy.upload();

      expect(shouldRetry).toHaveBeenCalled();
    });

    it("should throw error from onAfterResponse hook", async ({ worker }) => {
      worker.use(badRequestHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        onAfterResponse: (xhr: any) => {
          if (xhr.status === 400) {
            throw new Error("Custom error message");
          }
        },
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const errorSpy = vi.fn();
      uppy.on("upload-error", errorSpy);

      await uppy.upload();

      expect(errorSpy).toHaveBeenCalled();
      const [, error] = errorSpy.mock.calls[0];
      expect(error.message).toBe("Custom error message");
    });
  });

  describe("metadata", () => {
    it("should include metadata in form data", async ({ worker }) => {
      worker.use(createMetadataEchoHandler("customField"));

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        allowedMetaFields: ["customField"],
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
        meta: {
          customField: "custom value",
        },
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(successSpy).toHaveBeenCalled();
      const [, response] = successSpy.mock.calls[0];
      expect(response.body.metadata).toBe("custom value");
    });

    it("should filter metadata based on allowedMetaFields", async ({
      worker,
    }) => {
      worker.use(createMetadataFilterHandler("allowed", "disallowed"));

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
        allowedMetaFields: ["allowed"],
      });

      uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
        meta: {
          allowed: "value1",
          disallowed: "value2",
        },
      });

      const successSpy = vi.fn();
      uppy.on("upload-success", successSpy);

      await uppy.upload();

      expect(successSpy).toHaveBeenCalled();
      const [, response] = successSpy.mock.calls[0];
      expect(response.body.allowed).toBe("value1");
      expect(response.body.disallowed).toBeNull();
    });
  });
});
