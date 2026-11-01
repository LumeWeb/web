/** Bounds passive response observation without cancelling the SDK's requests or body reads. */
import type { Request, Response } from "@playwright/test";
import { SharedTokenObserver } from "./shared-token-observer.js";

interface HostPage {
  off(
    event: "request" | "requestfailed",
    listener: (request: HostRequest) => void,
  ): void;
  off(event: "response", listener: (response: HostResponse) => void): void;
  on(
    event: "request" | "requestfailed",
    listener: (request: HostRequest) => void,
  ): void;
  on(event: "response", listener: (response: HostResponse) => void): void;
}
type HostRequest = Pick<Request, "method" | "url">;
type HostResponse = Pick<Response, "body" | "headers" | "status" | "url"> & {
  request(): HostRequest;
};

export class ResponseDrain {
  private failure: Error | undefined;
  private finalized = false;
  private readonly tasks = new Set<Promise<void>>();

  constructor(
    private readonly pending: () => boolean,
    private readonly timeoutMs = 15_000,
  ) {}

  async drain(): Promise<void> {
    this.checkFailure();
    if (this.finalized) return;
    const until = Date.now() + this.timeoutMs;
    try {
      while (this.tasks.size || this.pending()) {
        const remaining = until - Date.now();
        if (remaining <= 0)
          throw new Error("Shared-host observations did not settle");
        if (this.tasks.size)
          await this.withDeadline(Promise.all([...this.tasks]), remaining);
        else
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(50, remaining)),
          );
        this.checkFailure();
      }
    } catch (error) {
      // A timed-out body can still settle during page teardown, after the observer has been finalized.
      this.finalized = true;
      this.tasks.clear();
      this.failure = error as Error;
      throw error;
    }
  }

  async finish(
    detach: () => void,
    priorFailure?: { error: unknown },
  ): Promise<void> {
    const failures: unknown[] = [];
    try {
      await this.drain();
    } catch (error) {
      failures.push(error);
    } finally {
      this.finalized = true;
      this.tasks.clear();
      try {
        detach();
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length) {
      if (priorFailure && !failures.includes(priorFailure.error))
        failures.unshift(priorFailure.error);
      if (failures.length === 1 && failures[0] instanceof Error)
        throw failures[0];
      throw new AggregateError(
        failures,
        "Browser probe and observation cleanup failed",
        { cause: failures[0] },
      );
    }
  }

  observe<T>(body: Promise<T>, accept: (value: T) => void): void {
    if (this.finalized) {
      void body.catch(() => undefined);
      return;
    }
    const task = body
      .then((value) => {
        if (!this.finalized) accept(value);
      })
      .catch(() => {
        // Response errors can contain credentials; keep the diagnostic independent of the body.
        if (!this.finalized)
          this.failure ??= new Error(
            "Shared-host response decoding or projection failed",
          );
      })
      .finally(() => {
        this.tasks.delete(task);
      });
    this.tasks.add(task);
  }

  private checkFailure(): void {
    if (this.failure) throw this.failure;
  }

  private async withDeadline(
    task: Promise<unknown>,
    remaining: number,
  ): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        task,
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("Shared-host observations did not settle")),
            remaining,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Connect fixes this operation's sole recipient. Later host pages must use that
 * credential, and their bodies must settle before an expiry result is accepted.
 */
export function observeSharedHosts(page: HostPage, origin: string) {
  const observer = new SharedTokenObserver(origin);
  const starts = new Map<HostRequest, number>();
  const pending = new Set<HostRequest>();
  const bodies = new ResponseDrain(() => pending.size > 0);
  const failures: string[] = [];
  let recipient: string | undefined;
  let received = 0;
  const check = () => {
    if (failures.length) throw new Error(failures.join("; "));
  };
  const onRequest = (request: HostRequest) => {
    const url = new URL(request.url());
    if (
      url.origin !== origin ||
      url.pathname !== "/shared/hosts" ||
      request.method() !== "GET"
    )
      return;
    const identity = url.searchParams.get("sc");
    recipient ??= identity ?? undefined;
    if (!identity || identity !== recipient) {
      failures.push("Unexpected shared-host recipient");
      return;
    }
    starts.set(request, Date.now());
    pending.add(request);
  };
  const onFailed = (request: HostRequest) => {
    if (pending.delete(request)) failures.push("Shared-host request failed");
  };
  const onResponse = (response: HostResponse) => {
    const request = response.request();
    const requestStartedAtMs = starts.get(request);
    if (requestStartedAtMs === undefined) return;
    received++;
    const responseReceivedAtMs = Date.now();
    if (response.status() !== 401) {
      const contentType = (response.headers()["content-type"] ?? "")
        .split(";")[0]
        ?.trim()
        .toLowerCase();
      if (contentType !== "application/json") {
        failures.push(
          contentType === "application/cbor"
            ? "Shared-host response uses CBOR"
            : "Unsupported shared-host content type",
        );
        pending.delete(request);
        return;
      }
    }
    bodies.observe(
      response.status() === 401 ? Promise.resolve(undefined) : response.body(),
      (bytes) => {
        try {
          const body: unknown =
            bytes === undefined
              ? undefined
              : JSON.parse(bytes.toString("utf8"));
          observer.observe({
            body,
            requestStartedAtMs,
            responseReceivedAtMs,
            status: response.status(),
            url: response.url(),
          });
        } finally {
          pending.delete(request);
        }
      },
    );
  };
  page.on("request", onRequest);
  page.on("requestfailed", onFailed);
  page.on("response", onResponse);
  return {
    counts: () => ({
      recipients: recipient ? 1 : 0,
      requests: starts.size,
      responses: received,
    }),
    drain: async () => {
      await bodies.drain();
      check();
    },
    finish: (priorFailure?: { error: unknown }) =>
      bodies.finish(() => {
        page.off("request", onRequest);
        page.off("requestfailed", onFailed);
        page.off("response", onResponse);
        check();
      }, priorFailure),
    snapshot: () => observer.snapshot(),
  };
}

/** Keeps summary metadata observation separate from the later payload download. */
export function observeSummaryResponses(
  page: Pick<HostPage, "off" | "on">,
  timeoutMs = 15_000,
) {
  const bodies = new ResponseDrain(() => false, timeoutMs);
  const rows: unknown[] = [];
  const onResponse = (response: HostResponse) => {
    const url = new URL(response.url());
    if (
      url.pathname.endsWith("/shared/objects") &&
      url.searchParams.get("includeslabs") === "false" &&
      response.status() === 200
    )
      bodies.observe(response.body(), (body) => {
        const value: unknown = JSON.parse(body.toString("utf8"));
        rows.push(value);
      });
  };
  page.on("response", onResponse);
  return {
    drain: () => bodies.drain(),
    finish: (priorFailure?: { error: unknown }) =>
      bodies.finish(() => page.off("response", onResponse), priorFailure),
    snapshot: () => [...rows],
  };
}
