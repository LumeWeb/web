import type { HttpError } from "@refinedev/core";

import ky from "ky";

import { NestedParamError } from "./generateUrl";

export const httpClient = (apiBase?: string) =>
  ky.extend({
    hooks: {
      afterResponse: [
        async (request, options, response) => {
          if (!response.ok) {
            // Clone response before reading body to avoid locking the stream
            const errorBody = await response
              .clone()
              .json()
              .catch(() => ({}));
            const error: HttpError = {
              message:
                errorBody.message ||
                "An error occurred while processing the request",
              statusCode: response.status,
            };
            return new Response(JSON.stringify(error), {
              status: response.status,
            });
          }
        },
      ],
      beforeRequest: [
        (request) => {
          const url = new URL(request.url);
          if (/{\w+}/.exec(url.pathname)) {
            throw new NestedParamError(
              `Unresolved parameters in URL: ${url.pathname}`,
            );
          }
        },
      ],
    },
    prefixUrl: apiBase,
  });
