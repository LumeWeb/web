import type { Pinner } from "@/pinner";
import type {
  PinataUploadBuilder,
  PinataUploadResult,
  UrlUploadBuilderOptions,
} from "@/types/pinata";
import type { UploadOptions } from "@/encoder/types";
import { CID } from "multiformats/cid";
import { base64ToFile, jsonToFile, urlToFile } from "@/encoder";
import { validateUrl } from "@/utils/validation";

/**
 * Error wrapper for Pinata adapter operations.
 */
export class PinataAdapterError extends Error {
  code: "UPLOAD_FAILED" | "EMPTY_FILE_ARRAY" | "INVALID_CID";
  cause?: Error;

  constructor(
    message: string,
    code: PinataAdapterError["code"],
    cause?: Error,
  ) {
    super(message);
    this.name = "PinataAdapterError";
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Base upload builder with common name/keyvalues functionality.
 */
abstract class BaseUploadBuilder<
  TResult,
> implements PinataUploadBuilder<TResult> {
  protected _name?: string;
  protected _keyvalues?: Record<string, string>;

  constructor(protected pinner: Pinner) {}

  name(name: string): this {
    this._name = name;
    return this;
  }

  keyvalues(kv: Record<string, string>): this {
    this._keyvalues = kv;
    return this;
  }

  abstract execute(): Promise<TResult>;

  protected toUploadResult(result: {
    cid?: string;
    size: number;
    createdAt: Date;
  }): PinataUploadResult {
    if (!result.cid) {
      throw new Error("Upload result has no CID yet — use waitForOperation() to poll for the CID");
    }
    return {
      IpfsHash: result.cid,
      PinSize: result.size,
      Timestamp: result.createdAt.toISOString(),
      isDuplicate: false,
    };
  }
}

/**
 * File upload builder.
 */
class FileUploadBuilder extends BaseUploadBuilder<PinataUploadResult> {
  constructor(
    pinner: Pinner,
    private file: File,
  ) {
    super(pinner);
  }

  async execute(): Promise<PinataUploadResult> {
    const result = await this.pinner.uploadAndWait(this.file, {
      name: this._name,
      keyvalues: this._keyvalues,
    });
    return this.toUploadResult(result);
  }
}

/**
 * File array upload builder.
 */
class FileArrayUploadBuilder extends BaseUploadBuilder<PinataUploadResult> {
  constructor(
    pinner: Pinner,
    private files: File[],
  ) {
    super(pinner);
    if (files.length === 0) {
      throw new PinataAdapterError(
        "Cannot upload empty file array",
        "EMPTY_FILE_ARRAY",
      );
    }
  }

  async execute(): Promise<PinataUploadResult> {
    try {
      const operation = await this.pinner.uploadDirectory(this.files, {
        name: this._name,
        keyvalues: this._keyvalues,
      });
      const result = await operation.result;
      return this.toUploadResult(result);
    } catch (error) {
      if (error instanceof Error) {
        throw new PinataAdapterError(
          `File array upload failed: ${error.message}`,
          "UPLOAD_FAILED",
          error,
        );
      }
      throw error;
    }
  }
}

/**
 * Encoded upload builder - handles JSON, Base64, and URL uploads using encoders.
 */
class EncodedUploadBuilder extends BaseUploadBuilder<PinataUploadResult> {
  constructor(
    pinner: Pinner,
    private encoderFn: (
      name?: string,
      keyvalues?: Record<string, string>,
    ) => Promise<{ file: File; options: UploadOptions }>,
  ) {
    super(pinner);
  }

  async execute(): Promise<PinataUploadResult> {
    try {
      const encoded = await this.encoderFn(this._name, this._keyvalues);
      const result = await this.pinner.uploadAndWait(
        encoded.file,
        encoded.options,
      );
      return this.toUploadResult(result);
    } catch (error) {
      if (error instanceof Error) {
        throw new PinataAdapterError(
          `Upload failed: ${error.message}`,
          "UPLOAD_FAILED",
          error,
        );
      }
      throw error;
    }
  }
}

/**
 * CID upload builder (pin by CID).
 */
class CidUploadBuilder implements PinataUploadBuilder<void> {
  private _name?: string;
  private _keyvalues?: Record<string, string>;

  constructor(
    private pinner: Pinner,
    private cidString: string,
  ) {}

  name(name: string): this {
    this._name = name;
    return this;
  }

  keyvalues(kv: Record<string, string>): this {
    this._keyvalues = kv;
    return this;
  }

  async execute(): Promise<void> {
    try {
      const cid = CID.parse(this.cidString);
      const generator = await this.pinner.pinByHash(cid, {
        name: this._name,
        metadata: this._keyvalues,
      });
      for await (const _ of generator) {
        // Pin operation in progress
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new PinataAdapterError(
          `CID upload failed: ${error.message}`,
          "INVALID_CID",
          error,
        );
      }
      throw error;
    }
  }
}

/**
 * Create a file upload builder.
 */
export function createUploadBuilder(
  pinner: Pinner,
  file: File,
): PinataUploadBuilder<PinataUploadResult> {
  return new FileUploadBuilder(pinner, file);
}

/**
 * Create a file array upload builder.
 */
export function createFileArrayUploadBuilder(
  pinner: Pinner,
  files: File[],
): PinataUploadBuilder<PinataUploadResult> {
  return new FileArrayUploadBuilder(pinner, files);
}

/**
 * Create a JSON upload builder.
 */
export function createJsonUploadBuilder(
  pinner: Pinner,
  data: object,
): PinataUploadBuilder<PinataUploadResult> {
  return new EncodedUploadBuilder(pinner, (name, keyvalues) =>
    jsonToFile(data, { name, keyvalues }),
  );
}

/**
 * Create a base64 upload builder.
 */
export function createBase64UploadBuilder(
  pinner: Pinner,
  base64String: string,
): PinataUploadBuilder<PinataUploadResult> {
  return new EncodedUploadBuilder(pinner, (name, keyvalues) =>
    base64ToFile(base64String, { name, keyvalues }),
  );
}

/**
 * Create a URL upload builder.
 */
export function createUrlUploadBuilder(
  pinner: Pinner,
  urlString: string,
  options?: UrlUploadBuilderOptions,
): PinataUploadBuilder<PinataUploadResult> {
  // Validate URL to prevent SSRF attacks
  validateUrl(urlString);

  return new EncodedUploadBuilder(pinner, (name, keyvalues) =>
    urlToFile(urlString, { name, keyvalues, fetch: options?.fetch }),
  );
}

/**
 * Create a CID upload builder.
 */
export function createCidUploadBuilder(
  pinner: Pinner,
  cidString: string,
): PinataUploadBuilder<void> {
  return new CidUploadBuilder(pinner, cidString);
}
