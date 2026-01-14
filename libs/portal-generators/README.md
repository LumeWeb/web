# @lumeweb/portal-generators

Code generators for creating new portal plugins and utility libraries in the Lume Web monorepo. Powered by Turbo Gen and Plop.js.

## Features

- **Portal Plugin Generator** - Scaffold complete portal plugins with Module Federation, routes, widgets, and optional API client setup
- **Library Generator** - Create utility libraries with optional test setup and coverage configuration
- **Automatic Port Assignment** - Automatically assigns available dev ports for new plugins
- **Template-Based** - Uses Handlebars templates for consistent project structure
- **TypeScript Ready** - All generated code includes proper TS configuration

## Installation

This package is used as a development dependency in the monorepo. It's automatically available when running generator commands.

## Usage

### Generate a Portal Plugin

The portal plugin generator creates a full-featured plugin with:

- Module Federation configuration
- Vite dev server with automatic port assignment
- Tailwind CSS setup
- Optional route templates
- Optional src-lib for library interface
- Optional Orval API client generation
- Widget registration support

```bash
pnpm turbo gen portal-plugin
```

**Prompts:**

- **Plugin name** - Enter the name (e.g., `my-plugin`)
- **Include route templates?** - Add route files (default: yes)
- **Routes** - Comma-separated route names (default: dashboard,settings)
- **Include src-lib for library interface?** - Add src-lib directory (default: no)
- **Include Orval for API client generation?** - Add Orval config (default: no)
- **Include widget registrations?** - Add widget setup (default: no)

**Generated Structure:**

```
libs/portal-plugin-my-plugin/
├── package.json
├── plugin.config.ts
├── vite.config.ts
├── tsconfig.json
├── tsdown.config.ts
├── tailwind.config.ts
├── postcss.config.cjs
├── orval.config.ts          (if Orval enabled)
├── src/
│   └── index.ts
│   └── capabilities/
│       └── refineConfig.ts
│   └── routes.tsx          (if routes enabled)
│   └── widgetRegistrations.ts
│   └── ui/
│       └── components/
│           └── index.ts
│       └── hooks/
│           └── index.ts
│       └── util/
│           └── index.ts
└── src-lib/                (if src-lib enabled)
    └── index.ts
    └── types/
        └── index.ts
    └── util/
        └── index.ts
```

### Generate a Utility Library

The library generator creates a reusable utility library:

```bash
pnpm turbo gen lib
```

**Prompts:**

- **Library name** - Enter the name (e.g., `my-util`)
- **Library description** - Optional description
- **Include test setup?** - Add Vitest configuration (default: yes)
- **Include test coverage configuration?** - Add coverage config (default: no)
- **Catalog dependencies** - Comma-separated catalog dependencies
- **Module exports** - Comma-separated export paths

**Generated Structure:**

```
libs/my-util/
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── vitest.config.ts        (if tests enabled)
└── src/
    └── index.ts
    └── __tests__/
        └── setup.ts        (if tests enabled)
```

## Automatic Port Assignment

The portal plugin generator automatically finds the next available dev port starting from 4178. It scans existing plugins in `libs/portal-plugin-*` to determine used ports and assigns the next available one.

## Templates

Generator templates are located in `src/templates/`:

**Portal Plugin:**
- `portal-plugin-package.json.hbs`
- `portal-plugin-config.ts.hbs`
- `portal-plugin-vite.config.ts.hbs`
- `portal-plugin-tsconfig.json.hbs`
- `portal-plugin-tsdown.config.ts.hbs`
- `portal-plugin-tailwind.config.ts.hbs`
- `portal-plugin-postcss.config.cjs.hbs`
- `portal-plugin-src-index.ts.hbs`
- `portal-plugin-src-capabilities-refineConfig.ts.hbs`
- `portal-plugin-src-routes.tsx.hbs`
- `portal-plugin-src-widgetRegistrations.ts.hbs`

**Library:**
- `lib-package.json.hbs`
- `lib-src-index.ts.hbs`
- `lib-vitest.config.ts.hbs`
- `lib-tsconfig.json.hbs`
- `lib-tsdown.config.ts.hbs`

## Development

Generators are automatically built as part of the monorepo's prepare script:

```bash
pnpm run prepare
```

## API

### `genPortalPlugin()`

Returns a Plop generator configuration for creating portal plugins.

### `genLib()`

Returns a Plop generator configuration for creating utility libraries.

### `default(plop)`

Main entry point that registers generators with Plop.js.

## Contributing

When adding new features to generators:

1. Create or update Handlebars templates in `src/templates/`
2. Update generator functions in `src/index.ts`
3. Test thoroughly with `pnpm turbo gen`

## License

See LICENSE file for details.
