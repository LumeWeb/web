/** Records observation evidence from decoded shared-host responses, not runtime cutoff proof.
 * Transport decoding (including CBOR) belongs to the caller; this module never changes SDK responses.
 * The maximum covers every supplied successful page, including delayed deliveries and refresh races.
 * Callers must observe all pages, drain pending observations, and account for clock uncertainty before waiting.
 */
export interface SharedTokenObservation {
  hosts: { publicKey: string; validUntilMs: number }[];
  kind: "delivered" | "unauthorized";
  requestStartedAtMs: number;
  responseReceivedAtMs: number;
  status: number;
}

export interface SharedTokenResponse {
  body: unknown;
  requestStartedAtMs: number;
  responseReceivedAtMs: number;
  status: number;
  url: string;
}

function publicKey(value: unknown): string {
  if (typeof value !== "string" || !/^ed25519:[0-9a-f]{64}$/.test(value))
    return invalid();
  return value;
}

/** Keeps old delivered expiries because observation order does not establish SDK cache replacement. */
export class SharedTokenObserver {
  private readonly allowedOrigin: string;
  private readonly observations: SharedTokenObservation[] = [];

  constructor(allowedOrigin: string) {
    const url = parseUrl(allowedOrigin);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== allowedOrigin ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      invalid();
    this.allowedOrigin = url.origin;
  }

  observe(input: SharedTokenResponse): SharedTokenObservation {
    const url = parseUrl(input.url);
    if (
      url.origin !== this.allowedOrigin ||
      url.pathname !== "/shared/hosts" ||
      url.username ||
      url.password ||
      url.hash
    )
      invalid();
    clock(input.requestStartedAtMs);
    clock(input.responseReceivedAtMs);
    if (
      input.requestStartedAtMs > input.responseReceivedAtMs ||
      !Number.isInteger(input.status) ||
      (input.status !== 401 && (input.status < 200 || input.status > 299))
    )
      invalid();

    const hosts: SharedTokenObservation["hosts"] = [];
    // A 401 body is not a token delivery, even if it resembles a successful page.
    if (input.status !== 401) {
      if (!Array.isArray(input.body)) return invalid();
      for (const entry of input.body) {
        const host = record(entry),
          token = record(host.token);
        const key = publicKey(host.publicKey);
        if (publicKey(token.hostKey) !== key) invalid();
        hosts.push({ publicKey: key, validUntilMs: expiry(token.validUntil) });
      }
    }
    const observation: SharedTokenObservation = {
      hosts,
      kind: input.status === 401 ? "unauthorized" : "delivered",
      requestStartedAtMs: input.requestStartedAtMs,
      responseReceivedAtMs: input.responseReceivedAtMs,
      status: input.status,
    };
    this.observations.push(observation);
    return copy(observation);
  }

  snapshot(): {
    conservativeMaximumDeliveredExpiryMs: null | number;
    observations: SharedTokenObservation[];
  } {
    let maximum: null | number = null;
    for (const observation of this.observations) {
      for (const host of observation.hosts)
        maximum = Math.max(maximum ?? host.validUntilMs, host.validUntilMs);
    }
    return {
      conservativeMaximumDeliveredExpiryMs: maximum,
      observations: this.observations.map(copy),
    };
  }
}

function clock(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > 8640000000000000)
    invalid();
}

function copy(observation: SharedTokenObservation): SharedTokenObservation {
  return {
    ...observation,
    hosts: observation.hosts.map((host) => ({ ...host })),
  };
}

function expiry(value: unknown): number {
  if (typeof value !== "string") return invalid();
  const parts =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    );
  if (!parts) return invalid();
  const [
    ,
    yearText,
    monthText,
    dayText,
    hour,
    minute,
    second,
    fraction = "",
    zone = "",
  ] = parts;
  const day = Number(dayText),
    month = Number(monthText),
    year = Number(yearText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > days[month - 1]! ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59 ||
    (zone !== "Z" &&
      (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59))
  )
    return invalid();
  // Date.parse truncates sub-millisecond precision; round up so the deadline never moves earlier.
  const result = Date.parse(value) + (/[1-9]/.test(fraction.slice(3)) ? 1 : 0);
  if (!Number.isSafeInteger(result) || result < 0 || result > 8640000000000000)
    return invalid();
  return result;
}

function invalid(): never {
  // Do not attach input or a parser cause: URLs and bodies can contain credentials.
  throw new Error("Invalid shared-host observation");
}

function parseUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    return invalid();
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return invalid();
  return value as Record<string, unknown>;
}
