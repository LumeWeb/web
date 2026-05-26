# `@lumeweb/portal-plugin-quota`

Dashboard widget plugin that displays storage, upload, and download quota usage as Tailwind progress bars.

## What It Does

Registers a `QuotaWidget` in the `dashboard:header` area showing three usage bars:

- **Storage** — bytes used vs limit
- **Upload** — bytes used vs limit
- **Download** — bytes used vs limit

Each bar changes color based on utilization: default under 70%, warning (yellow) at 70–90%, destructive (red) above 90%. When a quota type has no limit, "Unlimited" is displayed instead of a bar.

Data is fetched through Refine's `useCustom` hook hitting the `/account/quota` endpoint via the `account` data provider.

## Dependencies

- `core:dashboard` — provides the `dashboard:header` widget area and API URL

## SDK

Convenience wrappers are available in `@lumeweb/portal-sdk`:

```ts
import { AccountApi } from "@lumeweb/portal-sdk";

const api = new AccountApi(baseUrl);
const status = await api.quota();        // QuotaStatusResponse
const history = await api.quotaHistory(); // QuotaHistoryResponse
```

### MSW Mocks

Mock handlers for testing are exported from the dedicated subpath:

```ts
import { getGetApiAccountQuotaMockHandler } from "@lumeweb/portal-sdk/mocks";
```
