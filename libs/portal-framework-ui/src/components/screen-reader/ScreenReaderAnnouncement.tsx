import React from "react";

import { useScreenReaderAnnouncement } from "@/components/screen-reader/hooks/useScreenReaderAnnouncement";

interface ScreenReaderAnnouncementProps {
  /**
   * Optional ID for the announcement region
   */
  id?: string;
}

/**
 * ScreenReaderAnnouncement component
 *
 * This component creates a visually hidden live region for screen reader announcements.
 * It should be included once in your application, typically near the top level.
 *
 * Use the useScreenReaderAnnouncement hook to make announcements.
 */
export function ScreenReaderAnnouncement({
  id = "screen-reader-announcement",
}: ScreenReaderAnnouncementProps) {
  const { announcement, politeness } = useScreenReaderAnnouncement();

  return (
    <div
      aria-atomic="true"
      aria-live={politeness}
      className="sr-only"
      id={id}
      role={politeness === "assertive" ? "alert" : "status"}>
      {announcement}
    </div>
  );
}

/**
 * Re-export the hook for convenience
 */
export { useScreenReaderAnnouncement };
