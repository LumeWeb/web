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
  readonly #uncertain = new Set<string>();

  constructor(uppy: Uppy<Meta, SiaUploadBody>, options: SiaUploadOptions) {
    super(uppy, options);
    this.id = options.id ?? SiaUpload.id;
    this.type = "uploader";
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
  ): void {
    this.#uncertain.add(file.id);
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
    this.uppy.emit("upload-start", files);
    const generation = this.#generation;
    for (const file of files) {
      if (!this.#installed || generation !== this.#generation) break;
      if (!this.uppy.getFile(file.id)) continue;
      if (!sessionId) {
        this.uppy.emit(
          "upload-error",
          file,
          new Error("A Sia account is required to upload"),
        );
        continue;
      }
      await this.#uploadFile(file, sessionId, generation);
    }
  };

  async #uploadFile(
    file: UppyFile<Meta, SiaUploadBody>,
    sessionId: string,
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
    if (this.#uncertain.has(file.id)) {
      this.uppy.emit("upload-error", file, new SiaUploadUncertainError());
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
        );
        return;
      }
      this.uppy.emit("upload-success", file, {
        body: { objectId: result.objectId },
        status: 200,
      });
    } catch (error) {
      if (error instanceof SiaUploadUncertainError)
        this.#reportUncertain(file, error, sessionId);
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
