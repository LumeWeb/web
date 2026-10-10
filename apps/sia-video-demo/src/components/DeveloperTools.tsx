/**
 * App-level "Developer tools" disclosure: the one centralized UI surface
 * for developer-mode features. The developer options (the centralized
 * developer-mode configuration) and the event log are developer surfaces,
 * not part of the product UI, so they are collapsed and UNMOUNTED by
 * default: `developerToolsSurfaces` decides the mount set and the component
 * renders exactly that. Expanding the disclosure mounts the
 * `DeveloperOptionsPanel` (the only place the developer options are edited)
 * and the `EventLog` panel; collapsing unmounts them again.
 */

import { useState } from "react";
import { DeveloperOptionsPanel } from "./DeveloperOptions";
import { EventLog } from "./player/EventLog";

/** One developer surface the disclosure can mount. */
export type DeveloperToolSurface = "developer-options" | "event-log";

export function DeveloperTools() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        aria-expanded={open}
        className="text-fg-muted block cursor-pointer border-0 bg-transparent px-0 py-1 text-left text-[13px] hover:underline"
        onClick={() => setOpen((value) => !value)}
        type="button">
        {open ? "Hide" : "Show"} developer tools
      </button>
      {developerToolsSurfaces(open).map((surface) =>
        surface === "developer-options" ? (
          <DeveloperOptionsPanel key="developer-options" />
        ) : (
          <EventLog key="event-log" />
        ),
      )}
    </div>
  );
}

/**
 * What the disclosure mounts for a given open state: nothing while
 * collapsed, the centralized developer-options panel and the event-log
 * panel only once expanded. Pure and deterministic so the visibility rule
 * is pinned in a Node spec without rendering.
 */
export function developerToolsSurfaces(
  open: boolean,
): readonly DeveloperToolSurface[] {
  return open
    ? ["developer-options", "event-log"]
    : ([] as readonly DeveloperToolSurface[]);
}
