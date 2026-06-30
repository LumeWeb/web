# Navigation System

How nav items are built from plugin routes, how sections create visual grouping, and how the tree hierarchy works.

## File Map

| File | Responsibility |
|------|---------------|
| `src/features/navigation.ts` | `Navigation` class: route collection, nav item creation, ID generation, validation, route tree building |
| `src/features/navigation.spec.ts` | Test suite for navigation feature |

## How Nav Items Are Built

### Entry Point: `buildNavigation(plugins)`

1. Iterate all registered plugins via `framework.getPlugins()`
2. For each plugin, call `processRouteForNavigation()` on every top-level route
3. Collect all `NavigationItem[]` into a flat array
4. Sort by `order` ascending (undefined last), preserving plugin registration order as tiebreaker

```typescript
buildNavigation(plugins: Plugin[]): NavigationItem[] {
  return plugins
    .flatMap(plugin =>
      plugin.routes?.flatMap(route =>
        this.processRouteForNavigation(route, plugin.id)
      ) ?? []
    )
    .sort(/* by order, then registration order */);
}
```

### Recursive Walk: `processRouteForNavigation(route, pluginId, parentPath, parentId, inheritedSection)`

This is the core recursive function that walks route trees. It handles five responsibilities:

#### 1. Should Include Check

```typescript
const shouldInclude = this.shouldIncludeRouteInNavigation(route);
```

A route is included if it has a `navigation` field AND is not an index route (unless `forceShowInNavigation` is set). Routes without navigation are still traversed for their children — this handles layout/group routes.

#### 2. Nav Item Creation

If the route should be included, `createNavigationItem()` is called. If not, `item` is null but children are still processed.

#### 3. Section Inheritance

```typescript
if (item && !item.section && inheritedSection) {
  item.section = inheritedSection;
}
const effectiveSection = item?.section ?? inheritedSection;
```

Children without their own `section` field inherit the parent's section. This ensures all descendants of a `section: "Account"` route are grouped together in the sidebar.

#### 4. Path Resolution

`resolveFullPath(parentPath, route.path)` joins child paths to parent paths:
- Absolute child paths (`/foo`) are kept as-is
- Relative child paths (`bar`) are joined to the parent path (`/foo` + `bar` -> `/foo/bar`)
- Handles trailing slash normalization

#### 5. Child Processing

When a route has `children`, each child is recursively processed with:
- The resolved full path as `parentPath`
- The parent's nav item ID as `parentId`
- The effective section for inheritance

### Property Passthrough: `createNavigationItem(route, pluginId, parentPath, parentId)`

Extracts navigation config from the route's `navigation` field and copies it to a `NavigationItem`. Uses a `propMap` to define which properties are included:

```typescript
const propMap = {
  badge: CHECK_TYPES.DEFINED,
  children: CHECK_TYPES.DEFINED,
  description: CHECK_TYPES.UNDEFINED_CHECK,
  disabled: CHECK_TYPES.UNDEFINED_CHECK,
  hidden: CHECK_TYPES.UNDEFINED_CHECK,
  icon: CHECK_TYPES.DEFINED,
  order: CHECK_TYPES.UNDEFINED_CHECK,
  linkable: CHECK_TYPES.UNDEFINED_CHECK,
  parentId: CHECK_TYPES.UNDEFINED_CHECK,
  section: CHECK_TYPES.UNDEFINED_CHECK,
  show: CHECK_TYPES.DEFINED,
};
```

Each property is copied from `route.navigation.<prop>` to the nav item if the value is not `undefined`. The `section` and `description` fields flow through this map, as does `parentId` (which can be explicitly set on navigation config for cross-plugin nesting).

## Section Grouping

### How Sections Work

The `section` field on a `NavigationItem` determines which visual group an item belongs to in the sidebar. The UI layer (`useNavigationTree.groupBySection`) partitions items by section name:

- Items with `section: "Account"` form the "Account" group (rendered with a header)
- Items with `section: "Public Data"` form the "Public Data" group
- Items without a section go to the "default" group (rendered without a header, sorts first)

### Section Inheritance

When a parent route sets `section: "Account"`, all children that don't define their own section inherit "Account". This happens in `processRouteForNavigation` before recursing into children:

```typescript
// Parent has section, child doesn't -> inherit
if (item && !item.section && inheritedSection) {
  item.section = inheritedSection;
}
const effectiveSection = item?.section ?? inheritedSection;
// Pass effectiveSection to child processing
```

### Single-Item Sections

The UI layer (`MainNavigation.tsx`) suppresses the section header when a group has only one item whose ID suffix matches the section name (kebab-cased). For example, a section named "Private Data" with a single item whose ID ends in `private-data` will have its header suppressed. This keeps the sidebar clean when a section has a single service (e.g., Sia under "Private Data").

## Ordering

Navigation items are sorted at two levels:

1. **Global sort** in `buildNavigation`: by `order` ascending, undefined values last, plugin registration order as tiebreaker
2. **Per-section sort** in UI layer `groupBySection`: items within each section sort by `order` ascending
3. **Per-level sort** in UI layer `buildTree`: nodes at each tree level sort by `order` ascending

The `order` field on the `navigation` config controls this. Lower numbers appear first.

## Hierarchy: parentId and Inline Children

### parentId Linking

When `processRouteForNavigation` processes children of a route with a nav item, it passes the parent's `id` as `parentId`. This creates the `parentId` field on child `NavigationItem` objects. The UI layer's `buildTree()` uses these `parentId` references to build the tree: items with `parentId` are nested under their parent.

### Inline children Array

`NavigationItem.children` is an alternative hierarchy mechanism. When a nav item has inline `children`, `buildTree()` attaches them to the parent node. If a child appears both as a flat item with `parentId` AND in an inline `children` array, `parentId` takes precedence for deduplication.

### Layout Routes (Group Headers Without Navigation)

A route without a `navigation` field (e.g., a layout wrapper) produces no nav item, but its children are still processed. This allows structuring routes hierarchically without polluting the sidebar with layout routes:

```typescript
// Route with no navigation — item is null
if (!item) {
  const childPath = resolveFullPath(parentPath, route.path ?? "");
  return route.children?.flatMap(...) ?? [];
}
```

## ID Generation Waterfall

The `generateIdFromRoute(route, pluginId)` function generates unique IDs for nav items using a priority waterfall:

```
1. Existing ID     — use route.id if it's a valid NamespacedId
       │ (no id)
       ▼
2. Path-based      — sanitize route.path, namespace under plugin
       │ (no path)
       ▼
3. Component name  — normalizeNameForId(route.component), namespace under plugin
       │ (no component)
       ▼
4. Navigation label — sanitize route.navigation.label, namespace under plugin
       │ (no label)
       ▼
5. Hash fallback    — JSON.stringify(route) -> hash -> "generated:route-<hash36>"
```

### Namespace Fallback

When `pluginId` is `undefined` (e.g., during standalone route processing), IDs are namespaced under `"generated"` instead of the plugin's namespace. This applies to steps 2-5.

### Index Route Path Fallback

In step 2, if a route has no `path` but is an index route (`index: true`), the string `"index"` is used as the path for ID generation.

### Component NamespacedId Sub-Parsing

In step 3, if `route.component` contains a `:` (i.e., it's a NamespacedId), it's parsed with `parseNamespacedId()` to extract the name part before normalization. This handles cases where component names are namespaced identifiers.

### Path Sanitization

For path-based IDs, the path is cleaned:
- Strip leading/trailing slashes
- Replace invalid chars with hyphens
- Collapse consecutive hyphens
- Namespace under the plugin's namespace (if `pluginId` provided)

### Component Name Normalization

`normalizeNameForId()` converts camelCase/PascalCase component names to kebab-case:
- `UserProfile` -> `user-profile`
- `APIKeys` -> `apikeys` (no lowercase-uppercase boundary to split on)
- `UserProfile` -> `user-profile`
- `UserSettings2` -> `user-settings2`

## Route Validation and Building

### `getRoutes()`

The async counterpart to `getNavigation()`. Builds the route tree for React Router:

1. **Process routes**: For each plugin route, resolve component data, process children recursively
2. **ID enforcement**: Routes without `id` throw an error (bare strings not accepted)
3. **Duplicate detection**: Warn on duplicate route IDs and paths across plugins
4. **Validation**: `validateRoute()` checks for required path, component/element, and ID
5. **Sort**: `buildRouteTree()` sorts by path specificity (root first, then by segment count)
6. **404 route**: Appends a `*` catch-all route at the end

### Validation Rules

```typescript
private validateRoute(route: RouteDefinition): boolean {
  if (!route.path) return false;           // path required
  if (!route.component && !route.element) return false;  // component OR element
  if (!route.id) return false;             // ID required
  return true;
}
```

Routes failing validation are dropped (a warning is logged via `console.warn`).

## Lifecycle

### `initialize(framework: Framework)`

Stores the `Framework` reference for later use by `getNavigation()` and `getRoutes()`. Called during feature registration.

### `destroy()`

Clears the framework reference. Called during framework teardown.

## Factory Function

### `createNavigationFeature(): NavigationFeature`

Creates and returns a new `Navigation` instance. This is the standard way to instantiate the navigation feature for inclusion in a plugin's `features[]` array.

## Utility Methods

### `routeExists(path: string): boolean` (private)

Checks if any registered plugin has a route with the given path. Returns `true` if found. This is a private method, not part of the public API.

## CHECK_TYPES

The `propMap` uses two symbols (`DEFINED`, `UNDEFINED_CHECK`) to categorize properties. Both currently follow the same behavior: copy the value if it's not `undefined`. The distinction exists for future differentiation of inclusion criteria.
