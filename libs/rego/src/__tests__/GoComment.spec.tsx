import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoComment } from "@/GoComment";

describe("GoComment", () => {
  test("renders comment with text", () => {
    const html = renderToDecodedString(
      <GoComment>This section shows user profile information</GoComment>,
    );
    expect(html).toContain(
      "{{/* This section shows user profile information */}}",
    );
  });

  test("renders comment with multiple lines", () => {
    const html = renderToDecodedString(
      <GoComment>This is a longer comment that spans multiple lines</GoComment>,
    );
    expect(html).toContain(
      "{{/* This is a longer comment that spans multiple lines */}}",
    );
  });
});
