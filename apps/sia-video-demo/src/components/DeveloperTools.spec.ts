import { describe, expect, it } from "vitest";
import {
  developerToolsSurfaces,
  type DeveloperToolSurface,
} from "./DeveloperTools";

/**
 * Node unit tests for the app-level "Developer tools" disclosure. The
 * developer options (the centralized developer-mode configuration) and the
 * event log are developer surfaces, not part of the product UI, so the
 * disclosure keeps them unmounted and hidden by default: the pure
 * `developerToolsSurfaces` helper decides what the app mounts for a given
 * disclosure state. The developer-options panel is the one centralized
 * UI surface for every developer option.
 */
describe("developerToolsSurfaces", () => {
  it("mounts no developer surfaces while the disclosure is collapsed (the default)", () => {
    expect(developerToolsSurfaces(false)).toEqual<DeveloperToolSurface[]>([]);
  });

  it("mounts the developer-options surface and the event log once expanded", () => {
    expect(developerToolsSurfaces(true)).toEqual<DeveloperToolSurface[]>([
      "developer-options",
      "event-log",
    ]);
  });
});
