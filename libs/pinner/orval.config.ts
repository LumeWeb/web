import { defineConfig } from "orval";

export default defineConfig({
  default: {
    input: "./src/api/swagger.yaml",
    output: {
      baseUrl: {
        getBaseUrlFromSpecification: true,
      },
      indexFiles: true,
      mode: "tags",
      client: "fetch",
      target: "./src/api/generated",
      workspace: "./src/api",
    },
  },
});
