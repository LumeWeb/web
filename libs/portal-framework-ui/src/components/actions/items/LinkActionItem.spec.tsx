import { cleanup, render, screen } from "@testing-library/react"; // Import cleanup
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"; // Import afterEach and beforeEach
// We will mock react-router's Link, so we don't import the actual RouterLink here yet

import { ActionItemType } from "../types";
import { LinkActionItem, registerLinkActionItem } from "./LinkActionItem";
// We will mock the registry module, so we don't import the actual registerActionItemComponent here yet

// Mock react-router's Link component *before* importing LinkActionItem
vi.mock("react-router", () => ({
  Link: vi.fn(({ children, to, ...props }) => (
    <a data-testid="mock-router-link" href={to as string} {...props}>
      {children}
    </a>
  )),
}));

// Mock the core library components *before* importing LinkActionItem
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Button: vi.fn(
    (
      { children, ...props }, // Also mock Button
    ) => <button {...props}>{children}</button>,
  ),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Simple mock for class joining
  Spinner: vi.fn(
    (
      { className, size }, // Also mock Spinner
    ) => (
      <span className={className} data-testid="spinner">
        Loading ({size})
      </span>
    ),
  ),
}));

// Mock the registry module *before* importing registerLinkActionItem
// Define the mock function *inside* the factory
vi.mock("../registry", () => ({
  registerActionItemComponent: vi.fn(), // Define mock here
  resetRegistryForTesting: vi.fn(), // Mock this too if it were used here
}));

// Import the mocked Link component after its mock is defined
import { Link as RouterLink } from "react-router";

// Now import the component and its registration function AFTER the mocks
import { LinkActionItem, registerLinkActionItem } from "./LinkActionItem";

describe("LinkActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders as an <a> tag for external http links", () => {
    render(
      <LinkActionItem
        config={{
          label: "External",
          to: "http://example.com",
          type: ActionItemType.LINK,
        }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "http://example.com");
    expect(link).toHaveTextContent("External");
    expect(screen.queryByTestId("mock-router-link")).not.toBeInTheDocument(); // Should not be the mocked RouterLink
  });

  it("renders as an <a> tag for external https links", () => {
    render(
      <LinkActionItem
        config={{
          label: "External",
          to: "https://example.com",
          type: ActionItemType.LINK,
        }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(screen.queryByTestId("mock-router-link")).not.toBeInTheDocument();
  });

  it("renders as an <a> tag when target is _blank", () => {
    render(
      <LinkActionItem
        config={{
          label: "New Tab",
          target: "_blank",
          to: "/internal-path",
          type: ActionItemType.LINK,
        }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/internal-path");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByTestId("mock-router-link")).not.toBeInTheDocument();
  });

  it("renders as an <a> tag when reloadDocument is true", () => {
    render(
      <LinkActionItem
        config={{
          label: "Reload",
          reloadDocument: true,
          to: "/internal-path",
          type: ActionItemType.LINK,
        }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/internal-path");
    expect(screen.queryByTestId("mock-router-link")).not.toBeInTheDocument();
  });

  it("renders as RouterLink for internal paths by default", () => {
    render(
      <LinkActionItem
        config={{
          label: "Dashboard",
          to: "/dashboard",
          type: ActionItemType.LINK,
        }}
      />,
    );
    const link = screen.getByTestId("mock-router-link"); // Should be the mocked RouterLink
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveTextContent("Dashboard");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(
      screen.queryByRole("link", { name: "Dashboard" }),
    ).toBeInTheDocument(); // Check the mock rendered an <a> with the correct text
  });

  it("renders with provided label", () => {
    render(
      <LinkActionItem
        config={{ label: "Click Here", to: "/path", type: ActionItemType.LINK }}
      />,
    );
    // Query by role and text content is more robust than data-testid for user-facing elements
    expect(
      screen.getByRole("link", { name: "Click Here" }),
    ).toBeInTheDocument();
  });

  it("renders with provided children", () => {
    render(
      <LinkActionItem
        config={{
          children: <span>Go</span>,
          to: "/path",
          type: ActionItemType.LINK,
        }}
      />,
    );
    // Query by role and text content (or part of it)
    expect(screen.getByRole("link", { name: "Go" })).toBeInTheDocument();
    expect(screen.getByRole("link")).toContainHTML("<span>Go</span>");
  });

  it("prefers label over children", () => {
    render(
      <LinkActionItem
        config={{
          children: <span>Ignored Children</span>,
          label: "Preferred Label",
          to: "/path",
          type: ActionItemType.LINK,
        }}
      />,
    );
    expect(screen.getByRole("link")).toHaveTextContent("Preferred Label");
    expect(screen.getByRole("link")).not.toContainHTML(
      "<span>Ignored Children</span>",
    );
  });

  it("applies className from config", () => {
    render(
      <LinkActionItem
        config={{
          className: "extra-class",
          label: "Link",
          to: "/path",
          type: ActionItemType.LINK,
        }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("extra-class");
    // Check that default classes are also applied (mocked cn joins them)
    // Note: The mocked `cn` just joins strings, so we check for the joined string
    // This might need adjustment if the actual `cn` does more complex logic
    expect(link).toHaveClass("inline-flex");
    expect(link).toHaveClass("text-primary");
  });

  it("applies target attribute correctly for <a> tags", () => {
    render(
      <LinkActionItem
        config={{
          label: "Self",
          target: "_self",
          to: "http://example.com",
          type: ActionItemType.LINK,
        }}
      />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("target", "_self");
    expect(screen.getByRole("link")).not.toHaveAttribute("rel"); // rel only for _blank
  });

  it("does not apply rel attribute for non-_blank targets", () => {
    render(
      <LinkActionItem
        config={{
          label: "Self",
          target: "_self",
          to: "http://example.com",
          type: ActionItemType.LINK,
        }}
      />,
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("rel");
  });
});

// Import the mocked registry function just before the suite that uses it
import { registerActionItemComponent } from "../registry";

describe("registerLinkActionItem", () => {
  // Clear the mock calls on the registry mock before this test suite
  beforeEach(() => {
    // Use the imported mock function directly
    registerActionItemComponent.mockClear();
  });

  it("should register the LinkActionItem component", () => {
    registerLinkActionItem();

    // Assert that the mocked registerActionItemComponent was called
    expect(registerActionItemComponent).toHaveBeenCalledTimes(1);
    expect(registerActionItemComponent).toHaveBeenCalledWith(
      ActionItemType.LINK,
      LinkActionItem,
    );
  });
});
