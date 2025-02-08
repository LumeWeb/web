import { defineConfig } from "orval";

export default defineConfig({
  account: {
    input: "./src/account/swagger.yaml",
    output: {
      client: "fetch",
      mode: "split",
      target: "openapi.ts",
      workspace: "./src/account/generated",
    },
  },
});
