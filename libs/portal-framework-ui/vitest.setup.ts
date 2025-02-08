import "@testing-library/jest-dom/vitest";
// Import vi from vitest if globals is not enabled
import { vi } from "vitest";

// This tells Vitest to use the manual mock we created in __mocks__/zustand.ts
// It should be placed here, *outside* of describe/test blocks in test files.
vi.mock("zustand");
