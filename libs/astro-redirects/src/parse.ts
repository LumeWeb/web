import type { RedirectRule } from "./types.js";

const MAX_FILE_SIZE_BYTES = 65536; // 64 KiB per IPFS spec

/**
 * Check if a status code is valid per the IPFS spec.
 */
export function isValidStatus(status: number): boolean {
  return new Set([200, 301, 302, 303, 307, 308, 404, 410, 451]).has(status);
}

/**
 * Check if a status code is supported by Astro's redirect config.
 */
export function isAstroSupportedStatus(status: number): boolean {
  return new Set([301, 302, 303, 307, 308]).has(status);
}

/**
 * Parse a _redirects file (Netlify / IPFS format).
 *
 * Each non-empty, non-comment line must match:
 *   from to [status]
 *
 * @param input - Raw file content.
 * @returns Parsed redirect rules.
 */
export function parseRedirects(input: string): RedirectRule[] {
  const byteLength = new TextEncoder().encode(input).length;
  if (byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Redirects file size cannot exceed ${MAX_FILE_SIZE_BYTES} bytes (got ${byteLength})`
    );
  }

  const rules: RedirectRule[] = [];
  const lines = input.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "" || line.startsWith("#")) {
      continue;
    }

    const fields = line.split(/\s+/);

    if (fields.length < 2) {
      throw new Error(`Missing 'to' path in line: ${line}`);
    }
    if (fields.length > 3) {
      throw new Error(
        `Too many fields, expected 'from to [status]' in line: ${line}`
      );
    }

    const from = parseFrom(fields[0]);
    const to = parseTo(fields[1]);
    const status = fields[2] ? parseStatus(fields[2]) : 301;

    rules.push({ from, to, status });
  }

  return rules;
}

export function parseFrom(value: string): string {
  const splats = value.split("*").length - 1;
  if (splats > 0) {
    if (splats > 1) {
      throw new Error(`Path can have at most one asterisk: ${value}`);
    }
    if (!value.endsWith("*")) {
      throw new Error(`Path with splat must end with asterisk: ${value}`);
    }
  }

  if (!value.startsWith("/")) {
    throw new Error(`Path must begin with '/': ${value}`);
  }

  return value;
}

export function parseTo(value: string): string {
  if (value.startsWith("/")) {
    return value;
  }

  // Allow absolute URLs with safelisted schemes (per IPFS spec)
  const url = new URL(value);
  const allowed = new Set(["http", "https", "ipfs", "ipns"]);
  if (!allowed.has(url.protocol.slice(0, -1))) {
    throw new Error(`Invalid URL scheme in 'to': ${value}`);
  }

  return value;
}

export function parseStatus(value: string): number {
  if (value.endsWith("!")) {
    throw new Error(
      `Forced redirects (shadowing) are not supported: ${value}`
    );
  }

  const code = Number(value);
  if (!Number.isInteger(code) || !isValidStatus(code)) {
    throw new Error(`Unsupported status code: ${value}`);
  }

  return code;
}
