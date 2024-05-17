import { Buffer } from "buffer";
import { CID, NodeId } from "@lumeweb/libs5-encoding";
import { MediaFormat, MediaLinks } from "./media";
import {
  DirectoryDetails,
  DirectoryReference,
  FileReference,
  FileVersion,
  FileVersionThumbnail,
} from "./directory";
import { OrderedMap, OrderedSet } from "immutable";

export class Packer {
  private _bufSize: number;
  private _buf!: Buffer;
  private _d!: DataView;
  private _offset: number = 0;
  private _builder: Buffer[] = [];
  private _strCodec = new TextEncoder();

  constructor(bufSize: number = 64) {
    this._bufSize = bufSize;
    this._newBuf(this._bufSize);
  }

  private _newBuf(size: number) {
    this._buf = Buffer.alloc(size);
    this._d = new DataView(this._buf.buffer, this._buf.byteOffset);
    this._offset = 0;
  }

  private _nextBuf() {
    this._flushBuf();
    this._bufSize *= 2;
    this._newBuf(this._bufSize);
  }

  private _flushBuf() {
    this._builder.push(this._buf.slice(0, this._offset));
  }

  private _putBytes(bytes: Buffer | Uint8Array) {
    const length = bytes.length;
    if (this._buf.length - this._offset < length) {
      this._nextBuf();
    }
    if (this._offset === 0) {
      this._builder.push(Buffer.from(bytes));
    } else {
      this._buf.set(bytes, this._offset);
      this._offset += length;
    }
  }

  public packNull() {
    if (this._buf.length - this._offset < 1) {
      this._nextBuf();
    }
    this._d.setUint8(this._offset++, 0xc0);
  }

  public packBool(v: boolean | null) {
    if (this._buf.length - this._offset < 1) {
      this._nextBuf();
    }
    if (v === null) {
      this._d.setUint8(this._offset++, 0xc0);
    } else {
      this._d.setUint8(this._offset++, v ? 0xc3 : 0xc2);
    }
  }

  public packInt(v: number | null) {
    if (this._buf.length - this._offset < 9) {
      this._nextBuf();
    }
    if (v === null) {
      this._d.setUint8(this._offset++, 0xc0);
    } else if (v >= 0) {
      if (v <= 127) {
        this._d.setUint8(this._offset++, v);
      } else if (v <= 0xff) {
        this._d.setUint8(this._offset++, 0xcc);
        this._d.setUint8(this._offset++, v);
      } else if (v <= 0xffff) {
        this._d.setUint8(this._offset++, 0xcd);
        this._d.setUint16(this._offset, v);
        this._offset += 2;
      } else if (v <= 0xffffffff) {
        this._d.setUint8(this._offset++, 0xce);
        this._d.setUint32(this._offset, v);
        this._offset += 4;
      } else {
        this._d.setUint8(this._offset++, 0xcf);
        this._d.setBigUint64(this._offset, BigInt(v));
        this._offset += 8;
      }
    } else {
      if (v >= -32) {
        this._d.setInt8(this._offset++, v);
      } else if (v >= -128) {
        this._d.setUint8(this._offset++, 0xd0);
        this._d.setInt8(this._offset++, v);
      } else if (v >= -32768) {
        this._d.setUint8(this._offset++, 0xd1);
        this._d.setInt16(this._offset, v);
        this._offset += 2;
      } else if (v >= -2147483648) {
        this._d.setUint8(this._offset++, 0xd2);
        this._d.setInt32(this._offset, v);
        this._offset += 4;
      } else {
        this._d.setUint8(this._offset++, 0xd3);
        this._d.setBigInt64(this._offset, BigInt(v));
        this._offset += 8;
      }
    }
  }

  public packDouble(v: number | null) {
    if (this._buf.length - this._offset < 9) {
      this._nextBuf();
    }
    if (v === null) {
      this._d.setUint8(this._offset++, 0xc0);
      return;
    }
    this._d.setUint8(this._offset++, 0xcb);
    this._d.setFloat64(this._offset, v);
    this._offset += 8;
  }

  public packString(v: string | null) {
    if (this._buf.length - this._offset < 5) {
      this._nextBuf();
    }
    if (v === null) {
      this._d.setUint8(this._offset++, 0xc0);
      return;
    }
    const encoded = this._strCodec.encode(v);
    const length = encoded.length;
    if (length <= 31) {
      this._d.setUint8(this._offset++, 0xa0 | length);
    } else if (length <= 0xff) {
      this._d.setUint8(this._offset++, 0xd9);
      this._d.setUint8(this._offset++, length);
    } else if (length <= 0xffff) {
      this._d.setUint8(this._offset++, 0xda);
      this._d.setUint16(this._offset, length);
      this._offset += 2;
    } else if (length <= 0xffffffff) {
      this._d.setUint8(this._offset++, 0xdb);
      this._d.setUint32(this._offset, length);
      this._offset += 4;
    } else {
      throw new Error("Max String length is 0xFFFFFFFF");
    }
    this._putBytes(Buffer.from(encoded));
  }

  public packStringEmptyIsNull(v: string | null) {
    if (v === null || v === "") {
      this.packNull();
    } else {
      this.packString(v);
    }
  }

  public packBinary(buffer: Buffer | null) {
    if (this._buf.length - this._offset < 5) {
      this._nextBuf();
    }
    if (buffer === null) {
      this._d.setUint8(this._offset++, 0xc0);
      return;
    }
    const length = buffer.length;
    if (length <= 0xff) {
      this._d.setUint8(this._offset++, 0xc4);
      this._d.setUint8(this._offset++, length);
    } else if (length <= 0xffff) {
      this._d.setUint8(this._offset++, 0xc5);
      this._d.setUint16(this._offset, length);
      this._offset += 2;
    } else if (length <= 0xffffffff) {
      this._d.setUint8(this._offset++, 0xc6);
      this._d.setUint32(this._offset, length);
      this._offset += 4;
    } else {
      throw new Error("Max binary length is 0xFFFFFFFF");
    }
    this._putBytes(buffer);
  }

  public packListLength(length: number | null) {
    if (this._buf.length - this._offset < 5) {
      this._nextBuf();
    }
    if (length === null) {
      this._d.setUint8(this._offset++, 0xc0);
    } else if (length <= 0xf) {
      this._d.setUint8(this._offset++, 0x90 | length);
    } else if (length <= 0xffff) {
      this._d.setUint8(this._offset++, 0xdc);
      this._d.setUint16(this._offset, length);
      this._offset += 2;
    } else if (length <= 0xffffffff) {
      this._d.setUint8(this._offset++, 0xdd);
      this._d.setUint32(this._offset, length);
      this._offset += 4;
    } else {
      throw new Error("Max list length is 0xFFFFFFFF");
    }
  }

  public packMapLength(length: number | null) {
    if (this._buf.length - this._offset < 5) {
      this._nextBuf();
    }
    if (length === null) {
      this._d.setUint8(this._offset++, 0xc0);
    } else if (length <= 0xf) {
      this._d.setUint8(this._offset++, 0x80 | length);
    } else if (length <= 0xffff) {
      this._d.setUint8(this._offset++, 0xde);
      this._d.setUint16(this._offset, length);
      this._offset += 2;
    } else if (length <= 0xffffffff) {
      this._d.setUint8(this._offset++, 0xdf);
      this._d.setUint32(this._offset, length);
      this._offset += 4;
    } else {
      throw new Error("Max map length is 0xFFFFFFFF");
    }
  }

  public takeBytes(): Buffer {
    if (this._builder.length === 0) {
      return this._buf.slice(0, this._offset);
    }

    this._flushBuf();
    return Buffer.concat(this._builder);
  }

  public pack(v: any): this {
    if (v === null) {
      this.packNull();
    } else if (typeof v === "number") {
      if (Number.isInteger(v)) {
        this.packInt(v);
      } else {
        this.packDouble(v);
      }
    } else if (typeof v === "boolean") {
      this.packBool(v);
    } else if (typeof v === "string") {
      this.packString(v);
    } else if (v instanceof Uint8Array) {
      this.packBinary(Buffer.from(v));
    } else if (Array.isArray(v)) {
      this.packListLength(v.length);
      for (const item of v) {
        this.pack(item);
      }
    } else if (v instanceof Map) {
      this.packMapLength(v.size);
      v.forEach((value, key) => {
        this.pack(key);
        this.pack(value);
      });
    } else if (OrderedMap.isOrderedMap(v)) {
      this.packMapLength(v.size);
      v.forEach((value, key) => {
        this.pack(key);
        this.pack(value);
      });
    } else if (OrderedSet.isOrderedSet(v)) {
      this.pack(v.toArray());
    } else if (
      v instanceof MediaFormat ||
      v instanceof MediaLinks ||
      v instanceof DirectoryReference ||
      v instanceof DirectoryDetails ||
      v instanceof FileReference ||
      v instanceof FileVersion ||
      v instanceof FileVersionThumbnail
    ) {
      this.pack(v.encodeData());
    } else if (v instanceof CID) {
      this.pack(v.toBytes());
    } else if (v instanceof NodeId) {
      this.pack(v.bytes);
    } else if (typeof v === "object") {
      this.packMapLength(Object.keys(v).length);
      for (const [key, value] of Object.entries(v)) {
        this.pack(key);
        this.pack(value);
      }
    } else {
      throw new Error(`Could not pack type: ${typeof v}`);
    }

    return this;
  }
}
