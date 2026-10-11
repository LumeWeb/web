import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const cssSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../index.css"),
  "utf8",
);

/** Guards the dialog colors the media skin applies over failed video frames. */
describe("media error dialog contrast (src/index.css)", () => {
  function declarationsFor(selector: string): string {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = new RegExp(`${escaped}\\s*{([^{]*)}`).exec(cssSource);
    return match ? match[1] : "";
  }

  function declaredValue(block: string, property: string): string {
    const match = new RegExp(`${property}\\s*:\\s*([^;]+);`).exec(block);
    return match ? match[1].trim() : "";
  }

  it("pins the dialog popup to an opaque dark background", () => {
    const block = declarationsFor(".media-default-skin .media-dialog__popup");
    expect(block, "rule for the dialog popup is missing from index.css").not
      .toBe("");
    const background = declaredValue(block, "background-color");
    expect(background, "popup must set an explicit background-color").not.toBe(
      "",
    );
    expect(background).not.toMatch(/\/\s*\d/);
    expect(background.toLowerCase()).not.toContain("#fff");
    expect(background).not.toContain("white");
  });

  it("pins the dialog popup text to a light color", () => {
    const block = declarationsFor(".media-default-skin .media-dialog__popup");
    const color = declaredValue(block, "color");
    expect(color, "popup must set an explicit light text color").not.toBe("");
    expect(color.toLowerCase()).not.toContain("#000");
    expect(color).not.toContain("black");
  });

  it("keeps the primary button label dark on the light button", () => {
    const block = declarationsFor(
      "media-default-skin media-error-dialog .media-button--primary",
    );
    expect(declaredValue(block, "color")).toBe("#000");
  });
});
