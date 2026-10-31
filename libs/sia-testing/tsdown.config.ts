import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";

export default defineConfig(createLibraryConfig([
  "src/fixtures/index.ts",
  "src/model/index.ts",
  "src/msw/index.ts",
  "src/msw/node.ts",
  "src/http/index.ts",
]));
