/** Checks decoded fixture observations, not SDK traffic or runtime token cutoff. */
import { expect, it } from "vitest";
import { SharedTokenObserver } from "../e2e/support/shared-token-observer.js";

const hostA =
  "ed25519:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const hostB =
  "ed25519:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const secret = "secret-account-signature-seed";
const page = (validUntil = "2030-01-01T00:05:00Z", publicKey = hostA) => [
  {
    addresses: [],
    countryCode: "US",
    goodForUpload: true,
    latitude: 0,
    longitude: 0,
    publicKey,
    seed: secret,
    token: {
      account: secret,
      hostKey: publicKey,
      signature: secret,
      validUntil,
    },
  },
];
const input = (body: unknown = page()) => ({
  body,
  requestStartedAtMs: 1893456000000,
  responseReceivedAtMs: 1893456000100,
  status: 200,
  url: `http://127.0.0.1:3091/shared/hosts?signature=${secret}&offset=0`,
});

it("projects only public host expiry and response timing without changing the supplied body", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  const body = page();
  const before = JSON.stringify(body);
  expect(observer.observe(input(body))).toEqual({
    hosts: [{ publicKey: hostA, validUntilMs: 1893456300000 }],
    kind: "delivered",
    requestStartedAtMs: 1893456000000,
    responseReceivedAtMs: 1893456000100,
    status: 200,
  });
  expect(JSON.stringify(body)).toBe(before);
  expect(JSON.stringify(observer.snapshot())).not.toContain(secret);
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456300000,
  );
});

it("keeps the maximum across pages even when later delivery has an earlier expiry", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  observer.observe({
    ...input(page("2030-01-01T00:09:00Z", hostB)),
    requestStartedAtMs: 1893456000200,
    responseReceivedAtMs: 1893456000300,
  });
  observer.observe(input(page()));
  observer.observe(input([]));
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456540000,
  );
  expect(observer.snapshot().observations).toHaveLength(3);
});

it("does not invent an expiry for empty pages", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  observer.observe(input([]));
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBeNull();
});

it("records unauthorized refresh without accepting its body or extending delivered expiry", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  expect(
    observer.observe({ ...input(page("2099-01-01T00:00:00Z")), status: 401 }),
  ).toEqual({
    hosts: [],
    kind: "unauthorized",
    requestStartedAtMs: 1893456000000,
    responseReceivedAtMs: 1893456000100,
    status: 401,
  });
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBeNull();
  observer.observe(input());
  observer.observe({ ...input(null), status: 401 });
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456300000,
  );
});

for (const [name, patch] of [
  [
    "wrong origin",
    { url: `http://elsewhere.test/shared/hosts?seed=${secret}` },
  ],
  ["wrong port", { url: "http://127.0.0.1:3092/shared/hosts" }],
  ["wrong path", { url: "http://127.0.0.1:3091/shared/objects" }],
  ["trailing path", { url: "http://127.0.0.1:3091/shared/hosts/" }],
  ["URL credentials", { url: `http://${secret}@127.0.0.1:3091/shared/hosts` }],
  ["invalid URL", { url: secret }],
  ["server failure", { status: 500 }],
  ["redirect", { status: 302 }],
  ["forbidden", { status: 403 }],
  ["fractional status", { status: 200.5 }],
  ["unsafe request clock", { requestStartedAtMs: Number.MAX_SAFE_INTEGER + 1 }],
  ["negative clock", { requestStartedAtMs: -1 }],
  ["fractional clock", { responseReceivedAtMs: 1893456000100.5 }],
  ["NaN clock", { responseReceivedAtMs: NaN }],
  ["infinite clock", { responseReceivedAtMs: Infinity }],
  ["reversed interval", { requestStartedAtMs: 1893456000101 }],
  ["outside date range", { responseReceivedAtMs: 8640000000000001 }],
  ["missing body", { body: undefined }],
  ["object body", { body: { secret } }],
  ["null host", { body: [null] }],
  [
    "malformed key",
    {
      body: [
        { publicKey: secret, token: { validUntil: "2030-01-01T00:05:00Z" } },
      ],
    },
  ],
  ["missing token", { body: [{ publicKey: hostA }] }],
  [
    "wrong token host",
    {
      body: [
        {
          publicKey: hostA,
          token: { hostKey: hostB, validUntil: "2030-01-01T00:05:00Z" },
        },
      ],
    },
  ],
  [
    "missing token host",
    {
      body: [
        { publicKey: hostA, token: { validUntil: "2030-01-01T00:05:00Z" } },
      ],
    },
  ],
] as const) {
  it(`rejects ${name} without retaining input or exposing secrets in errors`, () => {
    const observer = new SharedTokenObserver("http://127.0.0.1:3091");
    let caught: unknown;
    try {
      observer.observe({ ...input(), ...patch });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(Error);
    const error = caught as Error;
    const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));
    expect(`${String(error)}${serialized}`).not.toContain(secret);
    expect(`${String(error)}${serialized}`).not.toContain("http://");
    expect(observer.snapshot()).toEqual({
      conservativeMaximumDeliveredExpiryMs: null,
      observations: [],
    });
  });
}

for (const date of [
  "2030-02-30T00:00:00Z",
  "2030-02-29T00:00:00Z",
  "2030-13-01T00:00:00Z",
  "2030-01-01",
  "2030-01-01T24:00:00Z",
  "2030-01-01T00:00:60Z",
  "2030-01-01T00:00:00",
  "2030-01-01T00:00:00+24:00",
  secret,
  "",
  null,
  1893456300000,
]) {
  it(`rejects malformed expiry fixture ${String(date)}`, () => {
    const observer = new SharedTokenObserver("http://127.0.0.1:3091");
    expect(() =>
      observer.observe(
        input([
          { publicKey: hostA, token: { hostKey: hostA, validUntil: date } },
        ]),
      ),
    ).toThrow();
    expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBeNull();
  });
}

for (const [date, expected] of [
  ["2030-01-01T00:05:00.000000001Z", 1893456300001],
  ["2030-01-01T00:05:00.001000000Z", 1893456300001],
  ["2030-01-01T01:05:00+01:00", 1893456300000],
  ["2030-01-01T00:00:00Z", 1893456000000],
  ["2029-12-31T23:59:59Z", 1893455999000],
  ["2028-02-29T00:00:00Z", 1835395200000],
] as const) {
  it(`preserves a conservative millisecond expiry for ${date}`, () => {
    const observer = new SharedTokenObserver("http://127.0.0.1:3091");
    observer.observe(input(page(date)));
    expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
      expected,
    );
  });
}

it("does not retain a partially validated page", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  observer.observe(input());
  expect(() =>
    observer.observe(input([...page("2099-01-01T00:00:00Z"), {}])),
  ).toThrow();
  expect(observer.snapshot().observations).toHaveLength(1);
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456300000,
  );
});

it("isolates retained evidence from caller mutations", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  const result = observer.observe(input());
  result.hosts[0]!.validUntilMs = 0;
  const snapshot = observer.snapshot();
  snapshot.observations.length = 0;
  expect(observer.snapshot().observations).toHaveLength(1);
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456300000,
  );
});

for (const origin of [
  "http://127.0.0.1:3091/path",
  `http://${secret}@127.0.0.1:3091`,
  "http://127.0.0.1:3091?seed=secret",
  "file:///tmp",
  secret,
]) {
  it("rejects an origin scope that is not an HTTP origin", () => {
    expect(() => new SharedTokenObserver(origin)).toThrow();
  });
}

it("includes every host in a page and raises the maximum on a later successful page", () => {
  const observer = new SharedTokenObserver("http://127.0.0.1:3091");
  observer.observe(input([...page(), ...page("2030-01-01T00:09:00Z", hostB)]));
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456540000,
  );
  observer.observe(input(page("2030-01-01T00:10:00Z")));
  expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
    1893456600000,
  );
  expect(observer.snapshot().observations[0]!.hosts).toEqual([
    { publicKey: hostA, validUntilMs: 1893456300000 },
    { publicKey: hostB, validUntilMs: 1893456540000 },
  ]);
});

for (const status of [200, 299]) {
  it(`accepts successful status ${status} with equal safe boundary clocks`, () => {
    const observer = new SharedTokenObserver("http://127.0.0.1:3091");
    observer.observe({
      ...input(),
      requestStartedAtMs: 0,
      responseReceivedAtMs: 0,
      status,
    });
    observer.observe({
      ...input(),
      requestStartedAtMs: 8640000000000000,
      responseReceivedAtMs: 8640000000000000,
      status,
    });
    expect(observer.snapshot().observations).toHaveLength(2);
    expect(observer.snapshot().conservativeMaximumDeliveredExpiryMs).toBe(
      1893456300000,
    );
  });
}
