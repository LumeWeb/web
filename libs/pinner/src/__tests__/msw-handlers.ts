// Combined MSW handlers for pin and upload operations
// This file re-exports all handlers from split modules for convenience

// ============================================================================
// PIN HANDLERS
// ============================================================================

export {
  createPinHandler,
  listPinsHandler,
  getPinHandler,
  updatePinHandler,
  deletePinHandler,
  pinHandlers,
  resetPinServiceState,
} from "./msw-pin-service-adapter";

// ============================================================================
// UPLOAD HANDLERS
// ============================================================================

export {
  tusOptionsHandler,
  tusHeadHandler,
  tusCreateHandler,
  tusPatchHandler,
  tusDeleteHandler,
  tusUploadHandlers,
  xhrUploadHandler,
  xhrUploadHandlers,
  accountUploadLimitHandler,
  accountInfoHandler,
  accountHandlers,
  operationHandler,
  operationHandlers,
  uploadHandlers,
} from "./msw-upload-handlers";

// ============================================================================
// ERROR HANDLERS
// ============================================================================

export {
  pinNotFoundHandler,
  unauthorizedHandler,
  rateLimitHandler,
  serverErrorHandler,
  uploadErrorHandler,
  tusErrorHandler,
  errorHandlers,
} from "./msw-error-handlers";

// ============================================================================
// CUSTOM HANDLERS
// ============================================================================

export {
  createCustomPinHandlers,
  createCustomUploadHandlers,
} from "./msw-custom-handlers";

// ============================================================================
// SETUP UTILITIES
// ============================================================================

export { resetRequestCounter } from "./setup";

// ============================================================================
// COMBINED ALL HANDLERS
// ============================================================================

// Import modules to create combined handlers
import { pinHandlers as allPinHandlers } from "./msw-pin-service-adapter";
import { uploadHandlers as allUploadHandlers } from "./msw-upload-handlers";
import { websitesIPNSHandlers as allWebsitesIPNSHandlers } from "./msw-websites-ipns-handlers";

// Combined handlers for all operations
export const allHandlers = [...allPinHandlers, ...allUploadHandlers, ...allWebsitesIPNSHandlers];
