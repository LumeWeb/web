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
}

interface Pending {
  controller: AbortController;
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

  readonly #upload = async (fileIDs: string[]): Promise<void> => {
    const files = this.uppy
      .getFilesByIds(fileIDs)
      .filter((file) => !file.progress.uploadComplete);
    if (!files.length) return;
    this.uppy.emit("upload-start", files);
    const generation = this.#generation;
    for (const file of files) {
      if (!this.#installed || generation !== this.#generation) break;
      if (!this.uppy.getFile(file.id)) continue;
      await this.#uploadFile(file);
    }
  };

  async #uploadFile(file: UppyFile<Meta, SiaUploadBody>): Promise<void> {
    if (this.#pending.has(file.id)) return;
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
    const pending: Pending = { controller };
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
        this.#uncertain.add(file.id);
        return;
      }
      this.uppy.emit("upload-success", file, {
        body: { objectId: result.objectId },
        status: 200,
      });
    } catch (error) {
      if (error instanceof SiaUploadUncertainError)
        this.#uncertain.add(file.id);
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
    }
  }
}
