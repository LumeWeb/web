import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Import the component to test
import DesktopSidebar from "./DesktopSidebar";

// Mocking child components
vi.mock("../LumeLogo", () => ({
  LumeLogo: () => <div data-testid="mock-lume-logo" />,
}));

vi.mock("../MainNavigation", () => ({
  MainNavigation: () => <div data-testid="mock-main-navigation" />,
}));

describe("DesktopSidebar", () => {
  afterEach(cleanup);

  it("renders correctly with mocked components and text", () => {
    render(<DesktopSidebar />);

    // Check if mocked components are rendered
    expect(screen.getByTestId("mock-lume-logo")).toBeInTheDocument();
    expect(screen.getByTestId("mock-main-navigation")).toBeInTheDocument();

    // Check if the specific text elements are present
    expect(screen.getByText("Freedom")).toBeInTheDocument();
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Ownership")).toBeInTheDocument();
  });
});
