/** Mock-only routes keep payload fixtures separate from the real Indexd HTTP API. */
export const MOCK_SDK_PATH = "/mock-sdk/";

export const mockMethods = {
  deleteObject: "POST",
  download: "GET",
  object: "GET",
  pinObject: "POST",
  pruneSlabs: "POST",
  upload: "POST",
} as const;
