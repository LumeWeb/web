import type { CsvFormatterOptions } from "./csv-options";
import { RowFormatter } from "./row-formatter";

export type { CsvFormatterOptions };

/**
 * Simple CSV formatter without streaming support.
 * Converts arrays of objects or arrays to CSV strings.
 * 
 * This implementation is derived from @fast-csv/format (https://github.com/C2FO/fast-csv)
 * Copyright (c) 2011 C2FO Labs, LLC
 * Licensed under the MIT License
 */
export class CsvFormatter {
  private options: CsvFormatterOptions;
  private rowFormatter: RowFormatter;
  private hasWrittenBOM = false;

  constructor(options: CsvFormatterOptions = {}) {
    this.options = {
      objectMode: true,
      delimiter: ',',
      rowDelimiter: '\n',
      quote: '"',
      escape: undefined,
      quoteColumns: false,
      quoteHeaders: undefined,
      headers: null as string[] | null,
      writeHeaders: undefined,
      includeEndRowDelimiter: false,
      transform: undefined,
      writeBOM: false,
      BOM: '\ufeff',
      alwaysWriteHeaders: false,
      ...options,
    };

    // Set escape to quote if not provided
    if (typeof this.options.escape !== 'string') {
      this.options.escape = this.options.quote === true ? '"' : (this.options.quote as string);
    }

    // Set quoteHeaders to quoteColumns if not provided
    if (typeof this.options.quoteHeaders === 'undefined') {
      this.options.quoteHeaders = this.options.quoteColumns;
    }

    // Normalize quote option
    if (this.options.quote === true) {
      this.options.quote = '"';
    } else if (this.options.quote === false) {
      this.options.quote = '';
    }

    this.rowFormatter = new RowFormatter(this.options);
    this.hasWrittenBOM = !this.options.writeBOM;
  }

  /**
   * Format an array of rows to CSV string.
   */
  format(rows: unknown[]): string {
    const chunks: string[] = [];

    // Write BOM if configured
    if (!this.hasWrittenBOM) {
      chunks.push(this.options.BOM || '\ufeff');
      this.hasWrittenBOM = true;
    }

    // Format each row
    for (const row of rows) {
      const formattedRows = this.rowFormatter.format(row);
      chunks.push(...formattedRows);
    }

    // Add finish content (end row delimiter, etc.)
    const finishRows = this.rowFormatter.finish();
    chunks.push(...finishRows);

    return chunks.join('');
  }

  /**
   * Format a single row to CSV string.
   */
  formatRow(row: unknown): string {
    const chunks: string[] = [];

    // Write BOM if configured
    if (!this.hasWrittenBOM) {
      chunks.push(this.options.BOM || '\ufeff');
      this.hasWrittenBOM = true;
    }

    const formattedRows = this.rowFormatter.format(row);
    chunks.push(...formattedRows);

    return chunks.join('');
  }
}

/**
 * Create a CSV formatter with the given options.
 */
export function createCsvFormatter(options?: CsvFormatterOptions): CsvFormatter {
  return new CsvFormatter(options);
}
