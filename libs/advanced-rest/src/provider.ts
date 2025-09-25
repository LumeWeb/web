import type { BaseRecord, DataProvider } from "@refinedev/core";

import { stringify } from "querystring";

import { generateFilter } from "./utils/generateFilter";
import { generateSort } from "./utils/generateSort";
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

type QueryParams = Record<string, boolean | number | string>;

const addParam = (
  key: string,
  value: boolean | number | string | undefined,
  queryParams: QueryParams,
) => {
  if (value !== undefined) {
    queryParams[key] = value;
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
    const searchParams = queryParams ? `?${stringify(queryParams)}` : "";
    const fullUrl = `${url}${searchParams}`;

    let authHeader = {};
    if (needsAuthFlag) {
      const token = await waitForToken();
      if (token) {
        authHeader = { Authorization: `Bearer ${token}` };
      }
    } else if (authToken) {
      authHeader = { Authorization: `Bearer ${authToken}` };
    }

    const options: Record<string, any> = {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...headers,
      },
      ...(payload ? { json: payload } : {}),
      searchParams: queryParams,
      throwHttpErrors: false, // Disable ky's default error throwing
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
      if (pagination) {
        const { current = 1, pageSize = 10 } = pagination;
        const start = (current - 1) * pageSize;
        const end = start + pageSize;
        
        addParam("_start", start, queryParams);
        addParam("_end", end, queryParams);
      }

      const response = await baseFetch(url, "GET", undefined, queryParams, headers, meta?.needsAuth ?? needsAuth);
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
