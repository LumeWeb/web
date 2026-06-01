/**
 * Astro PUBLIC_ env vars are safe for client-side code.
 * Pass values as props from .astro pages to React islands
 * to avoid hydration mismatches.
 */
const portalApiUrl =
  import.meta.env.PUBLIC_PORTAL_API_URL || "https://pinner.xyz";

const portalDomain = new URL(portalApiUrl).hostname;

export const config = {
  portalApiUrl,
  listmonkUrl:
    import.meta.env.PUBLIC_LISTMONK_URL || `https://list.${portalDomain}`,
  listmonkListUuid:
    import.meta.env.PUBLIC_LISTMONK_LIST_UUID ?? "",
} as const;
