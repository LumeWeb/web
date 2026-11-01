/** Device faults affect SDK calls while control inspection remains available to the test. */
import { createTransferLink } from "./link.js";
import { withAbort } from "./abort.js";
export interface MockConditions {
  downloadBytesPerSecond: number;
  latencyMs: number;
  uploadBytesPerSecond: number;
}

export interface MockControl {
  addFault(input: MockSelector & { message?: string; times?: number }): void;
  hold(input: MockSelector): () => void;
  requests(): MockRequest[];
  setConditions(input: Partial<MockConditions>): void;
  setOffline(device: string, offline: boolean): void;
}

export type MockOperation =
  | "deleteObject"
  | "download"
  | "object"
  | "pinObject"
  | "pruneSlabs"
  | "upload";

export interface MockRequest {
  accountId: string;
  bytes: number;
  device: string;
  objectId?: string;
  operation: MockOperation;
  sequence: number;
  status: "cancelled" | "completed" | "failed" | "pending";
}

export interface MockSelector {
  device?: string;
  operation: MockOperation;
}

/** Each pending call keeps its own record even when bounded history evicts it. */
export function createControls(requestLimit: number) {
  if (!Number.isSafeInteger(requestLimit) || requestLimit < 1)
    throw new Error("requestLimit must be a positive safe integer");
  const offline = new Set<string>();
  const faults: (MockSelector & { message: string; times: number })[] = [];
  const holds = new Set<MockSelector & { pending: Promise<void> }>();
  const history: MockRequest[] = [];
  const conditions: MockConditions = {
    downloadBytesPerSecond: 0,
    latencyMs: 0,
    uploadBytesPerSecond: 0,
  };
  const download = createTransferLink(() => conditions.downloadBytesPerSecond);
  const upload = createTransferLink(() => conditions.uploadBytesPerSecond);
  let sequence = 0;

  function matches(selector: MockSelector, request: MockRequest): boolean {
    return (
      selector.operation === request.operation &&
      (selector.device === undefined || selector.device === request.device)
    );
  }

  function checkOnline(device: string): void {
    if (offline.has(device)) throw new Error(`device ${device} is offline`);
  }

  const control: MockControl = {
    addFault(input) {
      const times = input.times ?? 1;
      if (!Number.isSafeInteger(times) || times < 1)
        throw new Error("fault times must be a positive safe integer");
      faults.push({
        ...input,
        message: input.message ?? "injected network failure",
        times,
      });
    },
    hold(input) {
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const record = { ...input, pending };
      holds.add(record);
      return () => {
        holds.delete(record);
        release();
      };
    },
    requests: () => history.map((record) => ({ ...record })),
    setConditions(input) {
      for (const key of [
        "latencyMs",
        "downloadBytesPerSecond",
        "uploadBytesPerSecond",
      ] as const) {
        const value = input[key];
        if (value !== undefined && (!Number.isFinite(value) || value < 0))
          throw new Error(`${key} must be nonnegative and finite`);
      }
      Object.assign(conditions, input);
    },
    setOffline(device, value) {
      if (value) offline.add(device);
      else offline.delete(device);
    },
  };

  return {
    async before(request: MockRequest, signal?: AbortSignal): Promise<void> {
      signal?.throwIfAborted();
      checkOnline(request.device);
      if (conditions.latencyMs > 0) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await withAbort(
            new Promise<void>((resolve) => {
              timer = setTimeout(resolve, conditions.latencyMs);
            }),
            signal,
          );
        } finally {
          if (timer !== undefined) clearTimeout(timer);
        }
      }
      await withAbort(
        Promise.all(
          [...holds]
            .filter((hold) => matches(hold, request))
            .map((hold) => hold.pending),
        ),
        signal,
      );
      signal?.throwIfAborted();
      checkOnline(request.device);
      const fault = faults.find((item) => matches(item, request));
      if (fault) {
        if (--fault.times === 0) faults.splice(faults.indexOf(fault), 1);
        throw new Error(fault.message);
      }
    },
    begin(
      input: Pick<
        MockRequest,
        "accountId" | "device" | "objectId" | "operation"
      >,
    ): MockRequest {
      const record: MockRequest = {
        ...input,
        bytes: 0,
        sequence: ++sequence,
        status: "pending",
      };
      history.push(record);
      if (history.length > requestLimit) history.shift();
      return record;
    },
    checkOnline,
    control,
    download,
    upload,
  };
}
