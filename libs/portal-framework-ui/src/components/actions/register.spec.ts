import { describe, expect, it, vi, beforeEach } from "vitest";

// Use vi.mock to replace the actual imports with our mocks.
// Define the mock functions *inside* the factory functions.
vi.mock("./items/CancelActionItem", () => ({
  registerCancelActionItem: vi.fn(),
}));
vi.mock("./items/CustomActionItem", () => ({
  registerCustomActionItem: vi.fn(),
}));
vi.mock("./items/LinkActionItem", () => ({
  registerLinkActionItem: vi.fn(),
}));
vi.mock("./items/SubmitActionItem", () => ({
  registerSubmitActionItem: vi.fn(),
}));

// Import the function to be tested AFTER mocking
import { registerAllActionItems } from "./register";

// Import the mocked functions *after* the vi.mock calls so we can assert on them.
// Vitest will provide the mocked versions of these functions.
import { registerCancelActionItem } from "./items/CancelActionItem";
import { registerCustomActionItem } from "./items/CustomActionItem";
import { registerLinkActionItem } from "./items/LinkActionItem";
import { registerSubmitActionItem } from "./items/SubmitActionItem";

describe("registerAllActionItems", () => {
  // Clear mocks before each test to ensure a clean state for assertions
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call all individual registration functions", () => {
    registerAllActionItems();

    // Assert on the imported mocked functions
    expect(registerSubmitActionItem).toHaveBeenCalledTimes(1);
    expect(registerCancelActionItem).toHaveBeenCalledTimes(1);
    expect(registerCustomActionItem).toHaveBeenCalledTimes(1);
    expect(registerLinkActionItem).toHaveBeenCalledTimes(1);
  });
});
