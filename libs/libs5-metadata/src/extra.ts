import { IMetadata } from "./metadata";

export class Extra implements IMetadata {
  public data: Map<number, any>;

  constructor(
    data: Map<number, any> | Record<string, any> = new Map<number, any>(),
  ) {
    if (data instanceof Map) {
      this.data = data;
    } else {
      this.data = new Map<number, any>(
        Object.entries(data).map(([key, value]) => [Number(key), value]),
      );
    }
  }

  encode(): Buffer {
    throw new Error("Method not implemented.");
  }

  decode(data: Buffer): boolean {
    throw new Error("Method not implemented.");
  }

  toJSON(): any {
    throw new Error("Method not implemented.");
  }
}
