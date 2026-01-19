# Lume Web Portal Framework

A modern, modular portal framework built with React, TypeScript, and Module Federation for creating scalable micro-frontend applications.

## 🏗️ Architecture Overview

This monorepo uses **pnpm workspaces** and **Turbo** for build orchestration, featuring a sophisticated plugin architecture with **Module Federation** that enables independent development and deployment of portal functionality.

### Core Components

**Portal Framework (`libs/portal-framework-*`)**
- `portal-framework-core`: Core framework providing plugin management, routing, and component loading infrastructure
- `portal-framework-ui`: React components and UI layer built on top of the core framework
- `portal-framework-ui-core`: Shared UI components and styling (Tailwind CSS)
- `portal-framework-auth`: Authentication-related functionality

**Portal SDK (`libs/portal-sdk`)**
- Generated API client and types for portal backend communication
- Account management schemas and interfaces

**Plugin System (`libs/portal-plugin-*`)**
- Modular plugins that extend portal functionality
- Independent build and deployment capabilities
- Capability-based architecture for extensibility

**Applications (`apps/*`)**
- `portal-app-shell`: Main application host that orchestrates plugins
- `portal-frontend`: Public-facing marketing site
- `portal-storybook`: Component documentation and testing
- Additional specialized applications

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- pnpm 10.15.0+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lume-web

# Install dependencies
pnpm install

# Start development mode
pnpm dev
```

### Environment Setup

The portal app shell requires environment variables:

```bash
# Required for portal-app-shell
VITE_PORTAL_APP_NAME=your-app-name
VITE_PORTAL_APP_TITLE=Your App Title

# Optional
VITE_PORTAL_APP_DISABLE_NAV=true
VITE_PORTAL_APP_DISABLE_ROUTING=true
```

## 📁 Project Structure

```
lume-web/
├── apps/                          # Application entry points
│   ├── portal-app-shell/          # Main portal application host
│   ├── portal-frontend/           # Public marketing site (Astro)
│   ├── portal-storybook/          # Component documentation
│   ├── web3.news/                 # Web3 news application
│   ├── lumeweb.com/               # Company website
│   └── docs.lumeweb.com/          # Documentation site
├── libs/                          # Shared libraries and plugins
│   ├── portal-framework-*/        # Framework core libraries
│   ├── portal-sdk/                # Generated API client
│   └── portal-plugin-*/           # Modular plugins
├── packages/                      # Additional shared packages
│   └── portal-storybook-config/   # Storybook configuration
├── shared-modules.ts              # Module Federation shared modules
├── turbo.json                     # Turbo build configuration
├── pnpm-workspace.yaml            # pnpm workspace configuration
├── AGENTS.md                      # AI agent development guidelines
├── PLUGIN_GUIDELINES.md           # Plugin development guidelines
└── README.md                      # This file
```

## 🔌 Plugin System

The portal framework uses a sophisticated plugin architecture where each plugin is an independently deployable micro-frontend.

### Available Plugins

- **portal-plugin-core**: Essential functionality (NotFound routes, navigation)
- **portal-plugin-dashboard**: Main dashboard with authentication and file upload
- **portal-plugin-ipfs**: IPFS integration and file management
- **portal-plugin-admin**: Administrative interface
- **portal-plugin-abuse**: Abuse management system
- **portal-plugin-abuse-report**: Public abuse reporting interface
- **portal-plugin-abuse-common**: Shared types and API clients

### Plugin Development

See [PLUGIN_GUIDELINES.md](./PLUGIN_GUIDELINES.md) for comprehensive plugin development guidelines.

#### Quick Plugin Template

```bash
# Create new plugin directory
mkdir libs/portal-plugin-my-feature
cd libs/portal-plugin-my-feature

# Initialize with standard structure
# (Follow PLUGIN_GUIDELINES.md for detailed setup)
```

## 🛠️ Development

### Common Commands

```bash
# Development
pnpm dev                    # Start all packages in development mode
pnpm dev --filter=portal-app-shell  # Start only app shell

# Building
pnpm build                  # Build all packages and apps
pnpm build:portal-app-shell # Build only app shell
pnpm build:portal-plugin-dashboard  # Build specific plugin

# Testing
pnpm test                   # Run all tests
vitest run                  # Run unit tests
playwright test             # Run E2E tests

# Code Quality
pnpm lint                   # Run linting across all packages
pnpm format                 # Format code with Prettier
```

### Plugin-Specific Commands

```bash
# Dashboard plugin
pnpm e2e:portal-plugin-dashboard  # Run E2E tests

# Individual plugin development
cd libs/portal-plugin-dashboard
pnpm dev                  # Start plugin in isolation
```

### Framework Development

Framework libraries use `tsdown` for building:

```bash
cd libs/portal-framework-core
pnpm build               # Build library with ESM/CJS output
```

## 🏗️ Build System

### Turbo Orchestration

The monorepo uses Turbo for efficient build orchestration:

- **Parallel builds**: Dependencies are built in parallel where possible
- **Incremental builds**: Only changed packages are rebuilt
- **Caching**: Build outputs are cached for faster subsequent builds

### Module Federation

The system uses Module Federation for:

- **Plugin isolation**: Each plugin builds independently
- **Shared dependencies**: Common libraries are shared to reduce bundle size
- **Runtime composition**: Plugins are loaded at runtime
- **Development flexibility**: Plugins can be developed independently

### Shared Modules Configuration

```typescript
// shared-modules.ts
export const getSharedModules = () => ({
  react: { singleton: true, requiredVersion: "^18.3.1" },
  "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
  "react-router": { singleton: true, requiredVersion: "^7.5.2" },
  // ... other shared modules
});
```

## 🔧 Configuration

### Portal App Shell

The main application host is configured via:

- `plugin.config.json`: Plugin registry configuration
- Environment variables: App name, features, and server settings
- Vite configuration: Module Federation setup

#### Plugin Registry Example

```json
[
  {
    "name": "core",
    "port": 443,
    "tunnelHost": "core.tunnel.pinner.xyz"
  },
  {
    "name": "dashboard", 
    "port": 443,
    "tunnelHost": "dashboard.tunnel.pinner.xyz"
  }
]
```

### Plugin Configuration

Each plugin requires:

- `plugin.config.ts`: Module Federation configuration
- `vite.config.ts`: Build configuration using framework's Config helper
- `package.json`: Dependencies and metadata
- `tsconfig.json`: TypeScript configuration

## 🧪 Testing

### Unit Testing

- **Framework**: Vitest with Happy DOM
- **Location**: `*.spec.ts` files alongside source code
- **Command**: `vitest run` or `vitest --watch`

### Integration Testing

- **Framework**: Playwright for E2E tests
- **Location**: `e2e/` directories in plugins
- **Command**: `playwright test` or `playwright test --ui`

### Browser Testing

- **Framework**: Vitest with browser environment
- **Location**: `*.browser.spec.ts` files
- **Command**: `vitest run --browser`

## 📚 Documentation

### Component Documentation

- **Storybook**: Run `pnpm dev --filter=portal-storybook`
- **URL**: http://localhost:6006
- **Purpose**: Component development, testing, and documentation

### API Documentation

- **Location**: `docs.lumeweb.com` app
- **Framework**: Vocs
- **Command**: `pnpm dev --filter=@lumeweb/docs.lumeweb.com`

### Development Guidelines

- **AGENTS.md**: Guidelines for AI agents working with the codebase
- **PLUGIN_GUIDELINES.md**: Comprehensive plugin development guide

## 🌐 Deployment

### Build Process

```bash
# Build all packages
pnpm build

# Build specific app
pnpm build:portal-app-shell

# Build with environment
NODE_ENV=production pnpm build:portal-app-shell
```

### Plugin Deployment

Each plugin can be deployed independently:

```bash
cd libs/portal-plugin-dashboard
pnpm build
# Deploy dist/ directory to your hosting platform
```

### App Shell Deployment

The app shell requires:

1. Built plugins available at configured URLs
2. Environment variables configured
3. Static file serving with SPA fallback support

## 🔍 Architecture Patterns

### Plugin Communication

Plugins communicate through:

- **Capabilities**: Exposed functionality interfaces
- **Features**: Major functionality encapsulation
- **Events**: Framework event system for loose coupling
- **Shared Services**: Framework-provided services

### Capability System

```typescript
// Example capability
export class CustomCapability implements BaseCapability {
  readonly id: string = "plugin:capability";
  readonly type = "custom-type";
  
  async initialize(framework: Framework) {
    // Initialize capability
  }
  
  async destroy() {
    // Cleanup
  }
}
```

### Feature System

```typescript
// Example feature
export class Feature implements FrameworkFeature {
  readonly id: NamespacedId = createNamespacedId("plugin", "feature");
  
  async initialize(framework: Framework) {
    // Initialize feature
  }
}
```

## 🎯 Best Practices

### Development

1. **Follow established patterns**: Use framework abstractions and conventions
2. **Keep plugins focused**: Single responsibility per plugin
3. **Use TypeScript**: Leverage type safety throughout
4. **Test thoroughly**: Unit tests for logic, E2E for user flows
5. **Document interfaces**: Clear capability and feature contracts

### Performance

1. **Lazy loading**: Load components and features on demand
2. **Code splitting**: Split large features into smaller chunks
3. **Bundle optimization**: Monitor and optimize bundle sizes
4. **Shared dependencies**: Use Module Federation sharing effectively

### Security

1. **Environment variables**: Never expose secrets in client code
2. **Input validation**: Use Zod schemas for validation
3. **Authentication**: Use framework auth capabilities
4. **CORS**: Configure properly for plugin communication

## 🤝 Contributing

### Development Workflow

1. **Setup**: Install dependencies and configure environment
2. **Create branch**: Feature branches from main/develop
3. **Develop**: Follow guidelines in AGENTS.md and PLUGIN_GUIDELINES.md
4. **Test**: Ensure all tests pass
5. **Build**: Verify build process works
6. **Submit**: Create pull request with description

### Code Style

- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting with Tailwind plugin
- **Conventional Commits**: Use conventional commit format
- **TypeScript**: Strict mode enabled

## 📦 Package Management

### Workspace Structure

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "libs/*"
  - "apps/portal-storybook"
  - "packages/portal-storybook-config"
```

### Dependency Management

- **Workspace dependencies**: Use `workspace:*` for internal packages
- **Peer dependencies**: Properly declare for framework libraries
- **Version alignment**: Use overrides for consistent versions

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure unique dev ports for plugins
2. **Module Federation**: Check shared modules configuration
3. **Build failures**: Verify dependency versions and compatibility
4. **Environment variables**: Ensure all required variables are set

### Debug Commands

```bash
# Check dependency tree
pnpm why react

# Clean build artifacts
pnpm clean  # If available, or manually remove dist/ directories

# Rebuild with verbose output
TURBO_LOG=detail pnpm build
```

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check PLUGIN_GUIDELINES.md
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
