/**
 * Runtime patch for tus-js-client's NodeHttpStack Request class.
 *
 * PROBLEM:
 * Code using onBeforeRequest hook may need to call abort() on the request
 * before send() is called. However, the Request class only sets this._request
 * inside the send() method, so getUnderlyingObject() returns null before send().
 *
 * SOLUTION:
 * Patch the Request class to initialize a dummy _request object with an abort()
 * method immediately when the request is created.
 *
 * NOTE:
 * This patch is only needed in Node.js environments. In browser environments,
 * the tus-js-client uses a different HTTP stack that doesn't have this issue.
 */

import { isNodeEnvironment } from "./env";

// Track whether the patch has been applied to prevent multiple patches
let isPatched = false;

export function patchTusNodeHttpStack(): void {
  // Prevent multiple patches
  if (isPatched) {
    return;
  }

  // Only apply patch in Node.js environments
  if (!isNodeEnvironment()) {
    return;
  }

  // Find the tus-js-client NodeHttpStack module
  // It exports the default as NodeHttpStack with a nested Request class
  try {
    // Use dynamic require() to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tusHttpStackModule = require("tus-js-client/lib.es5/node/httpStack");

    if (!tusHttpStackModule || !tusHttpStackModule.default) {
      console.warn(
        "[tus-patch] tus-js-client NodeHttpStack not found, patch skipped",
      );
      return;
    }

    const NodeHttpStack = tusHttpStackModule.default;

    // Get the original createRequest method
    const originalCreateRequest = NodeHttpStack.prototype.createRequest;

    if (typeof originalCreateRequest !== "function") {
      console.warn("[tus-patch] createRequest method not found, patch skipped");
      return;
    }

    // Patch createRequest to set up a dummy _request on the Request instance
    NodeHttpStack.prototype.createRequest = function (
      method: string,
      url: string,
    ) {
      // Call the original createRequest to get the Request instance
      const request = originalCreateRequest.call(this, method, url);

      // Set a dummy _request object with an abort() method
      // This allows getUnderlyingObject().abort() to work before send() is called
      request._request = {
        abort: () => {
          // No-op abort before actual request is created
          // The real request will be created in send() and this will be replaced
        },
        // Preserve any existing properties that might be checked
        destroyed: false,
      };

      return request;
    };

    console.debug(
      "[tus-patch] Successfully patched tus-js-client NodeHttpStack",
    );
  } catch (error) {
    console.warn("[tus-patch] Failed to patch tus-js-client:", error);
  }
}
