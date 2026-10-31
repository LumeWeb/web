import { readFile, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import {
  approveIndexd,
  cleanupIndexd,
  parseConnectKeyResponse,
  provisionIndexd,
  type ProvisionRecovery,
} from "../../src/e2e/internal/indexd-provision.mjs";

const recovery: ProvisionRecovery = {
  persist: () => Promise.resolve(),
};

function acknowledge(init: RequestInit): Response {
  if (init.method !== "POST") return new Response(null, { status: 204 });
  if (typeof init.body !== "string")
    throw new Error("Expected JSON request body");
  return new Response(init.body);
}

describe("Indexd provisioning calls", () => {
  it.each([null, "caller-quota"])(
    "rejects supplied quota names without making an admin request: %s",
    async (quotaKey) => {
      const paths: string[] = [];
      const fetchImpl = (url: URL) => {
        paths.push(url.pathname);
        return Promise.resolve(
          new Response(JSON.stringify({ key: "fixture-key" })),
        );
      };
      const options = {
        adminURL: "http://127.0.0.1:40124",
        appID: "ab".repeat(32),
        fetchImpl,
        password: "fixture-password",
        quotaKey,
      };
      await expect(provisionIndexd(options)).rejects.toThrow();
      expect(paths).toEqual([]);
    },
  );
  it("creates quota/key and cleans up only those resources", async () => {
    const calls: string[] = [];
    const fetchImpl = (url: URL, init: RequestInit) => {
      calls.push(`${init.method} ${url.pathname}`);
      if (init.method === "GET")
        return Promise.resolve(new Response(null, { status: 404 }));
      return Promise.resolve(acknowledge(init));
    };
    const created = await provisionIndexd({
      adminURL: "http://127.0.0.1:40124",
      appID: "ab".repeat(32),
      fetchImpl,
      password: "admin-secret",
      recovery,
    });
    await cleanupIndexd({
      adminURL: "http://127.0.0.1:40124",
      created,
      fetchImpl,
      password: "admin-secret",
      quotaKey: created.quotaKey,
    });
    expect(calls).toEqual([
      `GET /api/quotas/${created.quotaKey}`,
      `GET /api/apps/connect/keys/${created.connectKey}`,
      `PUT /api/quotas/${created.quotaKey}`,
      "POST /api/apps/connect/keys",
      `DELETE /api/apps/connect/keys/${created.connectKey}`,
      `DELETE /api/quotas/${created.quotaKey}`,
    ]);
  });

  it("deletes the registered account before its connect key", async () => {
    const calls: string[] = [];
    const fetchImpl = (url: URL, init: RequestInit) => {
      calls.push(`${init.method} ${url.pathname}`);
      return Promise.resolve(new Response(null, { status: 204 }));
    };
    await cleanupIndexd({
      accountKey: `ed25519:${"ab".repeat(32)}`,
      adminURL: "http://127.0.0.1:40124",
      created: { connectKey: "owned-key", quota: true },
      fetchImpl,
      password: "admin-secret",
      quotaKey: "payload",
    });
    expect(calls).toEqual([
      `DELETE /api/account/ed25519%3A${"ab".repeat(32)}`,
      "DELETE /api/apps/connect/keys/owned-key",
      "DELETE /api/quotas/payload",
    ]);
  });

  it("waits for account pruning before deleting the connect key", async () => {
    let attempts = 0;
    const fetchImpl = (url: URL) => {
      if (url.pathname.endsWith("/owned-key") && ++attempts === 1)
        return Promise.resolve(
          new Response("failed to delete app connect key: key in use\n", {
            status: 500,
          }),
        );
      return Promise.resolve(new Response(null, { status: 204 }));
    };
    await expect(
      cleanupIndexd({
        accountKey: `ed25519:${"ab".repeat(32)}`,
        adminURL: "http://127.0.0.1:40124",
        created: { connectKey: "owned-key" },
        fetchImpl,
        password: "admin-secret",
      }),
    ).resolves.toBeUndefined();
    expect(attempts).toBe(2);
  });

  it("funds payload accounts with the requested byte allowance", async () => {
    const quotaBodies: unknown[] = [];
    const fetchImpl = (_url: URL, init: RequestInit) => {
      if (init.method === "GET")
        return Promise.resolve(new Response(null, { status: 404 }));
      if (init.method === "PUT") {
        if (typeof init.body !== "string")
          throw new Error("Quota body must be JSON text");
        quotaBodies.push(JSON.parse(init.body));
      }
      return Promise.resolve(acknowledge(init));
    };
    await provisionIndexd({
      adminURL: "http://127.0.0.1:40124",
      appID: "ab".repeat(32),
      fetchImpl,
      fundTargetBytes: 8_388_608,
      password: "admin-secret",
      recovery,
    });
    expect(quotaBodies).toEqual([
      {
        description: "disposable sia-testing Builder",
        fundTargetBytes: 8_388_608,
        maxPinnedData: 1_000_000_000,
        totalUses: 1,
      },
    ]);
  });

  it("parses the Indexd connect-key response", () => {
    expect(
      parseConnectKeyResponse({
        key: "stock-key",
        quota: "run_quota",
        remainingUses: 1,
      }),
    ).toBe("stock-key");
    expect(() => parseConnectKeyResponse({ connectKey: "stock-key" })).toThrow(
      "connect key",
    );
  });
});

describe("recoverable Indexd provisioning", () => {
  it("persists exact identities before each admin mutation", async () => {
    const events: {
      phase: string;
      plan: { connectKey: string; quotaKey: string };
    }[] = [];
    const calls: {
      body?: Record<string, unknown>;
      method: string;
      path: string;
    }[] = [];
    const fetchImpl = (url: URL, init: RequestInit) => {
      const body =
        typeof init.body === "string"
          ? (JSON.parse(init.body) as Record<string, unknown>)
          : undefined;
      calls.push({
        method: init.method!,
        path: url.pathname,
        ...(body && { body }),
      });
      expect(events[0]?.phase).toBe("intent");
      if (init.method === "GET")
        return Promise.resolve(new Response(null, { status: 404 }));
      if (init.method === "POST") {
        expect(events[events.length - 1]?.phase).toBe(
          "connect-key-create-pending",
        );
        expect(body?.key).toBe(events[0]?.plan.connectKey);
        return Promise.resolve(
          new Response(JSON.stringify({ key: body?.key, quota: body?.quota })),
        );
      }
      expect(events[events.length - 1]?.phase).toBe("quota-create-pending");
      return Promise.resolve(new Response(null, { status: 204 }));
    };
    const result = await provisionIndexd({
      adminURL: "http://127.0.0.1:40124",
      appID: "ab".repeat(32),
      fetchImpl,
      password: "fixture-password",
      recovery: {
        persist: (event) => {
          events.push(event);
          return Promise.resolve();
        },
      },
    });
    expect(events.map((event) => event.phase)).toEqual([
      "intent",
      "quota-create-pending",
      "quota-created",
      "connect-key-create-pending",
      "connect-key-created",
    ]);
    expect(result.quotaKey).toMatch(/^sj_[0-9a-f]{28}$/);
    expect(result.connectKey).toMatch(/^[0-9a-f]{64}$/);
    expect(calls.map((call) => call.method)).toEqual([
      "GET",
      "GET",
      "PUT",
      "POST",
    ]);
    expect(calls[2]?.path).toBe(`/api/quotas/${result.quotaKey}`);
    expect(events[0]?.plan).toEqual({
      appID: "ab".repeat(32),
      connectKey: result.connectKey,
      quotaKey: result.quotaKey,
    });
  });

  it.each([200, 403, 500])(
    "does not mutate when exact absence returns %s",
    async (status) => {
      const methods: string[] = [];
      const fetchImpl = (_url: URL, init: RequestInit) => {
        methods.push(init.method!);
        return Promise.resolve(new Response("{}", { status }));
      };
      await expect(
        provisionIndexd({
          adminURL: "http://127.0.0.1:40124",
          appID: "ab".repeat(32),
          fetchImpl,
          password: "fixture-password",
          recovery: {
            persist: () => Promise.resolve(),
          },
        }),
      ).rejects.toThrow();
      expect(methods).toEqual(["GET"]);
    },
  );

  it("does not mutate when the exact connect key already exists", async () => {
    const methods: string[] = [];
    const fetchImpl = (_url: URL, init: RequestInit) => {
      methods.push(init.method!);
      return Promise.resolve(
        new Response(null, { status: methods.length === 1 ? 404 : 200 }),
      );
    };
    await expect(
      provisionIndexd({
        adminURL: "http://127.0.0.1:40124",
        appID: "ab".repeat(32),
        fetchImpl,
        password: "fixture-password",
        recovery: {
          persist: () => Promise.resolve(),
        },
      }),
    ).rejects.toThrow();
    expect(methods).toEqual(["GET", "GET"]);
  });

  it("retains quota identity when its commit response is lost without claiming ownership", async () => {
    const methods: string[] = [];
    const records: { phase: string; plan: { quotaKey: string } }[] = [];
    const fetchImpl = (url: URL, init: RequestInit) => {
      methods.push(init.method!);
      if (init.method === "GET")
        return Promise.resolve(new Response(null, { status: 404 }));
      expect(url.pathname).toBe(`/api/quotas/${records[0]?.plan.quotaKey}`);
      expect(records[records.length - 1]?.phase).toBe("quota-create-pending");
      throw new Error("transport lost after quota commit");
    };
    await expect(
      provisionIndexd({
        adminURL: "http://127.0.0.1:40124",
        appID: "ab".repeat(32),
        fetchImpl,
        password: "fixture-password",
        recovery: {
          persist: (event) => {
            records.push(event);
            return Promise.resolve();
          },
        },
      }),
    ).rejects.toThrow();
    expect(methods).toEqual(["GET", "GET", "PUT"]);
    expect(records.map((event) => event.phase)).toEqual([
      "intent",
      "quota-create-pending",
      "provision-failed",
    ]);
    expect(records[0]?.plan.quotaKey).toMatch(/^sj_[0-9a-f]{28}$/);
  });

  it("does not mutate when the intent recorder rejects", async () => {
    const methods: string[] = [];
    const fetchImpl = (_url: URL, init: RequestInit) => {
      methods.push(init.method!);
      return Promise.resolve(new Response(null, { status: 404 }));
    };
    await expect(
      provisionIndexd({
        adminURL: "http://127.0.0.1:40124",
        appID: "ab".repeat(32),
        fetchImpl,
        password: "fixture-password",
        recovery: {
          persist: () => {
            throw new Error("fixture persist failure");
          },
        },
      }),
    ).rejects.toThrow();
    expect(methods).toEqual([]);
  });

  it.each(["conflict", "lost response", "mismatched key"])(
    "retains planned identity without deleting an unconfirmed key after %s",
    async (outcome) => {
      const methods: string[] = [];
      const phases: string[] = [];
      const fetchImpl = (url: URL, init: RequestInit) => {
        methods.push(
          `${init.method} ${url.pathname.startsWith("/api/apps") ? "key" : "quota"}`,
        );
        if (init.method === "GET")
          return Promise.resolve(new Response(null, { status: 404 }));
        if (init.method === "POST") {
          if (outcome === "lost response")
            throw new Error("transport lost after commit");
          if (outcome === "conflict")
            return Promise.resolve(new Response(null, { status: 409 }));
          return Promise.resolve(
            new Response(JSON.stringify({ key: "not-the-planned-key" })),
          );
        }
        return Promise.resolve(new Response(null, { status: 204 }));
      };
      await expect(
        provisionIndexd({
          adminURL: "http://127.0.0.1:40124",
          appID: "ab".repeat(32),
          fetchImpl,
          password: "fixture-password",
          recovery: {
            persist: (event) => {
              phases.push(event.phase);
              return Promise.resolve();
            },
          },
        }),
      ).rejects.toThrow();
      expect(methods).toEqual([
        "GET quota",
        "GET key",
        "PUT quota",
        "POST key",
        "DELETE quota",
      ]);
      expect(phases).toContain("connect-key-create-pending");
      expect(phases).not.toContain("connect-key-created");
      expect(phases[phases.length - 1]).toBe("quota-deleted");
    },
  );

  it.each([
    ["quota-create-pending", []],
    ["quota-created", ["PUT", "DELETE"]],
    ["connect-key-create-pending", ["PUT", "DELETE"]],
    ["connect-key-created", ["PUT", "POST", "DELETE", "DELETE"]],
  ] as const)(
    "does not skip the recorder at %s",
    async (failurePhase, expected) => {
      const mutations: string[] = [];
      const phases: string[] = [];
      const fetchImpl = (_url: URL, init: RequestInit) => {
        if (init.method === "GET")
          return Promise.resolve(new Response(null, { status: 404 }));
        mutations.push(init.method!);
        if (init.method === "POST") {
          if (typeof init.body !== "string")
            throw new Error("Expected fixture JSON text");
          const body = JSON.parse(init.body) as { key: string; quota: string };
          return Promise.resolve(
            new Response(JSON.stringify({ key: body.key, quota: body.quota })),
          );
        }
        return Promise.resolve(new Response(null, { status: 204 }));
      };
      await expect(
        provisionIndexd({
          adminURL: "http://127.0.0.1:40124",
          appID: "ab".repeat(32),
          fetchImpl,
          password: "fixture-password",
          recovery: {
            persist: (event) => {
              phases.push(event.phase);
              if (event.phase === failurePhase)
                throw new Error("fixture persist failure");
              return Promise.resolve();
            },
          },
        }),
      ).rejects.toThrow();
      expect(mutations).toEqual(expected);
      expect(phases).toContain(failurePhase);
    },
  );

  it("continues cleanup when a pre-delete recorder fails without deleting that resource", async () => {
    const deleted: string[] = [];
    const phases: string[] = [];
    await expect(
      cleanupIndexd({
        adminURL: "http://127.0.0.1:40124",
        created: { connectKey: "owned-key", quota: true },
        fetchImpl: (url: URL) => {
          deleted.push(url.pathname);
          return Promise.resolve(new Response(null, { status: 204 }));
        },
        password: "fixture-password",
        quotaKey: "owned-quota",
        recoveryRecord: (phase) => {
          phases.push(phase);
          if (phase === "connect-key-delete-pending")
            throw new Error("fixture persist failure");
          return Promise.resolve();
        },
      }),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(deleted).toEqual(["/api/quotas/owned-quota"]);
    expect(phases).toEqual([
      "connect-key-delete-pending",
      "connect-key-delete-failed",
      "quota-delete-pending",
      "quota-deleted",
    ]);
  });

  it("keeps the primary error when owned cleanup also fails", async () => {
    const primary = new Error("fixture primary failure");
    const cleanup = new Error("fixture cleanup failure");
    const fetchImpl = (_url: URL, init: RequestInit) => {
      if (init.method === "GET")
        return Promise.resolve(new Response(null, { status: 404 }));
      if (init.method === "POST") throw primary;
      if (init.method === "DELETE") throw cleanup;
      return Promise.resolve(new Response(null, { status: 204 }));
    };
    const failure: unknown = await provisionIndexd({
      adminURL: "http://127.0.0.1:40124",
      appID: "ab".repeat(32),
      fetchImpl,
      password: "fixture-password",
      recovery,
    }).catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError))
      throw new Error("Expected aggregate failure");
    expect(failure.errors).toHaveLength(2);
    expect(failure.errors[0]).toBe(primary);
    const cleanupFailures: unknown = failure.errors[1];
    expect(failure).toHaveProperty("cause", primary);
    expect(cleanupFailures).toBeInstanceOf(AggregateError);
    if (!(cleanupFailures instanceof AggregateError))
      throw new Error("Expected cleanup aggregate");
    expect(cleanupFailures.errors[0]).toBe(cleanup);
  });

  it("continues known cleanup after an account deletion fails", async () => {
    const methods: string[] = [];
    const fetchImpl = (url: URL, init: RequestInit) => {
      methods.push(`${init.method} ${url.pathname}`);
      return Promise.resolve(
        new Response(null, {
          status: url.pathname.includes("/account/") ? 500 : 204,
        }),
      );
    };
    await expect(
      cleanupIndexd({
        accountKey: "owned-account",
        adminURL: "http://127.0.0.1:40124",
        created: { connectKey: "owned-key", quota: true },
        fetchImpl,
        password: "fixture-password",
        quotaKey: "owned-quota",
      }),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(methods).toEqual([
      "DELETE /api/account/owned-account",
      "DELETE /api/apps/connect/keys/owned-key",
      "DELETE /api/quotas/owned-quota",
    ]);
  });
});

it.each([
  ["0", "", "consent"],
  ["1", "", "lease"],
  ["1", "99999", "lease"],
])(
  "refuses direct provisioning before HTTP with consent %s and descriptor %s",
  (consent, descriptor, reason) => {
    const program = `import { provisionIndexd } from './src/e2e/internal/indexd-provision.mjs';
    try { await provisionIndexd({adminURL:'http://127.0.0.1:1',appID:'ab'.repeat(32),password:'fixture'}); console.log('UNSAFE'); }
    catch (error) { console.log(error.message); }`;
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "-e", program],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          SIA_NATIVE_TOKEN_LOCK_FD: descriptor,
          SIA_TEST_ALLOW_MUTATION: consent,
        },
      },
    );
    expect(output).toMatch(new RegExp(reason, "i"));
    expect(output).not.toContain("UNSAFE");
  },
);

it("never sends approval credentials to a foreign origin or unrelated route", async () => {
  const urls: string[] = [];
  const fetchImpl = (url: URL, _init: RequestInit) => {
    urls.push(url.toString());
    return Promise.resolve(new Response(null, { status: 204 }));
  };
  for (const responseURL of [
    "http://remote.invalid/auth/connect/owned",
    "http://127.0.0.1:4000/unrelated",
    "http://user:secret@127.0.0.1:4000/auth/connect/owned",
  ]) {
    await expect(
      approveIndexd({
        connectKey: "private",
        fetchImpl,
        indexdURL: "http://127.0.0.1:4000",
        responseURL,
      }),
    ).rejects.toThrow();
  }
  expect(urls).toEqual([]);
});

it("approves only the requested connection using the owned connect key", async () => {
  const requests: RequestInit[] = [];
  const response = new Response("unused approval body");
  await approveIndexd({
    connectKey: "owned-key",
    fetchImpl: (_url, init) => {
      requests.push(init);
      return Promise.resolve(response);
    },
    indexdURL: "http://127.0.0.1:4000",
    responseURL: "http://127.0.0.1:4000/auth/connect/owned",
  });
  expect(response.bodyUsed).toBe(true);
  expect(requests).toEqual([
    {
      body: '{"approve":true}',
      headers: {
        "authorization": `Basic ${Buffer.from(":owned-key").toString("base64")}`,
        "content-type": "application/json",
      },
      method: "POST",
      redirect: "error",
    },
  ]);
});

it("reserves fresh exact identities and retains a private record when no account was confirmed", async () => {
  const methods: string[] = [];
  const fetchImpl = (_url: URL, init: RequestInit) => {
    methods.push(init.method!);
    if (init.method === "GET")
      return Promise.resolve(new Response(null, { status: 404 }));
    if (init.method === "POST") {
      const body = JSON.parse(init.body as string) as {
        key?: string;
        quota: string;
      };
      return Promise.resolve(
        new Response(
          JSON.stringify({
            key: body.key ?? "fixture-generated",
            quota: body.quota,
          }),
        ),
      );
    }
    return Promise.resolve(new Response(null, { status: 204 }));
  };
  const created = await provisionIndexd({
    adminURL: "http://127.0.0.1:4000",
    appID: "ab".repeat(32),
    fetchImpl,
    password: "fixture",
  });
  try {
    expect(methods).toEqual(["GET", "GET", "PUT", "POST"]);
    expect(created.recoveryPath).toEqual(expect.any(String));
    if (!created.recoveryPath)
      throw new Error("Expected a private recovery file");
    const intent = JSON.parse(await readFile(created.recoveryPath, "utf8")) as {
      accountKey?: string;
      phase: string;
      plan: unknown;
    };
    expect(intent.plan).toEqual({
      appID: "ab".repeat(32),
      connectKey: created.connectKey,
      quotaKey: created.quotaKey,
    });
    await cleanupIndexd({
      adminURL: "http://127.0.0.1:4000",
      created,
      fetchImpl,
      password: "fixture",
      quotaKey: created.quotaKey,
    });
    const final = JSON.parse(await readFile(created.recoveryPath, "utf8")) as {
      accountKey?: string;
      phase: string;
      plan: unknown;
    };
    expect(final.phase).toBe("quota-deleted");
    expect(final.accountKey).toBeUndefined();
  } finally {
    if (created.recoveryPath)
      await rm(dirname(created.recoveryPath), { force: true, recursive: true });
  }
});

it("rejects a denied approval without exposing its private response diagnostics", async () => {
  const sentinel =
    "seed-SENTINEL ?signature=signed-query-SENTINEL raw-error-SENTINEL";
  const response = new Response(sentinel, { status: 403 });
  const failure: unknown = await approveIndexd({
    connectKey: "private-key",
    fetchImpl: () => Promise.resolve(response),
    indexdURL: "http://127.0.0.1:4000",
    responseURL: "http://127.0.0.1:4000/auth/connect/owned",
  }).catch((error: unknown) => error);
  expect(response.bodyUsed).toBe(true);
  expect(failure).toBeInstanceOf(Error);
  if (!(failure instanceof Error)) throw new Error("Expected denied approval");
  expect(failure.message).toBe("Indexd approval failed (403)");
  expect(failure.message).not.toContain("SENTINEL");
});

it.each([200, 403])(
  "preserves approval and response cleanup failures for status %s",
  async (status) => {
    const drainage = { secret: "private-drain-SENTINEL" };
    const response = new Response(
      new ReadableStream({
        cancel: vi.fn<() => Promise<void>>().mockRejectedValue(drainage),
      }),
      { status },
    );
    const failure: unknown = await approveIndexd({
      connectKey: "owned",
      fetchImpl: () => Promise.resolve(response),
      indexdURL: "http://127.0.0.1:4000",
      responseURL: "http://127.0.0.1:4000/auth/connect/owned",
    }).catch((error: unknown) => error);
    expect(response.bodyUsed).toBe(true);
    if (status === 200) expect(failure).toBe(drainage);
    else {
      expect(failure).toBeInstanceOf(AggregateError);
      if (!(failure instanceof AggregateError))
        throw new Error("Expected approval and cleanup errors");
      expect(failure.errors).toHaveLength(2);
      expect(failure.errors[0]).toBeInstanceOf(Error);
      expect(failure.errors[0]).toHaveProperty(
        "message",
        "Indexd approval failed (403)",
      );
      expect(failure.errors[1]).toBe(drainage);
    }
  },
);
