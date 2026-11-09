/** Known descriptor and SDK identities cannot acquire another cleanup owner by changing roles. */
import { expect, it, vi } from "vitest";
import {
  createSessionFromClient,
  createSiaSdkSession,
  SdkSessionErrorCode,
  SdkState,
} from "../src/index.ts";

function client() {
  return {
    dispose() {
      this.free();
    },
    free: vi.fn<() => void>(),
    value: { read: () => "document" },
  };
}

it.each(["retained", "disposed"] as const)(
  "rejects a %s client used as another owner's handle descriptor",
  async (state) => {
    const sdk = client();
    const owner = createSessionFromClient(sdk);
    const lease = owner.source.acquire();
    const peer = createSiaSdkSession<object>();
    if (state === "disposed") {
      lease.release();
      await owner.close();
    }
    try {
      expect(() => peer.setHandle(sdk)).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
      );
      expect(peer.source.getSnapshot().state).toBe(SdkState.Empty);
      expect(sdk.free).toHaveBeenCalledTimes(state === "disposed" ? 1 : 0);
    } finally {
      await peer.close();
      lease.release();
      await owner.close();
    }
    expect(sdk.free).toHaveBeenCalledOnce();
  },
);

it.each(["retained", "disposed"] as const)(
  "rejects a %s handle descriptor used as another owner's client",
  async (state) => {
    const sdk = client();
    const owner = createSiaSdkSession<object>();
    owner.setHandle(sdk);
    const lease = owner.source.acquire();
    const peer = createSiaSdkSession<object>();
    if (state === "disposed") {
      lease.release();
      await owner.close();
    }
    try {
      expect(() => peer.set(sdk)).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
      );
      expect(peer.source.getSnapshot().state).toBe(SdkState.Empty);
      expect(sdk.free).toHaveBeenCalledTimes(state === "disposed" ? 1 : 0);
    } finally {
      await peer.close();
      lease.release();
      await owner.close();
    }
    expect(sdk.free).toHaveBeenCalledOnce();
  },
);

it.each(["retained", "disposed"] as const)(
  "rejects a %s handle descriptor used as another handle's value",
  async (state) => {
    const sdk = client();
    const owner = createSiaSdkSession<object>();
    owner.setHandle(sdk);
    const lease = owner.source.acquire();
    const peer = createSiaSdkSession<object>();
    if (state === "disposed") {
      lease.release();
      await owner.close();
    }
    try {
      expect(() =>
        peer.setHandle({ dispose: () => sdk.dispose(), value: sdk }),
      ).toThrowError(
        expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
      );
      expect(peer.source.getSnapshot().state).toBe(SdkState.Empty);
      expect(sdk.free).toHaveBeenCalledTimes(state === "disposed" ? 1 : 0);
    } finally {
      await peer.close();
      lease.release();
      await owner.close();
    }
    expect(sdk.free).toHaveBeenCalledOnce();
  },
);

it("rejects a client claimed as a handle while its free getter runs", async () => {
  const owner = createSiaSdkSession<object>();
  const peer = createSiaSdkSession<object>();
  const free = vi.fn<() => void>();
  const sdk = {
    dispose: free,
    get free() {
      peer.setHandle(sdk);
      return free;
    },
    value: {},
  };
  try {
    expect(() => owner.set(sdk)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    expect(owner.source.getSnapshot().state).toBe(SdkState.Empty);
    expect(free).not.toHaveBeenCalled();
  } finally {
    await owner.close();
    await peer.close();
  }
  expect(free).toHaveBeenCalledOnce();
});

it("rejects a descriptor claimed as a client while its dispose getter runs", async () => {
  const owner = createSiaSdkSession<object>();
  const peer = createSiaSdkSession<object>();
  const free = vi.fn<() => void>();
  const sdk = {
    get dispose() {
      peer.set(sdk);
      return free;
    },
    free,
    value: {},
  };
  try {
    expect(() => owner.setHandle(sdk)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    expect(owner.source.getSnapshot().state).toBe(SdkState.Empty);
    expect(free).not.toHaveBeenCalled();
  } finally {
    await owner.close();
    await peer.close();
  }
  expect(free).toHaveBeenCalledOnce();
});

it("rejects a value claimed as a descriptor while the outer dispose getter runs", async () => {
  const owner = createSiaSdkSession<object>();
  const peer = createSiaSdkSession<object>();
  const sdk = client();
  const handle = {
    get dispose() {
      peer.setHandle(sdk);
      return () => sdk.dispose();
    },
    value: sdk,
  };
  try {
    expect(() => owner.setHandle(handle)).toThrowError(
      expect.objectContaining({ code: SdkSessionErrorCode.AlreadyUsed }),
    );
    expect(owner.source.getSnapshot().state).toBe(SdkState.Empty);
    expect(sdk.free).not.toHaveBeenCalled();
  } finally {
    await owner.close();
    await peer.close();
  }
  expect(sdk.free).toHaveBeenCalledOnce();
});

it("a self-valued handle keeps its identity when set as the same current client", async () => {
  const owner = createSiaSdkSession<object>();
  const sdk = {
    dispose() {
      this.free();
    },
    free: vi.fn<() => void>(),
    get value(): object {
      return this;
    },
  };
  try {
    const id = owner.setHandle(sdk);
    const before = owner.source.getSnapshot();
    expect(owner.set(sdk)).toBe(id);
    expect(owner.source.getSnapshot()).toBe(before);
    expect(sdk.free).not.toHaveBeenCalled();
  } finally {
    await owner.close();
  }
  expect(sdk.free).toHaveBeenCalledOnce();
});
