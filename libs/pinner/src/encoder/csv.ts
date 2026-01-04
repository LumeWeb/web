import type { Encoder, EncoderResult, UploadOptions } from "./types";
import { EncoderError } from "./error";
import {
  createCsvFormatter,
  type CsvFormatterOptions,
} from "./csv/csv-formatter";

/**
 * CSV encoder - converts CSV strings, arrays of objects, or arrays of arrays to File objects.
 * Uses a simplified CSV formatter without streaming support.
 *
 * This implementation is derived from @fast-csv/format (https://github.com/C2FO/fast-csv)
 * Copyright (c) 2011 C2FO Labs, LLC
 * Licensed under the MIT License
 */

/**
 * Extended upload options for CSV encoder.
 * Extends base UploadOptions with CSV formatting options.
 */
export interface CsvUploadOptions extends UploadOptions {
  /**
   * CSV formatting options.
   */
  csv?: CsvFormatterOptions;
}

/**
 * CSV encoder - converts CSV strings, arrays of objects, or arrays of arrays to File objects.
 * Uses a simplified CSV formatter without streaming support.
 */
export class CsvEncoder implements Encoder<string | object[] | any[][]> {
  async encode(
    input: string | object[] | any[][],
    options?: CsvUploadOptions,
  ): Promise<EncoderResult> {
    try {
      let csvContent: string;

      if (typeof input === "string") {
        // Raw CSV string - use as-is
        csvContent = input;
      } else if (Array.isArray(input)) {
        // Convert array to CSV using our formatter
        csvContent = this.#arrayToCsv(input, options?.csv);
      } else {
        throw new EncoderError(
          "Invalid CSV input: must be string or array",
          "INVALID_CSV",
        );
      }

      const blob = new Blob([csvContent], { type: "text/csv" });
      const file = new File([blob], options?.name || "data.csv", {
        type: "text/csv",
      });

      return {
        file,
        options: options || {},
      };
    } catch (error) {
      if (error instanceof EncoderError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new EncoderError(
          `CSV encoding failed: ${error.message}`,
          "INVALID_CSV",
          error,
        );
      }
      throw new EncoderError(
        "CSV encoding failed: unknown error",
        "INVALID_CSV",
      );
    }
  }

  #arrayToCsv(
    data: any[] | object[][],
    csvOptions?: CsvFormatterOptions,
  ): string {
    const formatter = createCsvFormatter({
      headers: true,
      ...csvOptions,
    });

    return formatter.format(data);
  }
}

/**
 * Encode CSV data to a File object.
 */
export async function csvToFile(
  data: string | object[] | any[][],
  options?: CsvUploadOptions,
): Promise<EncoderResult> {
  const encoder = new CsvEncoder();
  return encoder.encode(data, options);
}
