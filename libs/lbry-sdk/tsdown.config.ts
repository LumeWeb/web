import { defineConfig } from "tsdown";
import { createLibraryConfig } from "@lumeweb/tsdown-config";
import { goWasm } from "./src/rollup-plugin-go-wasm.ts";

export default defineConfig(
  createLibraryConfig(
    [
      "./src/index.ts",
      "./src/wasm/index.ts",
      "./src/mempool/index.ts",
      "./src/wallet/index.ts",
      "./src/tx/index.ts",
      "./src/claims/index.ts",
      "./src/storage/index.ts",
      "./src/guardrails/index.ts",
      "!src/**/*.{spec,stories}.{ts,tsx}",
      "!src/**/*.test.{ts,tsx}",
      "!src/rollup-plugin-go-wasm.ts",
    ],
    {
      plugins: [
        goWasm({
          // tinygo binary resolved from PATH (local dev: /opt/data/tinygo/bin/tinygo via PATH)
          // wasm_exec.js resolved via `tinygo env TINYGOROOT`
          goBuildExtraArgs: ["-target", "wasm", "-no-debug"],
          cwd: `${import.meta.dirname}/wasm/go`,
        }),
      ],
      outputOptions: {
        exports: "named",
      },
    }
  )
);
