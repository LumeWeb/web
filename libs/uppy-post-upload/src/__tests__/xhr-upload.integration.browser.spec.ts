/**
 * Browser-only integration tests for XHRUpload plugin
 * These tests use MSW to mock HTTP responses and test XHR-specific features
 * Features tested here are specific to the browser XHR implementation
 */

import { test as it } from "./int-test";
import { describe, expect, vi } from "vitest";
import Core, { type UppyEventMap } from "@uppy/core";
import XHRUpload from "../index";
import {
  bundleProgressHandlers,
  createSampleHeaderSpyHandler,
  endpointBundleHandler,
  endpointFunctionHandler,
  hooksTestHandlers,
  slowUploadHandler,
  uploadErrorResponseHandler,
  uploadProgressHandlers,
} from "./msw-browser-handlers";

describe("XHRUpload Integration Tests (Browser-Only)", () => {
  describe("endpoint as function", () => {
    it("can be a function", async ({ worker }) => {
      worker.use(endpointFunctionHandler);

      const core = new Core();
      core.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: (file) =>
          !Array.isArray(file)
            ? `https://fake-endpoint.uppy.io/upload/${file.name}`
            : "",
        bundle: false,
      });

      core.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await core.upload();
    });

    it("can be a function (bundle)", async ({ worker }) => {
      worker.use(endpointBundleHandler);

      const core = new Core();
      core.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: (file) =>
          Array.isArray(file)
            ? `https://fake-endpoint.uppy.io/upload-bundle/${file.map((f) => f.name).join(",")}`
            : "",
        bundle: true,
      });

      core.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      core.addFile({
        type: "image/png",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await core.upload();
    });
  });

  describe("headers", () => {
    it("can be a function", async ({ worker }) => {
      const headerSpy = vi.fn();
      worker.use(createSampleHeaderSpyHandler(headerSpy));

      const core = new Core();
      core.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://fake-endpoint.uppy.io",
        headers: (file) => ({
          "x-sample-header": file.name!,
        }),
      });

      core.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      await core.upload();

      expect(headerSpy).toHaveBeenCalledWith("test.jpg");
    });
  });

  describe("hooks", () => {
    it("should leverage hooks from fetcher", async ({ worker }) => {
      worker.use(...hooksTestHandlers);

      const core = new Core<any, { url: string }>();

      const shouldRetry = vi.fn(() => true);
      const onBeforeRequest = vi.fn();
      const onAfterResponse = vi.fn();
      const getResponseData = vi.fn((xhr: any) => ({
        url: xhr.responseText,
      }));

      core.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://fake-endpoint.uppy.io",
        shouldRetry,
        onBeforeRequest,
        onAfterResponse,
        getResponseData,
      });

      const id = core.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      core.setFileState(id, {
        xhrUpload: {
          endpoint: "https://fake-endpoint.uppy.io",
        },
      });

      await core.upload();

      // Note: shouldRetry is only called on errors/non-2xx status, not on successful uploads
      expect(onAfterResponse).toHaveBeenCalled();
      expect(onBeforeRequest).toHaveBeenCalled();
      expect(getResponseData).toHaveBeenCalled();

      expect(core.getFile(id).response!.body).toEqual({
        url: "https://fake-endpoint.uppy.io/random-id",
      });
    });

    it("should send response object over upload-error event", async ({
      worker,
    }) => {
      worker.use(uploadErrorResponseHandler);

      const core = new Core();
      const shouldRetry = vi.fn(() => false);

      core.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://fake-endpoint.uppy.io",
        shouldRetry,
        async onAfterResponse(xhr: any) {
          if (xhr.status === 400) {
            throw new Error(JSON.parse(xhr.responseText).message);
          }
        },
      });

      const id = core.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const event = new Promise<
        Parameters<UppyEventMap<any, any>["upload-error"]>
      >((resolve) => {
        core.once("upload-error", (...args) => resolve(args));
      });

      await Promise.all([
        core.upload(),
        event.then(([file, error, response]) => {
          expect(file?.id).toEqual(id);
          expect(response).toBeDefined();
          expect(error.message).toEqual("Oh no");
        }),
      ]);

      expect(shouldRetry).toHaveBeenCalled();
    });
  });

  describe("upload progress", () => {
    it("should emit upload-progress events", async ({ worker }) => {
      worker.use(...uploadProgressHandlers);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      const file = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const progressSpy = vi.fn();
      uppy.on("upload-progress", progressSpy);

      await uppy.upload();

      expect(progressSpy).toHaveBeenCalled();
    });

    it("should emit upload-progress for bundle uploads", async ({ worker }) => {
      worker.use(...bundleProgressHandlers);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload-bundle",
        bundle: true,
      });

      const file1 = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const file2 = uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const progressSpy = vi.fn();
      uppy.on("upload-progress", progressSpy);

      await uppy.upload();

      // Progress events should be emitted for both files
      expect(progressSpy).toHaveBeenCalled();
    });
  });

  describe("cancellation", () => {
    it("should cancel individual file upload", async ({ worker }) => {
      worker.use(slowUploadHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const successSpy = vi.fn();
      const errorSpy = vi.fn();
      uppy.on("upload-success", successSpy);
      uppy.on("upload-error", errorSpy);

      // Cancel upload immediately
      setTimeout(() => uppy.removeFile(fileId), 10);

      await uppy.upload();

      // Cancellation should not emit upload-error (it's not an error)
      expect(errorSpy).not.toHaveBeenCalled();
      // Nor should it emit upload-success
      expect(successSpy).not.toHaveBeenCalled();
    });

    it("should cancel all uploads", async ({ worker }) => {
      worker.use(slowUploadHandler);

      const uppy = new Core();
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com/upload",
      });

      const file1 = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const file2 = uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const canceledSpy = vi.fn();
      uppy.on("cancel-all", canceledSpy);

      // Cancel all uploads immediately
      setTimeout(() => uppy.cancelAll(), 10);

      await uppy.upload();

      expect(canceledSpy).toHaveBeenCalled();
    });
  });

  describe("timeout", () => {
    it("should handle timeout", async () => {
      // NOTE: We must mock browserClient.request because MSW's XHR interceptor doesn't
      // properly trigger the timeout mechanism in browser tests. Here's the detailed
      // explanation:
      //
      // 1. How ProgressTimeout works:
      //    - The @uppy/utils fetcher creates a ProgressTimeout instance with a timeout duration
      //    - ProgressTimeout.progress() is called whenever xhr.upload.onprogress fires
      //    - progress() sets/reset a timeout timer that calls onTimeout() if no progress occurs
      //    - ProgressTimeout.done() is called when the request completes successfully
      //
      // 2. How MSW handles XHR requests:
      //    - MSW's XMLHttpRequestInterceptor intercepts XHR requests before they reach the network
      //    - It waits for the handler's async response before firing any events
      //    - Upload progress events are only fired AFTER the response is ready, not during the wait
      //    - See: @mswjs/interceptors/src/interceptors/XMLHttpRequest/XMLHttpRequestController.ts
      //      - respondWith() method triggers 'loadstart', 'progress', and 'load' events
      //      - These events fire after await getBodyByteLength() completes
      //
      // 3. The problem:
      //    - When a test handler uses setTimeout() to simulate a slow server (e.g., 10 seconds)
      //    - MSW waits the full duration before responding
      //    - xhr.upload.onprogress never fires during the wait
      //    - ProgressTimeout.progress() is never called
      //    - The timeout timer is never set (it's only set inside progress())
      //    - After 10 seconds, MSW responds and fires a single progress event with full data
      //    - The upload completes successfully without ever triggering the timeout
      //
      // 4. Why we can't use MSW for this test:
      //    - Even with an XHR interceptor, we can't make MSW fire progress events mid-request
      //    - The @mswjs/interceptors library's design waits for the full response before events
      //    - We can't modify MSW's behavior without library changes
      //
      // 5. Solution:
      //    - Mock browserClient.request to directly call callbacks.onTimeout()
      //    - This matches the pattern used in node tests (xhr-upload.spec.ts)
      //    - We return a successful response because timeout is a warning, not an error
      //    - The upload-stalled event is emitted, which is what we're testing
      const { browserClient } = await import("../network/browser");
      const originalRequest = browserClient.request.bind(browserClient);

      browserClient.request = vi
        .fn()
        .mockImplementation(async (_url, options, callbacks) => {
          // Simulate timeout by calling onTimeout callback
          callbacks?.onTimeout?.(options.timeout || 100);

          // Return a successful response (timeout is a warning, not an error)
          return {
            status: 200,
            statusText: "OK",
            responseText: '{"url":"https://example.com/file"}',
            response: { url: "https://example.com/file" },
            responseType: "json",
            request: null as any,
          };
        });

      try {
        const uppy = new Core();
        uppy.use(XHRUpload, {
          id: "XHRUpload",
          endpoint: "https://api.test.com/upload",
          timeout: 100,
        });

        uppy.addFile({
          type: "image/png",
          source: "test",
          name: "test.jpg",
          data: new Blob([new Uint8Array(8192)]),
        });

        const stalledSpy = vi.fn();
        uppy.on("upload-stalled", stalledSpy);

        await uppy.upload();

        expect(stalledSpy).toHaveBeenCalled();
      } finally {
        // Restore original request method
        browserClient.request = originalRequest;
      }
    });
  });
});
