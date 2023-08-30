export default class Unpacker {
  private _list: Buffer;
  private _offset: number = 0;
  private _d: DataView;

  constructor(list: Buffer) {
    this._list = list;
    this._d = new DataView(list.buffer, list.byteOffset);
  }

  public static fromPacked(data: Uint8Array) {
    return new Unpacker(Buffer.from(data));
  }

  public unpackBool(): boolean | null {
    const b = this._d.getUint8(this._offset++);
    if (b === 0xc2) return false;
    if (b === 0xc3) return true;
    if (b === 0xc0) return null;
    throw this._formatException("bool", b);
  }

  public unpackInt(): number | null {
    const b = this._d.getUint8(this._offset++);
    if (b <= 0x7f || (b >= 0xe0 && b <= 0xff)) {
      return b;
    } else if (b === 0xcc) {
      return this._d.getUint8(this._offset++);
    } else if (b === 0xcd) {
      this._offset += 2;
      return this._d.getUint16(this._offset - 2);
    } else if (b === 0xce) {
      this._offset += 4;
      return this._d.getUint32(this._offset - 4);
    } else if (b === 0xcf) {
      this._offset += 8;
      const high = this._d.getUint32(this._offset - 8);
      const low = this._d.getUint32(this._offset - 4);
      return high * 0x100000000 + low;
    } else if (b === 0xd0) {
      return this._d.getInt8(this._offset++);
    } else if (b === 0xd1) {
      this._offset += 2;
      return this._d.getInt16(this._offset - 2);
    } else if (b === 0xd2) {
      this._offset += 4;
      return this._d.getInt32(this._offset - 4);
    } else if (b === 0xd3) {
      this._offset += 8;
      const high = this._d.getInt32(this._offset - 8);
      const low = this._d.getUint32(this._offset - 4);
      return high * 0x100000000 + low;
    } else if (b === 0xc0) {
      return null;
    } else {
      throw this._formatException("integer", b);
    }
  }

  public unpackDouble(): number | null {
    const b = this._d.getUint8(this._offset++);
    if (b === 0xca) {
      this._offset += 4;
      return this._d.getFloat32(this._offset - 4);
    } else if (b === 0xcb) {
      this._offset += 8;
      return this._d.getFloat64(this._offset - 8);
    } else if (b === 0xc0) {
      return null;
    } else {
      throw this._formatException("double", b);
    }
  }
  public unpackString(): string | null {
    const b = this._d.getUint8(this._offset++);
    let len: number;
    if ((b & 0xe0) === 0xa0) {
      len = b & 0x1f;
    } else if (b === 0xd9) {
      len = this._d.getUint8(this._offset++);
    } else if (b === 0xda) {
      this._offset += 2;
      len = this._d.getUint16(this._offset - 2);
    } else if (b === 0xdb) {
      this._offset += 4;
      len = this._d.getUint32(this._offset - 4);
    } else if (b === 0xc0) {
      return null;
    } else {
      throw this._formatException("String", b);
    }
    const str = this._list.toString("utf-8", this._offset, this._offset + len);
    this._offset += len;
    return str;
  }

  public unpackBinary(): Buffer {
    const b = this._d.getUint8(this._offset++);
    let len: number;
    if (b === 0xc4) {
      len = this._d.getUint8(this._offset++);
    } else if (b === 0xc5) {
      this._offset += 2;
      len = this._d.getUint16(this._offset - 2);
    } else if (b === 0xc6) {
      this._offset += 4;
      len = this._d.getUint32(this._offset - 4);
    } else if (b === 0xc0) {
      len = 0;
    } else {
      throw this._formatException("Binary", b);
    }
    const data = this._list.slice(this._offset, this._offset + len);
    this._offset += len;
    return data;
  }

  public unpackList(): any[] {
    const length = this.unpackListLength();
    return Array.from({ length }, () => this._unpack());
  }

  public unpackMap(): { [key: string]: any } {
    const length = this.unpackMapLength();
    const obj: { [key: string]: any } = {};
    for (let i = 0; i < length; i++) {
      const key = this._unpack();
      obj[key as string] = this._unpack();
    }
    return obj;
  }

  public unpackListLength(): number {
    const b = this._d.getUint8(this._offset++);
    if ((b & 0xf0) === 0x90) {
      return b & 0xf;
    } else if (b === 0xdc) {
      this._offset += 2;
      return this._d.getUint16(this._offset - 2);
    } else if (b === 0xdd) {
      this._offset += 4;
      return this._d.getUint32(this._offset - 4);
    } else if (b === 0xc0) {
      return 0;
    } else {
      throw this._formatException("List length", b);
    }
  }

  public unpackMapLength(): number {
    const b = this._d.getUint8(this._offset++);
    if ((b & 0xf0) === 0x80) {
      return b & 0xf;
    } else if (b === 0xde) {
      this._offset += 2;
      return this._d.getUint16(this._offset - 2);
    } else if (b === 0xdf) {
      this._offset += 4;
      return this._d.getUint32(this._offset - 4);
    } else if (b === 0xc0) {
      return 0;
    } else {
      throw this._formatException("Map length", b);
    }
  }

  private _unpack(): any {
    const b = this._d.getUint8(this._offset);
    if (b <= 0x7f || (b >= 0xe0 && b <= 0xff)) {
      return this.unpackInt();
    } else if (b === 0xc2 || b === 0xc3 || b === 0xc0) {
      return this.unpackBool();
    } else if (b === 0xca || b === 0xcb) {
      return this.unpackDouble();
    } else if ((b & 0xe0) === 0xa0 || b === 0xd9 || b === 0xda || b === 0xdb) {
      return this.unpackString();
    } else if (b === 0xc4 || b === 0xc5 || b === 0xc6) {
      return this.unpackBinary();
    } else if ((b & 0xf0) === 0x90 || b === 0xdc || b === 0xdd) {
      return this.unpackList();
    } else if ((b & 0xf0) === 0x80 || b === 0xde || b === 0xdf) {
      return this.unpackMap();
    } else {
      throw this._formatException("Unknown", b);
    }
  }
  // Implement other methods here, following the same pattern as unpackBool and unpackInt

  private _formatException(type: string, b: number) {
    return new Error(
      `Try to unpack ${type} value, but it's not a ${type}, byte = ${b}`,
    );
  }
}
