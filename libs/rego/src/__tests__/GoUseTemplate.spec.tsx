import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoUseTemplate } from "@/GoUseTemplate";

describe("GoUseTemplate", () => {
  test("renders template invocation without data", () => {
    const html = renderToDecodedString(<GoUseTemplate name="email-header" />);
    expect(html).toContain('{{template "email-header"}}');
  });

  test("renders template invocation with data", () => {
    const html = renderToDecodedString(
      <GoUseTemplate name="user-info" data="currentUser" />,
    );
    expect(html).toContain('{{template "user-info" .currentUser}}');
  });

  test("renders template invocation ignoring children", () => {
    const html = renderToDecodedString(
      <GoUseTemplate name="header">
        <div>This should be ignored</div>
      </GoUseTemplate>,
    );
    expect(html).toContain('{{template "header"}}');
    expect(html).not.toContain("This should be ignored");
  });
});
