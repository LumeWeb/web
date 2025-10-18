# Portal Plugin Development Guidelines

This document provides comprehensive guidelines for developing portal plugins in the Lume Web portal framework. It outlines the common structure, patterns, and best practices observed across all existing plugins.

## Overview

Portal plugins are independently deployable micro-frontends that integrate with the main portal application through Module Federation. Each plugin is a self-contained Vite project that exposes components, routes, and capabilities to the host application.

## Plugin Types

Based on the analysis of existing plugins, there are several plugin patterns:

### 1. Core Plugins
- **portal-plugin-core**: Essential functionality (NotFound routes, navigation)
- **portal-plugin-dashboard**: Main dashboard with authentication and file upload
- **portal-plugin-ipfs**: IPFS integration and file management

### 2. Feature Plugins
- **portal-plugin-admin**: Administrative interface
- **portal-plugin-abuse**: Abuse management system
- **portal-plugin-abuse-report**: Public abuse reporting interface

### 3. Shared Libraries
- **portal-plugin-abuse-common**: Shared types and API clients for abuse functionality

## Required Files Structure

Every plugin must follow this standardized structure:

```
libs/portal-plugin-{name}/
├── package.json                    # Plugin metadata and dependencies
├── plugin.config.ts               # Module Federation configuration
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration (optional)
├── postcss.config.cjs             # PostCSS configuration
├── README.md                      # Plugin documentation
├── index.html                     # Development HTML entry point
├── src/                           # Source code directory
│   ├── index.ts                   # Plugin factory function (or plugin.ts)
│   ├── routes.tsx                 # Route definitions
│   ├── capabilities/              # Plugin capabilities
│   │   └── refineConfig.ts        # Refine configuration capability
│   ├── features/                  # Plugin features
│   │   └── {featureName}/
│   │       ├── Feature.ts         # Feature implementation
│   │       └── index.ts           # Feature exports
│   ├── ui/                        # UI components
│   │   ├── components/            # Reusable components
│   │   ├── routes/                # Route components
│   │   ├── dialogs/               # Modal/dialog components
│   │   ├── forms/                 # Form components
│   │   ├── hooks/                 # Custom React hooks
│   │   └── util/                  # Utility functions
│   ├── types.ts                   # TypeScript type definitions
│   ├── contexts/                  # React contexts (optional)
│   └── client/                    # API client code (optional)
└── e2e/                           # End-to-end tests (optional)
```

## Core Configuration Files

### package.json

Every plugin must have a `package.json` with:

```json
{
  "name": "@lumeweb/portal-plugin-{name}",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "@lumeweb/portal-framework-core": "workspace:*",
    "@lumeweb/portal-framework-ui": "workspace:*",
    "@lumeweb/portal-framework-ui-core": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router": "7.5.2"
  }
}
```

### plugin.config.ts

Required for all plugins except shared libraries:

```typescript
import type { PluginConfig } from "@lumeweb/portal-framework-core/vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "core:{plugin-name}",
  dir: __dirname,
  exposes: {
    ".": "./src/index",  // or "./src/plugin" for complex plugins
    // Additional exposed modules
  },
} satisfies PluginConfig;
```

### vite.config.ts

All plugins use the framework's Config helper:

```typescript
import { Config } from "@lumeweb/portal-framework-core/vite";
import * as sharedModules from "../../shared-modules";
import config from "./plugin.config";

export default Config({
  dir: config.dir,
  name: config.name,
  type: "plugin",
  devPort: 417X,  // Unique port per plugin
  exposes: config.exposes,
  sharedModules: sharedModules.getSharedModules(),
});
```

## Plugin Entry Point

### src/index.ts (or src/plugin.ts)

The main plugin file exports a factory function that returns a Plugin object:

```typescript
import {
  createNamespacedId,
  Framework,
  type Plugin,
} from "@lumeweb/portal-framework-core";

import { Capability as RefineConfigCapability } from "./capabilities/refineConfig";
import routes from "./routes";
import features from "./features";

export default function (): Plugin {
  return {
    id: createNamespacedId("core", "{plugin-name}"),
    capabilities: [new RefineConfigCapability()],
    features: features,
    routes,
    widgets: [],  // Optional widget registrations
    dependencies: [],  // Optional plugin dependencies
    capabilityAssociations: [],  // Optional capability associations
    async initialize(framework: Framework) {
      console.log("Plugin {name} initialized");
    },
    async destroy(framework: Framework) {
      console.log("Plugin {name} destroyed");
    },
  } satisfies Plugin;
}
```

## Routes Configuration

### src/routes.tsx

Define plugin routes using the RouteDefinition type:

```typescript
import type { RouteDefinition } from "@lumeweb/portal-framework-core";
import { IconName } from "lucide-react";

const routes = [
  {
    path: "/{route-path}",
    component: "{component-name}",
    id: "{unique-route-id}",
    navigation: {
      label: "Navigation Label",
      icon: IconName,
      order: 1,  // Optional ordering
    },
  },
  {
    path: "/parent",
    component: "ParentLayout",
    id: "parent-layout",
    children: [
      {
        component: "ChildComponent",
        index: true,  // Default child route
      },
      {
        component: "AnotherChild",
        path: "child-path",
      },
    ],
  },
] satisfies RouteDefinition[];

export default routes;
```

## Capabilities

Capabilities define what functionality a plugin provides to the framework.

### Refine Configuration Capability

Most plugins include a Refine configuration capability:

```typescript
// src/capabilities/refineConfig.ts
import {
  RefineConfigCapability,
  mergeRefineConfig,
} from "@lumeweb/portal-framework-core";

export class Capability implements RefineConfigCapability {
  readonly id: string = "{plugin}:refine-config";
  readonly type = "core:refine-config";
  
  async initialize(framework: Framework) {
    // Initialization logic
  }
  
  getConfig(existing?: Partial<RefineProps>) {
    return mergeRefineConfig(existing, {
      // Refine configuration
    });
  }
  
  async destroy() {
    // Cleanup logic
  }
}
```

### Custom Capabilities

Create custom capabilities for plugin-specific functionality:

```typescript
export class CustomCapability implements BaseCapability {
  readonly id: string = "{plugin}:custom-capability";
  readonly type = "custom:type";
  
  async initialize(framework: Framework) {
    // Initialize capability
  }
  
  async destroy() {
    // Cleanup capability
  }
  
  // Custom methods
  getCustomConfig() {
    return {};
  }
}
```

## Features

Features encapsulate major functionality within a plugin:

```typescript
// src/features/{feature}/Feature.ts
import {
  createNamespacedId,
  Framework,
  FrameworkFeature,
} from "@lumeweb/portal-framework-core";

export class Feature implements FrameworkFeature {
  readonly id: NamespacedId = createNamespacedId("{plugin}", "{feature}");
  
  async initialize(framework: Framework): Promise<void> {
    // Initialize feature
  }
  
  async destroy(framework: Framework): Promise<void> {
    // Cleanup feature
  }
  
  // Feature-specific methods
}
```

## UI Components Structure

### Component Organization

```
src/ui/
├── components/          # Reusable components
│   ├── ComponentName.tsx
│   └── index.ts         # Barrel exports
├── routes/              # Route-specific components
│   ├── routeName.tsx
│   └── layout.tsx       # Layout components
├── dialogs/             # Modal/dialog components
│   └── dialogName.tsx
├── forms/               # Form components
│   └── formName.tsx
├── hooks/               # Custom hooks
│   └── useCustomHook.ts
└── util/                # Utility functions
    └── util.ts
```

### Component Patterns

#### Route Components
Route components should be exported as default exports and correspond to the route definitions:

```typescript
// src/ui/routes/dashboard.tsx
export default function Dashboard() {
  return <div>Dashboard Content</div>;
}
```

#### Layout Components
Layout components provide common structure for child routes:

```typescript
// src/ui/routes/account.layout.tsx
import { Outlet } from "react-router-dom";

export default function AccountLayout() {
  return (
    <div>
      <header>Account Header</header>
      <main><Outlet /></main>
    </div>
  );
}
```

## Development Patterns

### TypeScript Configuration

Use path aliases for cleaner imports:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Styling

Use Tailwind CSS for styling. Include the Tailwind config:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

### Testing

- Unit tests: Use Vitest with Happy DOM
- E2E tests: Use Playwright (for complex plugins)
- Test files: `*.spec.ts` for unit tests, `*.browser.spec.ts` for browser tests

## Plugin Naming Conventions

### Package Names
- Format: `@lumeweb/portal-plugin-{name}`
- Examples: `@lumeweb/portal-plugin-dashboard`, `@lumeweb/portal-plugin-ipfs`

### Plugin IDs
- Format: `core:{plugin-name}`
- Examples: `core:dashboard`, `core:ipfs`, `core:admin`

### Capability IDs
- Format: `{plugin}:{capability-name}`
- Examples: `dashboard:refine-config`, `ipfs:protocol`

### Feature IDs
- Format: `{plugin}:{feature-name}`
- Examples: `dashboard:upload`, `ipfs:file-manager`

## Development Port Allocation

Each plugin needs a unique development port:

- portal-plugin-core: 4174
- portal-plugin-dashboard: 4175
- portal-plugin-admin: 4175 (conflict - should be unique)
- portal-plugin-ipfs: 4176
- portal-plugin-abuse: TBD
- portal-plugin-abuse-report: TBD

## Module Federation Exposes

### Required Exposes
Every plugin must expose:
- `"."`: Main plugin entry point

### Optional Exposes
- Routes: `"./route-name": "./src/ui/routes/routeName"`
- Layouts: `"./layout-name": "./src/ui/routes/layoutName"`
- Widgets: `"./widgets/widget-name": "./src/ui/widgets/widgetName"`

### Example Exposes Configuration

```typescript
exposes: {
  ".": "./src/index",
  "./dashboard": "./src/ui/routes/dashboard",
  "./account/layout": "./src/ui/routes/account.layout",
  "./widgets/upload/button": "./src/ui/widgets/upload/button",
}
```

## Dependencies Between Plugins

Plugins can declare dependencies on other plugins:

```typescript
export default function (): Plugin {
  return {
    // ... other properties
    dependencies: [
      {
        id: "core:core",  // Depends on core plugin
      },
    ],
  };
}
```

## Capability Associations

Plugins can associate capabilities with each other:

```typescript
export default function (): Plugin {
  return {
    // ... other properties
    capabilityAssociations: [
      {
        associated: ["ipfs:upload"],
        primary: "ipfs:protocol",
      },
    ],
  };
}
```

## Best Practices

### 1. Keep Plugins Focused
- Each plugin should have a single, well-defined purpose
- Avoid creating monolithic plugins
- Use shared libraries for common functionality

### 2. Use Framework Abstractions
- Leverage framework capabilities for common functionality
- Use framework-provided UI components when possible
- Follow framework patterns for routing and navigation

### 3. Proper Error Handling
- Implement proper error boundaries
- Provide meaningful error messages
- Handle initialization failures gracefully

### 4. Performance Considerations
- Lazy load heavy components
- Use code splitting for large features
- Optimize bundle sizes

### 5. Testing
- Write unit tests for core functionality
- Test plugin integration with the framework
- Include E2E tests for critical user flows

### 6. Documentation
- Document plugin capabilities and features
- Provide usage examples
- Include setup and configuration instructions

## Plugin Development Workflow

### 1. Setup
```bash
# Create new plugin directory
mkdir libs/portal-plugin-{name}
cd libs/portal-plugin-{name}

# Initialize package.json
pnpm init

# Install dependencies
pnpm add @lumeweb/portal-framework-core @lumeweb/portal-framework-ui
```

### 2. Configuration
Create the required configuration files following the templates above.

### 3. Development
```bash
# Start development server
pnpm dev

# Build plugin
pnpm build

# Run linting
pnpm lint
```

### 4. Integration
Add the plugin to the app shell's plugin configuration and test integration.

## Common Pitfalls to Avoid

1. **Port Conflicts**: Ensure each plugin uses a unique development port
2. **Missing Exposes**: All route components must be properly exposed in plugin.config.ts
3. **Capability Registration**: Ensure capabilities are properly registered in the plugin factory
4. **Type Safety**: Use proper TypeScript types for all framework interactions
5. **Bundle Size**: Be mindful of bundle sizes, especially for large dependencies

## Conclusion

Following these guidelines ensures consistency across all portal plugins and smooth integration with the portal framework. The modular architecture allows for independent development and deployment while maintaining a cohesive user experience.