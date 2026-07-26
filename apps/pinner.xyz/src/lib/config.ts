/**
 * Astro PUBLIC_ env vars are safe for client-side code.
 * Pass values as props from .astro pages to React islands
 * to avoid hydration mismatches.
 */
const portalApiUrl =
  import.meta.env.PUBLIC_PORTAL_API_URL || "https://account.pinner.xyz";

const portalHost = new URL(portalApiUrl).hostname;
const portalDomain = portalHost.split(".").length > 2
  ? portalHost.split(".").slice(1).join(".")
  : portalHost;

const accountBaseUrl = portalApiUrl;

type RegisterIntent = "pinning" | "hosting" | "storing";

function registerUrl(intent?: RegisterIntent): string {
  const base = `${accountBaseUrl}/register`;
  return intent ? `${base}?intent=${intent}` : base;
}

export const config = {
  portalApiUrl,
  accountBaseUrl,
  registerUrl,
  listmonkUrl:
    import.meta.env.PUBLIC_LISTMONK_URL || `https://list.${portalDomain}`,
  listmonkListUuid:
    import.meta.env.PUBLIC_LISTMONK_LIST_UUID ?? "",
} as const;

export const ctaCopy = {
  hosting: {
    heading: "Static hosting on open standards, with data permanence.",
    subheading: "You control your data. Content-addressed, portable, no platform lock-in. 5 USD/mo, crypto or card.",
  },
  pinning: {
    heading: "Your content stays pinned and available.",
    subheading: "Permanent links, distributed across independent hosts. No single point of failure.",
  },
  s3: {
    heading: "Your endpoint. Your keys. Your data.",
    subheading: "Encrypted by default. Predictable pricing. S3-compatible.",
  },
  privateStorage: {
    heading: "Your data is yours.",
    subheading: "Private storage. Zero-knowledge encryption. Data mining impossible.",
  },
  privateStoragePersonal: {
    heading: "Your data is yours.",
    subheading: "Zero-knowledge encryption. Only you hold the keys.",
  },
  privateStorageDevelopers: {
    heading: "Build on encrypted storage.",
    subheading: "S3-compatible API, revenue sharing, and the Sia SDK.",
  },
  home: {
    heading: "Your data is yours.",
    subheading: "Open source. Open standards. No surprises.",
  },
  about: {
    heading: "Your data is yours.",
    subheading: "Open source. Open standards. No surprises.",
  },
  howItWorks: {
    heading: "Your data on a network, not in a data center.",
    subheading: "One infrastructure for all your storage needs. Crypto or card.",
  },
  partners: {
    heading: "Build on Pinner.",
    subheading: "Revenue sharing, integration support, and custom pricing for Sia and IPFS builders.",
  },
} as const;

export interface Examples {
  /** Example CIDv1 used in terminal output across /host, /pin, and /ens */
  cid: string;
}

export const examples: Examples = {
  cid: "bafybeihm24l4qtkiyuhgxz34vgok77s253ogaadktuvm7ywidknwptsokq",
};

export type OS = "mac" | "linux" | "windows";

export interface CliInstallCommands {
  mac: string;
  linux: string;
  windows: string;
}

export interface CliInstall {
  installUrl: string;
  commands: CliInstallCommands;
}

/** CLI install commands shown in the hero terminal */
export const cliInstall: CliInstall = {
  installUrl: "https://get.pinner.xyz",
  commands: {
    mac: "curl -fsSL https://get.pinner.xyz | sh",
    linux: "curl -fsSL https://get.pinner.xyz | sh",
    windows: "irm https://get.pinner.xyz | iex",
  },
};
