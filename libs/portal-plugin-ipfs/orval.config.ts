import { defineConfig } from "orval";
export default defineConfig({
  default: {
    input: "./src/client/swagger.yaml",
    output: {
      baseUrl: {
        getBaseUrlFromSpecification: true,
      },
      indexFiles: true,
      mode: "tags",
      client: "fetch",
      target: "client/generated",
      workspace: "./src",
    },
  },
});
