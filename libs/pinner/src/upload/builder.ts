import type { Pinner } from "@/pinner";
import type { PinnerUploadBuilder } from "@/types/upload";
import type { UploadOptions, UploadOperation } from "@/types/upload";
import { jsonToFile, base64ToFile, urlToFile, csvToFile, textToFile } from "@/encoder";

/**
 * Base upload builder with common name/keyvalues functionality.
 */
abstract class BaseUploadBuilder implements PinnerUploadBuilder {
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

  abstract pin(): Promise<UploadOperation>;

  protected buildOptions(): UploadOptions {
    const options: UploadOptions = {};
    if (this._name !== undefined) {
      options.name = this._name;
    }
    if (this._keyvalues !== undefined) {
      options.keyvalues = this._keyvalues;
    }
    return options;
  }
}

/**
 * File upload builder.
 */
class FileUploadBuilder extends BaseUploadBuilder {
  constructor(
    pinner: Pinner,
    private file: File,
  ) {
    super(pinner);
  }

  async pin(): Promise<UploadOperation> {
    return this.pinner.upload(this.file, this.buildOptions());
  }
}

/**
 * Encoded upload builder - handles JSON, Base64, and URL uploads using encoders.
 */
class EncodedUploadBuilder extends BaseUploadBuilder {
  constructor(
    pinner: Pinner,
    private encoderFn: (
      name?: string,
      keyvalues?: Record<string, string>,
    ) => Promise<{ file: File; options: UploadOptions }>,
  ) {
    super(pinner);
  }

  async pin(): Promise<UploadOperation> {
    const encoded = await this.encoderFn(this._name, this._keyvalues);
    return this.pinner.upload(encoded.file, encoded.options);
  }
}

/**
 * Raw CAR upload builder - handles raw CAR file uploads without preprocessing.
 */
class RawUploadBuilder extends BaseUploadBuilder {
  constructor(
    pinner: Pinner,
    private carInput: File | ReadableStream<Uint8Array>,
  ) {
    super(pinner);
  }

  async pin(): Promise<UploadOperation> {
    return this.pinner.uploadCar(this.carInput, this.buildOptions());
  }
}

/**
 * Pinner upload builder namespace.
 * Provides fluent API for file, JSON, Base64, and URL uploads.
 */
export class UploadBuilderNamespace {
  constructor(private pinner: Pinner) {}

  /**
   * Upload a file.
   * Returns a builder for chaining name/keyvalues.
   */
  file(file: File): PinnerUploadBuilder {
    return new FileUploadBuilder(this.pinner, file);
  }

  /**
   * Upload JSON data (encoded as JSON file).
   * Returns a builder for chaining name/keyvalues.
   */
  json(data: object): PinnerUploadBuilder {
    return new EncodedUploadBuilder(this.pinner, (name, keyvalues) =>
      jsonToFile(data, { name, keyvalues }),
    );
  }

  /**
   * Upload Base64 encoded content (decoded and uploaded as file).
   * Returns a builder for chaining name/keyvalues.
   */
  base64(base64String: string): PinnerUploadBuilder {
    return new EncodedUploadBuilder(this.pinner, (name, keyvalues) =>
      base64ToFile(base64String, { name, keyvalues }),
    );
  }

  /**
   * Upload content from a URL (fetched and uploaded as file).
   * Returns a builder for chaining name/keyvalues.
   */
  url(urlString: string): PinnerUploadBuilder {
    return new EncodedUploadBuilder(this.pinner, (name, keyvalues) =>
      urlToFile(urlString, { name, keyvalues }),
    );
  }

  /**
   * Upload CSV data (string, array of objects, or array of arrays).
   * Returns a builder for chaining name/keyvalues.
   */
  csv(data: string | object[] | any[][]): PinnerUploadBuilder {
    return new EncodedUploadBuilder(this.pinner, (name, keyvalues) =>
      csvToFile(data, { name, keyvalues }),
    );
  }

  /**
   * Upload raw CAR data without preprocessing.
   * Useful for passthrough of pre-generated CAR files.
   * Returns a builder for chaining name/keyvalues.
   */
  raw(carInput: File | ReadableStream<Uint8Array>): PinnerUploadBuilder {
    return new RawUploadBuilder(this.pinner, carInput);
  }

  /**
   * Upload text content (encoded as text file).
   * Returns a builder for chaining name/keyvalues.
   */
  text(textData: string): PinnerUploadBuilder {
    return new EncodedUploadBuilder(this.pinner, (name, keyvalues) =>
      textToFile(textData, { name, keyvalues }),
    );
  }

  /**
   * Alias for text() - upload text content.
   */
  get content(): (textData: string) => PinnerUploadBuilder {
    return (textData: string) => this.text(textData);
  }
}

/**
 * Create a Pinner upload builder namespace.
 */
export function createUploadBuilderNamespace(
  pinner: Pinner,
): UploadBuilderNamespace {
  return new UploadBuilderNamespace(pinner);
}

/**
 * Combined interface for upload that works as both a method and a builder namespace.
 */
export type UploadMethodAndBuilder =
  & ((file: File, options?: UploadOptions) => Promise<UploadOperation>)
  & UploadBuilderNamespace;

/**
 * Export PinnerUploadBuilder for external use.
 */
export type { PinnerUploadBuilder };
