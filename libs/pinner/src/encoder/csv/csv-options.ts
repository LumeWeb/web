/**
 * CSV formatting options.
 * 
 * This implementation is derived from @fast-csv/format (https://github.com/C2FO/fast-csv)
 * Copyright (c) 2011 C2FO Labs, LLC
 * Licensed under the MIT License
 * 
 * Options have been simplified and adapted for use in the LumeWeb Pinner library.
 */

/**
 * Callback type for async transform functions.
 */
export type RowTransformCallback<T = unknown> = (err: Error | null, row?: T) => void;

/**
 * Synchronous transform function - takes a row and returns a transformed row.
 */
export type SyncRowTransform<TInput = unknown, TOutput = unknown> = (row: TInput) => TOutput;

/**
 * Asynchronous transform function - takes a row and a callback.
 */
export type AsyncRowTransform<TInput = unknown, TOutput = unknown> = (
  row: TInput,
  cb: RowTransformCallback<TOutput>,
) => void;

/**
 * Combined transform type - can be sync or async.
 */
export type RowTransform<TInput = unknown, TOutput = unknown> =
  | SyncRowTransform<TInput, TOutput>
  | AsyncRowTransform<TInput, TOutput>;

/**
 * Quote configuration for columns/headers.
 * Can be a boolean (all or none), an array of booleans (per column),
 * or an object mapping header names to booleans.
 */
export type QuoteConfig = boolean | boolean[] | Record<string, boolean>;

/**
 * Headers configuration.
 * - `true`: infer headers from first row
 * - `false`: no headers
 * - `string[]`: use provided headers
 * - `null`: infer headers from first row
 */
export type HeadersConfig = string[] | boolean | null;

/**
 * CSV formatting options.
 */
export interface CsvFormatterOptions {
  /**
   * Set to true to enable object mode (default: true).
   * Objects will be converted to rows using their keys as headers.
   */
  objectMode?: boolean;

  /**
   * The delimiter to use (default: ',').
   */
  delimiter?: string;

  /**
   * The row delimiter to use (default: '\n').
   */
  rowDelimiter?: string;

  /**
   * The quote character to use (default: '"').
   * Set to false or empty string to disable quoting.
   */
  quote?: string | boolean;

  /**
   * The escape character to use (default: same as quote).
   */
  escape?: string;

  /**
   * Whether to quote all columns (default: false).
   */
  quoteColumns?: QuoteConfig;

  /**
   * Whether to quote headers (default: same as quoteColumns).
   */
  quoteHeaders?: QuoteConfig;

  /**
   * The headers to write.
   */
  headers?: HeadersConfig;

  /**
   * Whether to write the headers (default: true when headers are provided).
   */
  writeHeaders?: boolean;

  /**
   * Whether to include the row delimiter at the end of the file (default: false).
   */
  includeEndRowDelimiter?: boolean;

  /**
   * A function to transform each row before formatting.
   * Can be a sync function (arity 1) or an async function (arity 2 with callback).
   */
  transform?: RowTransform;

  /**
   * Whether to write the BOM (Byte Order Mark) at the beginning of the file (default: false).
   */
  writeBOM?: boolean;

  /**
   * The BOM character (default: '\ufeff').
   */
  BOM?: string;

  /**
   * Whether to write headers even if no rows were written (default: false).
   */
  alwaysWriteHeaders?: boolean;
}

export type CsvFormatterOptionsArgs = CsvFormatterOptions;
