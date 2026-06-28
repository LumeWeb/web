import { defineConfig } from "orval";
export default defineConfig({
  default: {
    input: "./src/account/swagger.yaml",
    output: {
      baseUrl: {
        getBaseUrlFromSpecification: true,
      },
      indexFiles: true,
      mode: "tags",
      client: "fetch",
      target: "account/generated",
      workspace: "./src",
      mock: {
        path: "account/generated/mocks",
        generators: [{ type: "msw" }],
        delay: 0,
        indexMockFiles: true,
      },
    },
  },
});
