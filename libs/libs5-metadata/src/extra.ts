import { IMetadata } from "./metadata";

export class Extra implements IMetadata {
  public data: Map<number, any>;

  constructor(data: Map<number, any> = new Map<number, any>()) {
    this.data = data;
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
