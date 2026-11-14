/** Adapts Sia's account-scoped object write to Uppy file events. */
import {
  BasePlugin,
  type Body,
  type Meta,
  type Uppy,
  type UppyFile,
} from "@uppy/core";
import {
  type PackedBatchFile,
  type PackedBatchOutcome,
  uploadPackedBatch,
} from "./packed-batch.ts";
import {
  SiaUploadUncertainError,
  type SiaWriteOptions,
  type UploadAccess,
} from "./sia-upload.ts";

export {
  SiaUploadCancelledError,
  SiaUploadUncertainError,
  uploadToSia,
} from "./sia-upload.ts";
export type {
  SiaUploadProgress,
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

interface AdmittedFile {
  entry: PackedBatchFile;
  file: UppyFile<Meta, SiaUploadBody>;
  pending: Pending;
}

interface Pending {
  controller: AbortController;
  settle: () => void;
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

  #reportFileEvent(report: () => void): void {
    try {
      report();
    } catch (error) {
      this.uppy.log(
        error instanceof Error ? error.message : "Upload event listener failed",
        "error",
      );
    }
  }

  #reportOutcomes(
    admitted: readonly AdmittedFile[],
    outcomes: readonly PackedBatchOutcome[],
    sessionId: string,
    accountKey: string,
  ): void {
    for (const [index, { file, pending }] of admitted.entries()) {
      const outcome = outcomes[index]!;
      if ("error" in outcome) {
        if (outcome.error instanceof SiaUploadUncertainError)
          this.#reportUncertain(file, outcome.error, sessionId, accountKey);
        if (
          !pending.controller.signal.aborted &&
          this.#installed &&
          this.uppy.getFile(file.id)
        )
          this.#reportFileEvent(() =>
            this.uppy.emit(
              "upload-error",
              file,
              outcome.error instanceof Error
                ? outcome.error
                : new Error("Sia upload failed"),
            ),
          );
        continue;
      }
      if (!outcome.result)
        throw new Error("Packed upload did not return an outcome");
      if (
        pending.controller.signal.aborted ||
        !this.#installed ||
        !this.uppy.getFile(file.id)
      ) {
        this.#reportUncertain(
          file,
          new SiaUploadUncertainError(outcome.result.objectId),
          sessionId,
          accountKey,
        );
        continue;
      }
      this.#reportFileEvent(() =>
        this.uppy.emit("upload-success", file, {
          body: { objectId: outcome.result.objectId },
          status: 200,
        }),
      );
    }
  }

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
      this.#pending.get(file.id)?.controller.abort();
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
      const admitted: AdmittedFile[] = [];
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
        // A replacement with the same Uppy ID cannot reuse a pending native operation.
        const previous = this.#pending.get(file.id);
        if (previous) {
          if (!previous.controller.signal.aborted) continue;
          await previous.settled;
          if (
            removed.has(file.id) ||
            !this.#installed ||
            generation !== this.#generation ||
            !this.uppy.getFile(file.id)
          )
            continue;
        }
        if (this.opts.access.getSnapshot().activeSessionId !== sessionId) {
          this.uppy.emit(
            "upload-error",
            file,
            new Error("The Sia account changed during this upload batch"),
          );
          continue;
        }
        const uncertain = this.#uncertain.get(accountKey)?.get(file.id);
        if (uncertain) {
          this.uppy.emit("upload-error", file, uncertain);
          continue;
        }
        if (file.isRemote || !(file.data instanceof File)) {
          this.uppy.emit(
            "upload-error",
            file,
            new TypeError("Sia upload requires a local browser File"),
          );
          continue;
        }
        const data = file.data;
        const controller = new AbortController();
        let settle!: () => void;
        const settled = new Promise<void>((resolve) => {
          settle = resolve;
        });
        const pending: Pending = { controller, settle, settled };
        this.#pending.set(file.id, pending);
        admitted.push({
          entry: {
            file: data,
            isCurrent: () =>
              this.#installed &&
              generation === this.#generation &&
              this.uppy.getFile(file.id)?.data === data,
            ...(this.opts.metadata ? { metadata: this.opts.metadata } : {}),
            onProgress: (progress) => {
              const current = this.uppy.getFile(file.id);
              if (
                controller.signal.aborted ||
                !this.#installed ||
                generation !== this.#generation ||
                current?.data !== data ||
                current.progress.uploadStarted == null
              )
                return;
              // Uppy weights queued files by source size, not encoded shard bytes.
              this.uppy.emit("upload-progress", current, {
                bytesTotal: data.size,
                bytesUploaded:
                  (data.size * progress.bytesUploaded) / progress.bytesTotal,
                uploadStarted: current.progress.uploadStarted,
              });
            },
            signal: controller.signal,
          },
          file,
          pending,
        });
      }
      if (!admitted.length) return;
      try {
        const outcomes = await uploadPackedBatch(
          this.opts.access,
          admitted.map(({ entry }) => entry),
        );
        this.#reportOutcomes(admitted, outcomes, sessionId!, accountKey!);
      } catch (error) {
        for (const { file, pending } of admitted) {
          if (
            !pending.controller.signal.aborted &&
            this.#installed &&
            this.uppy.getFile(file.id)
          )
            this.#reportFileEvent(() =>
              this.uppy.emit(
                "upload-error",
                file,
                error instanceof Error ? error : new Error("Sia upload failed"),
              ),
            );
        }
      } finally {
        for (const { file, pending } of admitted) {
          if (this.#pending.get(file.id) === pending)
            this.#pending.delete(file.id);
          pending.settle();
        }
      }
    } finally {
      this.uppy.off("file-removed", onRemoved);
    }
  };
}
