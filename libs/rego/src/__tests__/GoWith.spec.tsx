import { describe, expect, test } from "vitest";
import { renderToDecodedString, stripReactComments } from "./testHelpers";
import { GoWith } from "@/GoWith";
import { GoVar } from "@/GoVar";

describe("GoWith", () => {
  test("renders with statement without fallback", () => {
    const html = stripReactComments(
      renderToDecodedString(
        <GoWith value="user">
          <div>
            Name: <GoVar name="name" />
          </div>
          <div>
            Email: <GoVar name="email" />
          </div>
        </GoWith>,
      ),
    );
    expect(html).toContain("{{with .user}}");
    expect(html).toContain("<div>Name: {{.name}}</div>");
    expect(html).toContain("<div>Email: {{.email}}</div>");
    expect(html).toContain("{{end}}");
  });

  test("renders with statement with fallback", () => {
    const html = stripReactComments(
      renderToDecodedString(
        <GoWith value="user" fallback="No user found">
          <div>
            Welcome, <GoVar name="name" />
          </div>
        </GoWith>,
      ),
    );
    expect(html).toContain("{{with .user}}");
    expect(html).toContain("<div>Welcome, {{.name}}</div>");
    expect(html).toContain("{{else}}");
    expect(html).toContain("No user found");
    expect(html).toContain("{{end}}");
  });
});
