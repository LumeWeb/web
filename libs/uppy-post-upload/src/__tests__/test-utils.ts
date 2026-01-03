/**
 * Test utilities for XHRUpload tests
 */

import { vi } from "vitest";

/**
 * Type for mocked functions created with vi.fn()
 */
export type MockedFunction<T extends (...args: any[]) => any> = ReturnType<
  typeof vi.fn<T>
>;

/**
 * Casts a function to a MockedFunction type for type inference
 * This is a type-only helper that adds mock methods to the function type
 * Usage: mock(getNetworkClient).mockReturnValue(value)
 *
 * @example
 * const mockedClient = mock(getNetworkClient);
 * mockedClient.mockReturnValue(mockClient);
 */
export function mock<T extends (...args: any[]) => any>(
  fn: T,
): T & MockedFunction<T> {
  return fn as T & MockedFunction<T>;
}
