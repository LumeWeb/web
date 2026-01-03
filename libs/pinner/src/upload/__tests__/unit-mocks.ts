import type { UploadResult } from "@/types/upload";
import { TUS_SIZE_THRESHOLD } from "@/types/constants";
import { vi } from "vitest";
import { getMockCID } from "./test-helpers";

// Mock instances - using vi.hoisted to ensure they're available before module imports

const { mockSdkInstance, mockXhrHandler, mockTusHandler, mockUploadResult } =
  await vi.hoisted(async () => {
    const getMockCID = (await import("./test-helpers")).getMockCID;
    const { OPERATION_STATUS } = await import("@lumeweb/portal-sdk");
    const mockCid = getMockCID(0);
    const mockUploadResult: UploadResult = {
      id: "test-id",
      cid: mockCid,
      name: "test.car",
      size: 1024,
      mimeType: "application/vnd.ipld.car",
      createdAt: new Date(),
      numberOfFiles: 1,
      operationId: 12345,
    };
    const sdkInstance = {
      account: vi.fn().mockReturnValue({
        uploadLimit: vi.fn().mockImplementation(() => {
          return Promise.resolve({
            success: true,
            data: { limit: 104857600 }, // 100 MB in bytes
          });
        }),
        listOperations: vi.fn().mockResolvedValue({
          success: true,
          data: {
            data: {
              id: 12345,
              cid: mockCid,
              status: OPERATION_STATUS.COMPLETED,
              operation: "upload",
              operation_display_name: "Upload",
              protocol: "ipfs",
              protocol_display_name: "IPFS",
              progress_percent: 100,
              started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            total: 1,
          },
        }),
        waitForOperation: vi.fn().mockResolvedValue({
          success: true,
          data: {
            id: 12345,
            cid: mockCid,
            status: OPERATION_STATUS.COMPLETED,
            operation: "upload",
            operation_display_name: "Upload",
            protocol: "ipfs",
            protocol_display_name: "IPFS",
            progress_percent: 100,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      }),
    };

    const mockOperation = {
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      result: Promise.resolve(mockUploadResult),
      progress: { percentage: 0, bytesUploaded: 0, bytesTotal: 1024 },
    };

    const xhrHandler = {
      upload: vi.fn().mockReturnValue(mockOperation),
      destroy: vi.fn(),
    };

    const tusHandler = {
      upload: vi.fn().mockReturnValue(mockOperation),
      destroy: vi.fn(),
    };

    return {
      mockSdkInstance: sdkInstance,
      mockXhrHandler: xhrHandler,
      mockTusHandler: tusHandler,
      mockUploadResult,
    };
  });

// Make mockUploadResult available for other modules
export { mockUploadResult };

export const DEFAULT_UPLOAD_LIMIT = TUS_SIZE_THRESHOLD; // 100 MB
export const CUSTOM_UPLOAD_LIMIT = 200 * 1024 * 1024; // 200 MB

// Use the shared mockUploadResult from hoisted
export const MOCK_UPLOAD_RESULT = mockUploadResult;

// Mock dependencies - these are hoisted to the top
export function setupPortalSdkMock() {
  vi.mock("@lumeweb/portal-sdk", () => ({
    Sdk: class {
      constructor(endpoint: string) {
        return mockSdkInstance;
      }
    },
  }));
}

export function setupUploadHandlerMocks() {
  vi.mock("../xhr-upload", () => ({
    XHRUploadHandler: class {
      constructor(config: any) {
        return mockXhrHandler;
      }
    },
  }));

  vi.mock("../tus-upload", () => ({
    TUSUploadHandler: class {
      constructor(config: any) {
        return mockTusHandler;
      }
    },
  }));
}

export function setupUppyMocks() {
  vi.mock("@uppy/core", () => {
    class MockUppy {
      private eventHandlers: Map<string, Function[]> = new Map();

      constructor() {} // Ensure constructor works with new keyword

      use = vi.fn();

      on = vi.fn().mockImplementation((event: string, handler: Function) => {
        if (!this.eventHandlers.has(event)) {
          this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event)!.push(handler);
      });

      addFile = vi.fn().mockImplementation((file: any) => {
        // Simulate file-added event
        const handlers = this.eventHandlers.get("file-added") || [];
        handlers.forEach((handler) => handler(file));
      });

      upload = vi.fn().mockImplementation(async () => {
        // Simulate successful upload
        const progressHandlers = this.eventHandlers.get("progress") || [];
        const successHandlers = this.eventHandlers.get("upload-success") || [];
        const errorHandlers = this.eventHandlers.get("error") || [];

        // Simulate progress
        progressHandlers.forEach((handler) => handler(512));
        progressHandlers.forEach((handler) => handler(1024));

        // Simulate success
        const mockResult = {
          uploadURL: "https://example.com/test",
          body: {
            id: "test-id",
            cid: getMockCID(1),
            name: "test.car",
            size: 1024,
            mimeType: "application/vnd.ipld.car",
            createdAt: new Date().toISOString(),
            numberOfFiles: 1,
            operationId: 12345,
          },
        };

        successHandlers.forEach((handler) => handler({}, mockResult));
        return Promise.resolve();
      });

      cancelAll = vi.fn();
      pauseResume = vi.fn();
    }

    return {
      default: MockUppy,
    };
  });

  vi.mock("@uppy/xhr-upload", () => ({
    default: vi.fn(),
  }));

  vi.mock("@uppy/tus", () => ({
    default: vi.fn(),
  }));
}

export function setupPromiseDeferMock() {
  vi.mock("p-defer", () => ({
    default: vi.fn().mockImplementation(() => {
      let resolve: (value: any) => void;
      let reject: (error: any) => void;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve: resolve!, reject: reject! };
    }),
  }));
}

export function setupStreamUtilsMocks() {
  vi.mock("../../utils/stream", () => ({
    streamToBlob: vi
      .fn()
      .mockResolvedValue(
        new Blob(["test data"], { type: "application/octet-stream" }),
      ),
    calculateStreamSize: vi
      .fn()
      .mockImplementation(async (stream: ReadableStream) => {
        return 1024n;
      }),
  }));
}

export function setupCarMocks() {
  vi.mock("../car", () => ({
    configureCar: vi.fn(),
    preprocessToCar: vi.fn().mockResolvedValue({
      carStream: new ReadableStream(),
      rootCid: getMockCID(2),
      size: 1024n,
    }),
    destroyCarPreprocessor: vi.fn(),
  }));
}

export function setupNormalizeMock() {
  vi.mock("../normalize", () => ({
    normalizeUploadInput: vi.fn().mockImplementation((input, options) => ({
      data: input,
      name: options?.name || "test.car",
      type: options?.type || "application/vnd.ipld.car",
      size: options?.size || 1024,
    })),
  }));
}

// Mock instance getters and setters
export function getMockSdkInstance(): any {
  return mockSdkInstance;
}

export function getMockXhrHandler(): any {
  return mockXhrHandler;
}

export function getMockTusHandler(): any {
  return mockTusHandler;
}

// Mock instance setup helpers
export function setupMockSdkInstance(
  uploadLimit: number = DEFAULT_UPLOAD_LIMIT,
): any {
  mockSdkInstance.account().uploadLimit.mockClear();
  mockSdkInstance.account().uploadLimit.mockResolvedValue({
    success: true,
    data: { limit: uploadLimit },
  });
  mockSdkInstance.account().listOperations.mockClear();
  mockSdkInstance.account().waitForOperation.mockClear();
  return mockSdkInstance;
}

export function setupMockUploadHandlers(): {
  mockXhrHandler: any;
  mockTusHandler: any;
} {
  // Reset mocks to clean state
  const mockOperation = {
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    result: Promise.resolve(MOCK_UPLOAD_RESULT),
    progress: { percentage: 0, bytesUploaded: 0, bytesTotal: 1024 },
  };

  mockXhrHandler.upload.mockReturnValue(mockOperation);
  mockXhrHandler.destroy.mockReset();

  mockTusHandler.upload.mockReturnValue(mockOperation);
  mockTusHandler.destroy.mockReset();

  return { mockXhrHandler, mockTusHandler };
}

// Common test setup function
export function setupCommonTestMocks() {
  setupPortalSdkMock();
  setupUploadHandlerMocks();
  setupUppyMocks();
  setupPromiseDeferMock();
  setupStreamUtilsMocks();
  setupCarMocks();
  setupNormalizeMock();
}

// Upload operation validation helpers
export function expectValidUploadOperation(operation: any, expectFn: any) {
  expectFn(operation).toBeDefined();
  expectFn(operation.cancel).toBeInstanceOf(Function);
  expectFn(operation.pause).toBeInstanceOf(Function);
  expectFn(operation.resume).toBeInstanceOf(Function);
  expectFn(operation.result).toBeInstanceOf(Promise);
  expectFn(operation.progress).toBeDefined();
}

export function expectMockUploadResult(result: any, expectFn: any) {
  expectFn(result).toEqual(MOCK_UPLOAD_RESULT);
}

// Test data generators
export function createTestUploadOptions(overrides: any = {}) {
  return {
    name: "test.car",
    keyvalues: { key1: "value1" },
    onProgress: vi.fn(),
    ...overrides,
  };
}

export function createLargeFileOptions(overrides: any = {}) {
  return {
    name: "large.car",
    size: DEFAULT_UPLOAD_LIMIT + 1,
    ...overrides,
  };
}

export function createSmallFileOptions(overrides: any = {}) {
  return {
    name: "small.car",
    size: 1024,
    ...overrides,
  };
}
