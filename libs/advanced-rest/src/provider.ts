import type { BaseRecord, DataProvider } from "@refinedev/core";

import { generateFilter } from "./utils/generateFilter";
import { generateSort } from "./utils/generateSort";
import { generateNestedUrl } from "./utils/generateUrl";
import { httpClient } from "./utils/kyInstance";

import { stringify } from "querystring";

const parseResponse = async (response: any) => {
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

  // Handle empty or non-JSON responses
  const responseText = await response.text();
  if (!responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    // Return raw text if not JSON
    return responseText;
  }
};

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

export const dataProvider = (apiUrl: string): DataProvider & { setAuthToken: (token: string | null) => void } => {
  let authToken: string | null = null;

  const setAuthToken = (token: string | null) => {
    authToken = token;
  };
  const baseFetch = async (
    url: string,
    method: string,
    payload?: any,
    queryParams?: any,
    headers?: Record<string, string>,
  ) => {
    const searchParams = queryParams ? `?${stringify(queryParams)}` : "";
    const fullUrl = `${url}${searchParams}`;

    const options: Record<string, any> = {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
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
    setAuthToken,
    create: async ({ meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, meta, resource });
      const headers = meta?.headers ?? {};
      const response = await baseFetch(
        url,
        "POST",
        variables,
        undefined,
        headers,
      );
      const data = await parseResponse(response);
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
      const headers = meta?.headers ?? {};
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
        headers,
      );
      const data = await parseResponse(response);
      return { data };
    },

    deleteOne: async ({ id, meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const headers = meta?.headers ?? {};
      const response = await baseFetch(
        url,
        "DELETE",
        variables,
        undefined,
        headers,
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

      // Handle empty or non-JSON responses
      const responseText = await response.text();
      if (!responseText.trim()) {
        return { data: null };
      }

      try {
        const data = JSON.parse(responseText);
        return { data };
      } catch (e) {
        // Return raw text if not JSON
        return { data: responseText };
      }
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

        const data = await parseResponse(response);

        let total = Number(response.headers.get("x-total-count"));

        if (Number.isNaN(total) || total === 0) {
          if (data && typeof data.total === "number") {
            total = data.total;
          } else {
            total = 0;
            console.warn("Total count not found in headers or data.");
          }
        }

        if (data && Array.isArray(data.data)) {
          return { data: data.data, total };
        }

        return { data: [], total: 0 };
      } catch (error) {
        console.error("Error fetching list:", error);
        return Promise.reject(error);
      }
    },

    getOne: async ({ id, meta, resource }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const headers = meta?.headers ?? {};
      const response = await baseFetch(
        url,
        "GET",
        undefined,
        undefined,
        headers,
      );
      const data = await parseResponse(response);
      return { data };
    },

    update: async ({ id, meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const headers = meta?.headers ?? {};
      const response = await baseFetch(
        url,
        "PATCH",
        variables,
        undefined,
        headers,
      );
      const data = await parseResponse(response);
      return { data };
    },
  };
};
