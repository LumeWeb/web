import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoDefine } from "@/GoDefine";

describe("GoDefine", () => {
  test("renders define template", async () => {
    const html = renderToDecodedString(
      <GoDefine name="email-header">
        <div>Header content</div>
      </GoDefine>,
    );
    expect(html).toContain('{{define "email-header"}}');
    expect(html).toContain("<div>Header content</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders define with nested content", () => {
    const html = renderToDecodedString(
      <GoDefine name="user-info">
        <div>
          <span>Name</span>
          <span>Email</span>
        </div>
      </GoDefine>,
    );
    expect(html).toContain('{{define "user-info"}}');
    expect(html).toContain("<div>");
    expect(html).toContain("<span>Name</span>");
    expect(html).toContain("<span>Email</span>");
    expect(html).toContain("</div>");
    expect(html).toContain("{{end}}");
  });
});
