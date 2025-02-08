import { render, screen, cleanup } from "@testing-library/react"; // Import cleanup
import React from "react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest"; // Import afterEach and beforeEach
// We will mock react-router's Link, so we don't import the actual RouterLink here yet

import { LinkActionItem, registerLinkActionItem } from "./LinkActionItem";
import { ActionItemType } from "../types";
// We will mock the registry module, so we don't import the actual registerActionItemComponent here yet

// Mock react-router's Link component *before* importing LinkActionItem
vi.mock("react-router", () => ({
  Link: vi.fn(({ to, children, ...props }) => (
    <a href={to as string} data-testid="mock-router-link" {...props}>
      {children}
    </a>
  )),
}));

// Mock the core library components *before* importing LinkActionItem
vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")), // Simple mock for class joining
  Button: vi.fn(({ children, ...props }) => ( // Also mock Button
    <button {...props}>{children}</button>
  )),
  Spinner: vi.fn(({ className, size }) => ( // Also mock Spinner
    <span data-testid="spinner" className={className}>
      Loading ({size})
    </span>
  )),
}));


// Mock the registry module *before* importing registerLinkActionItem
// Define the mock function *inside* the factory
vi.mock("../registry", () => ({
  registerActionItemComponent: vi.fn(), // Define mock here
  resetRegistryForTesting: vi.fn(), // Mock this too if it were used here
}));

// Now import the component and its registration function AFTER the mocks
import { LinkActionItem, registerLinkActionItem } from "./LinkActionItem";
// Import the mocked Link component after its mock is defined
import { Link as RouterLink } from "react-router";


describe("LinkActionItem", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders as an <a> tag for external http links", () => {
    render(
      <LinkActionItem
        config={{ type: ActionItemType.LINK, to: "http://example.com", label: "External" }}
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
        config={{ type: ActionItemType.LINK, to: "https://example.com", label: "External" }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(screen.queryByTestId("mock-router-link")).not.toBeInTheDocument();
  });

  it("renders as an <a> tag when target is _blank", () => {
    render(
      <LinkActionItem
        config={{ type: ActionItemType.LINK, to: "/internal-path", target: "_blank", label: "New Tab" }}
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
        config={{ type: ActionItemType.LINK, to: "/internal-path", reloadDocument: true, label: "Reload" }}
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/internal-path");
    expect(screen.queryByTestId("mock-router-link")).not.toBeInTheDocument();
  });

  it("renders as RouterLink for internal paths by default", () => {
    render(
      <LinkActionItem
        config={{ type: ActionItemType.LINK, to: "/dashboard", label: "Dashboard" }}
      />,
    );
    const link = screen.getByTestId("mock-router-link"); // Should be the mocked RouterLink
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveTextContent("Dashboard");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeInTheDocument(); // Check the mock rendered an <a> with the correct text
  });

  it("renders with provided label", () => {
    render(
      <LinkActionItem
        config={{ type: ActionItemType.LINK, to: "/path", label: "Click Here" }}
      />,
    );
    // Query by role and text content is more robust than data-testid for user-facing elements
    expect(screen.getByRole("link", { name: "Click Here" })).toBeInTheDocument();
  });

  it("renders with provided children", () => {
    render(
      <LinkActionItem
        config={{ type: ActionItemType.LINK, to: "/path", children: <span>Go</span> }}
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
          type: ActionItemType.LINK,
          to: "/path",
          label: "Preferred Label",
          children: <span>Ignored Children</span>,
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
        config={{ type: ActionItemType.LINK, to: "/path", className: "extra-class", label: "Link" }}
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
        config={{ type: ActionItemType.LINK, to: "http://example.com", target: "_self", label: "Self" }}
      />,
    );
    expect(screen.getByRole("link")).toHaveAttribute("target", "_self");
    expect(screen.getByRole("link")).not.toHaveAttribute("rel"); // rel only for _blank
  });

  it("does not apply rel attribute for non-_blank targets", () => {
    render(
      <LinkActionItem
        config={{ type: ActionItemType.LINK, to: "http://example.com", target: "_self", label: "Self" }}
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
