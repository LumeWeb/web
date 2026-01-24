# LBRY Portal Plugin

Integrates LBRY protocol support for decentralized content management and streaming within the Lume Web portal framework.

## Features

- LBRY protocol integration for decentralized content
- Device management - create, update, and manage LBRY-connected devices
- Stream management - view and manage content streams with pinning
- File uploads - small file uploads and large file uploads via TUS protocol
- Refine-based data provider for LBRY resources

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm

### Installation

```bash
pnpm install
pnpm dev
```

### Production Build

```bash
pnpm build
```

## Structure

```
libs/portal-plugin-lbry/
├── package.json                    # Plugin metadata and dependencies
├── plugin.config.ts               # Module Federation configuration
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
├── postcss.config.cjs             # PostCSS configuration
├── orval.config.ts                # API client generation config
├── README.md                      # This file
├── src/                           # Source code
│   ├── index.ts                   # Plugin factory function
│   ├── routes.tsx                 # Route definitions
│   ├── types.ts                   # TypeScript types
│   ├── capabilities/              # Plugin capabilities
│   │   ├── lbryProtocol.ts        # LBRY protocol capability
│   │   ├── lbryUpload.ts          # File upload capability
│   │   └── refineConfig.ts        # Refine configuration
│   ├── client/                    # API client
│   │   ├── default.ts             # Default API client
│   │   ├── lBRYStreamAPI.schemas.ts  # Generated schemas
│   │   ├── swagger.yaml           # OpenAPI specification
│   │   └── tus.ts                 # TUS upload client
│   └── ui/                        # UI components
│       ├── components/            # Reusable components
│       │   └── LbryIcon.tsx       # LBRY protocol icon
│       ├── routes/                # Route components
│       │   ├── devices.tsx        # Device management page
│       │   └── streams.tsx        # Stream management page
│       ├── forms/                 # Form components
│       │   ├── createDevice.tsx   # Create device form
│       │   ├── updateDevice.tsx   # Update device form
│       │   └── pinStream.tsx      # Pin stream form
│       ├── dialogs/               # Dialog components
│       │   ├── createDevice.tsx   # Create device dialog
│       │   ├── deleteDevice.tsx   # Delete device dialog
│       │   ├── editDevice.tsx     # Edit device dialog
│       │   ├── pinDialog.tsx      # Pin stream dialog
│       │   └── unpinDialog.tsx    # Unpin stream dialog
│       └── hooks/                 # Custom React hooks
│           └── useLbryPinning.ts  # Pinning management hook
```

## Capabilities

### LBRY Protocol (lbry:protocol)

Protocol-level integration with the LBRY decentralized content platform.

- Registers LBRY as a protocol option in the portal
- Displays the LBRY icon in the interface
- Provides protocol description and metadata

### Upload Capability (lbry:upload)

Handles file uploads to LBRY.

- Small file uploads - direct XHR to /api/streams/upload
- Large file uploads - TUS protocol for resumable uploads to /api/streams/upload/tus

Endpoints are dynamically constructed based on the portal's current URL.

### Refine Configuration (lbry:refine-config)

Refine-based data management.

- Custom data provider for LBRY API
- Resource definitions for lbry/devices and lbry/streams
- Authentication provider synchronization

## Routes

### Devices (/lbry/devices)

Manage LBRY-connected devices.

- List view of all devices
- Create new device dialog
- Edit existing device dialog
- Delete device functionality

### Streams (/lbry/streams)

View and manage LBRY content streams.

- List view of all streams
- Pin/unpin stream functionality
- Stream details and metadata

## API Integration

### Generated Client

Uses orval to generate TypeScript API clients from OpenAPI specification:

```typescript
import { lbryStreamApi } from "./client";

// Fetch streams
const { data: streams } = await lbryStreamApi.getStreams();
```

### TUS Upload

For large file uploads, implements TUS (Tus Resumable Upload Protocol):

```typescript
import { createTusClient } from "./client/tus";

const upload = createTusClient({
  endpoint: "https://lbry.api.example.com/api/streams/upload/tus",
  file: yourFile,
  onProgress: (bytesUploaded, bytesTotal) => {
    const progress = (bytesUploaded / bytesTotal) * 100;
    console.log(`Upload progress: ${progress}%`);
  },
});

await upload.start();
```

## Dependencies

### Runtime

| Package | Purpose |
|---------|---------|
| @lumeweb/advanced-rest-provider | Advanced REST data provider |
| @lumeweb/portal-framework-auth | Authentication utilities |
| @lumeweb/portal-framework-core | Core framework types and utilities |
| @lumeweb/portal-framework-ui | UI component library |
| @lumeweb/portal-framework-ui-core | Core UI components |
| @lumeweb/portal-plugin-dashboard | Dashboard plugin integration |
| @lumeweb/portal-sdk | Portal SDK types and utilities |
| @refinedev/core | React data management framework |
| @refinedev/react-router | React Router integration for Refine |
| @tanstack/react-query | Server state management |
| @tanstack/react-table | Table components |
| @uppy/core | File upload library |
| date-fns | Date formatting utilities |
| lucide-react | Icon library |
| react-hook-form | Form handling |
| react-router | Client-side routing |
| zod | Schema validation |

### Development

| Package | Purpose |
|---------|---------|
| @lumeweb/tsdown-config | TypeScript down configuration |

## Configuration

### Environment Variables

- VITE_PORTAL_DOMAIN_IS_ROOT: Determines if the portal domain is the root domain

### Plugin Registration

```typescript
// src/index.ts
export default function (): Plugin {
  return {
    capabilities: [
      new LbryProtocol(),
      new LbryUpload(),
      new LbryRefineConfig(),
    ],
    capabilityAssociations: [
      {
        associated: ["lbry:upload"],
        primary: "lbry:protocol",
      },
    ],
    id: createNamespacedId("core", "lbry"),
    routes,
  } satisfies Plugin;
}
```

## Development

### Scripts

| Command | Description |
|---------|-------------|
| pnpm dev | Start development server |
| pnpm build | Build plugin bundle |
| pnpm serve | Preview production build |
| pnpm lint | Run ESLint |
| pnpm orval | Regenerate API client from OpenAPI spec |

### Module Federation Exposes

| Expose | Path |
|--------|------|
| . | ./src/index |
| ./streams | ./src/ui/routes/streams |
| ./devices | ./src/ui/routes/devices |

### Port

Development server runs on port 4177.

## License

Part of the Lume Web portal framework.
