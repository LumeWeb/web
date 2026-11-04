/** Private one-use admissions reserve the run before a client opens its upload source. */
import { endpointShutdown } from "./diagnostics.js";
import type {
  ActorRef,
  ApplicationObject,
  BrowserAccess,
  MockSia,
} from "./types.js";
interface DispatchInput {
  access: BrowserAccess;
  actor: ActorRef;
  client: object;
  credential: string;
}
interface Lease {
  abort: AbortController;
  client: object;
  credential: string;
  expiresAt: number;
  result: Promise<ApplicationObject>;
  send: (stream: ReadableStream<Uint8Array>) => void;
  token: string;
}
export function createApplicationTransport(
  mock: MockSia,
  requestBody: (request: Request) => null | ReadableStream<Uint8Array> = (
    request,
  ) => request.body,
) {
  const active = new Set<Lease>();
  const pending = new Set<Promise<Response>>();
  const lifetime = new AbortController();
  let closing: Promise<void> | undefined;
  const tokens = new Map<string, Lease>();
  let closed = false;
  const cleanupErrors: unknown[] = [];
  const clients = new WeakMap<object, Map<string, ApplicationObject>>();
  function references(client: object) {
    let refs = clients.get(client);
    if (!refs) {
      refs = new Map();
      clients.set(client, refs);
    }
    return refs;
  }
  function invalid(code = "invalid-input"): never {
    throw Object.assign(new Error("Invalid application request"), { code });
  }
  async function json(
    body: null | ReadableStream<Uint8Array>,
    signal: AbortSignal,
  ): Promise<Record<string, unknown>> {
    signal.throwIfAborted();
    if (!body) invalid();
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    let cancellation: Promise<void> | undefined;
    const failures: unknown[] = [];
    let value: Record<string, unknown> | undefined;
    const cancel = () => {
      cancellation ??= reader.cancel(signal.reason);
      void cancellation.catch(() => undefined);
    };
    signal.addEventListener("abort", cancel, { once: true });
    try {
      for (;;) {
        signal.throwIfAborted();
        const next = await reader.read();
        signal.throwIfAborted();
        if (next.done) break;
        length += next.value.byteLength;
        if (length > 16_384) invalid();
        chunks.push(next.value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
      }
      const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        invalid();
      value = parsed as Record<string, unknown>;
    } catch (error) {
      failures.push(error);
    } finally {
      signal.removeEventListener("abort", cancel);
      cancel();
      try {
        await cancellation;
      } catch (error) {
        if (!failures.includes(error)) failures.push(error);
      } finally {
        reader.releaseLock();
      }
    }
    if (failures.length === 1) throw failures[0];
    if (failures.length > 1)
      throw new AggregateError(
        failures,
        "Application body read and cancellation failed",
      );
    return value!;
  }
  async function execute(
    request: Request,
    operation: string,
    input: DispatchInput,
    signal: AbortSignal,
    bodyStream: null | ReadableStream<Uint8Array>,
  ): Promise<Response> {
    if (closed) invalid("closed");
    signal.throwIfAborted();
    const refs = references(input.client);
    if (operation === "app-upload-body" || operation === "app-upload-cancel") {
      const token = new URL(request.url).searchParams.get("token") ?? "";
      const lease = tokens.get(token);
      if (
        !lease ||
        lease.credential !== input.credential ||
        lease.client !== input.client
      )
        invalid("denied");
      tokens.delete(token);
      if (operation === "app-upload-cancel") {
        lease.abort.abort();
        await lease.result.catch(() => undefined);
        return Response.json(null);
      }
      if (!bodyStream) {
        lease.abort.abort();
        invalid();
      }
      const abort = () => lease.abort.abort();
      signal.addEventListener("abort", abort, { once: true });
      try {
        signal.throwIfAborted();
        lease.send(bodyStream);
        const object = await lease.result;
        const ref = crypto.randomUUID();
        refs.set(ref, object);
        return Response.json({ id: object.id, ref });
      } finally {
        signal.removeEventListener("abort", abort);
      }
    }
    const body = await json(bodyStream, signal);
    if (closed) invalid("closed");
    signal.throwIfAborted();
    if (operation === "app-upload-admit") {
      if (
        typeof body.name !== "string" ||
        typeof body.sha256 !== "string" ||
        typeof body.sizeBytes !== "number" ||
        !Array.isArray(body.metadata) ||
        body.metadata.length > 1024 ||
        body.metadata.some((v) => !Number.isInteger(v) || v < 0 || v > 255)
      )
        invalid();
      const descriptor = {
        metadata: Uint8Array.from(body.metadata),
        name: body.name,
        sha256: body.sha256,
        sizeBytes: body.sizeBytes,
      };
      const writer = mock.application({
        access: input.access,
        as: input.actor,
      });
      const abort = new AbortController();
      let admitted!: () => void;
      let failed!: (error: unknown) => void;
      const admission = new Promise<void>((resolve, reject) => {
        admitted = resolve;
        failed = reject;
      });
      let send!: (stream: ReadableStream<Uint8Array> | undefined) => void;
      const stream = new Promise<ReadableStream<Uint8Array> | undefined>(
        (resolve) => {
          send = resolve;
        },
      );
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      let cancelled = false;
      const source = () =>
        new ReadableStream<Uint8Array>({
          async cancel(reason) {
            cancelled = true;
            send(undefined);
            const body = await stream;
            if (reader) await reader.cancel(reason);
            else await body?.cancel(reason);
          },
          async pull(controller) {
            if (!reader) {
              const body = await stream;
              if (cancelled) return;
              if (!body) {
                controller.close();
                return;
              }
              reader = body.getReader();
            }
            const next = await reader.read();
            if (next.done) controller.close();
            else controller.enqueue(next.value);
          },
          start() {
            admitted();
          },
        });
      const token = crypto.randomUUID();
      const lease: Lease = {
        abort,
        client: input.client,
        credential: input.credential,
        expiresAt: Date.now() + 30_000,
        result: undefined!,
        send,
        token,
      };
      const timer = setTimeout(() => abort.abort(), 30_000);
      const disconnected = () => abort.abort();
      signal.addEventListener("abort", disconnected, { once: true });
      lease.result = (async () => {
        try {
          return await writer.upload({
            file: {
              name: descriptor.name,
              open: source,
              sha256: descriptor.sha256,
              sizeBytes: descriptor.sizeBytes,
            },
            metadata: descriptor.metadata,
            name: descriptor.name,
            signal: AbortSignal.any([abort.signal, lifetime.signal]),
          });
        } catch (error) {
          failed(error);
          throw error;
        } finally {
          clearTimeout(timer);
          tokens.delete(token);
          await writer.close();
        }
      })();
      void lease.result.then(
        () => active.delete(lease),
        (error: unknown) => {
          if (error instanceof AggregateError && !cleanupErrors.includes(error))
            cleanupErrors.push(error);
          active.delete(lease);
        },
      );
      active.add(lease);
      try {
        if (signal.aborted) abort.abort();
        await admission;
        if (closed) invalid("closed");
        signal.throwIfAborted();
        tokens.set(token, lease);
        return Response.json({ expiresAt: lease.expiresAt, token });
      } finally {
        signal.removeEventListener("abort", disconnected);
      }
    }
    const writer = mock.application({
      access: input.access,
      as: input.actor,
    });
    try {
      if (operation === "app-events")
        return Response.json(
          await writer.events({
            cursor: body.cursor as never,
            limit: body.limit as number,
            signal,
          }),
        );
      const object = refs.get(typeof body.ref === "string" ? body.ref : "");
      if (!object) invalid("foreign-handle");
      if (operation === "app-inspect")
        return Response.json(await writer.inspect(object, { signal }));
      if (operation === "app-pin") {
        let metadata: Uint8Array | undefined;
        if (body.metadata !== undefined) {
          if (
            !Array.isArray(body.metadata) ||
            body.metadata.length > 1024 ||
            !body.metadata.every(
              (byte: unknown) =>
                Number.isInteger(byte) &&
                (byte as number) >= 0 &&
                (byte as number) <= 255,
            )
          )
            invalid();
          metadata = Uint8Array.from(body.metadata as number[]);
        }
        await writer.pin(object, { metadata, signal });
        return Response.json(null);
      }
      if (operation === "app-delete") {
        await writer.delete(object, { signal });
        return Response.json(null);
      }
      invalid();
    } finally {
      await writer.close();
    }
  }
  return {
    close() {
      if (closing) return closing;
      closed = true;
      closing = Promise.resolve().then(async () => {
        const leases = [...active];
        for (const lease of leases) lease.abort.abort();
        await Promise.allSettled([
          ...pending,
          ...leases.map((lease) => lease.result),
        ]);
        if (cleanupErrors.length)
          throw new AggregateError(
            cleanupErrors,
            "Application endpoint cleanup failed",
          );
      });
      lifetime.abort(endpointShutdown());
      return closing;
    },
    dispatch(request: Request, operation: string, input: DispatchInput) {
      if (closed)
        return Promise.reject(
          Object.assign(new Error("Application endpoint is closed"), {
            code: "closed",
          }),
        );
      const signal = AbortSignal.any([request.signal, lifetime.signal]);
      const work = Promise.resolve().then(async () => {
        const body = requestBody(request);
        const failures: unknown[] = [];
        let response: Response | undefined;
        try {
          response = await execute(request, operation, input, signal, body);
        } catch (error) {
          failures.push(error);
        }
        if (signal.aborted && body && !body.locked) {
          try {
            await body.cancel(signal.reason);
          } catch (error) {
            if (!failures.includes(error)) failures.push(error);
          }
        }
        if (failures.length === 1) throw failures[0];
        if (failures.length > 1)
          throw new AggregateError(
            failures,
            "Application dispatch and body cancellation failed",
          );
        return response!;
      });
      pending.add(work);
      void work.then(
        () => pending.delete(work),
        (error: unknown) => {
          if (error instanceof AggregateError && !cleanupErrors.includes(error))
            cleanupErrors.push(error);
          pending.delete(work);
        },
      );
      return work;
    },
  };
}
