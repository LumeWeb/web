# Portal Plugin Template

A comprehensive template for creating new portal plugins in the Lume Web portal framework. This template follows all established patterns and best practices for plugin development.

## Overview

This template provides a complete starting point for developing portal plugins with:

- ✅ Standard plugin structure and configuration
- ✅ Module Federation setup for bundle creation
- ✅ TypeScript configuration
- ✅ Tailwind CSS styling
- ✅ Example routes and components
- ✅ Plugin capabilities and features
- ✅ Widget registration system
- ✅ Custom hooks and utilities
- ✅ Bundle-only architecture (no standalone HTML)

## Quick Start

### 1. Copy the Template

```bash
# Copy the template to create a new plugin
cp -r libs/portal-plugin-template libs/portal-plugin-your-plugin-name
```

### 2. Update Package Information

Edit `package.json`:

```json
{
  "name": "@lumeweb/portal-plugin-your-plugin-name",
  "description": "Your plugin description"
}
```

### 3. Update Plugin Configuration

Edit `plugin.config.ts`:

```typescript
export default {
  name: "core:your-plugin-name",  // Update plugin ID
  dir: __dirname,
  exposes: {
    ".": "./src/index",
    // Add your route exposes here
  },
} satisfies PluginConfig;
```

### 4. Update Vite Configuration

Edit `vite.config.ts` to use a unique development port:

```typescript
export default Config({
  devPort: 4178,  // Use a unique port
  // ... other config
});
```

### 5. Update Plugin Entry Point

Edit `src/index.ts`:

```typescript
export default function (): Plugin {
  return {
    id: createNamespacedId("core", "your-plugin-name"),  // Update ID
    // ... other plugin configuration
  } satisfies Plugin;
}
```

### 6. Install Dependencies

```bash
pnpm install
```

### 7. Start Development

```bash
pnpm dev
```

Note: Plugins run in development mode but are built as bundles for embedding in the Go application.

## Plugin Structure

```
libs/portal-plugin-template/
├── package.json                    # Plugin metadata and dependencies
├── plugin.config.ts               # Module Federation configuration
├── vite.config.ts                 # Vite build configuration
├── tsdown.config.ts               # Library build configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.cjs             # PostCSS configuration
├── README.md                      # This file
├── src/                           # Source code directory
│   ├── index.ts                   # Plugin factory function
│   ├── routes.tsx                 # Route definitions
│   ├── types.ts                   # TypeScript type definitions
│   ├── widgetRegistrations.ts     # Widget registrations
├── src-lib/                       # Library interface for external consumption
│   ├── index.ts                   # Library entry point
│   ├── types/                     # Shared type definitions
│   │   ├── index.ts               # Type exports
│   │   └── template.ts            # Template-specific types
│   └── util/                      # Shared utilities
│       ├── index.ts               # Utility exports
│       └── templateHelpers.ts     # Template-specific utilities
│   ├── capabilities/              # Plugin capabilities
│   │   └── refineConfig.ts        # Refine configuration capability
│   ├── features/                  # Plugin features
│   │   └── template/              # Template feature
│   │       ├── Feature.ts         # Feature implementation
│   │       └── index.ts           # Feature exports
│   ├── ui/                        # UI components
│   │   ├── components/            # Reusable components
│   │   ├── routes/                # Route components
│   │   │   ├── dashboard.tsx      # Dashboard route
│   │   │   └── settings.tsx       # Settings route
│   │   ├── hooks/                 # Custom React hooks
│   │   │   └── useTemplate.ts     # Template hook
│   │   └── util/                  # Utility functions
│   │       └── templateHelpers.ts # Template utilities
│   ├── contexts/                  # React contexts (optional)
│   └── client/                    # API client code (optional)
└── e2e/                           # End-to-end tests (optional)
```

## Key Files Explained

### Plugin Configuration

- **`plugin.config.ts`**: Defines Module Federation exposes and plugin metadata
- **`vite.config.ts`**: Vite build configuration with framework integration
- **`tsdown.config.ts`**: Library build configuration for external consumption
- **`src/index.ts`**: Main plugin entry point with factory function
- **`src-lib/index.ts`**: Library interface entry point for external consumption

### Plugin Features

- **`src/features/template/Feature.ts`**: Example feature implementation
- **`src/capabilities/refineConfig.ts`**: Refine configuration capability
- **`src/routes.tsx`**: Route definitions with navigation configuration

### UI Components

- **`src/ui/routes/`**: Route-specific components
- **`src/ui/components/`**: Reusable components
- **`src/ui/hooks/`**: Custom React hooks
- **`src/ui/util/`**: Utility functions

### Library Interface

- **`src-lib/types/`**: Shared type definitions for external consumption
- **`src-lib/util/`**: Shared utilities for external consumption
- **`src-lib/index.ts`**: Library entry point with public API

## Development Patterns

### Adding New Routes

1. Add route to `src/routes.tsx`:

```typescript
{
  path: "/your-route",
  component: "yourComponent",
  id: "your-route-id",
  navigation: {
    label: "Your Route",
    icon: YourIcon,
    order: 1,
  },
}
```

2. Add component to `src/ui/routes/yourComponent.tsx`:

```typescript
export default function YourComponent() {
  return <div>Your Route Content</div>;
}
```

3. Expose the route in `plugin.config.ts`:

```typescript
exposes: {
  "./your-route": "./src/ui/routes/yourComponent",
}
```

### Adding New Capabilities

1. Create capability in `src/capabilities/yourCapability.ts`:

```typescript
export class YourCapability implements YourCapabilityInterface {
  readonly id: string = "your-plugin:your-capability";
  readonly type = "your-capability-type";

  async initialize(framework: Framework) {
    // Initialize capability
  }

  async destroy() {
    // Cleanup capability
  }
}
```

2. Register capability in `src/index.ts`:

```typescript
capabilities: [
  new RefineConfigCapability(),
  new YourCapability(),
],
```

### Adding New Features

1. Create feature in `src/features/yourFeature/Feature.ts`:

```typescript
export class Feature implements FrameworkFeature {
  readonly id = createNamespacedId("your-plugin", "your-feature");

  async initialize(framework: Framework): Promise<void> {
    // Initialize feature
  }

  async destroy(framework: Framework): Promise<void> {
    // Cleanup feature
  }
}
```

2. Register feature in `src/index.ts`:

```typescript
features: [
  new TemplateFeature(),
  new YourFeature(),
],
```

### Adding Widgets

1. Create widget component in `src/ui/widgets/yourWidget.tsx`:

```typescript
export default function YourWidget() {
  return <div>Your Widget Content</div>;
}
```

2. Register widget in `src/widgetRegistrations.ts`:

```typescript
{
  id: "your-plugin:your-widget",
  component: () => import("./widgets/yourWidget"),
  location: "dashboard:sidebar",
  order: 1,
},
```

### Creating Library Interface

Plugins can expose a library interface for other plugins to consume:

1. Add types to `src-lib/types/yourTypes.ts`:

```typescript
export interface YourPluginConfig {
  enabled: boolean;
  settings?: Record<string, unknown>;
}
```

2. Add utilities to `src-lib/util/yourHelpers.ts`:

```typescript
import type { YourPluginConfig } from "../types/yourTypes";

export function validateConfig(config: unknown): config is YourPluginConfig {
  // Validation logic
}
```

3. Export from `src-lib/index.ts`:

```typescript
export * from "./types";
export * from "./util";
```

4. Build the library:

```bash
pnpm build:lib
```

Other plugins can then consume your library:

```typescript
import { YourPluginConfig, validateConfig } from "@lumeweb/portal-plugin-your-plugin";
```

## Best Practices

### 1. Naming Conventions

- **Plugin ID**: `core:your-plugin-name`
- **Capability ID**: `your-plugin:capability-name`
- **Feature ID**: `your-plugin:feature-name`
- **Widget ID**: `your-plugin:widget-name`

### 2. File Organization

- Keep components focused and single-purpose
- Use barrel exports (`index.ts`) for clean imports
- Separate concerns (UI, logic, types)
- Follow the established directory structure

### 3. TypeScript Usage

- Use proper typing for all framework interactions
- Define interfaces for plugin-specific types
- Leverage the framework's type definitions
- Use path aliases (`@/*`) for clean imports

### 4. Styling

- Use Tailwind CSS for styling
- Follow the framework's design system
- Use framework components when possible
- Maintain consistency with other plugins

### 5. Error Handling

- Implement proper error boundaries
- Provide meaningful error messages
- Handle initialization failures gracefully
- Use the framework's error handling patterns

## Integration with App Shell

To integrate your plugin with the portal app shell:

1. Add your plugin to the app shell's plugin configuration
2. Ensure your plugin's routes don't conflict with existing routes
3. Test plugin loading and initialization
4. Verify navigation integration

## Testing

### Unit Tests

Create unit tests alongside your components:

```typescript
// src/ui/components/YourComponent.spec.tsx
import { render, screen } from "@testing-library/react";
import YourComponent from "./YourComponent";

describe("YourComponent", () => {
  it("renders correctly", () => {
    render(<YourComponent />);
    expect(screen.getByText("Your Content")).toBeInTheDocument();
  });
});
```

### E2E Tests

Create E2E tests in the `e2e/` directory:

```typescript
// e2e/plugin.spec.ts
import { test, expect } from "@playwright/test";

test("plugin loads correctly", async ({ page }) => {
  await page.goto("/your-route");
  await expect(page.getByText("Your Content")).toBeVisible();
});
```

## Build and Deployment

### Development

```bash
pnpm dev          # Start development server
pnpm build        # Build plugin bundle
pnpm build:lib    # Build library interface for external consumption
pnpm lint         # Run linting
```

### Production

Plugins are built as bundles and embedded in the Go application:

```bash
pnpm build        # Build plugin bundle for embedding
pnpm build:lib    # Build library interface for other plugins/packages
```

The built bundle will be embedded in the Go application's embedded package and served as part of the portal frontend. The library interface (`lib-dist/`) can be consumed by other plugins or packages.

## Common Issues and Solutions

### Port Conflicts

Ensure your plugin uses a unique development port in `vite.config.ts`. Check existing plugins for used ports.

### Route Conflicts

Make sure your plugin's routes don't conflict with existing plugins. Use unique route paths.

### Missing Exposes

All route components must be properly exposed in `plugin.config.ts` to be accessible by the app shell.

### Capability Registration

Ensure capabilities are properly registered in the plugin factory function and implement the required interfaces.

## Resources

- [Portal Plugin Development Guidelines](../../../PLUGIN_GUIDELINES.md)
- [Framework Documentation](../../../libs/portal-framework-core/README.md)
- [UI Components Documentation](../../../libs/portal-framework-ui/README.md)

## Support

For questions or issues with plugin development:

1. Check the existing plugin examples
2. Review the framework documentation
3. Consult the plugin guidelines
4. Reach out to the development team

## License

This template is part of the Lume Web portal framework and follows the same license terms.