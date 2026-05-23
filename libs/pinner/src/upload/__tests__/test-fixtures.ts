import type { UploadResult } from "@/types/upload";
import { DEFAULT_UPLOAD_LIMIT, MOCK_UPLOAD_RESULT } from "./test-constants";

/**
 * Test fixtures and factory functions for creating test data
 */

export interface UploadOperationFixture {
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  result: Promise<UploadResult>;
  progress: { percentage: number; bytesUploaded: number; bytesTotal: number };
}

export function createMockUploadOperation(
  result: UploadResult = MOCK_UPLOAD_RESULT,
  progress: any = { percentage: 0, bytesUploaded: 0, bytesTotal: 1024 },
): UploadOperationFixture {
  return {
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    result: Promise.resolve(result),
    progress,
  };
}

export function createFailingUploadOperation(
  error: Error = new Error("Upload failed"),
): UploadOperationFixture {
  return {
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    result: Promise.reject(error),
    progress: { percentage: 0, bytesUploaded: 0, bytesTotal: 1024 },
  };
}

export function createMockUploadResult(
  overrides: Partial<UploadResult> = {},
): UploadResult {
  return {
    ...MOCK_UPLOAD_RESULT,
    ...overrides,
  };
}

export function createLargeMockUploadResult(): UploadResult {
  return createMockUploadResult({
    id: "large-test-id",
    size: DEFAULT_UPLOAD_LIMIT + 1,
    name: "large-test.car",
  });
}

export function createSmallMockUploadResult(): UploadResult {
  return createMockUploadResult({
    id: "small-test-id",
    size: 1024,
    name: "small-test.car",
  });
}

export interface ConfigFixture {
  jwt: string;
  endpoint: string;
  gateway: string;
  [key: string]: any;
}

export function createMockConfig(
  overrides: Partial<ConfigFixture> = {},
): ConfigFixture {
  return {
    jwt: "test-jwt-token",
    endpoint: "https://test.pinner.xyz",
    gateway: "https://gateway.test.com",
    ...overrides,
  };
}

export interface UploadOptionsFixture {
  name?: string;
  keyvalues?: Record<string, string>;
  signal?: AbortSignal;
  size?: number;
  isDirectory?: boolean;
  type?: string;
}

export function createMockUploadOptions(
  overrides: Partial<UploadOptionsFixture> = {},
): UploadOptionsFixture {
  return {
    name: "test.car",
    keyvalues: { key1: "value1" },
    ...overrides,
  };
}

export function createLargeUploadOptions(
  overrides: Partial<UploadOptionsFixture> = {},
): UploadOptionsFixture {
  return createMockUploadOptions({
    name: "large.car",
    size: DEFAULT_UPLOAD_LIMIT + 1,
    ...overrides,
  });
}

export function createSmallUploadOptions(
  overrides: Partial<UploadOptionsFixture> = {},
): UploadOptionsFixture {
  return createMockUploadOptions({
    name: "small.car",
    size: 1024,
    ...overrides,
  });
}

export interface StreamTestFixture {
  stream: ReadableStream;
  content: string;
  size: number;
}

export function createTestStream(
  content: string = "test content",
): StreamTestFixture {
  const encoded = new TextEncoder().encode(content);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });

  return {
    stream,
    content,
    size: encoded.length,
  };
}

export function createLargeTestStream(): StreamTestFixture {
  const content = "x".repeat(DEFAULT_UPLOAD_LIMIT + 1);
  return createTestStream(content);
}

export function createSmallTestStream(): StreamTestFixture {
  return createTestStream("small content");
}

export interface FileTestFixture {
  file: File;
  content: string;
  size: number;
}

export function createTestFile(
  content: string = "test content",
  name: string = "test.car",
  type: string = "application/vnd.ipld.car",
): FileTestFixture {
  const encoded = new TextEncoder().encode(content);
  const file = new File([encoded], name, { type });

  return {
    file,
    content,
    size: encoded.length,
  };
}

export function createLargeTestFile(): FileTestFixture {
  const content = "x".repeat(DEFAULT_UPLOAD_LIMIT + 1);
  return createTestFile(content, "large.car");
}

export function createSmallTestFile(): FileTestFixture {
  return createTestFile("small content", "small.car");
}

export function createEmptyTestFile(): FileTestFixture {
  return createTestFile("", "empty.car");
}

export function createTestUploadFile(
  content: string = "test content",
  name: string = "test.car",
  type: string = "application/vnd.ipld.car",
): File {
  return new File([content], name, { type });
}

export function createEmptyReadableStream(): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>();
}

// Directory file fixtures
export interface DirectoryFileFixture {
  name: string;
  content: string;
  path: string;
}

export function createDirectoryFile(
  name: string,
  content: string,
  path: string,
): DirectoryFileFixture {
  return { name, content, path };
}

export function createTestDirectoryFiles(): DirectoryFileFixture[] {
  return [
    createDirectoryFile("file1.txt", "content1", "file1.txt"),
    createDirectoryFile("file2.txt", "content2", "dir/file2.txt"),
    createDirectoryFile("file3.json", '{"test": "data"}', "nested/file3.json"),
  ];
}

export function createSmallDirectoryFiles(): DirectoryFileFixture[] {
  return [createDirectoryFile("small.txt", "small content", "small.txt")];
}

// Mock handler fixtures (for tests that need vi.mock)
export interface HandlerTestFixture {
  upload: any;
  destroy: any;
}

// Dynamic import helper to avoid race conditions with mocking
// This function dynamically imports TUSUploadHandler at runtime
// instead of at module load time, preventing mock race conditions.
export async function importTUSUploadHandler() {
  const module = await import("../tus-upload");
  return module.TUSUploadHandler;
}

// Dynamic import helper for UploadManager to avoid MSW mock race conditions
export async function importUploadManager() {
  const module = await import("../manager");
  return module.UploadManager;
}

export function createMockHandler(): HandlerTestFixture {
  return {
    upload: () => createMockUploadOperation(),
    destroy: () => {},
  };
}

export function createMockXhrHandler(): HandlerTestFixture {
  return {
    upload: () => createMockUploadOperation(),
    destroy: () => {},
  };
}

export function createMockTusHandler(): HandlerTestFixture {
  return {
    upload: () => createMockUploadOperation(),
    destroy: () => {},
  };
}
