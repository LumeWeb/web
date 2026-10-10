import { describe, expect, it } from "vitest";
import {
  PUBLISH_HEADING,
  PUBLISH_INDEXER_URL_LABEL,
  PUBLISH_OBJECT_KEY_LABEL,
} from "./PublishSourceEntry";

/**
 * Node unit checks for the publish source-entry panel's user-facing copy.
 * These unit tests run in the node environment (no jsdom), so the component
 * is never server-rendered; the copy is pinned via the exported plaintext
 * constant instead.
 */
describe("PublishSourceEntry copy", () => {
  it("headlines the publish panel with a plain play prompt", () => {
    expect(PUBLISH_HEADING).toBe("Play from a Sia share URL");
  });

  it("labels the armed object key and indexer URL plainly", () => {
    expect(PUBLISH_OBJECT_KEY_LABEL).toBe("Object key");
    expect(PUBLISH_INDEXER_URL_LABEL).toBe("Indexer URL");
  });

  it("never reverts to the old publish framing", () => {
    expect(PUBLISH_HEADING).not.toContain("Publish a shared source");
    expect(PUBLISH_OBJECT_KEY_LABEL).not.toBe("object");
    expect(PUBLISH_INDEXER_URL_LABEL).not.toBe("indexer");
  });
});
