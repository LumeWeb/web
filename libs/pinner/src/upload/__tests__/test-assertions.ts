import { expect } from "vitest";
import type { UploadOperation, UploadResult } from "@/types/upload";
import { MOCK_UPLOAD_RESULT } from "./test-constants";

/**
 * Assertion helpers for common test patterns
 */

export function assertUploadOperationStructure(operation: UploadOperation) {
  expect(operation).toBeDefined();
  expect(operation.cancel).toBeInstanceOf(Function);
  expect(operation.pause).toBeInstanceOf(Function);
  expect(operation.resume).toBeInstanceOf(Function);
  expect(operation.result).toBeInstanceOf(Promise);
  expect(operation.progress).toBeDefined();
}

export function assertMockUploadResult(result: UploadResult) {
  expect(result).toEqual(MOCK_UPLOAD_RESULT);
}

export function assertValidUploadResult(result: UploadResult, expectCid: boolean = true) {
  expect(result).toBeDefined();
  expect(result.id).toBeDefined();
  if (expectCid) {
    expect(result.cid).toBeDefined();
  }
  expect(result.name).toBeDefined();
  expect(result.size).toBeGreaterThanOrEqual(0);
  expect(result.mimeType).toBeDefined();
  expect(result.createdAt).toBeDefined();
  expect(result.numberOfFiles).toBeGreaterThanOrEqual(1);
}

export function assertHandlerCalledCorrectly(
  mockHandler: any,
  expectedInput: any,
  expectedOptions?: any,
) {
  if (expectedOptions) {
    expect(mockHandler.upload).toHaveBeenCalledWith(
      expectedInput,
      expectedOptions,
    );
  } else {
    expect(mockHandler.upload).toHaveBeenCalledWith(expectedInput, undefined);
  }
}

export function assertHandlerNotCalled(mockHandler: any) {
  expect(mockHandler.upload).not.toHaveBeenCalled();
}

export function assertHandlerDestroyed(mockHandler: any) {
  expect(mockHandler.destroy).toHaveBeenCalled();
}

export function assertSdkUploadLimitCalled(
  mockSdkInstance: any,
  expectedTimes: number = 1,
) {
  expect(mockSdkInstance.account().uploadLimit).toHaveBeenCalledTimes(
    expectedTimes,
  );
}

export function assertUploadLimitFetched(manager: any, expectedLimit: number) {
  expect(manager.getUploadLimit()).toBe(expectedLimit);
}

export function assertFileDataIntegrity(
  capturedInput: File,
  expectedContent: string,
) {
  expect(capturedInput).toBeInstanceOf(File);
  expect(capturedInput.text()).resolves.toBe(expectedContent);
}

export function assertBinaryDataIntegrity(
  capturedInput: File,
  expectedData: Uint8Array,
) {
  expect(capturedInput).toBeInstanceOf(File);
  const buffer = capturedInput.arrayBuffer();
  expect(buffer).resolves.toSatisfy((arrayBuffer: ArrayBuffer) => {
    const capturedData = new Uint8Array(arrayBuffer);
    return (
      capturedData.length === expectedData.length &&
      capturedData.every((byte, index) => byte === expectedData[index])
    );
  });
}

export function assertProgressCallbackCalled(
  onProgress: any,
  expectedCalls?: number,
) {
  if (expectedCalls !== undefined) {
    expect(onProgress).toHaveBeenCalledTimes(expectedCalls);
  } else {
    expect(onProgress).toHaveBeenCalled();
  }
}

export function assertErrorThrown(
  asyncFn: () => Promise<any>,
  expectedErrorType?: any,
  expectedMessage?: string,
) {
  if (expectedMessage) {
    return expect(asyncFn()).rejects.toThrow(expectedMessage);
  } else if (expectedErrorType) {
    return expect(asyncFn()).rejects.toThrow(expectedErrorType);
  } else {
    return expect(asyncFn()).rejects.toThrow();
  }
}

export function assertMockFunctionCalled(mockFn: any, expectedTimes?: number) {
  if (expectedTimes !== undefined) {
    expect(mockFn).toHaveBeenCalledTimes(expectedTimes);
  } else {
    expect(mockFn).toHaveBeenCalled();
  }
}

export function assertMockFunctionNotCalled(mockFn: any) {
  expect(mockFn).not.toHaveBeenCalled();
}

export function assertMockFunctionCalledWith(mockFn: any, expectedArgs: any[]) {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
}

export function assertResultDefined(result: any) {
  expect(result).toBeDefined();
}

export function assertCallbackCalled(callback: any, expectedTimes?: number) {
  if (expectedTimes !== undefined) {
    expect(callback).toHaveBeenCalledTimes(expectedTimes);
  } else {
    expect(callback).toHaveBeenCalled();
  }
}
