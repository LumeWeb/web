const STORAGE_KEY = "pinner_utm_params";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referring_domain?: string;
}

const UTM_KEYS: (keyof UTMParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

export function captureUTMsFromURL(): UTMParams | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }

  if (Object.keys(utm).length === 0) return null;

  const referrer = document.referrer;
  if (referrer) {
    try {
      const hostname = new URL(referrer).hostname;
      if (hostname && hostname !== window.location.hostname) {
        utm.referring_domain = hostname;
      }
    } catch {}
  }

  return utm;
}

export function saveUTMParams(params: UTMParams): void {
  if (typeof window === "undefined") return;

  const existing = loadUTMParams();
  const merged: UTMParams = { ...existing, ...params };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function loadUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function appendUTMsToURL(url: string): string {
  const utms = loadUTMParams();
  if (Object.keys(utms).length === 0) return url;

  try {
    const parsed = new URL(url);

    for (const [key, value] of Object.entries(utms)) {
      if (value && !parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, value);
      }
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
