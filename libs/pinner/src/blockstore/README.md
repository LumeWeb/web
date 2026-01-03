# UnstorageBlockstore

A blockstore adapter that uses [unstorage](https://unstorage.unjs.io) as the underlying storage backend. This allows the blockstore to work with various storage drivers across different environments (browser, Node.js, etc.).

## Features

- **Environment-aware auto-configuration**: Automatically selects the appropriate storage driver based on the runtime environment
- **Flexible driver configuration**: Users can provide custom unstorage drivers or pre-configured storage instances
- **Cross-platform support**: Works in both browser and Node.js environments

## Usage

### Auto-Configuration (Recommended)

The blockstore will automatically detect the environment and use the appropriate driver:

```typescript
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";

// Browser: Uses IndexedDB driver
// Node.js: Uses fs-lite driver
const blockstore = new UnstorageBlockstore();
```

### Custom Driver

Provide a specific unstorage driver:

```typescript
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";
import localStorageDriver from "unstorage/drivers/localstorage";

const blockstore = new UnstorageBlockstore({
  driver: localStorageDriver({ base: "my-app:" })
});
```

### Pre-configured Storage

Use an existing unstorage instance:

```typescript
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";
import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

const storage = createStorage({
  driver: fsDriver({ base: "./my-blocks" })
});

const blockstore = new UnstorageBlockstore({
  storage
});
```

### Disable Auto-Configuration

To use the default in-memory storage:

```typescript
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";

const blockstore = new UnstorageBlockstore({
  autoConfigure: false
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `storage` | `Storage` | `undefined` | A pre-configured unstorage instance. If provided, `driver` and `autoConfigure` are ignored. |
| `driver` | `Driver` | `undefined` | A unstorage driver to use. If provided, `autoConfigure` is ignored. |
| `prefix` | `string` | `"blockstore"` | Key prefix for storing blocks in the storage backend. |
| `autoConfigure` | `boolean` | `true` | Whether to automatically configure the driver based on the environment. |

## Default Drivers

### Browser Environment

When running in a browser, the blockstore uses the **IndexedDB driver** with a base prefix of `"pinner:"`. This provides persistent storage with good performance for larger datasets.

### Node.js Environment

When running in Node.js, the blockstore uses the **fs-lite driver** with a base directory of `"./.pinner-blocks"`. This stores blocks on the filesystem using pure Node.js APIs without external dependencies.

## Available Drivers

Unstorage provides many drivers that can be used with this blockstore:

- **Browser**: `localStorage`, `sessionStorage`, `indexedDB`, `memory`
- **Node.js**: `fs`, `fs-lite`, `redis`, `cloudflare-kv`, `vercel-kv`
- **Universal**: `memory`, `http`, `overlay`

See the [unstorage documentation](https://unstorage.unjs.io/drivers) for the complete list of drivers.

## Example: Using Redis Driver

```typescript
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";
import redisDriver from "unstorage/drivers/redis";

const blockstore = new UnstorageBlockstore({
  driver: redisDriver({
    host: "localhost",
    port: 6379,
    base: "blocks:"
  })
});
```

## Example: Using Overlay Driver

Combine multiple storage layers:

```typescript
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";
import overlayDriver from "unstorage/drivers/overlay";
import memoryDriver from "unstorage/drivers/memory";
import fsDriver from "unstorage/drivers/fs";

const blockstore = new UnstorageBlockstore({
  driver: overlayDriver({
    layers: [
      memoryDriver(),  // Fast cache layer
      fsDriver({ base: "./blocks" })  // Persistent layer
    ]
  })
});
```
