import type { RequestClient } from "@uppy/companion-client";
import type {
  Body,
  DefinePluginOpts,
  Meta,
  PluginOpts,
  State,
  Uppy,
  UppyFile,
} from "@uppy/core";
import { BasePlugin, EventManager } from "@uppy/core";
import {
  filterFilesToEmitUploadStarted,
  filterFilesToUpload,
  getAllowedMetaFields,
  internalRateLimitedQueue,
  type LocalUppyFile,
  NetworkError,
  RateLimitedQueue,
  type RemoteUppyFile,
} from "@uppy/utils";
import packageJson from "../package.json" with { type: "json" };
import locale from "./locale.js";
import { getNetworkClient } from "@/network/index.js";
import { isNodeEnvironment } from "./env.js";

export interface XhrUploadOpts<
  M extends Meta,
  B extends Body,
> extends PluginOpts {
  endpoint:
    | string
    | ((
        fileOrBundle: UppyFile<M, B> | UppyFile<M, B>[],
      ) => string | Promise<string>);
  method?:
    | "GET"
    | "HEAD"
    | "POST"
    | "PUT"
    | "DELETE"
    | "OPTIONS"
    | "PATCH"
    | "delete"
    | "get"
    | "head"
    | "options"
    | "post"
    | "put"
    | string;
  formData?: boolean;
  fieldName?: string;
  headers?:
    | Record<string, string>
    | ((file: UppyFile<M, B>) => Record<string, string>);
  timeout?: number;
  limit?: number;
  responseType?: XMLHttpRequestResponseType;
  withCredentials?: boolean;
  retries?: number;
  onBeforeRequest?: (
    xhr: XMLHttpRequest,
    retryCount: number,
    /** The files to be uploaded. When `bundle` is `false` only one file is in the array.  */
    files: UppyFile<M, B>[],
  ) => void | Promise<void>;
  shouldRetry?: (xhr: XMLHttpRequest) => boolean;
  onAfterResponse?: (
    xhr: XMLHttpRequest,
    retryCount: number,
  ) => void | Promise<void>;
  getResponseData?: (xhr: XMLHttpRequest) => B | Promise<B>;
  allowedMetaFields?: boolean | string[];
  bundle?: boolean;
}

export type { XhrUploadOpts as XHRUploadOptions };

declare module "@uppy/utils" {
  export interface LocalUppyFile<M extends Meta, B extends Body> {
    xhrUpload?: XhrUploadOpts<M, B>;
  }
  export interface RemoteUppyFile<M extends Meta, B extends Body> {
    xhrUpload?: XhrUploadOpts<M, B>;
  }
}

declare module "@uppy/core" {
  export interface State<M extends Meta, B extends Body> {
    xhrUpload?: XhrUploadOpts<M, B>;
  }
}

function buildResponseError(
  xhr?: XMLHttpRequest,
  err?: string | Error | NetworkError,
): Error {
  let error = err;
  // No error message
  if (!error) error = new Error("Upload error");
  // Got an error message string
  if (typeof error === "string") error = new Error(error);
  // Got something else
  if (!(error instanceof Error)) {
    error = Object.assign(new Error("Upload error"), { data: error });
  }

  // Attach request info if available
  if (xhr) {
    (error as any).request = xhr;
  }

  return error;
}

/**
 * Set `data.type` in the blob to `file.meta.type`,
 * because we might have detected a more accurate file type in Uppy
 * https://stackoverflow.com/a/50875615
 */
function setTypeInBlob<M extends Meta, B extends Body>(
  file: LocalUppyFile<M, B>,
): Blob | Buffer {
  // In Node.js, file.data is a Buffer which doesn't have slice() method
  // We can't change the type of a Buffer, so we just return it as-is
  if (isNodeEnvironment()) {
    return file.data as unknown as Buffer;
  }

  // In browser, file.data is a Blob/File which has slice() method
  const dataWithUpdatedType = file.data!.slice(
    0,
    file.data!.size,
    file.meta.type,
  );
  return dataWithUpdatedType;
}

const defaultOptions = {
  formData: true,
  fieldName: "file",
  method: "post",
  allowedMetaFields: true,
  bundle: false,
  headers: {},
  timeout: 30 * 1000,
  limit: 5,
  withCredentials: false,
  responseType: "",
  retries: 3,
} satisfies Partial<XhrUploadOpts<any, any>>;

type Opts<M extends Meta, B extends Body> = DefinePluginOpts<
  XhrUploadOpts<M, B>,
  keyof typeof defaultOptions
>;

interface OptsWithHeaders<M extends Meta, B extends Body> extends Opts<M, B> {
  headers: Record<string, string>;
}

export default class XHRUpload<
  M extends Meta,
  B extends Body,
> extends BasePlugin<Opts<M, B>, M, B> {
  static VERSION = packageJson.version;

  #networkClient;

  requests: RateLimitedQueue;

  uploaderEvents: Record<string, EventManager<M, B> | null>;

  constructor(uppy: Uppy<M, B>, opts: XhrUploadOpts<M, B>) {
    super(uppy, {
      ...defaultOptions,
      fieldName: opts.bundle ? "files[]" : "file",
      ...opts,
    });
    this.type = "uploader";
    this.id = this.opts.id || "XHRUpload";

    this.defaultLocale = locale;

    this.i18nInit();

    // Simultaneous upload limiting is shared across all uploads with this plugin.
    if (internalRateLimitedQueue in this.opts) {
      // @ts-ignore untyped internal
      this.requests = this.opts[internalRateLimitedQueue];
    } else {
      this.requests = new RateLimitedQueue(this.opts.limit);
    }

    if (this.opts.bundle && !this.opts.formData) {
      throw new Error(
        "`opts.formData` must be true when `opts.bundle` is enabled.",
      );
    }

    if (this.opts.bundle && typeof this.opts.headers === "function") {
      throw new Error(
        "`opts.headers` can not be a function when the `bundle: true` option is set.",
      );
    }

    if (opts?.allowedMetaFields === undefined && "metaFields" in this.opts) {
      throw new Error(
        "The `metaFields` option has been renamed to `allowedMetaFields`.",
      );
    }

    this.uploaderEvents = Object.create(null);
    // Initialize network client (browser uses XHR via @uppy/utils, Node uses ky)
    this.#networkClient = getNetworkClient();

    // Set hooks on network client
    const client = this.#networkClient as any;
    if (typeof client.setHooks === "function") {
      client.setHooks({
        shouldRetry: this.opts.shouldRetry,
        onAfterResponse: this.opts.onAfterResponse,
        onBeforeRequest: this.opts.onBeforeRequest as any,
      });
    }
  }

  getOptions(file: UppyFile<M, B>): OptsWithHeaders<M, B> {
    const overrides = this.uppy.getState().xhrUpload;
    const { headers } = this.opts;

    const opts = {
      ...this.opts,
      ...(overrides || {}),
      ...(file.xhrUpload || {}),
      headers: {},
    };
    // Support for `headers` as a function, only in the XHRUpload settings.
    // Options set by other plugins in Uppy state or on the files themselves are still merged in afterward.
    //
    // ```js
    // headers: (file) => ({ expires: file.meta.expires })
    // ```
    if (typeof headers === "function") {
      opts.headers = headers(file);
    } else {
      Object.assign(opts.headers, this.opts.headers);
    }

    if (overrides) {
      Object.assign(opts.headers, overrides.headers);
    }
    if (file.xhrUpload) {
      Object.assign(opts.headers, file.xhrUpload.headers);
    }

    return opts;
  }

  addMetadata(
    formData: FormData,
    meta: State<M, B>["meta"],
    opts: Opts<M, B>,
  ): void {
    const allowedMetaFields = getAllowedMetaFields(
      opts.allowedMetaFields,
      meta,
    );

    allowedMetaFields.forEach((item) => {
      const value = meta[item];
      if (Array.isArray(value)) {
        // In this case we don't transform `item` to add brackets, it's up to
        // the user to add the brackets so it won't be overridden.
        value.forEach((subItem) => formData.append(item, subItem));
      } else {
        formData.append(item, value as string);
      }
    });
  }

  createFormDataUpload(file: LocalUppyFile<M, B>, opts: Opts<M, B>): FormData {
    const formPost = new FormData();

    this.addMetadata(formPost, file.meta, opts);

    const dataWithUpdatedType = setTypeInBlob(file);

    if (file.name) {
      formPost.append(opts.fieldName, dataWithUpdatedType as any, file.meta.name);
    } else {
      formPost.append(opts.fieldName, dataWithUpdatedType as any);
    }

    return formPost;
  }

  createBundledUpload(
    files: LocalUppyFile<M, B>[],
    opts: Opts<M, B>,
  ): FormData {
    const formPost = new FormData();

    const { meta } = this.uppy.getState();
    this.addMetadata(formPost, meta, opts);

    files.forEach((file) => {
      const options = this.getOptions(file);

      const dataWithUpdatedType = setTypeInBlob(file);

      if (file.name) {
        formPost.append(options.fieldName, dataWithUpdatedType as any, file.name);
      } else {
        formPost.append(options.fieldName, dataWithUpdatedType as any);
      }
    });

    return formPost;
  }

  async #uploadLocalFile(file: LocalUppyFile<M, B>) {
    const events = new EventManager(this.uppy);
    const controller = new AbortController();
    const uppyFetch = this.requests.wrapPromiseFunction(async () => {
      const opts = this.getOptions(file);
      const body = opts.formData
        ? this.createFormDataUpload(file, opts)
        : file.data;
      const endpoint =
        typeof opts.endpoint === "string"
          ? opts.endpoint
          : await opts.endpoint(file);

      let res;
      try {
        res = await this.#networkClient.request(
          endpoint,
          {
            method: opts.method,
            headers: opts.headers,
            body,
            timeout: opts.timeout,
            signal: controller.signal,
            withCredentials: opts.withCredentials,
            responseType: opts.responseType,
            retries: opts.retries,
          },
          {
            onUploadProgress: (event) => {
              if (event.lengthComputable) {
                this.uppy.emit("upload-progress", file, {
                  uploadStarted: file.progress.uploadStarted ?? 0,
                  bytesUploaded: event.loaded,
                  bytesTotal: event.total,
                });
              }
            },
            onTimeout: (timeout) => {
              const seconds = Math.ceil(timeout / 1000);
              const error = new Error(this.i18n("uploadStalled", { seconds }));
              this.uppy.emit("upload-stalled", error, [file]);
            },
          },
        );
      } catch (error) {
        if (error.name === "AbortError") {
          return undefined;
        }
        throw error;
      }

      if (!res) return;

      // Parse response
      let bodyData = await this.opts.getResponseData?.(res as any);

      if (res.responseType === "json") {
        bodyData ??= res.response;
      } else if (res.responseText) {
        try {
          bodyData ??= JSON.parse(res.responseText) as B;
        } catch (cause) {
          throw new Error(
            "@uppy/xhr-upload expects a JSON response (with a `url` property). To parse non-JSON responses, use `getResponseData` to turn your response into JSON.",
          );
        }
      }

      const uploadURL =
        typeof bodyData?.url === "string" ? bodyData.url : undefined;

      this.uppy.emit("upload-success", file, {
        status: res.status,
        body: bodyData,
        uploadURL,
      });

      return res;
    });

    events.onFileRemove(file.id, () => controller.abort());
    events.onCancelAll(file.id, () => {
      controller.abort();
    });

    try {
      await uppyFetch();
    } catch (error) {
      // TODO: create formal error with name 'AbortError' (this comes from RateLimitedQueue)
      if (error.message !== "Cancelled") {
        const processedError = this.#networkClient.processError
          ? this.#networkClient.processError(error, (error as any).request)
          : buildResponseError((error as any).request, error);
        this.uppy.emit(
          "upload-error",
          file,
          processedError,
          (error as any).request,
        );
        throw error;
      }
    } finally {
      events.remove();
    }
  }

  async #uploadBundle(files: LocalUppyFile<M, B>[]) {
    const controller = new AbortController();
    const uppyFetch = this.requests.wrapPromiseFunction(async () => {
      const optsFromState = this.uppy.getState().xhrUpload ?? {};
      const body = this.createBundledUpload(files, {
        ...this.opts,
        ...optsFromState,
      });
      const endpoint =
        typeof this.opts.endpoint === "string"
          ? this.opts.endpoint
          : await this.opts.endpoint(files);

      let res;
      try {
        res = await this.#networkClient.request(
          endpoint,
          {
            // headers can't be a function with bundle: true
            method: this.opts.method,
            headers: this.opts.headers as Record<string, string>,
            body,
            timeout: this.opts.timeout,
            signal: controller.signal,
            withCredentials: this.opts.withCredentials,
            responseType: this.opts.responseType,
            retries: this.opts.retries,
          },
          {
            onUploadProgress: (event) => {
              if (event.lengthComputable) {
                for (const { id } of files) {
                  const file = this.uppy.getFile(id);
                  if (file != null) {
                    this.uppy.emit("upload-progress", file, {
                      uploadStarted: file.progress.uploadStarted ?? 0,
                      bytesUploaded: (event.loaded / event.total) * file.size!,
                      bytesTotal: file.size,
                    });
                  }
                }
              }
            },
            onTimeout: (timeout) => {
              const seconds = Math.ceil(timeout / 1000);
              const error = new Error(this.i18n("uploadStalled", { seconds }));
              this.uppy.emit("upload-stalled", error, files);
            },
          },
        );
      } catch (error) {
        if (error.name === "AbortError") {
          return undefined;
        }
        throw error;
      }

      if (!res) return;

      // Parse response
      let bodyData = await this.opts.getResponseData?.(res as any);

      if (res.responseType === "json") {
        bodyData ??= res.response;
      } else if (res.responseText) {
        try {
          bodyData ??= JSON.parse(res.responseText) as B;
        } catch {
          throw new Error(
            "@uppy/xhr-upload expects a JSON response (with a `url` property). To parse non-JSON responses, use `getResponseData` to turn your response into JSON.",
          );
        }
      }

      const uploadURL =
        typeof bodyData?.url === "string" ? bodyData.url : undefined;

      for (const { id } of files) {
        this.uppy.emit("upload-success", this.uppy.getFile(id), {
          status: res.status,
          body: bodyData,
          uploadURL,
        });
      }

      return res;
    });

    function abort() {
      controller.abort();
    }

    // We only need to abort on cancel all because
    // individual cancellations are not possible with bundle: true
    this.uppy.once("cancel-all", abort);

    try {
      await uppyFetch();
    } catch (error) {
      // TODO: create formal error with name 'AbortError' (this comes from RateLimitedQueue)
      if (error.message !== "Cancelled") {
        throw error;
      }
    } finally {
      this.uppy.off("cancel-all", abort);
    }
  }

  #getCompanionClientArgs(file: RemoteUppyFile<M, B>) {
    const opts = this.getOptions(file);
    const allowedMetaFields = getAllowedMetaFields(
      opts.allowedMetaFields,
      file.meta,
    );
    return {
      ...file.remote?.body,
      protocol: "multipart",
      endpoint: opts.endpoint,
      size: file.data.size,
      fieldname: opts.fieldName,
      metadata: Object.fromEntries(
        allowedMetaFields.map((name) => [name, file.meta[name]]),
      ),
      httpMethod: opts.method,
      useFormData: opts.formData,
      headers: opts.headers,
    };
  }

  async #uploadFiles(files: UppyFile<M, B>[]) {
    await Promise.allSettled(
      files.map((file) => {
        if (file.isRemote) {
          const getQueue = () => this.requests;
          const controller = new AbortController();

          const removedHandler = (removedFile: UppyFile<M, B>) => {
            if (removedFile.id === file.id) controller.abort();
          };
          this.uppy.on("file-removed", removedHandler);

          const uploadPromise = this.uppy
            .getRequestClientForFile<RequestClient<M, B>>(file)
            .uploadRemoteFile(file, this.#getCompanionClientArgs(file), {
              signal: controller.signal,
              getQueue,
            });

          this.requests.wrapSyncFunction(
            () => {
              this.uppy.off("file-removed", removedHandler);
            },
            { priority: -1 },
          )();

          return uploadPromise;
        }

        return this.#uploadLocalFile(file);
      }),
    );
  }

  #handleUpload = async (fileIDs: string[]) => {
    if (fileIDs.length === 0) {
      this.uppy.log("[XHRUpload] No files to upload!");
      return;
    }

    // No limit configured by the user, and no RateLimitedQueue passed in by a "parent" plugin
    // (basically just AwsS3) using the internal symbol
    // @ts-ignore untyped internal
    if (this.opts.limit === 0 && !this.opts[internalRateLimitedQueue]) {
      this.uppy.log(
        "[XHRUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/xhr-upload/#limit-0",
        "warning",
      );
    }

    this.uppy.log("[XHRUpload] Uploading...");
    const files = this.uppy.getFilesByIds(fileIDs);

    const filesFiltered = filterFilesToUpload(files);
    const filesToEmit = filterFilesToEmitUploadStarted(filesFiltered);
    this.uppy.emit("upload-start", filesToEmit);

    if (this.opts.bundle) {
      // if bundle: true, we don't support remote uploads
      const isSomeFileRemote = filesFiltered.some((file) => file.isRemote);
      if (isSomeFileRemote) {
        throw new Error(
          "Can't upload remote files when the `bundle: true` option is set",
        );
      }

      if (typeof this.opts.headers === "function") {
        throw new TypeError(
          "`headers` may not be a function when the `bundle: true` option is set",
        );
      }

      await this.#uploadBundle(filesFiltered as LocalUppyFile<M, B>[]);
    } else {
      await this.#uploadFiles(filesFiltered);
    }
  };

  install(): void {
    if (this.opts.bundle) {
      const { capabilities } = this.uppy.getState();
      this.uppy.setState({
        capabilities: {
          ...capabilities,
          individualCancellation: false,
        },
      });
    }

    this.uppy.addUploader(this.#handleUpload);
  }

  uninstall(): void {
    if (this.opts.bundle) {
      const { capabilities } = this.uppy.getState();
      this.uppy.setState({
        capabilities: {
          ...capabilities,
          individualCancellation: true,
        },
      });
    }

    this.uppy.removeUploader(this.#handleUpload);
  }
}
