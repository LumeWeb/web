import type { CrudFilters, DataProvider, ResourceProps } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { CID } from "multiformats/cid";

export interface FileBlob {
  name: string;
  mimeType: string;
  blob: Blob;
}

export type BreadCrumbPath = BreadCrumbPathPart[];

export interface BreadCrumbPathPart {
  name: string;
  cid: CID;
}

export interface BreadCrumbPathHook {
  (): Promise<BreadCrumbPath>;
}

export interface NavigateToCIDHook {
  (cid: CID): void;
}

abstract class BaseService {
  public abstract register(): void;

  public abstract id(): string;

  public abstract name(): string;

  public abstract dataProvider(): Promise<DataProvider>;

  public abstract resources(): ResourceProps[];

  public abstract UIUploadQueueColumns(): ColumnDef<any, any>[];

  public abstract UIFileManagerColumns(): ColumnDef<any, any>[];

  public abstract UINavigateToCIDHook(): NavigateToCIDHook;

  public abstract UIFileManagerCurrentBreadcrumbPathHook(): BreadCrumbPathHook;

  public abstract UIGetSearchFilters(query: string): CrudFilters;

  public abstract UIGetHasActiveUploads(): boolean;

  public abstract validateCid(cid: string): boolean;

  public abstract downloadFile(cid: CID): Promise<FileBlob>;
}

export default BaseService;
