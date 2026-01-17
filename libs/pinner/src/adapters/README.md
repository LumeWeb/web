``# Pinata Adapters

This directory contains Pinata SDK API compatibility adapters for the Lume Pinner SDK. These adapters allow applications written for the Pinata SDK to work with Lume's IPFS pinning infrastructure without code changes.

## Attribution

**Copyright © 2024 Pinata Cloud Technologies**

This adapter includes TypeScript type definitions and API interfaces adapted from the Pinata SDK for compatibility purposes. The original Pinata SDK is available at:

- **Pinata SDK 2.x**: https://github.com/PinataCloud/pinata/commit/cdc0c06116aaadaf7c4b287a2673cd23b6ba1125
- **Pinata SDK 1.x**: https://github.com/PinataCloud/pinata/commit/c141177ff3036e46fa7b95fcc68c159b58817836

These specific commits reference the exact versions from which the type definitions and API interfaces were adapted for compatibility purposes.

The type definitions and interface structures are based on Pinata's public API specifications to ensure drop-in compatibility for existing applications.

**Important Distinction**: These adapters provide Pinata SDK API compatibility but route all operations through Lume's IPFS pinning infrastructure. They do NOT use Pinata's servers or services. The adapter implementations are original work by Lume.

## Overview

The adapters provide Pinata SDK API compatibility for applications that need to work with Lume's IPFS pinning infrastructure:

- **V2 Adapter (`v2/`)**: Compatible with Pinata SDK 2.x API (latest)
- **Legacy Adapter (`legacy/`)**: Compatible with Pinata SDK 1.x API

**How It Works**: These adapters implement the Pinata SDK's public API surface, but internally route all operations to the Lume Pinner SDK. This allows existing applications written for the Pinata SDK to migrate to Lume's pinning infrastructure with minimal code changes.

**What Gets Routed**:
- Upload operations → Lume Pinner's upload methods
- Pin operations → Lume Pinner's pinning service
- List operations → Lume Pinner's listing service
- Delete operations → Lume Pinner's removal service
- Metadata operations → Lume Pinner's metadata management

**What Doesn't Get Routed**:
- Pinata's gateways (gateway URLs can be configured separately)
- Pinata's analytics (returns empty data)
- Pinata's private operations (not supported, throws errors)
- Pinata's groups/swaps (not supported by Lume Pinner)

## Installation

```typescript
import { Pinner } from "@lumeweb/pinner";
import { pinataAdapter, pinataLegacyAdapter } from "@lumeweb/pinner/adapters/pinata";

// Configure Lume Pinner with your credentials
const pinner = new Pinner({
  jwt: "your-jwt-token",
  endpoint: "https://your-pinning-service-endpoint.com",
});

// Create a Pinata-compatible adapter that routes to your Lume Pinner
const pinata = pinataAdapter(pinner);

// Or use the legacy adapter
const pinataLegacy = pinataLegacyAdapter(pinner);
```

**Important**: These adapters provide Pinata SDK API compatibility but route all operations to your configured Lume Pinner instance. They do NOT use Pinata's servers or gateways.

## V2 Adapter (Recommended)

The v2 adapter provides full compatibility with Pinata SDK 2.x, including:

- **Public/Private Separation**: Separate namespaces for public and private operations
- **Builder Pattern**: Chainable builders for uploads and queries
- **Async Iteration**: Support for async iteration over results
- **Complete API Coverage**: All Pinata 2.x features (where supported by Pinner)

### Structure

```typescript
import { pinataAdapter } from "@lumeweb/pinner/adapters/pinata";

const pinata = pinataAdapter(pinner);

// Upload
const result = await pinata.upload.public.file(file)
  .name("My File")
  .keyvalues({ type: "test" })
  .execute();

// Files
const files = await pinata.files.public.list()
  .limit(10)
  .all();

// Gateways
const gateway = pinata.gateways.public.get("QmHash");

// Analytics
const analytics = await pinata.analytics.requests({ ... });
```

### Namespaces

#### Upload

- `upload.public.file(file, options)` - Upload a file
- `upload.public.fileArray(files, options)` - Upload multiple files
- `upload.public.base64(base64String, options)` - Upload base64 data
- `upload.public.json(data, options)` - Upload JSON data
- `upload.public.cid(cid, options)` - Pin by CID
- `upload.public.createSignedURL(options)` - Create signed upload URL

#### Files

- `files.public.list()` - List files with filtering
- `files.public.get(id)` - Get file details
- `files.public.delete(files)` - Delete files
- `files.public.update(options)` - Update file metadata
- `files.public.queue()` - List pin queue
- `files.public.deletePinRequest(requestId)` - Delete by request ID

#### Gateways

- `gateways.public.get(cid)` - Returns gateway URL for a CID (uses configured gateway)
- `gateways.public.convert(url)` - Converts IPFS URL to gateway URL
- `gateways.private.createAccessLink(options)` - Returns gateway URL (not a true signed URL)

#### Groups

- `groups.public.create(options)` - Create a group
- `groups.public.list()` - List groups
- `groups.public.addFiles(options)` - Add files to group
- `groups.public.removeFiles(options)` - Remove files from group

#### Analytics

- `analytics.requests(query)` - Get top usage analytics
- `analytics.bandwidth(query)` - Get bandwidth analytics

### Builder Pattern

The v2 adapter uses a builder pattern for uploads and queries:

```typescript
// Upload with builder
const result = await pinata.upload.public.file(file)
  .name("custom-name")
  .keyvalues({ type: "document", category: "important" })
  .execute();

// Filter files with builder
const files = await pinata.files.public.list()
  .name("test")
  .limit(10)
  .order("DESC")
  .all();

// Or use async iteration
for await (const file of pinata.files.public.list()) {
  console.log(file.name);
}
```

## Legacy Adapter (1.x)

The legacy adapter provides compatibility with Pinata SDK 1.x, using direct method calls instead of builders.

### Structure

```typescript
import { pinataLegacyAdapter } from "@lumeweb/pinner/adapters/pinata";

const pinata = pinataLegacyAdapter(pinner);

// Upload
const result = await pinata.pinFileToIPFS(file, options);
const jsonResult = await pinata.pinJSONToIPFS(data, options);
const cidResult = await pinata.pinByHash(cid, options);

// Files
const files = await pinata.pinList({ limit: 10 });
await pinata.unpin(cid);
await pinata.hashMetadata(cid, metadata);

// Analytics
const analytics = await pinata.topUsageAnalytics({ ... });
```

### Methods

- `pinFileToIPFS(file, options)` - Upload a file
- `pinJSONToIPFS(data, options)` - Upload JSON data
- `pinByHash(cid, options)` - Pin by CID
- `pinList(query)` - List pinned files
- `unpin(cid)` - Unpin content
- `hashMetadata(cid, metadata)` - Update metadata
- `createSignedURL(options)` - Returns gateway URL (not a true signed URL)
- `pinJobs(query)` - Get pin jobs
- `topUsageAnalytics(query)` - Get top usage analytics
- `dateIntervalAnalytics(query)` - Get time interval analytics

## Configuration

### Pinner Configuration

The Lume Pinner instance is configured with your pinning service credentials:

```typescript
const pinner = new Pinner({
  jwt: "your-jwt-token",
  endpoint: "https://your-pinning-service-endpoint.com",
});
```

All pinning operations (upload, pin, list, delete) are routed through this configured endpoint.

### Adapter Configuration

The adapters accept optional configuration for compatibility with Pinata SDK methods that expect gateway URLs:

```typescript
const config = {
  pinataGateway: "https://your-gateway-endpoint.com",
  pinataGatewayKey: "your-gateway-key",
  customHeaders: { "X-Custom-Header": "value" },
};

const pinata = pinataAdapter(pinner, config);
```

**Note**: The adapter config is optional and only used for methods that return gateway URLs (like `createSignedURL`). All actual pinning operations use the Pinner's configured endpoint, not Pinata's services.

## Feature Support

### V2 Adapter

| Feature | Status | Notes |
|---------|--------|-------|
| Public Upload | ✅ Full Support | Routed to Lume Pinner |
| Private Upload | ❌ Not Supported | Throws error |
| Files List | ✅ Full Support | Routed to Lume Pinner |
| Files Get/Delete/Update | ✅ Full Support | Routed to Lume Pinner |
| Pin Queue | ✅ Full Support | Routed to Lume Pinner |
| Gateways | ⚠️ Partial | Returns configured gateway URL only |
| Access Links | ⚠️ Partial | Returns gateway URL (not signed) |
| Groups | ❌ Not Supported | Pinner doesn't support groups |
| Swaps | ❌ Not Supported | Throws error |
| Analytics | ❌ Not Supported | Returns empty (Pinner doesn't support) |

### Legacy Adapter

| Feature | Status | Notes |
|---------|--------|-------|
| File Upload | ✅ Full Support | Routed to Lume Pinner |
| JSON Upload | ✅ Full Support | Routed to Lume Pinner |
| Pin by Hash | ✅ Full Support | Routed to Lume Pinner |
| Pin List | ✅ Full Support | Routed to Lume Pinner |
| Unpin | ✅ Full Support | Routed to Lume Pinner |
| Metadata | ✅ Full Support | Routed to Lume Pinner |
| Signed URLs | ⚠️ Partial | Returns gateway URL (not signed) |
| Analytics | ❌ Not Supported | Returns empty data |
| Swaps | ❌ Not Supported | Throws error |

## Migration Guide

### From Pinata SDK to Lume Pinner with Adapter

These adapters allow you to migrate applications written for the Pinata SDK to use Lume's IPFS pinning infrastructure with minimal code changes.

#### From Pinata SDK 1.x to Legacy Adapter

```typescript
// Original Pinata SDK 1.x (uses Pinata's servers)
import { PinataSDK } from "pinata";
const pinata = new PinataSDK({ pinataJWT: "token" });
const result = await pinata.pinFileToIPFS(file);

// Migrated to Lume Pinner with Legacy Adapter (uses your pinning service)
import { Pinner } from "@lumeweb/pinner";
import { pinataLegacyAdapter } from "@lumeweb/pinner/adapters/pinata";
const pinner = new Pinner({ jwt: "token", endpoint: "https://your-endpoint.com" });
const pinata = pinataLegacyAdapter(pinner);
const result = await pinata.pinFileToIPFS(file); // Same API, different backend
```

#### From Pinata SDK 2.x to V2 Adapter

```typescript
// Original Pinata SDK 2.x (uses Pinata's servers)
import { PinataSDK } from "pinata";
const pinata = new PinataSDK({ pinataJWT: "token" });
const result = await pinata.upload.public.file(file).execute();

// Migrated to Lume Pinner with V2 Adapter (uses your pinning service)
import { Pinner } from "@lumeweb/pinner";
import { pinataAdapter } from "@lumeweb/pinner/adapters/pinata";
const pinner = new Pinner({ jwt: "token", endpoint: "https://your-endpoint.com" });
const pinata = pinataAdapter(pinner);
const result = await pinata.upload.public.file(file).execute(); // Same API, different backend
```

**Key Changes**:
- Replace `PinataSDK` with `Pinner` configured to your endpoint
- Wrap with `pinataAdapter()` or `pinataLegacyAdapter()`
- All API calls remain the same - no code changes needed in application logic
- Operations now route through your Lume Pinner instead of Pinata's servers

## Shared Types

The `shared/` directory contains type definitions and utilities shared between both adapters:

- `types.ts` - Shared TypeScript types
- `utils.ts` - Helper functions for data transformation

## Testing

Both adapters have comprehensive test coverage:

```bash
# Run all Pinata adapter tests
npm test -- src/adapters/pinata

# Run v2 adapter tests
npm test -- src/adapters/pinata/v2/__tests__

# Run legacy adapter tests
npm test -- src/adapters/pinata/legacy/__tests__
```

## License

This adapter is part of the Lume project. The type definitions and interface structures are based on Pinata's public API and are used here for compatibility purposes.

Original Pinata SDK: https://github.com/PinataCloud/pinata

## Support

For issues specific to the Lume Pinner SDK, please open an issue on the Lume repository.

For issues specific to Pinata's API or services, please visit:
- Pinata Documentation: https://docs.pinata.cloud
- Pinata GitHub: https://github.com/PinataCloud/pinata
- Pinata Support: support@pinata.cloud
