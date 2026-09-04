// NOTE: Build-time generator for
// libs/portal-framework-auth/src/ui/generated/social-providers.generated.ts
//
// Fetches GET /api/meta from the portal server, extracts (defensively) the
// dashboard plugin's `social_providers` list, unions it with a small built-in
// default list, and emits a deterministic, sorted provider map consumable by
// src/ui/components/common/SocialProviders.tsx.
//
// Contract:
// - Fetch failures, timeouts and malformed payloads never fail the build —
//   they fall back to the built-in defaults.
// - Output is written only when its bytes change (idempotent, keeps turbo
//   caches stable).
// - The emitted module is gitignored and regenerated on every build.
//
// Usage: node scripts/sync-social-providers.ts  (env: PORTAL_SERVER=<host>)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Mirror of DEFAULT_PORTAL_DOMAIN from
 * libs/portal-framework-core/src/vite/types.ts — keep in sync. */
const DEFAULT_PORTAL_DOMAIN = "default.lumeweb.com";

/** Providers always advertised even when /api/meta says (or fetch yields) nothing. */
const DEFAULT_PROVIDER_IDS = [
  "google",
  "github",
  "apple",
  "discord",
  "microsoft",
  "microsoftonline",
];

const FETCH_TIMEOUT_MS = 5_000;

/** Icon base-name overrides where the react-icons name diverges from the slug. */
const ICON_ALIASES: Record<string, string[]> = {
  battlenet: ["Battlenet", "BattleNet"],
  gplus: ["GooglePlus"],
  microsoftonline: ["Microsoft"],
  "openid-connect": ["Openid"],
  twitterv2: ["X", "Twitter"],
};

/** Human display-name overrides for slugs that humanize badly. */
const NAME_ALIASES: Record<string, string> = {
  microsoftonline: "Microsoft",
  "openid-connect": "OpenID",
  twitterv2: "X",
};

const LIB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = resolve(
  LIB_ROOT,
  "src/ui/generated/social-providers.generated.ts",
);

type IconImportSource = "react-icons/fa" | "react-icons/si";

/** Anything whose member export is an icon component, looked up by name. */
type IconModule = Record<string, unknown>;

interface IconModules {
  fa: IconModule | undefined;
  si: IconModule | undefined;
}

/** Locally-declared mirror of the relevant shape of the portal /api/meta payload. */
interface PortalMetaResponse {
  plugins?: { dashboard?: { meta?: { social_providers?: unknown } } };
}

/** Static brand facts for known provider ids: display name + hex color. */
interface ProviderMeta {
  bgColor: string;
  name: string;
}

interface ResolvedIcon {
  importFrom: IconImportSource;
  symbol: string;
}

/**
 * Static brand facts for known provider ids: display name + tailwind bg class.
 * Everything not present here is humanized from the slug with a neutral bg.
 */
const PROVIDER_DATA: Record<string, ProviderMeta> = {
  amazon: { bgColor: "#FF9900", name: "Amazon" },
  apple: { bgColor: "#000000", name: "Apple" },
  auth0: { bgColor: "#EB5424", name: "Auth0" },
  battlenet: { bgColor: "#148EFF", name: "Battle.net" },
  bitbucket: { bgColor: "#0052CC", name: "Bitbucket" },
  box: { bgColor: "#0061D5", name: "Box" },
  dailymotion: { bgColor: "#00AAFF", name: "Dailymotion" },
  deezer: { bgColor: "#FEAA2D", name: "Deezer" },
  digitalocean: { bgColor: "#0080FF", name: "DigitalOcean" },
  discord: { bgColor: "#5865F2", name: "Discord" },
  dropbox: { bgColor: "#0061FF", name: "Dropbox" },
  eveonline: { bgColor: "#1A1A1A", name: "Eve Online" },
  facebook: { bgColor: "#1877F2", name: "Facebook" },
  fitbit: { bgColor: "#00B0B9", name: "Fitbit" },
  gitea: { bgColor: "#609926", name: "Gitea" },
  github: { bgColor: "#181717", name: "GitHub" },
  gitlab: { bgColor: "#FC6D26", name: "Gitlab" },
  google: { bgColor: "#4285F4", name: "Google" },
  gplus: { bgColor: "#DB4437", name: "Google Plus" },
  heroku: { bgColor: "#430098", name: "Heroku" },
  instagram: { bgColor: "#E4405F", name: "Instagram" },
  intercom: { bgColor: "#0335FF", name: "Intercom" },
  kakao: { bgColor: "#FEE500", name: "Kakao" },
  lastfm: { bgColor: "#D51007", name: "Last FM" },
  line: { bgColor: "#00C300", name: "LINE" },
  linkedin: { bgColor: "#0A66C2", name: "LinkedIn" },
  mastodon: { bgColor: "#6364FF", name: "Mastodon" },
  meetup: { bgColor: "#ED1C40", name: "Meetup.com" },
  microsoft: { bgColor: "#00A4EF", name: "Microsoft" },
  microsoftonline: { bgColor: "#00A4EF", name: "Microsoft" },
  naver: { bgColor: "#03C75A", name: "Naver" },
  nextcloud: { bgColor: "#0082C9", name: "NextCloud" },
  okta: { bgColor: "#007DC1", name: "Okta" },
  "openid-connect": { bgColor: "#F78C40", name: "OpenID" },
  patreon: { bgColor: "#FF424D", name: "Patreon" },
  paypal: { bgColor: "#00457C", name: "Paypal" },
  salesforce: { bgColor: "#00A1E0", name: "Salesforce" },
  seatalk: { bgColor: "#6B7280", name: "SeaTalk" },
  shopify: { bgColor: "#96BF48", name: "Shopify" },
  slack: { bgColor: "#4A154B", name: "Slack" },
  soundcloud: { bgColor: "#FF3300", name: "SoundCloud" },
  spotify: { bgColor: "#1DB954", name: "Spotify" },
  steam: { bgColor: "#000000", name: "Steam" },
  strava: { bgColor: "#FC4C02", name: "Strava" },
  stripe: { bgColor: "#008CDD", name: "Stripe" },
  tiktok: { bgColor: "#000000", name: "TikTok" },
  twitch: { bgColor: "#9146FF", name: "Twitch" },
  twitter: { bgColor: "#1DA1F2", name: "Twitter" },
  twitterv2: { bgColor: "#1DA1F2", name: "X" },
  typetalk: { bgColor: "#2A5BAC", name: "Typetalk" },
  uber: { bgColor: "#000000", name: "Uber" },
  vk: { bgColor: "#4A76A8", name: "VK" },
  wecom: { bgColor: "#7BB32E", name: "WeCom" },
  wepay: { bgColor: "#0077A6", name: "Wepay" },
  xero: { bgColor: "#13B5EA", name: "Xero" },
  yahoo: { bgColor: "#6001D2", name: "Yahoo" },
  yammer: { bgColor: "#0072C6", name: "Yammer" },
  yandex: { bgColor: "#FF0000", name: "Yandex" },
  zoom: { bgColor: "#2D8CFF", name: "Zoom" },
};

function buildSource(providerIds: string[], modules: IconModules): string {
  const imports: Record<string, Set<string>> = {
    "react-icons/fa": new Set(),
    "react-icons/si": new Set(),
  };
  const entries: string[] = [];
  const usedAliases = new Set<string>();

  for (const id of providerIds) {
    const meta = PROVIDER_DATA[id];
    const name = meta?.name ?? NAME_ALIASES[id] ?? humanize(id);
    const bgColor = meta?.bgColor ?? "#6B7280";
    const icon = resolveIcon(id, modules);
    let iconRef = "undefined";
    if (icon) {
      let alias = `${identifier(id)}Icon`;
      while (usedAliases.has(alias)) alias = `_${alias}`;
      usedAliases.add(alias);
      imports[icon.importFrom].add(`${icon.symbol} as ${alias}`);
      iconRef = alias;
    }
    const iconPart = icon ? ` icon: ${iconRef},` : "";
    entries.push(
      `  [${JSON.stringify(id)}, { bgColor: "bg-[${bgColor}]",${iconPart} name: ${JSON.stringify(name)} }],`,
    );
  }

  const importLines = Object.entries(imports)
    .filter(([_, symbols]) => symbols.size > 0)
    .map(
      ([source, symbols]) =>
        `import { ${[...symbols].sort().join(", ")} } from "${source}";`,
    );

  return `// GENERATED by scripts/sync-social-providers.ts — DO NOT EDIT. Regenerated on every build. Not committed.
import type { ComponentType, SVGAttributes } from "react";

${importLines.sort().join("\n")}

type IconComponent = ComponentType<SVGAttributes<SVGElement>>;

export interface SocialLoginProvider {
  bgColor: string;
  icon?: IconComponent;
  name: string;
}

export const socialLoginProviders: Map<string, SocialLoginProvider> = new Map([
${entries.join("\n")}
]);

export default socialLoginProviders;
`;
}

/** Fetch /api/meta, defensively extracting the social_providers string list. */
async function fetchMetaProviders(domain: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(`https://${domain}/api/meta`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        console.warn(
          `[sync-social-providers] /api/meta on ${domain} responded ${response.status}; using defaults.`,
        );
        return [];
      }
      const body = (await response.json()) as null | PortalMetaResponse;
      const providers = body?.plugins?.dashboard?.meta?.social_providers;
      if (!Array.isArray(providers)) {
        console.warn(
          "[sync-social-providers] plugins.dashboard.meta.social_providers missing or not an array; using defaults.",
        );
        return [];
      }
      return providers.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      );
    } finally {
      clearTimeout(timer);
    }
  } catch (error: unknown) {
    console.warn(
      `[sync-social-providers] fetch failed (${error instanceof Error ? error.message : String(error)}); using defaults.`,
    );
    return [];
  }
}

function humanize(slug: string): string {
  return slug
    .split(/[-_.]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Preferred-first icon candidate base names for a provider id. */
function iconCandidates(id: string): string[] {
  const candidates = [pascal(id)];
  for (const alias of ICON_ALIASES[id] ?? []) {
    if (!candidates.includes(alias)) candidates.push(alias);
  }
  const firstPart = pascal(id.split(/[-_.]/)[0] ?? "");
  if (firstPart && !candidates.includes(firstPart)) candidates.push(firstPart);
  return [...new Set(candidates)];
}

/** Safe TS identifier from a provider slug (may contain dashes, digits…). */
function identifier(slug: string): string {
  const safe = slug.replace(/[^a-zA-Z0-9_$]/g, "_");
  return /^[0-9]/.test(safe) ? `_${safe}` : safe;
}

async function loadIconModules(): Promise<IconModules> {
  const modules: IconModules = { fa: undefined, si: undefined };
  for (const key of ["fa", "si"] as const) {
    try {
      if (key === "fa") {
        modules.fa = (await import("react-icons/fa")) as unknown as IconModule;
      } else {
        modules.si = (await import("react-icons/si")) as unknown as IconModule;
      }
    } catch {
      // Icon package unavailable in this environment; fall back to no icons.
    }
  }
  return modules;
}

async function main(): Promise<void> {
  const envHost = (process.env.PORTAL_SERVER ?? "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
  const domain = envHost || DEFAULT_PORTAL_DOMAIN;

  const metaProviders = await fetchMetaProviders(domain);
  const merged = [...new Set([...metaProviders, ...DEFAULT_PROVIDER_IDS])]
    .filter((id) => typeof id === "string")
    .sort((a, b) => a.localeCompare(b));

  const modules = await loadIconModules();
  const source = buildSource(merged, modules);

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  if (existsSync(OUT_FILE)) {
    if (readFileSync(OUT_FILE, "utf8") === source) {
      console.log(
        "[sync-social-providers] social-providers.generated.ts unchanged; write skipped.",
      );
      return;
    }
  }
  writeFileSync(OUT_FILE, source, "utf8");
  console.log(
    `[sync-social-providers] emitted ${OUT_FILE} (${merged.length} providers: ${merged.join(", ")})`,
  );
}

function pascal(slug: string): string {
  return slug
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function resolveIcon(id: string, modules: IconModules): ResolvedIcon | undefined {
  const candidates = iconCandidates(id);
  // Prefer simple-icons, fall back to Font Awesome only for ids simple-icons lacks.
  for (const base of candidates) {
    const symbol = `Si${base}`;
    if (modules.si?.[symbol]) {
      return { importFrom: "react-icons/si", symbol };
    }
  }
  for (const base of candidates) {
    const symbol = `Fa${base}`;
    if (modules.fa?.[symbol]) {
      return { importFrom: "react-icons/fa", symbol };
    }
  }
  return undefined;
}

await main();
