import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useScreenReaderAnnouncement } from "./hooks/useScreenReaderAnnouncement";
import { ScreenReaderAnnouncement } from "./ScreenReaderAnnouncement";

// Mock the hook to control its return values
vi.mock("./hooks/useScreenReaderAnnouncement");

const mockUseScreenReaderAnnouncement = useScreenReaderAnnouncement as vi.Mock;

describe("ScreenReaderAnnouncement", () => {
  afterEach(cleanup); // Clean up DOM after each test

  it("should render a visually hidden div with default attributes", () => {
    // Mock the hook to return default state
    mockUseScreenReaderAnnouncement.mockReturnValue({
      announce: vi.fn(),
      announcement: "",
      politeness: "polite",
    });

    render(<ScreenReaderAnnouncement />);

    const announcementDiv = screen.getByRole("status", { hidden: true }); // Use role and hidden: true to find sr-only element

    expect(announcementDiv).toBeInTheDocument();
    expect(announcementDiv).toHaveAttribute("aria-atomic", "true");
    expect(announcementDiv).toHaveAttribute("aria-live", "polite");
    expect(announcementDiv).toHaveAttribute("role", "status");
    expect(announcementDiv).toHaveClass("sr-only"); // Assuming 'sr-only' class exists for visual hiding
    expect(announcementDiv).toHaveAttribute("id", "screen-reader-announcement");
    expect(announcementDiv).toHaveTextContent("");
  });

  it("should display the announcement text", () => {
    const testMessage = "This is an announcement";
    mockUseScreenReaderAnnouncement.mockReturnValue({
      announce: vi.fn(),
      announcement: testMessage,
      politeness: "polite",
    });

    render(<ScreenReaderAnnouncement />);

    const announcementDiv = screen.getByRole("status", { hidden: true });
    expect(announcementDiv).toHaveTextContent(testMessage);
  });

  it("should update aria-live and role for assertive politeness", () => {
    mockUseScreenReaderAnnouncement.mockReturnValue({
      announce: vi.fn(),
      announcement: "Urgent alert!",
      politeness: "assertive",
    });

    render(<ScreenReaderAnnouncement />);

    const announcementDiv = screen.getByRole("alert", { hidden: true }); // Role changes to alert

    expect(announcementDiv).toBeInTheDocument();
    expect(announcementDiv).toHaveAttribute("aria-live", "assertive");
    expect(announcementDiv).toHaveAttribute("role", "alert");
  });

  it("should use a custom id if provided", () => {
    const customId = "my-custom-announcement-region";
    mockUseScreenReaderAnnouncement.mockReturnValue({
      announce: vi.fn(),
      announcement: "",
      politeness: "polite",
    });

    render(<ScreenReaderAnnouncement id={customId} />);

    const announcementDiv = screen.getByRole("status", { hidden: true });
    expect(announcementDiv).toHaveAttribute("id", customId);
  });

  it("should re-export the useScreenReaderAnnouncement hook", async () => {
    // Import the component and the re-exported hook directly from the file
    const {
      ScreenReaderAnnouncement,
      useScreenReaderAnnouncement: reExportedHook,
    } = await import("./ScreenReaderAnnouncement");

    // This is a simple check that the export exists and is the same function.
    // The hook's functionality is tested in its own spec file.
    expect(reExportedHook).toBe(useScreenReaderAnnouncement);
  });
});
