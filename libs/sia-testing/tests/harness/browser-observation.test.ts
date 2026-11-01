/** Playwright event fixtures exercise response tracking without launching a browser or replacing SDK traffic. */
import { EventEmitter } from "node:events";
import { afterEach, expect, it, vi } from "vitest";
import * as responses from "../e2e/support/response-drain.js";

const origin = "http://127.0.0.1:3091";
const request = (credential = "private-SENTINEL") => ({
  method: () => "GET",
  url: () => `${origin}/shared/hosts?sc=${credential}`,
});
const response = (
  req: ReturnType<typeof request>,
  body: Promise<Buffer> = Promise.resolve(Buffer.from("[]")),
  status = 200,
  contentType = "application/json",
) => ({
  body: () => body,
  headers: () => ({ "content-type": contentType }),
  request: () => req,
  status: () => status,
  url: req.url,
});
afterEach(() => vi.useRealTimers());

it("waits for every tracked body and includes unauthorized responses", async () => {
  await expect(
    (async () => {
      const page = new EventEmitter();
      const observer = responses.observeSharedHosts(page, origin);
      let deliver: (bytes: Buffer) => void = () => {
        throw new Error("Body was not requested");
      };
      const body = new Promise<Buffer>((resolve) => {
        deliver = resolve;
      });
      const first = request();
      const second = request();
      page.emit("request", first);
      page.emit("response", response(first, body));
      page.emit("request", second);
      page.emit("response", response(second, undefined, 401));
      let finished = false;
      const task = observer.drain().then(() => {
        finished = true;
      });
      await Promise.resolve();
      expect(finished).toBe(false);
      deliver(Buffer.from("[]"));
      await task;
      expect(
        observer
          .snapshot()
          .observations.map((item) => item.kind)
          .sort(),
      ).toEqual(["delivered", "unauthorized"]);
      expect(JSON.stringify(observer.snapshot())).not.toContain(
        "private-SENTINEL",
      );
      await observer.finish();
      expect(page.eventNames()).toEqual([]);
      return observer.counts();
    })(),
  ).resolves.toEqual({ recipients: 1, requests: 2, responses: 2 });
});

it.each([
  "different-recipient",
  "failed-request",
  "wrong-content-type",
] as const)("rejects %s without exposing credentials", async (failure) => {
  await expect(
    (async () => {
      const page = new EventEmitter();
      const observer = responses.observeSharedHosts(page, origin);
      const req = request();
      page.emit("request", req);
      if (failure === "different-recipient") {
        page.emit("response", response(req));
        page.emit("request", request("different-private-SENTINEL"));
      } else if (failure === "failed-request") page.emit("requestfailed", req);
      else
        page.emit(
          "response",
          response(req, undefined, 200, "application/cbor"),
        );
      const error: unknown = await observer
        .finish()
        .catch((value: unknown) => value);
      expect(error).toBeInstanceOf(Error);
      expect(String(error)).not.toContain("SENTINEL");
      return page.eventNames();
    })(),
  ).resolves.toEqual([]);
});

it("stops observing timed-out bodies after removing the listeners", async () => {
  vi.useFakeTimers();
  await expect(
    (async () => {
      const page = new EventEmitter();
      const observer = responses.observeSharedHosts(page, origin);
      let deliver: (bytes: Buffer) => void = () => {
        throw new Error("Body was not requested");
      };
      const req = request();
      page.emit("request", req);
      page.emit(
        "response",
        response(
          req,
          new Promise<Buffer>((resolve) => {
            deliver = resolve;
          }),
        ),
      );
      const ended = expect(observer.finish()).rejects.toThrow("did not settle");
      await vi.advanceTimersByTimeAsync(15_001);
      await ended;
      deliver(Buffer.from("[]"));
      await Promise.resolve();
      expect(observer.snapshot().observations).toEqual([]);
      return page.eventNames();
    })(),
  ).resolves.toEqual([]);
});
