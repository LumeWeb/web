import { beforeEach, describe, expect, it, vi } from "vitest";
import { Pinner } from "../pinner";
import type { PinnerConfig } from "../config";
import { CID } from "multiformats/cid";
import { createMockCID } from "./setup";
import type {
  UploadOperation,
  UploadOptions,
  UploadResult,
} from "@/types/upload";
import type { RemoteAddOptions, RemoteLsOptions, RemotePin } from "@/types/pin";
import { Status } from "@ipfs-shipyard/pinning-service-client";

// Create mock instances
const mockUploadManagerInstance = {
  upload: vi.fn(),
  uploadDirectory: vi.fn(),
  uploadCar: vi.fn(),
  waitForOperation: vi.fn(),
  destroy: vi.fn(),
};

const mockPinClientInstance = {
  add: vi.fn(),
  ls: vi.fn(),
  get: vi.fn(),
  isPinned: vi.fn(),
  setMetadata: vi.fn(),
  rm: vi.fn(),
};

// Mock the module imports with proper class constructors
vi.mock("../upload", () => {
  const MockUploadManager = function () {
    return mockUploadManagerInstance;
  };
  return {
    UploadManager: MockUploadManager,
  };
});

vi.mock("../pin", () => {
  const MockPinClient = function () {
    return mockPinClientInstance;
  };
  return {
    PinClient: MockPinClient,
  };
});

// Test fixtures
function createMockUploadResult(
  id: string,
  cid: string,
  name: string,
  size: number,
  mimeType: string,
  isDirectory = false,
): UploadResult {
  return {
    id,
    cid,
    name,
    size,
    mimeType,
    createdAt: new Date(),
    numberOfFiles: 1,
    isDirectory,
  };
}

async function createMockOperation(
  result: UploadResult,
  percentage = 0,
  bytesUploaded = 0,
): Promise<UploadOperation> {
  return {
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    result: Promise.resolve(result),
    progress: {
      percentage,
      bytesUploaded,
      bytesTotal: result.size,
    },
  };
}

function createMockPin(
  cid: string,
  name: string,
  status = Status.Pinned,
  size?: number,
  metadata?: Record<string, string>,
): RemotePin {
  return {
    cid: CID.parse(cid),
    name,
    status,
    created: new Date(),
    size,
    metadata,
  };
}

describe("Pinner", () => {
  let mockConfig: PinnerConfig;
  let pinner: Pinner;

  beforeEach(() => {
    mockConfig = {
      jwt: "test-jwt-token",
      endpoint: "https://api.test.com",
      gateway: "https://gateway.test.com",
    };

    // Clear all mock calls and reset implementations
    vi.clearAllMocks();

    // Reset mock implementations to default
    mockUploadManagerInstance.upload.mockClear();
    mockUploadManagerInstance.uploadDirectory.mockClear();
    mockUploadManagerInstance.uploadCar.mockClear();
    mockUploadManagerInstance.destroy.mockClear();
    mockPinClientInstance.add.mockClear();
    mockPinClientInstance.ls.mockClear();
    mockPinClientInstance.get.mockClear();
    mockPinClientInstance.isPinned.mockClear();
    mockPinClientInstance.setMetadata.mockClear();
    mockPinClientInstance.rm.mockClear();

    // Create a new Pinner instance for each test
    pinner = new Pinner(mockConfig);
  });

  describe("constructor", () => {
    it("should create a Pinner instance with valid config", () => {
      expect(pinner).toBeInstanceOf(Pinner);
    });

    it("should create instance with minimal config", () => {
      const minimalConfig: PinnerConfig = {
        jwt: "minimal-jwt",
      };
      const minimalPinner = new Pinner(minimalConfig);
      expect(minimalPinner).toBeInstanceOf(Pinner);
    });
  });

  describe("pins getter", () => {
    it("should return the PinClient instance", () => {
      const pins = pinner.pins;
      expect(pins).toBe(mockPinClientInstance);
    });

    it("should return the same instance on multiple calls", () => {
      const pins1 = pinner.pins;
      const pins2 = pinner.pins;
      expect(pins1).toBe(pins2);
    });
  });

  describe("upload", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    let mockUploadResult: UploadResult;
    let mockOperation: UploadOperation;

    beforeEach(async () => {
      const mockCid = await createMockCID(0);
      mockUploadResult = createMockUploadResult(
        "upload-123",
        mockCid,
        "test.txt",
        12,
        "text/plain",
      );
      mockOperation = await createMockOperation(mockUploadResult);
      mockUploadManagerInstance.upload.mockResolvedValue(mockOperation);
    });

    it("should upload a file and return UploadOperation", async () => {
      const operation = await pinner.upload(mockFile);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        undefined,
      );
      expect(operation).toBe(mockOperation);
    });

    it("should pass options to UploadManager", async () => {
      const options: UploadOptions = {
        name: "custom-name.txt",
        keyvalues: { key: "value" },
        onProgress: vi.fn(),
        onComplete: vi.fn(),
        onError: vi.fn(),
      };

      const operation = await pinner.upload(mockFile, options);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        options,
      );
      expect(operation).toBe(mockOperation);
    });

    it("should include abort signal in options", async () => {
      const signal = new AbortController().signal;
      const options: UploadOptions = {
        signal,
      };

      const operation = await pinner.upload(mockFile, options);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        options,
      );
    });

    it("should handle file upload errors", async () => {
      const error = new Error("Upload failed");
      mockUploadManagerInstance.upload.mockRejectedValue(error);

      await expect(pinner.upload(mockFile)).rejects.toThrow("Upload failed");
    });
  });

  describe("uploadAndWait", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    let mockUploadResult: UploadResult;
    let mockOperation: UploadOperation;

    beforeEach(async () => {
      const mockCid = await createMockCID(1);
      mockUploadResult = createMockUploadResult(
        "upload-123",
        mockCid,
        "test.txt",
        12,
        "text/plain",
      );
      mockOperation = await createMockOperation(mockUploadResult, 100, 12);
      mockUploadManagerInstance.upload.mockResolvedValue(mockOperation);
    });

    it("should upload and wait for completion", async () => {
      const result = await pinner.uploadAndWait(mockFile);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        undefined,
      );
      expect(result).toBe(mockUploadResult);
    });

    it("should pass options to upload", async () => {
      const options: UploadOptions = {
        name: "custom-name.txt",
      };

      const result = await pinner.uploadAndWait(mockFile, options);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        options,
      );
      expect(result).toBe(mockUploadResult);
    });

    it("should return the upload result", async () => {
      const result = await pinner.uploadAndWait(mockFile);

      expect(result.id).toBe("upload-123");
      expect(result.name).toBe("test.txt");
      expect(result.size).toBe(12);
    });

    it("should handle upload errors", async () => {
      const error = new Error("Upload failed");
      const mockCid = await createMockCID(1);
      const failingResult = createMockUploadResult(
        "upload-123",
        mockCid,
        "test.txt",
        12,
        "text/plain",
      );
      const failingOperation = await createMockOperation(failingResult);
      (failingOperation.result as Promise<UploadResult>) =
        Promise.reject(error);

      mockUploadManagerInstance.upload.mockResolvedValue(failingOperation);

      await expect(pinner.uploadAndWait(mockFile)).rejects.toThrow(
        "Upload failed",
      );
    });
  });

  describe("waitForOperation", () => {
    describe("with operation ID", () => {
      it("should wait for operation by ID", async () => {
        const mockCid = await createMockCID(10);
        const mockResult: UploadResult = {
          id: "12345",
          cid: mockCid,
          name: "test",
          size: 0,
          mimeType: "",
          createdAt: new Date(),
          numberOfFiles: 1,
          operationId: 12345,
        };

        mockUploadManagerInstance.waitForOperation.mockResolvedValue(
          mockResult,
        );

        const result = await pinner.waitForOperation(12345);

        expect(mockUploadManagerInstance.waitForOperation).toHaveBeenCalledWith(
          12345,
          undefined,
        );
        expect(result).toBe(mockResult);
      });

      it("should pass polling options", async () => {
        const mockCid = await createMockCID(11);
        const mockResult: UploadResult = {
          id: "12345",
          cid: mockCid,
          name: "test",
          size: 0,
          mimeType: "",
          createdAt: new Date(),
          numberOfFiles: 1,
          operationId: 12345,
        };

        mockUploadManagerInstance.waitForOperation.mockResolvedValue(
          mockResult,
        );

        const pollingOptions = {
          interval: 1000,
          timeout: 60000,
          settledStates: ["completed"],
        };

        const result = await pinner.waitForOperation(12345, pollingOptions);

        expect(mockUploadManagerInstance.waitForOperation).toHaveBeenCalledWith(
          12345,
          pollingOptions,
        );
        expect(result).toBe(mockResult);
      });
    });

    describe("with UploadResult", () => {
      it("should wait for operation using UploadResult", async () => {
        const mockCid = await createMockCID(12);
        const uploadResult: UploadResult = {
          id: "upload-123",
          cid: mockCid,
          name: "original.txt",
          size: 1024,
          mimeType: "text/plain",
          createdAt: new Date(),
          numberOfFiles: 1,
          operationId: 12345,
        };

        const finalResult: UploadResult = {
          id: "upload-123",
          cid: mockCid,
          name: "original.txt",
          size: 1024,
          mimeType: "text/plain",
          createdAt: new Date(),
          numberOfFiles: 1,
          operationId: 12345,
        };

        mockUploadManagerInstance.waitForOperation.mockResolvedValue(
          finalResult,
        );

        const result = await pinner.waitForOperation(uploadResult);

        expect(mockUploadManagerInstance.waitForOperation).toHaveBeenCalledWith(
          uploadResult,
          undefined,
        );
        expect(result).toBe(finalResult);
      });

      it("should pass polling options with UploadResult", async () => {
        const mockCid = await createMockCID(13);
        const uploadResult: UploadResult = {
          id: "upload-123",
          cid: mockCid,
          name: "original.txt",
          size: 1024,
          mimeType: "text/plain",
          createdAt: new Date(),
          numberOfFiles: 1,
          operationId: 12345,
        };

        const finalResult: UploadResult = {
          id: "upload-123",
          cid: mockCid,
          name: "original.txt",
          size: 1024,
          mimeType: "text/plain",
          createdAt: new Date(),
          numberOfFiles: 1,
          operationId: 12345,
        };

        mockUploadManagerInstance.waitForOperation.mockResolvedValue(
          finalResult,
        );

        const pollingOptions = { interval: 2000 };

        const result = await pinner.waitForOperation(
          uploadResult,
          pollingOptions,
        );

        expect(mockUploadManagerInstance.waitForOperation).toHaveBeenCalledWith(
          uploadResult,
          pollingOptions,
        );
        expect(result).toBe(finalResult);
      });
    });
  });

  describe("upload with waitForOperation option", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    let mockUploadResult: UploadResult;
    let mockOperation: UploadOperation;

    beforeEach(async () => {
      const mockCid = await createMockCID(14);
      mockUploadResult = createMockUploadResult(
        "upload-123",
        mockCid,
        "test.txt",
        12,
        "text/plain",
      );
      mockUploadResult.operationId = 12345;
      mockOperation = await createMockOperation(mockUploadResult);
      mockUploadManagerInstance.upload.mockResolvedValue(mockOperation);
    });

    it("should pass waitForOperation option to UploadManager", async () => {
      const options: UploadOptions = {
        waitForOperation: true,
      };

      const operation = await pinner.upload(mockFile, options);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        options,
      );
      expect(operation).toBe(mockOperation);
    });

    it("should pass operationPollingOptions to UploadManager", async () => {
      const options: UploadOptions = {
        waitForOperation: true,
        operationPollingOptions: {
          interval: 1000,
          timeout: 60000,
          settledStates: ["completed"],
        },
      };

      const operation = await pinner.upload(mockFile, options);

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(
        mockFile,
        options,
      );
      expect(operation).toBe(mockOperation);
    });

    it("should work with upload builder", async () => {
      const operation = await pinner.upload
        .file(mockFile)
        .waitForOperation(true)
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(mockFile, {
        waitForOperation: true,
      });
      expect(operation).toBe(mockOperation);
    });

    it("should work with upload builder and polling options", async () => {
      const pollingOptions = {
        interval: 2000,
        timeout: 120000,
      };

      const operation = await pinner.upload
        .file(mockFile)
        .waitForOperation(true)
        .operationPollingOptions(pollingOptions)
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(mockFile, {
        waitForOperation: true,
        operationPollingOptions: pollingOptions,
      });
      expect(operation).toBe(mockOperation);
    });
  });

  describe("uploadDirectory", () => {
    const mockFiles = [
      new File(["file1"], "file1.txt"),
      new File(["file2"], "file2.txt"),
    ];
    let mockUploadResult: UploadResult;
    let mockOperation: UploadOperation;

    beforeEach(async () => {
      const mockCid = await createMockCID(2);
      mockUploadResult = createMockUploadResult(
        "upload-dir-123",
        mockCid,
        "directory",
        10,
        "application/x-directory",
        true,
      );
      mockUploadResult.numberOfFiles = 2;
      mockOperation = await createMockOperation(mockUploadResult);
      mockUploadManagerInstance.uploadDirectory.mockResolvedValue(
        mockOperation,
      );
    });

    it("should upload a directory and return UploadOperation", async () => {
      const operation = await pinner.uploadDirectory(mockFiles);

      expect(mockUploadManagerInstance.uploadDirectory).toHaveBeenCalledWith(
        mockFiles,
        undefined,
      );
      expect(operation).toBe(mockOperation);
    });

    it("should pass options to UploadManager", async () => {
      const options: UploadOptions = {
        name: "my-directory",
        keyvalues: { type: "directory" },
      };

      const operation = await pinner.uploadDirectory(mockFiles, options);

      expect(mockUploadManagerInstance.uploadDirectory).toHaveBeenCalledWith(
        mockFiles,
        options,
      );
      expect(operation).toBe(mockOperation);
    });

    it("should handle directory upload errors", async () => {
      const error = new Error("Directory upload failed");
      mockUploadManagerInstance.uploadDirectory.mockRejectedValue(error);

      await expect(pinner.uploadDirectory(mockFiles)).rejects.toThrow(
        "Directory upload failed",
      );
    });
  });

  describe("upload builder API", () => {
    const mockFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    let mockUploadResult: UploadResult;
    let mockOperation: UploadOperation;

    beforeEach(async () => {
      const mockCid = await createMockCID(5);
      mockUploadResult = createMockUploadResult(
        "upload-builder-123",
        mockCid,
        "test.txt",
        12,
        "text/plain",
      );
      mockOperation = await createMockOperation(mockUploadResult);
      mockUploadManagerInstance.upload.mockResolvedValue(mockOperation);
      mockUploadManagerInstance.uploadCar.mockResolvedValue(mockOperation);
    });

    it("should support upload as a method (existing API)", async () => {
      const operation = await pinner.upload(mockFile, {
        name: "custom.txt",
        keyvalues: { type: "file" },
      });

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(mockFile, {
        name: "custom.txt",
        keyvalues: { type: "file" },
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.file() builder", async () => {
      const operation = await pinner.upload
        .file(mockFile)
        .name("custom.txt")
        .keyvalues({ type: "file" })
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(mockFile, {
        name: "custom.txt",
        keyvalues: { type: "file" },
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.json() builder", async () => {
      const jsonData = { foo: "bar", nested: { value: 123 } };
      const operation = await pinner.upload
        .json(jsonData)
        .name("data.json")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("data.json");
      expect(uploadedFile.type).toBe("application/json");
      expect(uploadCall[1]).toEqual({
        name: "data.json",
        keyvalues: undefined,
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.base64() builder", async () => {
      const base64Data = "SGVsbG8gV29ybGQ=";
      const operation = await pinner.upload
        .base64(base64Data)
        .name("hello.txt")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("hello.txt");
      expect(uploadCall[1]).toEqual({
        name: "hello.txt",
        keyvalues: undefined,
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.url() builder", async () => {
      const url = "https://httpbin.org/robots.txt";
      const operation = await pinner.upload
        .url(url)
        .name("remote-file.txt")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("remote-file.txt");
      expect(uploadCall[1]).toEqual({
        name: "remote-file.txt",
        keyvalues: undefined,
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.csv() builder with string", async () => {
      const csvData = "name,age\nJohn,30\nJane,25";
      const operation = await pinner.upload
        .csv(csvData)
        .name("users.csv")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("users.csv");
      expect(uploadedFile.type).toBe("text/csv");
      expect(uploadCall[1]).toEqual({
        name: "users.csv",
        keyvalues: undefined,
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.csv() builder with array of objects", async () => {
      const csvData = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const operation = await pinner.upload
        .csv(csvData)
        .name("users.csv")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("users.csv");
      expect(uploadedFile.type).toBe("text/csv");
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.csv() builder with array of arrays", async () => {
      const csvData = [
        ["name", "age"],
        ["John", 30],
        ["Jane", 25],
      ];
      const operation = await pinner.upload
        .csv(csvData)
        .name("users.csv")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("users.csv");
      expect(uploadedFile.type).toBe("text/csv");
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.text() builder", async () => {
      const textData = "Hello, World!";
      const operation = await pinner.upload
        .text(textData)
        .name("hello.txt")
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("hello.txt");
      expect(uploadedFile.type).toBe("text/plain");
      expect(uploadCall[1]).toEqual({
        name: "hello.txt",
        keyvalues: undefined,
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.content() as alias for text()", async () => {
      const textData = "Sample content";
      const operation = await pinner.upload
        .content(textData)
        .name("sample.txt")
        .keyvalues({ type: "text" })
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalled();
      const uploadCall = mockUploadManagerInstance.upload.mock.calls[0];
      const uploadedFile = uploadCall[0] as File;
      expect(uploadedFile.name).toBe("sample.txt");
      expect(uploadedFile.type).toBe("text/plain");
      expect(uploadCall[1]).toEqual({
        name: "sample.txt",
        keyvalues: { type: "text" },
      });
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.raw() builder with File", async () => {
      const mockCarFile = new File(["car data"], "data.car", {
        type: "application/vnd.ipld.car",
      });

      const operation = await pinner.upload
        .raw(mockCarFile)
        .name("my-data.car")
        .pin();

      expect(mockUploadManagerInstance.uploadCar).toHaveBeenCalledWith(
        mockCarFile,
        {
          name: "my-data.car",
          keyvalues: undefined,
        },
      );
      expect(operation).toBe(mockOperation);
    });

    it("should support upload.raw() builder with ReadableStream", async () => {
      const carStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("car data"));
          controller.close();
        },
      });

      const operation = await pinner.upload
        .raw(carStream)
        .name("stream-data.car")
        .keyvalues({ source: "stream" })
        .pin();

      expect(mockUploadManagerInstance.uploadCar).toHaveBeenCalledWith(
        carStream,
        {
          name: "stream-data.car",
          keyvalues: { source: "stream" },
        },
      );
      expect(operation).toBe(mockOperation);
    });

    it("should allow chaining name and keyvalues on raw builder", async () => {
      const mockCarFile = new File(["car data"], "data.car", {
        type: "application/vnd.ipld.car",
      });

      const operation = await pinner.upload
        .raw(mockCarFile)
        .name("my-car.car")
        .keyvalues({ type: "raw-car", version: "1.0" })
        .pin();

      expect(mockUploadManagerInstance.uploadCar).toHaveBeenCalledWith(
        mockCarFile,
        {
          name: "my-car.car",
          keyvalues: { type: "raw-car", version: "1.0" },
        },
      );
      expect(operation).toBe(mockOperation);
    });

    it("should allow chaining name and keyvalues on builder", async () => {
      const operation = await pinner.upload
        .file(mockFile)
        .name("my-file.txt")
        .keyvalues({ key1: "value1", key2: "value2" })
        .pin();

      expect(mockUploadManagerInstance.upload).toHaveBeenCalledWith(mockFile, {
        name: "my-file.txt",
        keyvalues: { key1: "value1", key2: "value2" },
      });
      expect(operation).toBe(mockOperation);
    });

    it("should return UploadOperation with controls from builder", async () => {
      const operation = await pinner.upload.file(mockFile).pin();

      expect(operation.cancel).toBeInstanceOf(Function);
      expect(operation.pause).toBeInstanceOf(Function);
      expect(operation.resume).toBeInstanceOf(Function);
      expect(operation.result).toBeInstanceOf(Promise);
      expect(operation.progress).toBeDefined();
    });

    it("should allow accessing upload as property for builder API", () => {
      expect(pinner.upload.file).toBeInstanceOf(Function);
      expect(pinner.upload.json).toBeInstanceOf(Function);
      expect(pinner.upload.base64).toBeInstanceOf(Function);
      expect(pinner.upload.url).toBeInstanceOf(Function);
      expect(pinner.upload.csv).toBeInstanceOf(Function);
      expect(pinner.upload.raw).toBeInstanceOf(Function);
      expect(pinner.upload.text).toBeInstanceOf(Function);
      expect(pinner.upload.content).toBeInstanceOf(Function);
    });

    it("should allow accessing upload as function for direct upload", () => {
      expect(typeof pinner.upload).toBe("function");
    });
  });

  describe("pinByHash", () => {
    it("should pin content by CID string", async () => {
      const mockCid = await createMockCID(3);
      const cidObj = CID.parse(mockCid);

      const asyncGenerator = (async function* () {
        yield cidObj;
      })();

      mockPinClientInstance.add.mockReturnValue(asyncGenerator);

      const result: CID[] = [];
      const pinGenerator = await pinner.pinByHash(mockCid);
      for await (const item of pinGenerator) {
        result.push(item);
      }

      expect(mockPinClientInstance.add).toHaveBeenCalledWith(cidObj, undefined);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(cidObj);
    });

    it("should pin content by CID object", async () => {
      const mockCid = await createMockCID(4);
      const cidObj = CID.parse(mockCid);

      const asyncGenerator = (async function* () {
        yield cidObj;
      })();

      mockPinClientInstance.add.mockReturnValue(asyncGenerator);

      const result: CID[] = [];
      const pinGenerator = await pinner.pinByHash(cidObj);
      for await (const item of pinGenerator) {
        result.push(item);
      }

      expect(mockPinClientInstance.add).toHaveBeenCalledWith(cidObj, undefined);
      expect(result).toHaveLength(1);
    });

    it("should pass options to PinClient", async () => {
      const mockCid = await createMockCID(5);
      const cidObj = CID.parse(mockCid);

      const asyncGenerator = (async function* () {
        yield cidObj;
      })();

      mockPinClientInstance.add.mockReturnValue(asyncGenerator);

      const options: RemoteAddOptions = {
        name: "test-pin",
        metadata: { key: "value" },
        origins: ["https://example.com"],
      };

      const result: CID[] = [];
      const pinGenerator = await pinner.pinByHash(mockCid, options);
      for await (const item of pinGenerator) {
        result.push(item);
      }

      expect(mockPinClientInstance.add).toHaveBeenCalledWith(cidObj, options);
    });

    it("should handle pin errors", async () => {
      const mockCid = await createMockCID(6);

      const asyncGenerator = (async function* () {
        throw new Error("Pin failed");
      })();

      mockPinClientInstance.add.mockReturnValue(asyncGenerator);

      await expect(async () => {
        const pinGenerator = await pinner.pinByHash(mockCid);
        for await (const item of pinGenerator) {
          item;
        }
      }).rejects.toThrow("Pin failed");
    });
  });

  describe("listPins", () => {
    it("should list all pins", async () => {
      const mockCid1 = await createMockCID(7);
      const mockCid2 = await createMockCID(8);

      const mockPin1 = createMockPin(mockCid1, "pin-1", Status.Pinned, 1024, {
        key: "value",
      });
      const mockPin2 = createMockPin(mockCid2, "pin-2", Status.Pinned, 2048);

      const asyncGenerator = (async function* () {
        yield mockPin1;
        yield mockPin2;
      })();

      mockPinClientInstance.ls.mockReturnValue(asyncGenerator);

      const pins = await pinner.listPins();

      expect(mockPinClientInstance.ls).toHaveBeenCalledWith(undefined);
      expect(pins).toHaveLength(2);
      expect(pins[0]).toEqual(mockPin1);
      expect(pins[1]).toEqual(mockPin2);
    });

    it("should pass options to PinClient", async () => {
      const options: RemoteLsOptions = {
        limit: 10,
        status: [Status.Pinned],
        name: "test",
      };

      const asyncGenerator = (async function* () {
        // Empty generator
      })();

      mockPinClientInstance.ls.mockReturnValue(asyncGenerator);

      await pinner.listPins(options);

      expect(mockPinClientInstance.ls).toHaveBeenCalledWith(options);
    });

    it("should handle empty pin list", async () => {
      const asyncGenerator = (async function* () {
        // Empty generator
      })();

      mockPinClientInstance.ls.mockReturnValue(asyncGenerator);

      const pins = await pinner.listPins();

      expect(pins).toHaveLength(0);
    });

    it("should handle list errors", async () => {
      const asyncGenerator = (async function* () {
        throw new Error("List failed");
      })();

      mockPinClientInstance.ls.mockReturnValue(asyncGenerator);

      await expect(pinner.listPins()).rejects.toThrow("List failed");
    });
  });

  describe("getPinStatus", () => {
    it("should get pin status by CID string", async () => {
      const mockCid = await createMockCID(9);
      const mockPin = createMockPin(mockCid, "test-pin", Status.Pinned, 1024, {
        key: "value",
      });

      mockPinClientInstance.get.mockResolvedValue(mockPin);

      const pin = await pinner.getPinStatus(mockCid);

      expect(mockPinClientInstance.get).toHaveBeenCalledWith(mockPin.cid);
      expect(pin).toEqual(mockPin);
    });

    it("should get pin status by CID object", async () => {
      const mockCid = await createMockCID(10);
      const mockPin = createMockPin(mockCid, "test-pin", Status.Pinned, 1024);

      mockPinClientInstance.get.mockResolvedValue(mockPin);

      const pin = await pinner.getPinStatus(mockPin.cid);

      expect(mockPinClientInstance.get).toHaveBeenCalledWith(mockPin.cid);
      expect(pin).toEqual(mockPin);
    });

    it("should handle get errors", async () => {
      const mockCid = await createMockCID(11);

      mockPinClientInstance.get.mockRejectedValue(new Error("Pin not found"));

      await expect(pinner.getPinStatus(mockCid)).rejects.toThrow(
        "Pin not found",
      );
    });
  });

  describe("isPinned", () => {
    it("should return true when content is pinned", async () => {
      const mockCid = await createMockCID(12);
      const cidObj = CID.parse(mockCid);

      mockPinClientInstance.isPinned.mockResolvedValue(true);

      const result = await pinner.isPinned(mockCid);

      expect(mockPinClientInstance.isPinned).toHaveBeenCalledWith(cidObj);
      expect(result).toBe(true);
    });

    it("should return false when content is not pinned", async () => {
      const mockCid = await createMockCID(13);
      const cidObj = CID.parse(mockCid);

      mockPinClientInstance.isPinned.mockResolvedValue(false);

      const result = await pinner.isPinned(mockCid);

      expect(mockPinClientInstance.isPinned).toHaveBeenCalledWith(cidObj);
      expect(result).toBe(false);
    });

    it("should work with CID object", async () => {
      const mockCid = await createMockCID(14);
      const cidObj = CID.parse(mockCid);

      mockPinClientInstance.isPinned.mockResolvedValue(true);

      const result = await pinner.isPinned(cidObj);

      expect(mockPinClientInstance.isPinned).toHaveBeenCalledWith(cidObj);
      expect(result).toBe(true);
    });
  });

  describe("setPinMetadata", () => {
    it("should set pin metadata by CID string", async () => {
      const mockCid = await createMockCID(15);
      const cidObj = CID.parse(mockCid);
      const metadata = { key: "value", custom: "data" };

      mockPinClientInstance.setMetadata.mockResolvedValue(undefined);

      await pinner.setPinMetadata(mockCid, metadata);

      expect(mockPinClientInstance.setMetadata).toHaveBeenCalledWith(
        cidObj,
        metadata,
      );
    });

    it("should set pin metadata by CID object", async () => {
      const mockCid = await createMockCID(16);
      const cidObj = CID.parse(mockCid);
      const metadata = { key: "value" };

      mockPinClientInstance.setMetadata.mockResolvedValue(undefined);

      await pinner.setPinMetadata(cidObj, metadata);

      expect(mockPinClientInstance.setMetadata).toHaveBeenCalledWith(
        cidObj,
        metadata,
      );
    });

    it("should clear metadata when undefined is passed", async () => {
      const mockCid = await createMockCID(17);
      const cidObj = CID.parse(mockCid);

      mockPinClientInstance.setMetadata.mockResolvedValue(undefined);

      await pinner.setPinMetadata(mockCid, undefined);

      expect(mockPinClientInstance.setMetadata).toHaveBeenCalledWith(
        cidObj,
        undefined,
      );
    });

    it("should handle set metadata errors", async () => {
      const mockCid = await createMockCID(18);
      const metadata = { key: "value" };

      mockPinClientInstance.setMetadata.mockRejectedValue(
        new Error("Update failed"),
      );

      await expect(pinner.setPinMetadata(mockCid, metadata)).rejects.toThrow(
        "Update failed",
      );
    });
  });

  describe("unpin", () => {
    it("should unpin content by CID string", async () => {
      const mockCid = await createMockCID(19);
      const cidObj = CID.parse(mockCid);

      const asyncGenerator = (async function* () {
        yield cidObj;
      })();

      mockPinClientInstance.rm.mockReturnValue(asyncGenerator);

      await pinner.unpin(mockCid);

      expect(mockPinClientInstance.rm).toHaveBeenCalledWith(cidObj, undefined);
    });

    it("should unpin content by CID object", async () => {
      const mockCid = await createMockCID(20);
      const cidObj = CID.parse(mockCid);

      const asyncGenerator = (async function* () {
        yield cidObj;
      })();

      mockPinClientInstance.rm.mockReturnValue(asyncGenerator);

      await pinner.unpin(cidObj);

      expect(mockPinClientInstance.rm).toHaveBeenCalledWith(cidObj, undefined);
    });

    it("should pass options to PinClient", async () => {
      const mockCid = await createMockCID(21);
      const cidObj = CID.parse(mockCid);

      const asyncGenerator = (async function* () {
        yield cidObj;
      })();

      mockPinClientInstance.rm.mockReturnValue(asyncGenerator);

      const abortController = new AbortController();
      const options = {
        signal: abortController.signal,
      };

      await pinner.unpin(mockCid, options);

      expect(mockPinClientInstance.rm).toHaveBeenCalledWith(cidObj, options);
    });

    it("should handle unpin errors", async () => {
      const mockCid = await createMockCID(22);

      const asyncGenerator = (async function* () {
        throw new Error("Unpin failed");
      })();

      mockPinClientInstance.rm.mockReturnValue(asyncGenerator);

      await expect(async () => {
        await pinner.unpin(mockCid);
      }).rejects.toThrow("Unpin failed");
    });
  });

  describe("destroy", () => {
    it("should destroy UploadManager", () => {
      pinner.destroy();

      expect(mockUploadManagerInstance.destroy).toHaveBeenCalledTimes(1);
    });

    it("should not throw errors when destroy is called", () => {
      expect(() => {
        pinner.destroy();
      }).not.toThrow();
    });

    it("should handle multiple destroy calls", () => {
      expect(() => {
        pinner.destroy();
        pinner.destroy();
        pinner.destroy();
      }).not.toThrow();

      expect(mockUploadManagerInstance.destroy).toHaveBeenCalledTimes(3);
    });
  });
});
