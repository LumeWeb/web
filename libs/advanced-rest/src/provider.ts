import type {
  BaseRecord,
  DataProvider,
  GetListResponse,
} from "@refinedev/core";

import { generateFilter } from "./utils/generateFilter";
import { generateSort } from "./utils/generateSort";
import { generateNestedUrl } from "./utils/generateUrl";
import { httpClient } from "./utils/kyInstance";

import { stringify } from "querystring";

type QueryParams = {
  [key: string]: string | number | boolean;
};

const addParam = (
  key: string,
  value: string | number | boolean | undefined,
  queryParams: QueryParams,
) => {
  if (value !== undefined) {
    queryParams[key] = value;
  }
};

export const dataProvider = (apiUrl: string): DataProvider => {
  const baseFetch = async (
    url: string,
    method: string,
    payload?: any,
    queryParams?: any,
  ) => {
    const searchParams = queryParams ? `?${stringify(queryParams)}` : "";
    const fullUrl = `${url}${searchParams}`;

    const options: Record<string, any> = {
      headers: {
        "Content-Type": "application/json",
      },
      ...(payload ? { json: payload } : {}),
      searchParams: queryParams,
      throwHttpErrors: false, // Disable ky's default error throwing
    };

    try {
      let response: any; // Type as any to avoid TS errors
      switch (method.toUpperCase()) {
        case "GET":
          response = await httpClient(apiUrl).get(fullUrl, options);
          break;
        case "POST":
          response = await httpClient(apiUrl).post(fullUrl, options);
          break;
        case "PUT":
          response = await httpClient(apiUrl).put(fullUrl, options);
          break;
        case "PATCH":
          response = await httpClient(apiUrl).patch(fullUrl, options);
          break;
        case "DELETE":
          response = await httpClient(apiUrl).delete(fullUrl, options);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      // Check if the response is an error response
      if (response instanceof Response && !response.ok) {
        try {
          const errorBody = await response.json();
          throw new Error(errorBody.message || `HTTP error ${response.status}`);
        } catch (jsonError) {
          throw new Error(
            `HTTP error ${response.status}: Could not parse error body`,
          );
        }
      }

      return response;
    } catch (error: any) {
      console.error(`Fetch error for ${method} ${fullUrl}:`, error);
      return Promise.reject(error);
    }
  };

  return {
    create: async ({ meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, meta, resource });
      const response = await baseFetch(url, "POST", variables);
      const data = await response.json();
      return { data };
    },

    custom: async ({
      meta,
      method,
      payload,
      url: operation,
      filters,
      sorters,
    }) => {
      const baseUrl = generateNestedUrl({
        apiBase: apiUrl,
        meta,
        operation,
      });

      const filterParams = generateFilter(filters);
      const sortParams = generateSort(sorters);

      const queryParams: QueryParams = {};

      Object.entries(filterParams).forEach(([key, value]) =>
        addParam(key, value, queryParams),
      );
      Object.entries(sortParams).forEach(([key, value]) =>
        addParam(key, value, queryParams),
      );
      const response = await baseFetch(
        baseUrl,
        method.toUpperCase(),
        payload,
        queryParams,
      );
      if (response instanceof Response && !response.ok) {
        try {
          const errorBody = await response.json();
          throw new Error(errorBody.message || `HTTP error ${response.status}`);
        } catch (jsonError) {
          throw new Error(
            `HTTP error ${response.status}: Could not parse error body`,
          );
        }
      }
      const data = await response.json();
      return { data };
    },

    deleteOne: async ({ id, meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const response = await baseFetch(url, "DELETE", variables);
      const data = await response.json();
      return { data };
    },

    getApiUrl: () => apiUrl,

    getList: async <TData extends BaseRecord>({
      filters,
      meta: _meta,
      pagination,
      resource,
      sorters,
    }) => {
      // Handle paramsMap deprecation
      const meta = _meta?.paramsMap
        ? { ..._meta, params: _meta.paramsMap, paramsMap: undefined }
        : _meta;
      const url = generateNestedUrl({ apiBase: apiUrl, meta, resource });

      const filterParams = generateFilter(filters);
      const sortParams = generateSort(sorters);

      const queryParams: QueryParams = {};

      // Add parameters
      Object.entries(filterParams).forEach(([key, value]) =>
        addParam(key, value, queryParams),
      );
      Object.entries(sortParams).forEach(([key, value]) =>
        addParam(key, value, queryParams),
      );
      addParam("_page", pagination?.current, queryParams);
      addParam("_per_page", pagination?.pageSize, queryParams);

      try {
        const response = await httpClient(apiUrl).get(url, {
          searchParams: queryParams,
        });

        const data = await response.json<GetListResponse<TData>>();

        let total = Number(response.headers.get("x-total-count"));

        if (Number.isNaN(total) || total === 0) {
          if ("total" in data && typeof data.total === "number") {
            total = data.total;
          } else {
            total = 0; // Provide a default value if total is not found
            console.warn("Total count not found in headers or data."); // Log a warning
          }
        }

        if ("data" in data && Array.isArray(data.data)) {
          return { data: data.data, total };
        }

        return { data: [], total: 0 }; // Or throw an error, depending on your requirements
      } catch (error) {
        console.error("Error fetching list:", error); // Log the error
        return Promise.reject(error);
      }
    },

    getOne: async ({ id, meta, resource }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const response = await baseFetch(url, "GET");
      if (response instanceof Response && !response.ok) {
        try {
          const errorBody = await response.json();
          throw new Error(errorBody.message || `HTTP error ${response.status}`);
        } catch (jsonError) {
          throw new Error(
            `HTTP error ${response.status}: Could not parse error body`,
          );
        }
      }
      const data = await response.json();
      return { data };
    },

    update: async ({ id, meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const response = await baseFetch(url, "PATCH", variables);
      if (response instanceof Response && !response.ok) {
        try {
          const errorBody = await response.json();
          throw new Error(errorBody.message || `HTTP error ${response.status}`);
        } catch (jsonError) {
          throw new Error(
            `HTTP error ${response.status}: Could not parse error body`,
          );
        }
      }
      const data = await response.json();
      return { data };
    },
  };
};
