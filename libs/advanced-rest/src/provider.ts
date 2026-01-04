import type { BaseRecord, DataProvider } from "@refinedev/core";

import {
  calculatePagination,
  serializeQueryParams,
} from "@lumeweb/query-builder";
import { generateNestedUrl } from "./utils/generateUrl";
import { httpClient } from "./utils/kyInstance";
import { parseListResponse } from "./utils/parseListResponse";
import { parseSingleResponse } from "./utils/parseSingleResponse";

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

export const dataProvider = (
  apiUrl: string,
  needsAuth: boolean = false,
): DataProvider & { setAuthToken: (token: null | string) => void } => {
  let authToken: null | string = null;
  let tokenPromise: Promise<null | string> | null = null;
  let tokenResolve: ((value: null | string) => void) | null = null;

  const setAuthToken = (token: null | string) => {
    authToken = token;
    if (tokenResolve) {
      tokenResolve(token);
      tokenPromise = null;
      tokenResolve = null;
    }
  };

  const waitForToken = (): Promise<null | string> => {
    if (authToken !== null) {
      return Promise.resolve(authToken);
    }

    if (!tokenPromise) {
      // @ts-ignore
      tokenPromise = Promise.withResolvers
        ? // @ts-ignore
          Promise.withResolvers()
        : (() => {
            let resolve: (value: null | string) => void;
            const promise = new Promise<null | string>((res) => {
              resolve = res;
            });
            // @ts-ignore
            return { promise, resolve };
          })();

      // @ts-ignore
      tokenResolve = tokenPromise.resolve || tokenPromise[1];
      // @ts-ignore
      tokenPromise = tokenPromise.promise || tokenPromise[0];
    }

    // @ts-ignore
    return tokenPromise;
  };
  const baseFetch = async (
    url: string,
    method: string,
    payload?: any,
    queryParams?: any,
    headers?: Record<string, string>,
    needsAuthFlag: boolean = needsAuth,
  ) => {
    const fullUrl = url;

    let authHeader = {};
    if (needsAuthFlag) {
      const token = await waitForToken();
      if (!token) {
        throw new Error("Authentication required but no token available");
      }
      authHeader = { Authorization: `Bearer ${token}` };
    }

    const options: Record<string, any> = {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...headers,
      },
      ...(payload ? { json: payload } : {}),
      searchParams: queryParams,
      throwHttpErrors: false,
    };

    try {
      let response: any; // Type as any to avoid TS errors
      switch (method.toUpperCase()) {
        case "DELETE":
          response = await httpClient(apiUrl).delete(fullUrl, options);
          break;
        case "GET":
          response = await httpClient(apiUrl).get(fullUrl, options);
          break;
        case "PATCH":
          response = await httpClient(apiUrl).patch(fullUrl, options);
          break;
        case "POST":
          response = await httpClient(apiUrl).post(fullUrl, options);
          break;
        case "PUT":
          response = await httpClient(apiUrl).put(fullUrl, options);
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
      const headers = meta?.headers ?? {};
      const response = await baseFetch(
        url,
        "POST",
        variables,
        undefined,
        headers,
        meta?.needsAuth ?? needsAuth,
      );
      const data = await parseResponse(response);

      return parseSingleResponse(data);
    },
    custom: async ({
      filters,
      meta,
      method,
      payload,
      sorters,
      url: operation,
    }) => {
      const headers = meta?.headers ?? {};
      const baseUrl = generateNestedUrl({
        apiBase: apiUrl,
        meta,
        operation,
      });

      const queryParams = serializeQueryParams({ filters, sorters });

      const response = await baseFetch(
        baseUrl,
        method.toUpperCase(),
        payload,
        queryParams,
        headers,
        meta?.needsAuth ?? needsAuth,
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
        meta?.needsAuth ?? needsAuth,
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
      const headers = meta?.headers ?? {};

      const paginationParams = pagination
        ? calculatePagination(
            pagination.currentPage || 1,
            pagination.pageSize || 10,
          )
        : undefined;

      const queryParams = serializeQueryParams({
        filters,
        sorters,
        pagination: paginationParams,
      });

      const response = await baseFetch(
        url,
        "GET",
        undefined,
        queryParams,
        headers,
        meta?.needsAuth ?? needsAuth,
      );
      const data = await parseResponse(response);

      const total = Number(response.headers.get("x-total-count"));
      return parseListResponse(data, total);
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
        meta?.needsAuth ?? needsAuth,
      );
      const data = await parseResponse(response);

      return parseSingleResponse(data);
    },

    setAuthToken,

    update: async ({ id, meta, resource, variables }) => {
      const url = generateNestedUrl({ apiBase: apiUrl, id, meta, resource });
      const headers = meta?.headers ?? {};
      const response = await baseFetch(
        url,
        "PATCH",
        variables,
        undefined,
        headers,
        meta?.needsAuth ?? needsAuth,
      );
      const data = await parseResponse(response);

      return parseSingleResponse(data);
    },
  };
};
