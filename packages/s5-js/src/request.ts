import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { S5Client } from "./client.js";
import {
  addUrlQuery,
  addUrlSubdomain,
  ensureUrlPrefix,
  makeUrl,
} from "./utils/url.js";

export type Headers = { [key: string]: string };

/**
 * Helper function that builds the request URL. Ensures that the final URL
 * always has a protocol prefix for consistency.
 *
 * @param client - The S5 client.
 * @param parts - The URL parts to use when constructing the URL.
 * @param [parts.baseUrl] - The base URL to use, instead of the portal URL.
 * @param [parts.endpointPath] - The endpoint to contact.
 * @param [parts.subdomain] - An optional subdomain to add to the URL.
 * @param [parts.extraPath] - An optional path to append to the URL.
 * @param [parts.query] - Optional query parameters to append to the URL.
 * @returns - The built URL.
 */
export async function buildRequestUrl(
  client: S5Client,
  parts: {
    baseUrl?: string;
    endpointPath?: string;
    subdomain?: string;
    extraPath?: string;
    query?: { [key: string]: string | undefined };
  },
): Promise<string> {
  let url;

  // Get the base URL, if not passed in.
  if (!parts.baseUrl) {
    url = await client.portalUrl;
  } else {
    url = parts.baseUrl;
  }

  // Make sure the URL has a protocol.
  url = ensureUrlPrefix(url);

  if (parts.endpointPath) {
    url = makeUrl(url, parts.endpointPath);
  }
  if (parts.extraPath) {
    url = makeUrl(url, parts.extraPath);
  }
  if (parts.subdomain) {
    url = addUrlSubdomain(url, parts.subdomain);
  }
  if (parts.query) {
    url = addUrlQuery(url, parts.query);
  }

  return url;
}
