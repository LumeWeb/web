import { defineConfig } from "orval";

export default defineConfig({
  default: {
    input: "./src/api/swagger.yaml",
    output: {
      baseUrl: {
        getBaseUrlFromSpecification: true,
      },
      indexFiles: true,
      mode: "tags-split",
      client: "fetch",
      target: "./src/api/generated",
      schemas: "./src/api/generated/schemas",
      mock: {
        generators: [{ type: "msw" }],
        delay: 0,
        indexMockFiles: true,
      },
    },
  },
});
