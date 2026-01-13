import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoDate, goDate } from "@/GoDate";

describe("GoDate", () => {
  test("renders date formatting with field", () => {
    const html = renderToDecodedString(
      <GoDate var="createdAt" format="Jan 2, 2006" />,
    );
    expect(html).toContain('{{.createdAt | formatDate "Jan 2, 2006"}}');
  });

  test("renders date formatting with local variable", () => {
    const html = renderToDecodedString(
      <GoDate var="$item.createdAt" format="2006-01-02" />,
    );
    expect(html).toContain('{{$item.createdAt | formatDate "2006-01-02"}}');
  });

  test("goDate helper function returns correct syntax", () => {
    const result = goDate("dueDate", "Jan 2, 2006");
    expect(result).toBe('{{.dueDate | formatDate "Jan 2, 2006"}}');
  });
});
