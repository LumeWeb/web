/** Adapts Sia's account-scoped object write to Uppy file events. */
import {
  BasePlugin,
  type Body,
  type Meta,
  type Uppy,
  type UppyFile,
} from "@uppy/core";
import {
  SiaUploadUncertainError,
  type SiaWriteOptions,
  type UploadAccess,
  uploadToSia,
} from "./sia-upload.ts";

export {
  SiaUploadCancelledError,
  SiaUploadUncertainError,
  uploadToSia,
} from "./sia-upload.ts";
export type {
  SiaUploadResult,
  SiaWriteOptions,
  UploadAccess,
} from "./sia-upload.ts";

export interface SiaUploadBody extends Body {
  readonly objectId: string;
}

export interface SiaUploadOptions {
  readonly access: UploadAccess;
  readonly id?: string;
  readonly metadata?: SiaWriteOptions["metadata"];
  readonly onUncertain?: (
    file: UppyFile<Meta, SiaUploadBody>,
    error: SiaUploadUncertainError,
    sessionId: string,
  ) => void;
}

interface Pending {
  controller: AbortController;
  settled: Promise<void>;
}

export default class SiaUpload extends BasePlugin<
  SiaUploadOptions,
  Meta,
  SiaUploadBody
> {
  static id = "SiaUpload";
  static VERSION = "0.0.0";
  #generation = 0;
  #installed = false;
  readonly #pending = new Map<string, Pending>();
  // Session IDs change on reconnect; the public key keeps unknown pins bound to the account.
  readonly #uncertain = new Map<string, Map<string, SiaUploadUncertainError>>();

  constructor(uppy: Uppy<Meta, SiaUploadBody>, options: SiaUploadOptions) {
    super(uppy, options);
    this.id = options.id ?? SiaUpload.id;
    this.type = "uploader";
  }

  async clearUncertain(fileId: string): Promise<boolean> {
    const sessionId = this.opts.access.getSnapshot().activeSessionId;
    if (!sessionId)
      throw new Error("A Sia account is required to clear an uncertain upload");
    const accountKey = await this.#accountKey(sessionId);
    const files = this.#uncertain.get(accountKey);
    const cleared = files?.delete(fileId) ?? false;
    if (!files?.size) this.#uncertain.delete(accountKey);
    return cleared;
  }

  install(): void {
    this.#installed = true;
    this.uppy.on("file-removed", this.#onRemoved);
    this.uppy.on("cancel-all", this.#onCancelAll);
    this.uppy.addUploader(this.#upload);
  }

  uninstall(): void {
    this.#installed = false;
    this.uppy.removeUploader(this.#upload);
    this.uppy.off("file-removed", this.#onRemoved);
    this.uppy.off("cancel-all", this.#onCancelAll);
    this.#onCancelAll();
  }

  async #accountKey(sessionId: string): Promise<string> {
    const accountKey = await this.opts.access.withSession((sdk) => {
      const key = sdk.appKey();
      try {
        return key.publicKey();
      } finally {
        key.free();
      }
    });
    if (this.opts.access.getSnapshot().activeSessionId !== sessionId)
      throw new Error("The Sia account changed before its identity was read");
    return accountKey;
  }

  readonly #onCancelAll = (): void => {
    this.#generation++;
    for (const entry of this.#pending.values()) entry.controller.abort();
  };

  readonly #onRemoved = (file: UppyFile<Meta, SiaUploadBody>): void => {
    this.#pending.get(file.id)?.controller.abort();
  };

  #reportUncertain(
    file: UppyFile<Meta, SiaUploadBody>,
    error: SiaUploadUncertainError,
    sessionId: string,
    accountKey: string,
  ): void {
    const files =
      this.#uncertain.get(accountKey) ??
      new Map<string, SiaUploadUncertainError>();
    files.set(file.id, error);
    this.#uncertain.set(accountKey, files);
    try {
      this.opts.onUncertain?.(file, error, sessionId);
    } catch (reportError) {
      // A reporting failure cannot change whether the remote pin committed.
      this.uppy.log(
        reportError instanceof Error
          ? reportError.message
          : "Uncertain upload callback failed",
        "error",
      );
    }
  }

  readonly #upload = async (fileIDs: string[]): Promise<void> => {
    const files = this.uppy
      .getFilesByIds(fileIDs)
      .filter((file) => !file.progress.uploadComplete);
    if (!files.length) return;
    const sessionId = this.opts.access.getSnapshot().activeSessionId;
    const removed = new Set<string>();
    const onRemoved = (file: UppyFile<Meta, SiaUploadBody>) => {
      removed.add(file.id);
    };
    this.uppy.on("file-removed", onRemoved);
    try {
      this.uppy.emit("upload-start", files);
      const generation = this.#generation;
      let accountKey: string | undefined;
      let identityError: unknown;
      if (sessionId) {
        try {
          accountKey = await this.#accountKey(sessionId);
        } catch (error) {
          identityError = error;
        }
      }
      for (const file of files) {
        if (!this.#installed || generation !== this.#generation) break;
        if (removed.has(file.id) || !this.uppy.getFile(file.id)) continue;
        if (!sessionId || !accountKey) {
          this.uppy.emit(
            "upload-error",
            file,
            identityError instanceof Error
              ? identityError
              : new Error("A Sia account is required to upload"),
          );
          continue;
        }
        await this.#uploadFile(file, sessionId, accountKey, generation);
      }
    } finally {
      this.uppy.off("file-removed", onRemoved);
    }
  };

  async #uploadFile(
    file: UppyFile<Meta, SiaUploadBody>,
    sessionId: string,
    accountKey: string,
    generation: number,
  ): Promise<void> {
    if (this.#pending.has(file.id)) {
      let removedWhileWaiting = false;
      const onRemoved = (removed: UppyFile<Meta, SiaUploadBody>) => {
        if (removed.id === file.id) removedWhileWaiting = true;
      };
      this.uppy.on("file-removed", onRemoved);
      try {
        while (this.#pending.has(file.id)) {
          const previous = this.#pending.get(file.id)!;
          if (!previous.controller.signal.aborted) return;
          await previous.settled;
        }
      } finally {
        this.uppy.off("file-removed", onRemoved);
      }
      if (
        removedWhileWaiting ||
        !this.#installed ||
        generation !== this.#generation ||
        !this.uppy.getFile(file.id)
      )
        return;
    }
    if (this.opts.access.getSnapshot().activeSessionId !== sessionId) {
      this.uppy.emit(
        "upload-error",
        file,
        new Error("The Sia account changed during this upload batch"),
      );
      return;
    }
    const uncertain = this.#uncertain.get(accountKey)?.get(file.id);
    if (uncertain) {
      this.uppy.emit("upload-error", file, uncertain);
      return;
    }
    if (file.isRemote || !(file.data instanceof File)) {
      this.uppy.emit(
        "upload-error",
        file,
        new TypeError("Sia upload requires a local browser File"),
      );
      return;
    }
    const controller = new AbortController();
    let settle!: () => void;
    const settled = new Promise<void>((resolve) => {
      settle = resolve;
    });
    const pending: Pending = { controller, settled };
    this.#pending.set(file.id, pending);
    try {
      const result = await uploadToSia(this.opts.access, file.data, {
        signal: controller.signal,
        ...(this.opts.metadata ? { metadata: this.opts.metadata } : {}),
      });
      if (
        controller.signal.aborted ||
        !this.#installed ||
        !this.uppy.getFile(file.id)
      ) {
        this.#reportUncertain(
          file,
          new SiaUploadUncertainError(result.objectId),
          sessionId,
          accountKey,
        );
        return;
      }
      this.uppy.emit("upload-success", file, {
        body: { objectId: result.objectId },
        status: 200,
      });
    } catch (error) {
      if (error instanceof SiaUploadUncertainError)
        this.#reportUncertain(file, error, sessionId, accountKey);
      if (
        !controller.signal.aborted &&
        this.#installed &&
        this.uppy.getFile(file.id)
      ) {
        this.uppy.emit(
          "upload-error",
          file,
          error instanceof Error ? error : new Error("Sia upload failed"),
        );
      }
    } finally {
      if (this.#pending.get(file.id) === pending) this.#pending.delete(file.id);
      settle();
    }
  }
}
