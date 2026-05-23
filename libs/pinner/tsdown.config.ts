import { defineConfig } from "tsdown";
import { createLibraryConfigWithExternals } from "@lumeweb/tsdown-config";

export default defineConfig(
  createLibraryConfigWithExternals(
    ["./src/index.ts", "./src/api/mocks.ts", "!src/**/*.{spec,stories}.{ts,tsx}"],
    [/node_modules/, "@uppy/core", "@uppy/tus", "stream", "@faker-js/faker", "msw"]
  )
);
