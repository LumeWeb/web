import type { CsvFormatterOptions } from "./csv-options";

/**
 * Handles formatting of individual CSV fields including quoting and escaping.
 * 
 * This implementation is derived from @fast-csv/format (https://github.com/C2FO/fast-csv)
 * Copyright (c) 2011 C2FO Labs, LLC
 * Licensed under the MIT License
 */
export class FieldFormatter {
  private options: CsvFormatterOptions;
  private _headers: string[] | null = null;
  private quoteReplaceRegExp: RegExp;
  private escapePatternRegExp: RegExp;

  constructor(options: CsvFormatterOptions) {
    this.options = options;

    if (Array.isArray(options.headers)) {
      this._headers = options.headers;
    } else {
      this._headers = null;
    }

    const quote = options.quote === true ? '"' : (options.quote === false ? '' : options.quote ?? '"');
    this.quoteReplaceRegExp = new RegExp(quote, 'g');

    const escapePattern = `[${options.delimiter || ','}${this.#escapeRegExpString(options.rowDelimiter || '\n')}|\r|\n]`;
    this.escapePatternRegExp = new RegExp(escapePattern);
  }

  get headers(): string[] | null {
    return this._headers;
  }

  set headers(headers: string[] | null) {
    this._headers = headers;
  }

  /**
   * Escape special regex characters in a string.
   */
  #escapeRegExpString(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Determine if a field should be quoted.
   */
  private shouldQuote(fieldIndex: number, isHeader: boolean): boolean {
    const quoteConfig = isHeader 
      ? this.options.quoteHeaders 
      : this.options.quoteColumns;

    if (typeof quoteConfig === 'boolean') {
      return quoteConfig;
    }

    if (Array.isArray(quoteConfig)) {
      return quoteConfig[fieldIndex] === true;
    }

    if (this._headers !== null && typeof quoteConfig === 'object') {
      return quoteConfig[this._headers[fieldIndex]] === true;
    }

    return false;
  }

  /**
   * Format a single field value.
   */
  format(field: unknown, fieldIndex: number, isHeader: boolean): string {
    const quote = this.options.quote === true ? '"' : (this.options.quote === false ? '' : this.options.quote ?? '"');
    const escape = this.options.escape ?? quote;

    // Convert to string, handle null/undefined
    const preparedField = `${field == null ? '' : field}`.replace(/\0/g, '');

    // Handle quote escaping
    if (quote !== '') {
      const shouldEscape = preparedField.indexOf(quote) !== -1;
      if (shouldEscape) {
        return this.quoteField(preparedField.replace(this.quoteReplaceRegExp, `${escape}${quote}`));
      }
    }

    // Check if field needs quoting (contains delimiter, row delimiter, etc.)
    const hasEscapeCharacters = preparedField.search(this.escapePatternRegExp) !== -1;
    if (hasEscapeCharacters || this.shouldQuote(fieldIndex, isHeader)) {
      return this.quoteField(preparedField);
    }

    return preparedField;
  }

  /**
   * Quote a field value.
   */
  private quoteField(field: string): string {
    const quote = this.options.quote === true ? '"' : (this.options.quote === false ? '' : this.options.quote ?? '"');
    return `${quote}${field}${quote}`;
  }
}
