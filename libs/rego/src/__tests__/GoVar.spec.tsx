import { describe, expect, test } from "vitest";
import { renderToDecodedString } from "./testHelpers";
import { GoVar, goVar, goLocalVar, goFieldVar } from "@/GoVar";

describe("GoVar", () => {
  test("renders field access variable syntax", () => {
    const html = renderToDecodedString(<GoVar name="userName" />);
    expect(html).toContain("{{.userName}}");
  });

  test("renders local variable syntax", () => {
    const html = renderToDecodedString(<GoVar name="$item.Name" />);
    expect(html).toContain("{{$item.Name}}");
  });

  test("renders nested field access", () => {
    const html = renderToDecodedString(<GoVar name="user.profile.name" />);
    expect(html).toContain("{{.user.profile.name}}");
  });

  test("goVar helper function returns field syntax", () => {
    expect(goVar("userName")).toBe("{{.userName}}");
  });

  test("goVar helper function returns local variable syntax", () => {
    expect(goVar("$item.Name")).toBe("{{$item.Name}}");
  });

  test("goLocalVar helper function returns local variable syntax", () => {
    expect(goLocalVar("item.url")).toBe("{{item.url}}");
  });

  test("goFieldVar helper function returns field syntax", () => {
    expect(goFieldVar("DashboardURL")).toBe("{{.DashboardURL}}");
  });
});
