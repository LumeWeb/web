import { PlopTypes } from "@turbo/gen";
import * as fs from "node:fs";
import * as path from "node:path";

const templatesDir = path.join(__dirname, "templates");

declare const __dirname: string;

export function genPortalPlugin(): PlopTypes.PlopGeneratorConfig {
  // Helper to find next available dev port
  function getNextDevPort(answers: Record<string, unknown>): number {
    const libsDir = `${(answers as any).turbo.paths.root}/libs`;
    const plugins = fs.readdirSync(libsDir).filter((dir) => dir.startsWith("portal-plugin-"));
    const usedPorts = plugins.map((plugin) => {
      const viteConfigPath = `${libsDir}/${plugin}/vite.config.ts`;
      if (fs.existsSync(viteConfigPath)) {
        const content = fs.readFileSync(viteConfigPath, "utf-8");
        const match = content.match(/devPort:\s*(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      }
      return null;
    }).filter((port): port is number => port !== null);

    // Start from 4178 and find next available
    let port = 4178;
    while (usedPorts.includes(port)) {
      port += 1;
    }
    return port;
  }

  return {
    description: "Create a new portal plugin with Module Federation",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Plugin name (e.g., my-plugin):",
        validate: (input: string) => {
          if (!input) return "Plugin name is required";
          if (input.includes(" ")) return "Plugin name cannot contain spaces";
          return true;
        },
      },
      {
        type: "confirm",
        name: "hasRoutes",
        message: "Include route templates?",
        default: true,
      },
      {
        type: "input",
        name: "routes",
        message: "Routes (comma-separated, e.g., dashboard,settings):",
        default: "dashboard,settings",
        when: (answers: Record<string, unknown>) => answers.hasRoutes === true,
        filter: (input: string) => input.split(",").map((r) => r.trim()),
      },
      {
        type: "confirm",
        name: "hasSrcLib",
        message: "Include src-lib for library interface?",
        default: false,
      },
      {
        type: "confirm",
        name: "hasOrval",
        message: "Include Orval for API client generation?",
        default: false,
      },
      {
        type: "confirm",
        name: "hasWidgets",
        message: "Include widget registrations?",
        default: false,
      },
    ],
    actions: (answers: Record<string, unknown>) => {
      const actions: PlopTypes.ActionType[] = [
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/package.json",
          templateFile: path.join(templatesDir, "portal-plugin-package.json.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/plugin.config.ts",
          templateFile: path.join(templatesDir, "portal-plugin-config.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/vite.config.ts",
          templateFile: path.join(templatesDir, "portal-plugin-vite.config.ts.hbs"),
          data: { devPort: getNextDevPort(answers) },
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/tsconfig.json",
          templateFile: path.join(templatesDir, "portal-plugin-tsconfig.json.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/tsdown.config.ts",
          templateFile: path.join(templatesDir, "portal-plugin-tsdown.config.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/tailwind.config.ts",
          templateFile: path.join(templatesDir, "portal-plugin-tailwind.config.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/postcss.config.cjs",
          templateFile: path.join(templatesDir, "portal-plugin-postcss.config.cjs.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/index.ts",
          templateFile: path.join(templatesDir, "portal-plugin-src-index.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/capabilities/refineConfig.ts",
          templateFile: path.join(templatesDir, "portal-plugin-src-capabilities-refineConfig.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/routes.tsx",
          templateFile: path.join(templatesDir, "portal-plugin-src-routes.tsx.hbs"),
          skip: (answers: Record<string, unknown>) => !answers.hasRoutes,
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/widgetRegistrations.ts",
          templateFile: path.join(templatesDir, "portal-plugin-src-widgetRegistrations.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/ui/components/index.ts",
          template: "// Add your component exports here\n",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/ui/hooks/index.ts",
          template: "// Add your hook exports here\n",
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src/ui/util/index.ts",
          template: "// Add your utility exports here\n",
        },
      ];

      // Add src-lib if requested
      if (answers.hasSrcLib) {
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src-lib/index.ts",
          template: "// Add your library exports here\n",
        });
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src-lib/types/index.ts",
          template: "// Add your type exports here\n",
        });
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/src-lib/util/index.ts",
          template: "// Add your utility exports here\n",
        });
      }

      // Add orval config if requested
      if (answers.hasOrval) {
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/libs/portal-plugin-{{ name }}/orval.config.ts",
          template: `import { defineConfig } from "orval";

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
      target: "client/",
      workspace: "./src",
    },
  },
});
`,
        });
      }

      return actions;
    },
  };
}

export function genLib(): PlopTypes.PlopGeneratorConfig {
  return {
    description: "Create a new generic utility library",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Library name (e.g., my-util):",
        validate: (input: string) => {
          if (!input) return "Library name is required";
          if (input.includes(" ")) return "Library name cannot contain spaces";
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Library description:",
        default: "",
      },
      {
        type: "confirm",
        name: "hasTests",
        message: "Include test setup?",
        default: true,
      },
      {
        type: "confirm",
        name: "hasCoverage",
        message: "Include test coverage configuration?",
        default: false,
        when: (answers: Record<string, unknown>) => answers.hasTests === true,
      },
      {
        type: "input",
        name: "dependencies",
        message: "Catalog dependencies (comma-separated, e.g., @refinedev/core,ky):",
        default: "",
        filter: (input: string) => input ? input.split(",").map((d) => d.trim()) : [],
      },
      {
        type: "input",
        name: "exports",
        message: "Module exports (comma-separated paths, e.g., utils,types):",
        default: "",
        filter: (input: string) => input ? input.split(",").map((e) => e.trim()) : [],
      },
    ],
    actions: (answers: Record<string, unknown>) => {
      const actions: PlopTypes.ActionType[] = [
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/{{ name }}/package.json",
          templateFile: path.join(templatesDir, "lib-package.json.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/{{ name }}/tsconfig.json",
          templateFile: path.join(templatesDir, "lib-tsconfig.json.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/{{ name }}/tsdown.config.ts",
          templateFile: path.join(templatesDir, "lib-tsdown.config.ts.hbs"),
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/libs/{{ name }}/src/index.ts",
          templateFile: path.join(templatesDir, "lib-src-index.ts.hbs"),
        },
      ];

      // Add test setup if requested
      if (answers.hasTests) {
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/libs/{{ name }}/vitest.config.ts",
          templateFile: path.join(templatesDir, "lib-vitest.config.ts.hbs"),
        });
        actions.push({
          type: "add",
          path: "{{ turbo.paths.root }}/libs/{{ name }}/src/__tests__/setup.ts",
          template: `// Test setup file
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
`,
        });
      }

      return actions;
    },
  };
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("portal-plugin", genPortalPlugin());
  plop.setGenerator("lib", genLib());
}
