import { dataProvider } from "libs/advanced-rest/src/provider";
import { NestedParamError } from "libs/advanced-rest/src/utils/generateUrl";
import nock from "nock";
import { beforeEach, describe, expect, it } from "vitest";

const API_URL = "http://localhost:3000";
const dp = dataProvider(API_URL);

describe("Nested REST Data Provider", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe("getList", () => {
    it("should handle nested resource with filters and pagination", async () => {
      nock(API_URL)
        .get("/tenants/123/projects/456/cases")
        //.get("http://localhost:3000/tenants/123/projects/456/cases") // DEBUG: Check full URL
        .query({
          "_start": 0,
          "_end": 20,
          "name": "Critical",
          "status%5Bin%5D": "open%2Cpending",
        })
        .reply(200, [{ id: 1 }], { "x-total-count": "100" });

      const response = await dp.getList({
        filters: [
          { field: "name", operator: "eq", value: "Critical" },
          { field: "status", operator: "in", value: ["open", "pending"] },
        ],
        meta: {
          paramsMap: { project: "456", tenant: "123" },
          template: "tenants/{tenant}/projects/{project}/cases",
        },
        pagination: { current: 1, pageSize: 20 },
        resource: "tenant.project.case",
      });

      expect(response.data).toEqual([{ id: 1 }]);
      expect(response.total).toBe(100);
    });

    it("should throw error for missing template params", async () => {
      await expect(
        dp.getList({
          meta: {
            paramsMap: { tenant: "123" }, // Missing project
            template: "tenants/{tenant}/projects/{project}/cases",
          },
          resource: "tenant.project.case",
        }),
      ).rejects.toThrow(NestedParamError);
    });
  });

  describe("getOne", () => {
    it("should construct nested URL with ID", async () => {
      nock(API_URL)
        .get("/companies/101112/tenants/123/projects/456/cases/789")
        .reply(200, { id: 789 });

      const response = await dp.getOne({
        id: "789",
        meta: {
          paramsMap: { company: "101112", project: "456", tenant: "123" },
          template:
            "companies/{company}/tenants/{tenant}/projects/{project}/cases",
        },
        resource: "company.tenant.project.case",
      });

      expect(response.data).toEqual({ id: 789 });
    });
  });

  describe("create", () => {
    it("should POST to nested resource endpoint", async () => {
      nock(API_URL)
        .post("/tenants/123/projects", { title: "New Project" })
        .reply(201, { id: 457 });

      const response = await dp.create({
        meta: {
          paramsMap: { tenant: "123" },
          template: "tenants/{tenant}/projects",
        },
        resource: "tenant.project",
        variables: { title: "New Project" },
      });

      expect(response.data).toEqual({ id: 457 });
    });
  });

  describe("update", () => {
    it("should PATCH nested resource with ID", async () => {
      nock(API_URL)
        .patch("/projects/456/cases/789", { status: "closed" })
        .reply(200, { id: 789, status: "closed" });

      const response = await dp.update({
        id: "789",
        meta: {
          paramsMap: { project: "456" },
          template: "projects/{project}/cases",
        },
        resource: "project.case",
        variables: { status: "closed" },
      });

      expect(response.data).toEqual({ id: 789, status: "closed" });
    });
  });

  describe("deleteOne", () => {
    it("should DELETE nested resource", async () => {
      nock(API_URL).delete("/tenants/123/projects/456").reply(200, { id: 456 });

      const response = await dp.deleteOne({
        id: "456",
        meta: {
          paramsMap: { tenant: "123" },
          template: "tenants/{tenant}/projects",
        },
        resource: "tenant.project",
      });

      expect(response.data).toEqual({ id: 456 });
    });
  });

  describe("custom", () => {
    it("should handle custom endpoint with operation", async () => {
      nock(API_URL)
        .post("/cases/789/archive", { reason: "resolved" })
        .reply(200, { archived: true });

      const response = await dp.custom?.({
        meta: {
          paramsMap: { id: "789" },
          template: "cases/{id}",
        },
        method: "post",
        payload: { reason: "resolved" },
        url: "archive",
      });

      expect(response?.data).toEqual({ archived: true });
    });
  });
});
