import type { NavigationItem } from "./navigation";

import { describe, expect, it } from "vitest";

describe("NavigationItem section field", () => {
  it("accepts section string", () => {
    const item: NavigationItem = {
      label: "Settings",
      path: "/settings",
      section: "Settings",
    };
    expect(item.section).toBe("Settings");
  });

  it("allows section to be undefined", () => {
    const item: NavigationItem = {
      label: "Dashboard",
      path: "/dashboard",
    };
    expect(item.section).toBeUndefined();
  });

  it("can group items by section", () => {
    const items: NavigationItem[] = [
      { id: "a", label: "A", path: "/a", order: 0 },
      { id: "b", label: "B", path: "/b", order: 1, section: "Settings" },
      { id: "c", label: "C", path: "/c", order: 2, section: "Settings" },
    ];

    const sections = new Map<string, NavigationItem[]>();
    for (const item of items) {
      const section = item.section ?? "default";
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section)!.push(item);
    }

    expect(sections.get("default")).toHaveLength(1);
    expect(sections.get("Settings")).toHaveLength(2);
    expect(sections.get("default")?.[0]?.id).toBe("a");
    expect(sections.get("Settings")?.map(i => i.id)).toEqual(["b", "c"]);
  });
});
