import type {
  CsvFormatterOptions,
  RowTransformCallback,
  RowTransform,
} from "./csv-options";
import { FieldFormatter } from "./field-formatter";

/**
 * Handles formatting of CSV rows including headers and column extraction.
 * 
 * This implementation is derived from @fast-csv/format (https://github.com/C2FO/fast-csv)
 * Copyright (c) 2011 C2FO Labs, LLC
 * Licensed under the MIT License
 */
export class RowFormatter {
  private options: CsvFormatterOptions;
  private fieldFormatter: FieldFormatter;
  private shouldWriteHeaders: boolean;
  private rowTransform: RowTransformCallback | null = null;
  private headers: string[] | null = null;
  private hasWrittenHeaders = false;
  private rowCount = 0;

  constructor(options: CsvFormatterOptions) {
    this.options = options;
    this.fieldFormatter = new FieldFormatter(options);
    this.headers = Array.isArray(options.headers) ? options.headers : null;
    this.shouldWriteHeaders = options.writeHeaders ?? (Array.isArray(options.headers) || options.headers === true);

    if (this.headers !== null) {
      this.fieldFormatter.headers = this.headers;
    }

    if (options.transform) {
      this.rowTransform = this.createTransform(options.transform);
    }
  }

  /**
   * Create a transform function that handles both sync and async transforms.
   */
  private createTransform(transformFn: RowTransform): RowTransformCallback {
    // Check if it's a sync transform (arity 1)
    if (transformFn.length === 1) {
      return (row: unknown, cb: RowTransformCallback) => {
        try {
          const transformedRow = (transformFn as (row: unknown) => unknown)(row);
          cb(null, transformedRow);
        } catch (e) {
          cb(e instanceof Error ? e : new Error(String(e)));
        }
      };
    }

    return transformFn as RowTransformCallback;
  }

  /**
   * Check if the transform is synchronous (arity 1).
   */
  private isSyncTransform(): boolean {
    if (!this.options.transform) {
      return true;
    }
    return this.options.transform.length === 1;
  }

  /**
   * Format a single row.
   */
  format(row: unknown): string[] {
    let transformedRow: unknown;

    // Apply transform if present
    if (this.rowTransform) {
      transformedRow = this.applyTransformSync(row);
    } else {
      transformedRow = row;
    }

    if (!transformedRow) {
      return [];
    }

    const rows: string[] = [];

    // Check headers
    const { shouldFormatColumns, headers } = this.checkHeaders(transformedRow);

    // Write headers if needed
    if (this.shouldWriteHeaders && headers && !this.hasWrittenHeaders) {
      rows.push(this.formatColumns(headers, true));
      this.hasWrittenHeaders = true;
    }

    // Format data row
    if (shouldFormatColumns) {
      const columns = this.gatherColumns(transformedRow);
      rows.push(this.formatColumns(columns, false));
    }

    return rows;
  }

  /**
   * Apply transform synchronously.
   * Note: This only supports sync transforms. Async transforms are not supported
   * in the synchronous format() method.
   */
  private applyTransformSync(row: unknown): unknown {
    if (!this.options.transform) {
      return row;
    }

    // Only sync transforms (arity 1) are supported
    if (this.isSyncTransform()) {
      try {
        return (this.options.transform as (row: unknown) => unknown)(row);
      } catch (e) {
        throw e instanceof Error ? e : new Error(String(e));
      }
    }

    throw new Error('Async transforms are not supported in synchronous CSV formatting');
  }

  /**
   * Finish formatting and return any trailing content.
   */
  finish(): string[] {
    const rows: string[] = [];

    // Write headers if alwaysWriteHeaders is true and no rows were written
    if (this.options.alwaysWriteHeaders && this.rowCount === 0) {
      if (!this.headers) {
        throw new Error('`alwaysWriteHeaders` option is set to true but `headers` option not provided.');
      }
      rows.push(this.formatColumns(this.headers, true));
    }

    // Add end row delimiter if configured
    if (this.options.includeEndRowDelimiter) {
      rows.push(this.options.rowDelimiter || '\n');
    }

    return rows;
  }

  /**
   * Check if headers need to be written.
   */
  private checkHeaders(row: unknown): { shouldFormatColumns: boolean; headers: string[] | null } {
    if (this.headers) {
      return { shouldFormatColumns: true, headers: this.headers };
    }

    const headers = this.gatherHeaders(row);
    this.headers = headers;
    this.fieldFormatter.headers = headers;

    if (!this.shouldWriteHeaders) {
      return { shouldFormatColumns: true, headers: null };
    }

    // If the row is equal to headers, don't format (it's the header row itself)
    if (Array.isArray(row) &&
        headers.every((header, i) => header === row[i])) {
      return { shouldFormatColumns: false, headers };
    }

    return { shouldFormatColumns: true, headers };
  }

  /**
   * Extract headers from a row.
   */
  private gatherHeaders(row: unknown): string[] {
    if (this.isRowHashArray(row)) {
      // Multi-dimensional array with item 0 being the header
      return (row as unknown[][]).map((it) => String(it[0]));
    }

    if (Array.isArray(row)) {
      return row.map(String);
    }

    return Object.keys(row as object);
  }

  /**
   * Check if row is a hash array (multi-dimensional array with [key, value] pairs).
   */
  private isRowHashArray(row: unknown): boolean {
    if (!Array.isArray(row)) {
      return false;
    }
    return Array.isArray(row[0]) && row[0].length === 2;
  }

  /**
   * Extract column values from a row.
   */
  private gatherColumns(row: unknown): unknown[] {
    if (this.headers === null) {
      throw new Error('Headers is currently null');
    }

    if (!Array.isArray(row)) {
      // Object: use headers to get values
      return this.headers.map((header) => (row as Record<string, unknown>)[header]);
    }

    if (this.isRowHashArray(row)) {
      // Hash array: extract values
      return this.headers.map((header, i) => {
        const col = (row as unknown[][])[i];
        return col ? col[1] : '';
      });
    }

    // Regular array
    if (!this.shouldWriteHeaders) {
      // If headers weren't written, return the row as-is
      return row;
    }

    // Map by header index
    return this.headers.map((_, i) => row[i]);
  }

  /**
   * Format columns into a CSV row string.
   */
  private formatColumns(columns: unknown[], isHeadersRow: boolean): string {
    const formattedCols = columns
      .map((field, i) => this.fieldFormatter.format(field, i, isHeadersRow))
      .join(this.options.delimiter || ',');

    const { rowCount } = this;
    this.rowCount += 1;

    // Add row delimiter before all rows except the first
    if (rowCount > 0) {
      return [this.options.rowDelimiter || '\n', formattedCols].join('');
    }

    return formattedCols;
  }
}
