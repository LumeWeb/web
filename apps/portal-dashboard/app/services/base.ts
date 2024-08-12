import type { BaseRecord, DataProvider, ResourceProps } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";

abstract class BaseService {
  public abstract register(): void;
  public abstract id(): string;
  public abstract name(): string;
  public abstract dataProvider(): Promise<DataProvider>;
  public abstract resources(): ResourceProps[];
  public abstract UIUploadQueueColumns(): ColumnDef<any, any>[];
  public abstract UIUploadQueueResource(): string;
}

export default BaseService;
