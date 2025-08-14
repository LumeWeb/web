import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mocking external dependencies and child components/hooks
vi.mock("@/components/dialog", () => ({
  DialogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-dialog-provider">{children}</div>
  ),
  DialogRenderer: () => <div data-testid="mock-dialog-renderer" />,
}));

vi.mock("@/components/ThemeSwitcher", () => ({
  ThemeSwitcher: () => <div data-testid="mock-theme-switcher" />,
}));

vi.mock("@/hooks/useTheme", () => ({
  withTheme: (Component: React.ComponentType) => (props: any) => (
    <div data-testid="mock-with-theme">
      <Component {...props} />
    </div>
  ),
}));

vi.mock("@/images", () => ({
  discordLogoPng: "discord-logo.png",
  lumeColorLogoPng: "lume-color-logo.png",
}));

vi.mock("@lumeweb/portal-framework-ui-core", () => ({
  Avatar: (props: any) => <div data-testid="mock-avatar" {...props} />,
  Button: (props: any) => (
    <button data-testid="mock-button" {...props}>
      {props.children}
    </button>
  ),
  ChevronDownIcon: () => <div data-testid="mock-chevron-down-icon" />,
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-dropdown-menu-content">{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-dropdown-menu-group">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="mock-dropdown-menu-item" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-dropdown-menu-trigger">{children}</div>
  ),
  useMobile: vi.fn(), // Will be set per test case
}));

vi.mock("@radix-ui/react-icons", () => ({
  ChevronDownIcon: () => <div data-testid="mock-radix-chevron-down-icon" />,
  ExitIcon: () => <div data-testid="mock-exit-icon" />,
}));

const mockLogoutMutate = vi.fn();
const mockIdentity = { firstName: "John", lastName: "Doe" };
vi.mock("@refinedev/core", () => ({
  useGetIdentity: () => ({ data: mockIdentity }),
  useLogout: () => ({ mutate: mockLogoutMutate }),
}));

vi.mock("react-router", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock the sidebar components
vi.mock("./DesktopSidebar", () => ({
  default: () => <div data-testid="mock-desktop-sidebar" />,
}));

vi.mock("./MobileSidebar", () => ({
  default: () => <div data-testid="mock-mobile-sidebar" />,
}));

import { useMobile } from "@lumeweb/portal-framework-ui-core";

// Import the component to test
import { GeneralLayout } from "./GeneralLayout";

describe("GeneralLayout", () => {
  const mockChildren = <div data-testid="mock-children">Layout Children</div>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Default to desktop view unless specified otherwise
    (useMobile as vi.Mock).mockReturnValue(false);
  });

  afterEach(cleanup);

  it("renders DesktopSidebar and desktop elements when not mobile", () => {
    render(<GeneralLayout>{mockChildren}</GeneralLayout>);

    expect(screen.getByTestId("mock-desktop-sidebar")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-mobile-sidebar")).not.toBeInTheDocument();

    // Check for desktop-specific elements
    expect(screen.getByTestId("mock-theme-switcher")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-dropdown-menu-trigger"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${mockIdentity.firstName} ${mockIdentity.lastName}`),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-avatar")).toBeInTheDocument();
    expect(
      screen.getByTestId("mock-radix-chevron-down-icon"),
    ).toBeInTheDocument();

    // Check for footer links
    const connectLinks = screen.getAllByRole("link", {
      name: /Connect with us/i,
    });
    expect(connectLinks).toHaveLength(2); // Ensure we found both links

    const discordLink = connectLinks.find(
      (link) => link.getAttribute("href") === "https://discord.lumeweb.com",
    );
    const lumeLink = connectLinks.find(
      (link) => link.getAttribute("href") === "https://lumeweb.com",
    );

    expect(discordLink).toBeInTheDocument();
    expect(lumeLink).toBeInTheDocument();
    expect(discordLink).toHaveAttribute("href", "https://discord.lumeweb.com");
    expect(lumeLink).toHaveAttribute("href", "https://lumeweb.com");

    // Check if children are rendered
    expect(screen.getByTestId("mock-children")).toBeInTheDocument();
  });

  it("renders MobileSidebar and hides desktop elements when mobile", () => {
    (useMobile as vi.Mock).mockReturnValue(true); // Set to mobile view
    render(<GeneralLayout>{mockChildren}</GeneralLayout>);

    expect(
      screen.queryByTestId("mock-desktop-sidebar"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-mobile-sidebar")).toBeInTheDocument();

    // Check for absence of desktop-specific elements in the main content area
    // The ThemeSwitcher and the desktop header dropdown are rendered but hidden by CSS on mobile,
    // so we don't check for their absence in the DOM.
    // The mobile sidebar handles its own user/logout.

    // Check for footer links (should still be present in mobile view)
    const connectLinks = screen.getAllByRole("link", {
      name: /Connect with us/i,
    });
    expect(connectLinks).toHaveLength(2); // Ensure we found both links

    const discordLink = connectLinks.find(
      (link) => link.getAttribute("href") === "https://discord.lumeweb.com",
    );
    const lumeLink = connectLinks.find(
      (link) => link.getAttribute("href") === "https://lumeweb.com",
    );

    expect(discordLink).toBeInTheDocument();
    expect(lumeLink).toBeInTheDocument();
    expect(discordLink).toHaveAttribute("href", "https://discord.lumeweb.com");
    expect(lumeLink).toHaveAttribute("href", "https://lumeweb.com");

    // Check if children are rendered
    expect(screen.getByTestId("mock-children")).toBeInTheDocument();
  });

  it("calls logout when the desktop logout menu item is clicked", () => {
    (useMobile as vi.Mock).mockReturnValue(false); // Ensure desktop view
    render(<GeneralLayout>{mockChildren}</GeneralLayout>);

    // Simulate clicking the dropdown trigger to make the menu item available
    // With simple mocks, the dropdown content might be always visible.
    // For this simple mock, we assume the item is accessible.
    const logoutMenuItem = screen.getByTestId("mock-dropdown-menu-item");

    fireEvent.click(logoutMenuItem);

    expect(mockLogoutMutate).toHaveBeenCalledTimes(1);
  });

  it("renders DialogProvider and DialogRenderer", () => {
    render(<GeneralLayout>{mockChildren}</GeneralLayout>);

    expect(screen.getByTestId("mock-dialog-provider")).toBeInTheDocument();
    expect(screen.getByTestId("mock-dialog-renderer")).toBeInTheDocument();
  });

  it("wraps the component with withTheme", () => {
    render(<GeneralLayout>{mockChildren}</GeneralLayout>);
    expect(screen.getByTestId("mock-with-theme")).toBeInTheDocument();
  });
});
