import { expect } from "vitest";
import type { Result } from "@/types";
import type { AccountError } from "@/types";

/**
 * Type guards and helper functions for testing Result<T> types
 */

/**
 * Asserts that a Result is successful and narrows the type
 */
export function expectSuccess<T>(result: Result<T>): asserts result is { success: true; data: T } {
  expect(result.success).toBe(true);
}

/**
 * Asserts that a Result failed and narrows the type
 */
export function expectFailure<T>(result: Result<T>): asserts result is { success: false; error: AccountError } {
  expect(result.success).toBe(false);
}

/**
 * Helper to check operation status in results
 */
export function expectOperationStatus<T extends { status: string }>(result: Result<T>, expectedStatus: string) {
  expectSuccess(result);
  expect(result.data.status).toBe(expectedStatus);
}

/**
 * Creates a successful mock Result object with proper typing
 */
export function createMockSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Creates a failed mock Result object with proper typing
 */
export function createMockFailure(error: Error | string): Result<never> {
  const errorObj = typeof error === 'string' 
    ? new Error(error)
    : error;
  return { 
    success: false, 
    error: errorObj as AccountError 
  };
}

/**
 * Helper to access private properties for testing
 * Use sparingly and only when testing internal state
 */
export function getPrivateProperty<T, K extends string>(obj: T, prop: K): any {
  return (obj as any)[prop];
}

/**
 * Sets a private property for testing
 * Use sparingly and only when manipulating internal state
 */
export function setPrivateProperty<T, K extends string>(obj: T, prop: K, value: any): void {
  (obj as any)[prop] = value;
}

/**
 * Creates a mock with any type for testing invalid inputs
 * Use sparingly - prefer proper typing when possible
 */
export function asMock<T>(value: unknown): T {
  return value as any;
}
