import {
  generateNestedUrl,
  NestedParamError,
  TemplateResolutionError,
} from "../generateUrl";
import { describe, expect, test } from "vitest";

describe("generateNestedUrl", () => {
  test("basic template substitution", () => {
    const result = generateNestedUrl({
      meta: {
        params: {
          project: "456",
          tenant: "123",
        },
        template: "tenants/{tenant}/projects/{project}/cases",
      },
      resource: "cases",
    });
    expect(result).toBe("tenants/123/projects/456/cases");
  });

  test("with id", () => {
    const result = generateNestedUrl({
      id: "789",
      meta: {
        params: {
          project: "456",
          tenant: "123",
        },
        template: "tenants/{tenant}/projects/{project}/cases",
      },
      resource: "cases",
    });
    expect(result).toBe("tenants/123/projects/456/cases/789");
  });

  test("with operation", () => {
    const result = generateNestedUrl({
      meta: {
        params: {
          project: "456",
          tenant: "123",
        },
        template: "tenants/{tenant}/projects/{project}/cases",
      },
      operation: "export",
      resource: "cases",
    });
    expect(result).toBe("tenants/123/projects/456/cases/export");
  });

  test("resource dot notation", () => {
    const result = generateNestedUrl({
      meta: {
        params: {
          case: "789",
          project: "456",
          tenant: "123",
        },
      },
      resource: "tenant.project.case",
    });
    expect(result).toBe("tenant/123/project/456/case");
  });

  test("complex template with multiple params", () => {
    const result = generateNestedUrl({
      meta: {
        params: {
          company: "101112",
          project: "456",
          tenant: "123",
        },
        template:
          "companies/{company}/tenants/{tenant}/projects/{project}/cases",
      },
      resource: "cases",
    });
    expect(result).toBe("companies/101112/tenants/123/projects/456/cases");
  });

  test("missing required parameter throws error", () => {
    expect(() =>
      generateNestedUrl({
        meta: {
          params: {}, // Missing tenant
          template: "tenants/{tenant}/cases",
        },
        resource: "cases",
      }),
    ).toThrow(NestedParamError);
  });

  test("invalid template throws error", () => {
    expect(() =>
      generateNestedUrl({
        meta: {
          params: { tenant: "123" },
          template: "tenants/{missingParam{}", // Invalid template syntax with malformed param
        },
        resource: "cases",
      }),
    ).toThrow(TemplateResolutionError);
  });

  test("with apiBase prefix", () => {
    const result = generateNestedUrl({
      apiBase: "https://api.example.com",
      meta: {
        params: {},
        template: "cases",
      },
      resource: "cases",
    });
    expect(result).toBe("cases");
  });

  test("encoded parameter values", () => {
    const result = generateNestedUrl({
      meta: {
        params: {
          tenant: "test tenant",
        },
        template: "tenants/{tenant}/cases",
      },
      resource: "cases",
    });
    expect(result).toBe("tenants/test%20tenant/cases");
  });
});
