import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

// Extends Vitest's expect with methods from react-testing-library/jest-dom
expect.extend(matchers);

// Runs cleanup after each test file.
// This is important for React Testing Library to ensure tests are isolated.
afterEach(() => {
  cleanup();
});
