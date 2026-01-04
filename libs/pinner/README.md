# @lumeweb/pinner

A TypeScript library for uploading files to IPFS and managing pinning operations with support for multiple upload protocols, custom storage backends, and flexible configuration.

## Features

- **Multiple Upload Methods**: TUS resumable uploads, XHR uploads, and direct CAR file uploads
- **Directory Support**: Upload multiple files as a directory to IPFS
- **Pin Management**: Add, list, remove, and check status of pinned content
- **Custom Blockstore**: Flexible storage backend using unstorage (IndexedDB, filesystem, Redis, etc.)
- **Adapters**: Built-in Pinata adapter with extensible adapter pattern
- **Encoders**: Support for CSV, JSON, text, base64, and URL encoding
- **Progress Tracking**: Real-time upload progress and operation polling
- **Cross-Platform**: Works in both browser and Node.js environments
- **TypeScript**: Fully typed with comprehensive type definitions

## Installation

```bash
pnpm add @lumeweb/pinner
```

## Quick Start

```typescript
import { Pinner } from "@lumeweb/pinner";

// Initialize with JWT token
const pinner = new Pinner({
  jwt: "your-jwt-token",
  endpoint: "https://ipfs.pinner.xyz",
  gateway: "https://dweb.link"
});

// Upload a file
const file = new File(["Hello, IPFS!"], "hello.txt", { type: "text/plain" });
const operation = await pinner.upload(file);

// Wait for completion
const result = await operation.result;
console.log("CID:", result.cid);
console.log("URL:", result.url);

// List pins
const pins = await pinner.listPins();
console.log("Pinned content:", pins);
```

## Configuration

The `Pinner` class accepts a `PinnerConfig` object:

```typescript
interface PinnerConfig {
  // Required
  jwt: string;

  // Optional
  endpoint?: string;               // Default: "https://ipfs.pinner.xyz"
  gateway?: string;                // Default: "https://dweb.link"
  allowedFileTypes?: string[];     // MIME types allowed for upload
  fetch?: typeof fetch;            // Custom fetch implementation
  datastore?: Datastore;           // Custom datastore for Helia
  storage?: Storage;               // Custom unstorage instance
  datastoreName?: string;          // Base name for storage (default: "pinner-helia-data")
}
```

## Upload Methods

### Basic Upload

```typescript
// Upload with default options
const operation = await pinner.upload(file);

// Upload with custom options
const operation = await pinner.upload(file, {
  metadata: { name: "My File" },
  timeout: 30000
});

// Wait for result
const result = await operation.result;
```

### Upload and Wait

Convenience method for simple use cases:

```typescript
const result = await pinner.uploadAndWait(file);
console.log("CID:", result.cid);
```

### Directory Upload

```typescript
const files = [
  new File(["content1"], "file1.txt"),
  new File(["content2"], "file2.txt")
];

const operation = await pinner.uploadDirectory(files);
const result = await operation.result;
```

### CAR File Upload

Upload pre-generated CAR files without preprocessing:

```typescript
const carFile = new File([carData], "content.car", { type: "application/vnd.ipld.car" });
const operation = await pinner.uploadCar(carFile);
const result = await operation.result;
```

### Upload Builder Pattern

Use the builder API for more control:

```typescript
// Upload JSON
const operation = await pinner.upload.json({ foo: "bar" });

// Upload text
const operation = await pinner.upload.text("Hello, world!");

// Upload CSV
const operation = await pinner.upload.csv([
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
]);
```

## Progress Tracking

Upload operations return an `UploadOperation` with progress tracking:

```typescript
const operation = await pinner.upload(file);

// Listen to progress events
operation.on("progress", (progress) => {
  console.log(`Progress: ${progress.progress}%`);
  console.log(`Speed: ${progress.speed} bytes/sec`);
});

// Listen to completion
operation.on("complete", (result) => {
  console.log("Upload complete:", result.cid);
});

// Listen to errors
operation.on("error", (error) => {
  console.error("Upload failed:", error);
});

// Or await the result directly
const result = await operation.result;
```

## Pin Management

### Pin by CID

```typescript
import { CID } from "multiformats/cid";

// Pin existing content
const cid = CID.parse("Qm...");
await pinner.pinByHash(cid);

// With options
await pinner.pinByHash(cid, {
  name: "My Pin",
  metadata: { key: "value" }
});
```

### List Pins

```typescript
// List all pins
const pins = await pinner.listPins();

// List with filters
const pins = await pinner.listPins({
  status: "pinned",
  limit: 10,
  offset: 0
});
```

### Get Pin Status

```typescript
const pin = await pinner.getPinStatus(cid);
console.log("Pin status:", pin.status);
console.log("Created:", pin.created);
```

### Check if Pinned

```typescript
const isPinned = await pinner.isPinned(cid);
if (isPinned) {
  console.log("Content is pinned");
}
```

### Update Metadata

```typescript
await pinner.setPinMetadata(cid, {
  name: "Updated Name",
  description: "Updated description"
});
```

### Remove Pin

```typescript
await pinner.unpin(cid);
```

## Operation Polling

Wait for operations to complete with custom polling options:

```typescript
// Poll with default settings
const result = await pinner.waitForOperation(operationId);

// Poll with custom options
const result = await pinner.waitForOperation(operationId, {
  interval: 1000,      // Check every 1 second
  timeout: 60000,      // Timeout after 60 seconds
  settledStates: ["completed", "failed"]
});
```

## Custom Blockstore

Configure a custom storage backend using unstorage:

```typescript
import { Pinner, createBlockstore, setDriverFactory } from "@lumeweb/pinner";
import { createStorage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";

// Create Redis storage
const storage = createStorage({
  driver: redisDriver({
    host: "localhost",
    port: 6379,
    base: "pinner:"
  })
});

// Initialize with custom storage
const pinner = new Pinner({
  jwt: "your-token",
  storage
});
```

### Blockstore Options

```typescript
import { createBlockstore } from "@lumeweb/pinner";

// Auto-configure (browser: IndexedDB, Node.js: filesystem)
const blockstore = createBlockstore();

// Custom driver
const blockstore = createBlockstore({
  driver: localStorageDriver({ base: "my-app:" })
});

// Pre-configured storage
const blockstore = createBlockstore({
  storage: myStorageInstance
});

// Disable auto-configuration (uses memory)
const blockstore = createBlockstore({
  autoConfigure: false
});
```

See [blockstore/README.md](./src/blockstore/README.md) for detailed blockstore documentation.

## Adapters

### Pinata Adapter

The Pinata adapter provides a Pinata SDK-compatible interface for the Pinner client, making it easy to migrate from Pinata SDK with minimal code changes.

#### Setup

```typescript
import { Pinner, pinataAdapter } from "@lumeweb/pinner";

// Initialize Pinner
const pinner = new Pinner({
  jwt: "your-jwt-token"
});

// Create Pinata adapter
const pinata = pinataAdapter(pinner);
```

#### Upload Methods

The Pinata adapter provides multiple upload methods with a fluent builder pattern:

##### Upload a File

```typescript
// Simple file upload
const result = await pinata.upload.file(file).execute();
console.log("CID:", result.IpfsHash);
console.log("Size:", result.PinSize);

// Upload with metadata
const result = await pinata.upload.file(file)
  .name("My File")
  .keyvalues({ key: "value" })
  .execute();
```

##### Upload Multiple Files (Directory)

```typescript
const files = [
  new File(["content1"], "file1.txt"),
  new File(["content2"], "file2.txt")
];

const result = await pinata.upload.fileArray(files)
  .name("My Directory")
  .keyvalues({ type: "directory" })
  .execute();
```

##### Upload JSON Data

```typescript
const data = { foo: "bar", number: 42 };

const result = await pinata.upload.json(data)
  .name("data.json")
  .keyvalues({ format: "json" })
  .execute();
```

##### Upload Base64 String

```typescript
const base64String = "SGVsbG8sIHdvcmxkIQ==";

const result = await pinata.upload.base64(base64String)
  .name("base64-file.txt")
  .execute();
```

##### Upload from URL

```typescript
const result = await pinata.upload.url("https://example.com/data.json")
  .name("downloaded-file.json")
  .execute();
```

##### Pin by CID

```typescript
// Pin existing content
await pinata.upload.cid("Qm...").execute();

// Pin with metadata
await pinata.upload.cid("Qm...")
  .name("Existing Content")
  .keyvalues({ source: "external" })
  .execute();
```

#### Pin Management

##### Pin by Hash

```typescript
await pinata.pinByHash("Qm...", {
  name: "My Pin",
  keyvalues: { key: "value" }
});
```

##### Unpin Content

```typescript
await pinata.unpin("Qm...");
```

##### Get Pin Status

```typescript
const pin = await pinata.getPinStatus("Qm...");
console.log("Pin ID:", pin.id);
console.log("IPFS Hash:", pin.ipfsPinHash);
console.log("Size:", pin.size);
console.log("Date Pinned:", pin.datePinned);
console.log("Metadata:", pin.metadata);
```

##### Check if Pinned

```typescript
const isPinned = await pinata.isPinned("Qm...");
if (isPinned) {
  console.log("Content is pinned");
}
```

##### Update Pin Metadata

```typescript
await pinata.setPinMetadata("Qm...", {
  name: "Updated Name",
  key: "value"
});
```

#### Files Management

##### List Files

```typescript
// List all files
const files = await pinata.files.list().execute();

// List with pagination
const files = await pinata.files.list()
  .limit(10)
  .pageToken("next-page-token")
  .execute();

files.forEach(file => {
  console.log("ID:", file.id);
  console.log("CID:", file.cid);
  console.log("Size:", file.size);
  console.log("Name:", file.name);
  console.log("Created:", file.createdAt);
});
```

##### Get File by ID

```typescript
const file = await pinata.files.get("Qm...");
console.log("File details:", file);
```

#### Pinata SDK Compatibility

The adapter follows the Pinata SDK's API conventions, making migration straightforward:

**Pinata SDK:**
```typescript
import pinataSDK from '@pinata/sdk';
const pinata = pinataSDK('apiKey', 'apiSecret');

const result = await pinata.pinFileToIPFS(file, {
  pinataMetadata: { name: 'My File' },
  pinataOptions: { cidVersion: 1 }
});
```

**Pinner with Pinata Adapter:**
```typescript
import { Pinner, pinataAdapter } from '@lumeweb/pinner';

const pinner = new Pinner({ jwt: 'your-jwt-token' });
const pinata = pinataAdapter(pinner);

const result = await pinata.upload.file(file)
  .name('My File')
  .execute();
```

#### Result Format

Upload operations return a `PinataUploadResult`:

```typescript
interface PinataUploadResult {
  IpfsHash: string;        // IPFS CID
  PinSize: number;         // Size in bytes
  Timestamp: string;       // ISO timestamp
  isDuplicate: boolean;    // Whether content was already pinned
}
```

#### Error Handling

The adapter provides specific errors:

```typescript
import { PinataAdapterError } from "@lumeweb/pinner/adapters/pinata";

try {
  const result = await pinata.upload.file(file).execute();
} catch (error) {
  if (error instanceof PinataAdapterError) {
    switch (error.code) {
      case "UPLOAD_FAILED":
        console.error("Upload failed:", error.message);
        break;
      case "EMPTY_FILE_ARRAY":
        console.error("Cannot upload empty file array");
        break;
      case "INVALID_CID":
        console.error("Invalid CID:", error.message);
        break;
    }
  }
}
```

## Encoders

The library provides several encoders for different data formats:

```typescript
// JSON encoder
const operation = await pinner.upload.json({ data: "value" });

// CSV encoder
const operation = await pinner.upload.csv([
  { column1: "value1", column2: "value2" }
]);

// Text encoder
const operation = await pinner.upload.text("Plain text content");

// Base64 encoder
const operation = await pinner.upload.base64("SGVsbG8sIHdvcmxkIQ==");

// URL encoder
const operation = await pinner.upload.url("https://example.com/data");
```

## Error Handling

The library provides specific error types:

```typescript
import {
  PinnerError,
  ConfigurationError,
  AuthenticationError,
  UploadError,
  NetworkError,
  ValidationError,
  EmptyFileError,
  TimeoutError,
  PinError,
  NotFoundError,
  RateLimitError
} from "@lumeweb/pinner";

try {
  const result = await pinner.uploadAndWait(file);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Authentication failed:", error.message);
  } else if (error instanceof NetworkError) {
    console.error("Network error:", error.message);
  } else if (error instanceof ValidationError) {
    console.error("Validation error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

### Type Guards

```typescript
import { isRetryable, isAuthenticationError } from "@lumeweb/pinner";

if (isRetryable(error)) {
  // Retry the operation
}

if (isAuthenticationError(error)) {
  // Re-authenticate
}
```

## Stream Utilities

```typescript
import {
  streamToBlob,
  calculateStreamSize,
  asyncGeneratorToReadableStream,
  readableStreamToAsyncIterable
} from "@lumeweb/pinner";

// Convert stream to blob
const blob = await streamToBlob(stream);

// Calculate stream size
const size = await calculateStreamSize(stream);

// Convert async generator to readable stream
const readableStream = asyncGeneratorToReadableStream(asyncGenerator);

// Convert readable stream to async iterable
const asyncIterable = readableStreamToAsyncIterable(readableStream);
```

## Testing

The library includes comprehensive tests:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm coverage

# Run specific test project
vitest run --project node-upload-unit
vitest run --project browser-upload-integration
```

### Test Structure

- **Unit Tests**: Test individual components with mocks
- **Integration Tests**: Test real-world scenarios without mocks
- **Browser Tests**: Run tests in Chromium using Playwright
- **Node Tests**: Run tests in Node.js environment

## Build

```bash
# Build the library
pnpm build

# Type checking
pnpm lint
```

The library outputs:
- ESM: `dist/esm/`
- CJS: `dist/cjs/`
- Type definitions: `dist/esm/*.d.ts`

## Package Exports

```typescript
// Main exports
import { Pinner } from "@lumeweb/pinner";

// Upload types and utilities
import {
  UploadManager,
  UploadResult,
  UploadOptions,
  UploadProgress
} from "@lumeweb/pinner";

// Pin types
import type {
  RemotePins,
  RemotePin,
  RemoteAddOptions,
  RemoteLsOptions
} from "@lumeweb/pinner";

// Blockstore
import {
  createBlockstore,
  createDatastore,
  setDriverFactory
} from "@lumeweb/pinner";

// Adapters
import { pinataAdapter } from "@lumeweb/pinner/adapters/pinata";

// Blockstore module
import { UnstorageBlockstore } from "@lumeweb/pinner/blockstore";
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure all tests pass and follow the existing code style.


