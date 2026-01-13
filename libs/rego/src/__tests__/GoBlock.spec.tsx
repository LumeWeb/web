import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoBlock } from "@/GoBlock";

describe("GoBlock", () => {
  test("renders block without context", async () => {
    const html = renderToDecodedString(
      <GoBlock name="email-content">
        <div>Default content</div>
      </GoBlock>,
    );
    expect(html).toContain('{{block "email-content" .}}');
    expect(html).toContain("<div>Default content</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders block with context", () => {
    const html = renderToDecodedString(
      <GoBlock name="email-content" context=".user">
        <div>Default content</div>
      </GoBlock>,
    );
    expect(html).toContain('{{block "email-content" .user}}');
    expect(html).toContain("<div>Default content</div>");
    expect(html).toContain("{{end}}");
  });
});
