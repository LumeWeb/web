# Navigation Interface Design

This document covers the type contracts and interface design for the navigation system. These interfaces live in `portal-framework-core` and define the contract that `portal-plugin-core` implements and `portal-framework-ui` consumes.

For implementation behavior (how nav items are built, section inheritance, ordering, ID generation), see `portal-plugin-core/docs/navigation/README.md`.

## Interface Overview

```
portal-framework-core (contracts)
├── FrameworkFeature          — base lifecycle interface for all features
├── NavigationFeature         — extends FrameworkFeature with nav-specific methods
├── NavigationItem            — flat nav item shape (label, icon, order, section, etc.)
├── NavigationBadge           — badge shape for nav items
├── NavigationItemIconProps   — props passed to icon components
├── RouteDefinition           — route config with optional navigation metadata
├── Plugin                    — plugin contract with optional routes[] and features[]
└── Plugin.routes: RouteDefinition[]   — where plugins declare their routes

         │ implements
         ▼

portal-plugin-core (implementation)
└── Navigation class          — concrete NavigationFeature implementation

         │ consumed by
         ▼

portal-framework-ui (rendering)
├── useMenuItems()            — reads menuItems from appStore
├── useNavigationTree()       — groups by section, builds N-level tree
└── MainNavigation            — renders sectioned sidebar
```

## FrameworkFeature

The base interface that all framework features (navigation, settings, etc.) implement:

```typescript
interface FeatureDependency {
  id: NamespacedId;
}

type FeatureStatus = "disabled" | "enabled" | "error";

interface FrameworkFeature {
  dependencies?: FeatureDependency[];
  id: NamespacedId;
  status: FeatureStatus;
  initialize(framework: Framework): Promise<void>;
  destroy(framework: Framework): Promise<void>;
}
```

Features are registered with the framework lifecycle. `initialize` gives the feature access to the `Framework` instance (used to read registered plugins). `destroy` cleans up on teardown. Both receive the `Framework` instance.

## NavigationFeature

Extends `FrameworkFeature` with two methods:

```typescript
interface NavigationFeature extends FrameworkFeature {
  getNavigation(): NavigationItem[];
  getRoutes(): Promise<RouteDefinition[]>;
}
```

- **`getNavigation()`** — Synchronous. Returns a flat array of `NavigationItem` collected from registered plugins' routes. Called when the navigation sidebar is rendered.
- **`getRoutes()`** — Async. Returns a validated `RouteDefinition[]` tree for React Router.

## NavigationItem

The core data unit for the sidebar. Produced by the navigation feature from route definitions:

```typescript
interface NavigationBadge {
  content: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

interface NavigationItemIconProps {
  className?: string;
  size?: number | string;
}

interface NavigationItem {
  id?: NamespacedId;                  // unique identifier (used for parentId linking)
  label: string;                      // display label (required)
  path?: string;                      // route path this item links to
  parentId?: NamespacedId;            // links this item to a parent for hierarchy
  section?: string;                   // groups items under a visual header
  order?: number;                     // sort order within siblings (ascending)
  icon?: React.FC<NavigationItemIconProps>;
  badge?: NavigationBadge;
  children?: NavigationItem[];        // inline children (alternative to parentId)
  hidden?: boolean;                   // hide from sidebar
  disabled?: boolean;                 // show greyed out
  linkable?: boolean;                 // false = render without link (group headers)
  show?: () => boolean;               // dynamic visibility
  forceShowInNavigation?: boolean;    // force index routes into the sidebar
  index?: boolean;                    // marks an index route
}
```

### Design Decisions

**Two hierarchy mechanisms**: `parentId` and inline `children[]`. Both exist because:
- `parentId` supports flat collections where items are registered independently (e.g., across plugins)
- Inline `children[]` supports co-located parent-child definitions in a single route tree

**Section is a string, not an enum**: Sections are open-ended. Plugins can invent their own sections ("Public Data", "Account", "Private Data") without coordinating with the framework. The UI layer groups by string equality.

## RouteDefinition

Extends React Router's `RouteObject` with portal-specific fields:

```typescript
interface RouteDefinition extends Omit<RouteObject, "children"> {
  children?: RouteDefinition[];
  component: string;                  // bare export name from plugin module
  id?: NamespacedId;                  // required (enforced at plugin registration time)
  index?: boolean;
  lazyLoad?: boolean;
  navigation?: NavigationItem;        // config for sidebar entry (partial — id/path/parentId resolved automatically)
  parentId?: NamespacedId;            // namespaced route nesting
  pluginId?: NamespacedId;            // set during route processing
  caseSensitive?: boolean;
  shouldRevalidate?: (args: { currentUrl: URL; nextUrl: URL }) => boolean;
}
```

**`component` is a bare string**: Not a namespaced ID. It's resolved against the plugin's module loader to find the exported component. This decouples route definitions from component packaging.

**`navigation` is partial**: The route's `navigation` field provides sidebar config, but `id`, `path`, and `parentId` on the `NavigationItem` are resolved automatically by the `Navigation` class during route processing. Plugin authors only set display properties (label, icon, order, section, etc.).

**`id` enforcement**: Route IDs must be valid `NamespacedId` values. Bare strings are rejected during plugin registration in `PluginManager.register()`.

## Plugin Contract

Plugins optionally provide routes and features:

```typescript
interface Plugin {
  id: NamespacedId;
  routes?: RouteDefinition[];         // optional route definitions
  features?: FrameworkFeature[];      // optional features (incl. NavigationFeature)
  initialize(framework: Framework): Promise<void>;
  destroy(framework: Framework): Promise<void>;
  // ... capabilities, exports, namespaces, widgets, etc.
}
```

The `Navigation` feature is included in a plugin's `features[]` array. It collects `routes` from all registered plugins via `framework.getPlugins()`. Each plugin's routes are processed independently, then merged and sorted by `order`.

## Data Flow

```
Plugin.routes: RouteDefinition[]
    │
    │ NavigationFeature.getNavigation()
    │   (implementation in portal-plugin-core)
    ▼
NavigationItem[] (flat)
    │
    │ appStore.menuItems (Zustand store)
    ▼
useMenuItems() → useNavigationTree(items)
    │
    │ groupBySection(): partition by section name (default = no header, sorts last)
    │ buildTree(): per-section N-level tree (parentId + inline children)
    ▼
{ sections, sectionTrees, tree }
    │
    │ MainNavigation renders:
    │   - Named sections with header + items
    │   - Single-item sections: no header (suppressed)
    │   - Default section: no header
    ▼
<MainNavigation />
```

> Implementation details (buildNavigation, processRouteForNavigation, createNavigationItem, section inheritance, ID generation waterfall) are documented in `portal-plugin-core/docs/navigation/README.md`.

## Implementing a Custom NavigationFeature

If you need to replace or extend the default `Navigation` class, implement the `NavigationFeature` interface and include it in a plugin's `features[]` array:

```typescript
import {
  CORE_NS,
  createNamespacedId,
  type Framework,
  type NavigationFeature,
  type NavigationItem,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";

class CustomNavigation implements NavigationFeature {
  id = createNamespacedId(CORE_NS, "navigation");
  status = "enabled" as const;
  #framework: Framework | null = null;

  async initialize(framework: Framework): Promise<void> {
    this.#framework = framework;
  }

  getNavigation(): NavigationItem[] {
    // Return flat NavigationItem[] from this.#framework.getPlugins()
  }

  async getRoutes(): Promise<RouteDefinition[]> {
    // Return validated RouteDefinition[] tree for the router
  }

  async destroy(framework: Framework): Promise<void> {
    // Clean up
  }
}
```

Register it as a feature on a plugin, then register that plugin with the `Builder`:

```typescript
import { Builder, createNamespacedId } from "@lumeweb/portal-framework-core";

const builder = new Builder("my-app");
builder.registerPluginFactory(
  createNamespacedId("myapp", "core"),
  () => ({
    id: createNamespacedId("myapp", "core"),
    features: [new CustomNavigation()],
  }),
);
const framework = await builder.build();
```

The framework UI layer (`MainNavigation`, `useNavigationTree`) is agnostic to the navigation feature implementation — it only consumes `NavigationItem[]` from `appStore.menuItems`. As long as your implementation populates the store with valid `NavigationItem` objects, the UI renders correctly.
