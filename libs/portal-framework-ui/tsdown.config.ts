import { defineConfig } from "tsdown";
import {
  createLibraryConfigWithPlugins,
  entryPatterns,
  rolldownImageAssetPlugin,
} from "@lumeweb/tsdown-config";

export default defineConfig([
  {
    ...createLibraryConfigWithPlugins(
      entryPatterns.withoutTests,
      [rolldownImageAssetPlugin()],
      {
        deps: { skipNodeModulesBundle: true, neverBundle: [/@refinedev\/.*/] },
        unbundle: true,
      },
    ),
  },
  {
    ...createLibraryConfigWithPlugins(
      ["src/images.ts"],
      [rolldownImageAssetPlugin()],
      {
        clean: false,
        dts: true,
        format: "esm",
      },
    ),
    outDir: "dist/esm",
  },
]);
