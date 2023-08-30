export default class StorageLocation {
  type: number;
  parts: string[];
  binaryParts: Uint8Array[] = [];
  expiry: number; // Unix timestamp in seconds
  providerMessage?: Uint8Array; // Made optional, similar to `late` in Dart

  constructor(type: number, parts: string[], expiry: number) {
    this.type = type;
    this.parts = parts;
    this.expiry = expiry;
  }

  get bytesUrl(): string {
    return this.parts[0];
  }

  get outboardBytesUrl(): string {
    if (this.parts.length === 1) {
      return `${this.parts[0]}.obao`;
    }
    return this.parts[1];
  }

  toString(): string {
    const expiryDate = new Date(this.expiry * 1000);
    return `StorageLocation(${this.type}, ${
      this.parts
    }, expiry: ${expiryDate.toISOString()})`;
  }
}
