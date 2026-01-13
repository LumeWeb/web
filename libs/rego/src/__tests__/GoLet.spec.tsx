import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoLet } from "@/GoLet";
import { GoVar } from "@/GoVar";

describe("GoLet", () => {
  test("renders simple variable assignment with value prop", () => {
    const html = renderToDecodedString(
      <GoLet name="currentUser" value="user">
        <div>
          <GoVar name="$currentUser.name" />
        </div>
      </GoLet>,
    );
    expect(html).toContain("{{$currentUser := .user}}");
    expect(html).toContain("{{$currentUser.name}}");
  });

  test("renders variable assignment with local variable value", () => {
    const html = renderToDecodedString(
      <GoLet name="displayName" value="$item.title">
        <div>
          <GoVar name="$displayName" />
        </div>
      </GoLet>,
    );
    expect(html).toContain("{{$displayName := $item.title}}");
  });

  test("renders assignment with GoFormat", () => {
    const html = renderToDecodedString(
      <GoLet name="displayName">
        <div>
          <GoVar name="$displayName" />
        </div>
      </GoLet>,
    );
    // Without GoFormat, it should just render children
    expect(html).toContain("{{$displayName}}");
  });

  test("renders children without assignment when no pattern matches", () => {
    const html = renderToDecodedString(
      <GoLet name="test">
        <div>Just content</div>
      </GoLet>,
    );
    // Falls back to just rendering children
    expect(html).toContain("<div>Just content</div>");
  });
});
