import { defineConfig } from "orval";

export default defineConfig({
  s5: {
    input: "./swagger.yaml",
    output: {
      mode: "split",
      workspace: "./src/generated",
      target: "openapi.ts",
      override: {
        mutator: {
          path: "../axios.ts",
          name: "customInstance",
        },
      },
    },
  },
});
