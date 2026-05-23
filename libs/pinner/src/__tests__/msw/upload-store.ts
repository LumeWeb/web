import { MapStore } from "./store";
import { createMockCID } from "../setup";

export interface TusFile {
  id: string;
  /** Current offset / bytes uploaded */
  size: number;
  /** Total size (from Upload-Length header) */
  upload_length?: string;
  /** If length is deferred */
  upload_defer_length?: string;
  /** Metadata from creation */
  upload_metadata?: string;
}

export class TusStore extends MapStore<string, TusFile> {
  private uploadCounter = 0;

  constructor() {
    super();
  }

  getNextUploadId(): string {
    this.uploadCounter++;
    return `test-upload-id`;
  }

  getTusFile(fileId: string): TusFile | undefined {
    return this.get(fileId);
  }

  createTusFile(
    fileId: string,
    uploadLength?: string,
    uploadMetadata?: string,
  ): TusFile {
    const file: TusFile = {
      id: fileId,
      size: 0,
      upload_length: uploadLength,
      upload_metadata: uploadMetadata,
    };
    this.set(fileId, file);
    return file;
  }

  updateTusFileOffset(fileId: string, newOffset: number): void {
    const file = this.get(fileId);
    if (file) {
      file.size = newOffset;
    }
  }

  deleteTusFile(fileId: string): void {
    this.delete(fileId);
  }

  override reset(): void {
    super.reset();
    this.uploadCounter = 0;
  }
}

export interface MockOperation {
  id: number;
  operation: string;
  operation_display_name: string;
  cid: string;
  status: string;
  status_display_name: string;
  status_message: string;
  error?: string;
  progress_percent: number;
  protocol: string;
  protocol_display_name: string;
  started_at: string;
  updated_at: string;
  current_step: number;
  total_steps: number;
}

export class OperationStore extends MapStore<number, MockOperation> {
  private operationCounter = 0;

  constructor() {
    super();
  }

  getNextOperationId(): number {
    this.operationCounter++;
    return this.operationCounter;
  }

  async createMockOperation(
    operationId: number,
    overrides: Partial<{
      status: string;
      error?: string;
      cid?: string;
      operation?: string;
      operation_display_name?: string;
    }> = {},
  ): Promise<MockOperation> {
    const mockCid = overrides.cid || (await createMockCID(operationId));

    return {
      id: operationId,
      operation: overrides.operation || "pin",
      operation_display_name: overrides.operation_display_name || "Pin Content",
      cid: mockCid,
      status: overrides.status || "completed",
      status_display_name: overrides.status === "failed" ? "Failed" : "Completed",
      status_message:
        overrides.status === "failed"
          ? "Pinning failed"
          : "Pinning completed successfully",
      error: overrides.error,
      progress_percent: overrides.status === "failed" ? 0 : 100,
      protocol: "ipfs",
      protocol_display_name: "IPFS",
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      current_step: overrides.status === "failed" ? 0 : 1,
      total_steps: 1,
    };
  }

  override reset(): void {
    super.reset();
    this.operationCounter = 0;
  }
}
