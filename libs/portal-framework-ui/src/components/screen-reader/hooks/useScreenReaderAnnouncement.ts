import React from "react";

export type PolitenessLevel = "assertive" | "polite";

export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = React.useState("");
  const [politeness, setPoliteness] = React.useState<PolitenessLevel>("polite");
  // Use number type for browser compatibility
  const timeoutRef = React.useRef<null | number>(null);

  const announce = React.useCallback(
    (message: string, level: PolitenessLevel = "polite") => {
      // Clear any existing timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      // Set the announcement and politeness level
      setAnnouncement(message);
      setPoliteness(level);

      // Clear the announcement after a delay to prevent duplicate announcements
      timeoutRef.current = window.setTimeout(() => {
        setAnnouncement("");
      }, 3000);
    },
    [],
  );

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce, announcement, politeness };
}
