import { defineConfig } from "orval";

export default defineConfig({
  default: {
    input: "./swagger.yaml",
    output: {
      baseUrl: {
        getBaseUrlFromSpecification: true,
      },
      indexFiles: true,
      mode: "tags",
      target: "./src/client",
    },
  },
});
