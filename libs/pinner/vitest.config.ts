import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

const TEST_TYPE_UNIT = "unit";
const TEST_TYPE_INTEGRATION = "integration";

const resolveConfig = {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
};

function createBrowserConfig() {
  return {
    enabled: true,
    provider: playwright(),
    instances: [
      {
        browser: "chromium" as const,
        headless: true,
      },
    ],
  };
}

function createNodeProject(
  name: string,
  include: string[],
  setupFiles?: string[],
) {
  return {
    test: {
      name,
      include,
      ...(setupFiles && { setupFiles }),
      environment: "node" as const,
    },
    resolve: resolveConfig,
  };
}

function createBrowserProject(
  name: string,
  include: string[],
  setupFiles?: string[],
) {
  return {
    test: {
      name,
      include,
      ...(setupFiles && { setupFiles }),
      browser: createBrowserConfig(),
    },
    resolve: resolveConfig,
  };
}

function createUploadProjects(
  testType: typeof TEST_TYPE_UNIT | typeof TEST_TYPE_INTEGRATION,
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern =
    testType === TEST_TYPE_INTEGRATION
      ? ["src/upload/__tests__/**/*.integration.spec.ts"]
      : [
          "src/upload/__tests__/**/*.spec.ts",
          "!src/upload/__tests__/**/*.integration.spec.ts",
          "!src/upload/__tests__/base-upload.spec.ts",
          "!src/upload/__tests__/normalize.spec.ts",
          "!src/upload/__tests__/car.spec.ts",
        ];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  // For unit tests, add the unit-specific setup files
  const unitSetupFiles = {
    node: testType === TEST_TYPE_UNIT ? ["./src/upload/__tests__/setup.unit.ts"] : [],
    browser: testType === TEST_TYPE_UNIT ? ["./src/upload/__tests__/setup.unit.browser.ts"] : [],
  };

  return [
    createNodeProject(`node-upload-${testType}`, includePattern, [
      ...baseSetupFiles.node,
      ...unitSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject(`browser-upload-${testType}`, includePattern, [
      ...baseSetupFiles.browser,
      ...unitSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createBlockstoreProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/blockstore/__tests__/**/*.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-blockstore", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-blockstore", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createPinProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/pin/__tests__/**/*.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-pin", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-pin", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createNodeUtilsProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/utils/__tests__/**/*.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-utils", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-utils", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createPinnerProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/__tests__/pinner*.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-pinner", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-pinner", includePattern, [
      ...baseSetupFiles.browser,
      "./src/__tests__/setup.browser.ts",
      ...browserSetupFiles,
    ]),
  ];
}

function createEncoderProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/encoder/__tests__/**/*.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-encoder", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-encoder", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createAdapterProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/adapters/pinata/__tests__/**/*.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-adapter", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-adapter", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createNormalizeProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/upload/__tests__/normalize.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-normalize", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-normalize", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createCarProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/upload/__tests__/car.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-car", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-car", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

function createBaseUploadProjects(
  nodeSetupFiles: string[] = [],
  browserSetupFiles: string[] = [],
) {
  const includePattern = ["src/upload/__tests__/base-upload.spec.ts"];

  const baseSetupFiles = {
    node: ["./src/__tests__/setup.node.ts"],
    browser: ["./src/__tests__/setup.browser.ts"],
  };

  return [
    createNodeProject("node-base-upload", includePattern, [
      ...baseSetupFiles.node,
      ...nodeSetupFiles,
    ]),
    createBrowserProject("browser-base-upload", includePattern, [
      ...baseSetupFiles.browser,
      ...browserSetupFiles,
    ]),
  ];
}

export default defineConfig({
  test: {
    projects: [
      // Upload integration tests - no mocks, real implementations
      ...createUploadProjects(TEST_TYPE_INTEGRATION),
      // Upload unit tests - with mocks
      ...createUploadProjects(TEST_TYPE_UNIT, [
        "./src/upload/__tests__/setup.unit.ts",
      ]),
      // Normalize tests - no mocks, pure unit tests
      ...createNormalizeProjects(),
      // Car tests - no mocks, pure unit tests
      ...createCarProjects(),
      // BaseUploadHandler tests - lightweight mocks
      ...createBaseUploadProjects(),
      // Blockstore tests
      ...createBlockstoreProjects(),
      // Pin tests
      ...createPinProjects(),
      // Node utils tests
      ...createNodeUtilsProjects(),
      // Pinner tests
      ...createPinnerProjects(),
      // Encoder tests
      ...createEncoderProjects(),
      // Adapter tests
      ...createAdapterProjects(),
    ],
  },
});
