import { c as commonjsGlobal, r as reactExports, b as getAugmentedNamespace, g as getDefaultExportFromCjs, R as React } from "./jsx-runtime-CzXAEjbZ.js";
var buffer = {};
var base64Js = {};
base64Js.byteLength = byteLength;
base64Js.toByteArray = toByteArray;
base64Js.fromByteArray = fromByteArray;
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;
  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 255;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(
      lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
    );
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}
var ieee754 = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
ieee754.read = function(buffer2, offset, isLE, mLen, nBytes) {
  var e2, m2;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer2[offset + i];
  i += d;
  e2 = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e2 = e2 * 256 + buffer2[offset + i], i += d, nBits -= 8) {
  }
  m2 = e2 & (1 << -nBits) - 1;
  e2 >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m2 = m2 * 256 + buffer2[offset + i], i += d, nBits -= 8) {
  }
  if (e2 === 0) {
    e2 = 1 - eBias;
  } else if (e2 === eMax) {
    return m2 ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m2 = m2 + Math.pow(2, mLen);
    e2 = e2 - eBias;
  }
  return (s ? -1 : 1) * m2 * Math.pow(2, e2 - mLen);
};
ieee754.write = function(buffer2, value, offset, isLE, mLen, nBytes) {
  var e2, m2, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m2 = isNaN(value) ? 1 : 0;
    e2 = eMax;
  } else {
    e2 = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e2)) < 1) {
      e2--;
      c *= 2;
    }
    if (e2 + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e2++;
      c /= 2;
    }
    if (e2 + eBias >= eMax) {
      m2 = 0;
      e2 = eMax;
    } else if (e2 + eBias >= 1) {
      m2 = (value * c - 1) * Math.pow(2, mLen);
      e2 = e2 + eBias;
    } else {
      m2 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e2 = 0;
    }
  }
  for (; mLen >= 8; buffer2[offset + i] = m2 & 255, i += d, m2 /= 256, mLen -= 8) {
  }
  e2 = e2 << mLen | m2;
  eLen += mLen;
  for (; eLen > 0; buffer2[offset + i] = e2 & 255, i += d, e2 /= 256, eLen -= 8) {
  }
  buffer2[offset + i - d] |= s * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(exports2) {
  const base64 = base64Js;
  const ieee754$1 = ieee754;
  const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
  exports2.Buffer = Buffer2;
  exports2.Buffer.Buffer = Buffer2;
  exports2.SlowBuffer = SlowBuffer;
  exports2.INSPECT_MAX_BYTES = 50;
  const K_MAX_LENGTH = 2147483647;
  exports2.kMaxLength = K_MAX_LENGTH;
  const { Uint8Array: GlobalUint8Array, ArrayBuffer: GlobalArrayBuffer, SharedArrayBuffer: GlobalSharedArrayBuffer } = globalThis;
  Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
  if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
    console.error(
      "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
    );
  }
  function typedArraySupport() {
    try {
      const arr = new GlobalUint8Array(1);
      const proto = { foo: function() {
        return 42;
      } };
      Object.setPrototypeOf(proto, GlobalUint8Array.prototype);
      Object.setPrototypeOf(arr, proto);
      return arr.foo() === 42;
    } catch (e2) {
      return false;
    }
  }
  Object.defineProperty(Buffer2.prototype, "parent", {
    enumerable: true,
    get: function() {
      if (!Buffer2.isBuffer(this)) return void 0;
      return this.buffer;
    }
  });
  Object.defineProperty(Buffer2.prototype, "offset", {
    enumerable: true,
    get: function() {
      if (!Buffer2.isBuffer(this)) return void 0;
      return this.byteOffset;
    }
  });
  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    const buf = new GlobalUint8Array(length);
    Object.setPrototypeOf(buf, Buffer2.prototype);
    return buf;
  }
  function Buffer2(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      }
      return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
  }
  Buffer2.poolSize = 8192;
  function from(value, encodingOrOffset, length) {
    if (typeof value === "string") {
      return fromString(value, encodingOrOffset);
    }
    if (GlobalArrayBuffer.isView(value)) {
      return fromArrayView(value);
    }
    if (value == null) {
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
      );
    }
    if (isInstance(value, GlobalArrayBuffer) || value && isInstance(value.buffer, GlobalArrayBuffer)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof GlobalSharedArrayBuffer !== "undefined" && (isInstance(value, GlobalSharedArrayBuffer) || value && isInstance(value.buffer, GlobalSharedArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof value === "number") {
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    }
    const valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) {
      return Buffer2.from(valueOf, encodingOrOffset, length);
    }
    const b = fromObject(value);
    if (b) return b;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
      return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    }
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
    );
  }
  Buffer2.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };
  Object.setPrototypeOf(Buffer2.prototype, GlobalUint8Array.prototype);
  Object.setPrototypeOf(Buffer2, GlobalUint8Array);
  function assertSize(size) {
    if (typeof size !== "number") {
      throw new TypeError('"size" argument must be of type number');
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
  }
  function alloc(size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(size);
    }
    if (fill !== void 0) {
      return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    }
    return createBuffer(size);
  }
  Buffer2.alloc = function(size, fill, encoding) {
    return alloc(size, fill, encoding);
  };
  function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
  }
  Buffer2.allocUnsafe = function(size) {
    return allocUnsafe(size);
  };
  Buffer2.allocUnsafeSlow = function(size) {
    return allocUnsafe(size);
  };
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer2.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
    const length = byteLength2(string, encoding) | 0;
    let buf = createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) {
      buf = buf.slice(0, actual);
    }
    return buf;
  }
  function fromArrayLike(array) {
    const length = array.length < 0 ? 0 : checked(array.length) | 0;
    const buf = createBuffer(length);
    for (let i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255;
    }
    return buf;
  }
  function fromArrayView(arrayView) {
    if (isInstance(arrayView, GlobalUint8Array)) {
      const copy = new GlobalUint8Array(arrayView);
      return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return fromArrayLike(arrayView);
  }
  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds');
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds');
    }
    let buf;
    if (byteOffset === void 0 && length === void 0) {
      buf = new GlobalUint8Array(array);
    } else if (length === void 0) {
      buf = new GlobalUint8Array(array, byteOffset);
    } else {
      buf = new GlobalUint8Array(array, byteOffset, length);
    }
    Object.setPrototypeOf(buf, Buffer2.prototype);
    return buf;
  }
  function fromObject(obj) {
    if (Buffer2.isBuffer(obj)) {
      const len = checked(obj.length) | 0;
      const buf = createBuffer(len);
      if (buf.length === 0) {
        return buf;
      }
      obj.copy(buf, 0, 0, len);
      return buf;
    }
    if (obj.length !== void 0) {
      if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
        return createBuffer(0);
      }
      return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data);
    }
  }
  function checked(length) {
    if (length >= K_MAX_LENGTH) {
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
    }
    return length | 0;
  }
  function SlowBuffer(length) {
    if (+length != length) {
      length = 0;
    }
    return Buffer2.alloc(+length);
  }
  Buffer2.isBuffer = function isBuffer3(b) {
    return b != null && b._isBuffer === true && b !== Buffer2.prototype;
  };
  Buffer2.compare = function compare(a, b) {
    if (isInstance(a, GlobalUint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
    if (isInstance(b, GlobalUint8Array)) b = Buffer2.from(b, b.offset, b.byteLength);
    if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    }
    if (a === b) return 0;
    let x = a.length;
    let y = b.length;
    for (let i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
  };
  Buffer2.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  Buffer2.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
      return Buffer2.alloc(0);
    }
    let i;
    if (length === void 0) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }
    const buffer2 = Buffer2.allocUnsafe(length);
    let pos = 0;
    for (i = 0; i < list.length; ++i) {
      let buf = list[i];
      if (isInstance(buf, GlobalUint8Array)) {
        if (pos + buf.length > buffer2.length) {
          if (!Buffer2.isBuffer(buf)) buf = Buffer2.from(buf);
          buf.copy(buffer2, pos);
        } else {
          GlobalUint8Array.prototype.set.call(
            buffer2,
            buf,
            pos
          );
        }
      } else if (!Buffer2.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      } else {
        buf.copy(buffer2, pos);
      }
      pos += buf.length;
    }
    return buffer2;
  };
  function byteLength2(string, encoding) {
    if (Buffer2.isBuffer(string)) {
      return string.length;
    }
    if (GlobalArrayBuffer.isView(string) || isInstance(string, GlobalArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
      );
    }
    const len = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0) return 0;
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len;
        case "utf8":
        case "utf-8":
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len * 2;
        case "hex":
          return len >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length;
          }
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer2.byteLength = byteLength2;
  function slowToString(encoding, start, end) {
    let loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding) encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer2.prototype._isBuffer = true;
  function swap(b, n2, m2) {
    const i = b[n2];
    b[n2] = b[m2];
    b[m2] = i;
  }
  Buffer2.prototype.swap16 = function swap16() {
    const len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for (let i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this;
  };
  Buffer2.prototype.swap32 = function swap32() {
    const len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for (let i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this;
  };
  Buffer2.prototype.swap64 = function swap64() {
    const len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for (let i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this;
  };
  Buffer2.prototype.toString = function toString2() {
    const length = this.length;
    if (length === 0) return "";
    if (arguments.length === 0) return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
  Buffer2.prototype.equals = function equals(b) {
    if (!Buffer2.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
    if (this === b) return true;
    return Buffer2.compare(this, b) === 0;
  };
  Buffer2.prototype.inspect = function inspect2() {
    let str = "";
    const max2 = exports2.INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max2).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max2) str += " ... ";
    return "<Buffer " + str + ">";
  };
  if (customInspectSymbol) {
    Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
  }
  Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, GlobalUint8Array)) {
      target = Buffer2.from(target, target.offset, target.byteLength);
    }
    if (!Buffer2.isBuffer(target)) {
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
      );
    }
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = target ? target.length : 0;
    }
    if (thisStart === void 0) {
      thisStart = 0;
    }
    if (thisEnd === void 0) {
      thisEnd = this.length;
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end) {
      return 0;
    }
    if (thisStart >= thisEnd) {
      return -1;
    }
    if (start >= end) {
      return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    let x = thisEnd - thisStart;
    let y = end - start;
    const len = Math.min(x, y);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for (let i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
      }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
  };
  function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
    if (buffer2.length === 0) return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (numberIsNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer2.length - 1;
    }
    if (byteOffset < 0) byteOffset = buffer2.length + byteOffset;
    if (byteOffset >= buffer2.length) {
      if (dir) return -1;
      else byteOffset = buffer2.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1;
    }
    if (typeof val === "string") {
      val = Buffer2.from(val, encoding);
    }
    if (Buffer2.isBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer2, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (typeof GlobalUint8Array.prototype.indexOf === "function") {
        if (dir) {
          return GlobalUint8Array.prototype.indexOf.call(buffer2, val, byteOffset);
        } else {
          return GlobalUint8Array.prototype.lastIndexOf.call(buffer2, val, byteOffset);
        }
      }
      return arrayIndexOf(buffer2, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1;
    let arrLength = arr.length;
    let valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read(buf, i2) {
      if (indexSize === 1) {
        return buf[i2];
      } else {
        return buf.readUInt16BE(i2 * indexSize);
      }
    }
    let i;
    if (dir) {
      let foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        let found = true;
        for (let j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break;
          }
        }
        if (found) return i;
      }
    }
    return -1;
  }
  Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };
  Buffer2.prototype.indexOf = function indexOf2(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };
  Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    const remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    const strLen = string.length;
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    let i;
    for (i = 0; i < length; ++i) {
      const parsed = parseInt(string.substr(i * 2, 2), 16);
      if (numberIsNaN(parsed)) return i;
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer2.prototype.write = function write(string, offset, length, encoding) {
    if (offset === void 0) {
      encoding = "utf8";
      length = this.length;
      offset = 0;
    } else if (length === void 0 && typeof offset === "string") {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset >>> 0;
      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === void 0) encoding = "utf8";
      } else {
        encoding = length;
        length = void 0;
      }
    } else {
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    }
    const remaining = this.length - offset;
    if (length === void 0 || length > remaining) length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding) encoding = "utf8";
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "hex":
          return hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
          return utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
          return asciiWrite(this, string, offset, length);
        case "base64":
          return base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer2.prototype.toJSON = function toJSON() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i = start;
    while (i < end) {
      const firstByte = buf[i];
      let codePoint = null;
      let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  const MAX_ARGUMENTS_LENGTH = 4096;
  function decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 127);
    }
    return ret;
  }
  function latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    const len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;
    let out = "";
    for (let i = start; i < end; ++i) {
      out += hexSliceLookupTable[buf[i]];
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    const bytes = buf.slice(start, end);
    let res = "";
    for (let i = 0; i < bytes.length - 1; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  Buffer2.prototype.slice = function slice(start, end) {
    const len = this.length;
    start = ~~start;
    end = end === void 0 ? len : ~~end;
    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }
    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }
    if (end < start) end = start;
    const newBuf = this.subarray(start, end);
    Object.setPrototypeOf(newBuf, Buffer2.prototype);
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
    if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
  }
  Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength3 && (mul *= 256)) {
      val += this[offset + i] * mul;
    }
    return val;
  };
  Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      checkOffset(offset, byteLength3, this.length);
    }
    let val = this[offset + --byteLength3];
    let mul = 1;
    while (byteLength3 > 0 && (mul *= 256)) {
      val += this[offset + --byteLength3] * mul;
    }
    return val;
  };
  Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };
  Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };
  Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
  };
  Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };
  Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last2 = this[offset + 7];
    if (first === void 0 || last2 === void 0) {
      boundsError(offset, this.length - 8);
    }
    const lo2 = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last2 * 2 ** 24;
    return BigInt(lo2) + (BigInt(hi) << BigInt(32));
  });
  Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last2 = this[offset + 7];
    if (first === void 0 || last2 === void 0) {
      boundsError(offset, this.length - 8);
    }
    const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    const lo2 = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last2;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo2);
  });
  Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength3 && (mul *= 256)) {
      val += this[offset + i] * mul;
    }
    mul *= 128;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) checkOffset(offset, byteLength3, this.length);
    let i = byteLength3;
    let mul = 1;
    let val = this[offset + --i];
    while (i > 0 && (mul *= 256)) {
      val += this[offset + --i] * mul;
    }
    mul *= 128;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128)) return this[offset];
    return (255 - this[offset] + 1) * -1;
  };
  Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };
  Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };
  Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last2 = this[offset + 7];
    if (first === void 0 || last2 === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last2 << 24);
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
  });
  Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last2 = this[offset + 7];
    if (first === void 0 || last2 === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last2);
  });
  Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, true, 23, 4);
  };
  Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, false, 23, 4);
  };
  Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, true, 52, 8);
  };
  Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max2, min) {
    if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max2 || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
  }
  Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
      checkInt(this, value, offset, byteLength3, maxBytes, 0);
    }
    let mul = 1;
    let i = 0;
    this[offset] = value & 255;
    while (++i < byteLength3 && (mul *= 256)) {
      this[offset + i] = value / mul & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength3) - 1;
      checkInt(this, value, offset, byteLength3, maxBytes, 0);
    }
    let i = byteLength3 - 1;
    let mul = 1;
    this[offset + i] = value & 255;
    while (--i >= 0 && (mul *= 256)) {
      this[offset + i] = value / mul & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
    return offset + 4;
  };
  Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  function wrtBigUInt64LE(buf, value, offset, min, max2) {
    checkIntBI(value, min, max2, buf, offset, 7);
    let lo2 = Number(value & BigInt(4294967295));
    buf[offset++] = lo2;
    lo2 = lo2 >> 8;
    buf[offset++] = lo2;
    lo2 = lo2 >> 8;
    buf[offset++] = lo2;
    lo2 = lo2 >> 8;
    buf[offset++] = lo2;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    return offset;
  }
  function wrtBigUInt64BE(buf, value, offset, min, max2) {
    checkIntBI(value, min, max2, buf, offset, 7);
    let lo2 = Number(value & BigInt(4294967295));
    buf[offset + 7] = lo2;
    lo2 = lo2 >> 8;
    buf[offset + 6] = lo2;
    lo2 = lo2 >> 8;
    buf[offset + 5] = lo2;
    lo2 = lo2 >> 8;
    buf[offset + 4] = lo2;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset + 3] = hi;
    hi = hi >> 8;
    buf[offset + 2] = hi;
    hi = hi >> 8;
    buf[offset + 1] = hi;
    hi = hi >> 8;
    buf[offset] = hi;
    return offset + 8;
  }
  Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit2 = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit2 - 1, -limit2);
    }
    let i = 0;
    let mul = 1;
    let sub = 0;
    this[offset] = value & 255;
    while (++i < byteLength3 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit2 = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit2 - 1, -limit2);
    }
    let i = byteLength3 - 1;
    let mul = 1;
    let sub = 0;
    this[offset + i] = value & 255;
    while (--i >= 0 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength3;
  };
  Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
    if (value < 0) value = 255 + value + 1;
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };
  Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0) value = 4294967295 + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function checkIEEE754(buf, value, offset, ext, max2, min) {
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
    if (offset < 0) throw new RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    if (targetStart < 0) {
      throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
    if (end < 0) throw new RangeError("sourceEnd out of bounds");
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    const len = end - start;
    if (this === target && typeof GlobalUint8Array.prototype.copyWithin === "function") {
      this.copyWithin(targetStart, start, end);
    } else {
      GlobalUint8Array.prototype.set.call(
        target,
        this.subarray(start, end),
        targetStart
      );
    }
    return len;
  };
  Buffer2.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === "string") {
      if (typeof start === "string") {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === "string") {
        encoding = end;
        end = this.length;
      }
      if (encoding !== void 0 && typeof encoding !== "string") {
        throw new TypeError("encoding must be a string");
      }
      if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      if (val.length === 1) {
        const code2 = val.charCodeAt(0);
        if (encoding === "utf8" && code2 < 128 || encoding === "latin1") {
          val = code2;
        }
      }
    } else if (typeof val === "number") {
      val = val & 255;
    } else if (typeof val === "boolean") {
      val = Number(val);
    }
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError("Out of range index");
    }
    if (end <= start) {
      return this;
    }
    start = start >>> 0;
    end = end === void 0 ? this.length : end >>> 0;
    if (!val) val = 0;
    let i;
    if (typeof val === "number") {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
      const len = bytes.length;
      if (len === 0) {
        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
      }
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }
    return this;
  };
  const errors = {};
  function E(sym, getMessage, Base) {
    errors[sym] = class NodeError extends Base {
      constructor() {
        super();
        Object.defineProperty(this, "message", {
          value: getMessage.apply(this, arguments),
          writable: true,
          configurable: true
        });
        this.name = `${this.name} [${sym}]`;
        this.stack;
        delete this.name;
      }
      get code() {
        return sym;
      }
      set code(value) {
        Object.defineProperty(this, "code", {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      }
      toString() {
        return `${this.name} [${sym}]: ${this.message}`;
      }
    };
  }
  E(
    "ERR_BUFFER_OUT_OF_BOUNDS",
    function(name) {
      if (name) {
        return `${name} is outside of buffer bounds`;
      }
      return "Attempt to access memory outside buffer bounds";
    },
    RangeError
  );
  E(
    "ERR_INVALID_ARG_TYPE",
    function(name, actual) {
      return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
    },
    TypeError
  );
  E(
    "ERR_OUT_OF_RANGE",
    function(str, range2, input) {
      let msg = `The value of "${str}" is out of range.`;
      let received = input;
      if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
        received = addNumericalSeparator(String(input));
      } else if (typeof input === "bigint") {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
          received = addNumericalSeparator(received);
        }
        received += "n";
      }
      msg += ` It must be ${range2}. Received ${received}`;
      return msg;
    },
    RangeError
  );
  function addNumericalSeparator(val) {
    let res = "";
    let i = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for (; i >= start + 4; i -= 3) {
      res = `_${val.slice(i - 3, i)}${res}`;
    }
    return `${val.slice(0, i)}${res}`;
  }
  function checkBounds(buf, offset, byteLength3) {
    validateNumber(offset, "offset");
    if (buf[offset] === void 0 || buf[offset + byteLength3] === void 0) {
      boundsError(offset, buf.length - (byteLength3 + 1));
    }
  }
  function checkIntBI(value, min, max2, buf, offset, byteLength3) {
    if (value > max2 || value < min) {
      const n2 = typeof min === "bigint" ? "n" : "";
      let range2;
      {
        if (min === 0 || min === BigInt(0)) {
          range2 = `>= 0${n2} and < 2${n2} ** ${(byteLength3 + 1) * 8}${n2}`;
        } else {
          range2 = `>= -(2${n2} ** ${(byteLength3 + 1) * 8 - 1}${n2}) and < 2 ** ${(byteLength3 + 1) * 8 - 1}${n2}`;
        }
      }
      throw new errors.ERR_OUT_OF_RANGE("value", range2, value);
    }
    checkBounds(buf, offset, byteLength3);
  }
  function validateNumber(value, name) {
    if (typeof value !== "number") {
      throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
  }
  function boundsError(value, length, type2) {
    if (Math.floor(value) !== value) {
      validateNumber(value, type2);
      throw new errors.ERR_OUT_OF_RANGE("offset", "an integer", value);
    }
    if (length < 0) {
      throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
    }
    throw new errors.ERR_OUT_OF_RANGE(
      "offset",
      `>= ${0} and <= ${length}`,
      value
    );
  }
  const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = str.split("=")[0];
    str = str.trim().replace(INVALID_BASE64_RE, "");
    if (str.length < 2) return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for (let i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1) bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0) break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0) break;
        bytes.push(
          codePoint >> 6 | 192,
          codePoint & 63 | 128
        );
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0) break;
        bytes.push(
          codePoint >> 12 | 224,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0) break;
        bytes.push(
          codePoint >> 18 | 240,
          codePoint >> 12 & 63 | 128,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    const byteArray = [];
    for (let i = 0; i < str.length; ++i) {
      byteArray.push(str.charCodeAt(i) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    let c, hi, lo2;
    const byteArray = [];
    for (let i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo2 = c % 256;
      byteArray.push(lo2);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    let i;
    for (i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length) break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  function isInstance(obj, type2) {
    return obj instanceof type2 || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type2.name;
  }
  function numberIsNaN(obj) {
    return obj !== obj;
  }
  const hexSliceLookupTable = function() {
    const alphabet = "0123456789abcdef";
    const table = new Array(256);
    for (let i = 0; i < 16; ++i) {
      const i16 = i * 16;
      for (let j = 0; j < 16; ++j) {
        table[i16 + j] = alphabet[i] + alphabet[j];
      }
    }
    return table;
  }();
  function defineBigIntMethod(fn) {
    return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
  }
  function BufferBigIntNotDefined() {
    throw new Error("BigInt not supported");
  }
})(buffer);
const Buffer$1 = buffer.Buffer;
const global = globalThis || void 0 || self;
var errorStackParser = { exports: {} };
var stackframe = { exports: {} };
var hasRequiredStackframe;
function requireStackframe() {
  if (hasRequiredStackframe) return stackframe.exports;
  hasRequiredStackframe = 1;
  (function(module2, exports2) {
    (function(root2, factory) {
      {
        module2.exports = factory();
      }
    })(commonjsGlobal, function() {
      function _isNumber(n2) {
        return !isNaN(parseFloat(n2)) && isFinite(n2);
      }
      function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
      }
      function _getter(p2) {
        return function() {
          return this[p2];
        };
      }
      var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"];
      var numericProps = ["columnNumber", "lineNumber"];
      var stringProps = ["fileName", "functionName", "source"];
      var arrayProps = ["args"];
      var objectProps = ["evalOrigin"];
      var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);
      function StackFrame(obj) {
        if (!obj) return;
        for (var i2 = 0; i2 < props.length; i2++) {
          if (obj[props[i2]] !== void 0) {
            this["set" + _capitalize(props[i2])](obj[props[i2]]);
          }
        }
      }
      StackFrame.prototype = {
        getArgs: function() {
          return this.args;
        },
        setArgs: function(v) {
          if (Object.prototype.toString.call(v) !== "[object Array]") {
            throw new TypeError("Args must be an Array");
          }
          this.args = v;
        },
        getEvalOrigin: function() {
          return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
          if (v instanceof StackFrame) {
            this.evalOrigin = v;
          } else if (v instanceof Object) {
            this.evalOrigin = new StackFrame(v);
          } else {
            throw new TypeError("Eval Origin must be an Object or StackFrame");
          }
        },
        toString: function() {
          var fileName = this.getFileName() || "";
          var lineNumber = this.getLineNumber() || "";
          var columnNumber = this.getColumnNumber() || "";
          var functionName = this.getFunctionName() || "";
          if (this.getIsEval()) {
            if (fileName) {
              return "[eval] (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
            }
            return "[eval]:" + lineNumber + ":" + columnNumber;
          }
          if (functionName) {
            return functionName + " (" + fileName + ":" + lineNumber + ":" + columnNumber + ")";
          }
          return fileName + ":" + lineNumber + ":" + columnNumber;
        }
      };
      StackFrame.fromString = function StackFrame$$fromString(str) {
        var argsStartIndex = str.indexOf("(");
        var argsEndIndex = str.lastIndexOf(")");
        var functionName = str.substring(0, argsStartIndex);
        var args = str.substring(argsStartIndex + 1, argsEndIndex).split(",");
        var locationString = str.substring(argsEndIndex + 1);
        if (locationString.indexOf("@") === 0) {
          var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, "");
          var fileName = parts[1];
          var lineNumber = parts[2];
          var columnNumber = parts[3];
        }
        return new StackFrame({
          functionName,
          args: args || void 0,
          fileName,
          lineNumber: lineNumber || void 0,
          columnNumber: columnNumber || void 0
        });
      };
      for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype["get" + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype["set" + _capitalize(booleanProps[i])] = /* @__PURE__ */ function(p2) {
          return function(v) {
            this[p2] = Boolean(v);
          };
        }(booleanProps[i]);
      }
      for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype["get" + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype["set" + _capitalize(numericProps[j])] = /* @__PURE__ */ function(p2) {
          return function(v) {
            if (!_isNumber(v)) {
              throw new TypeError(p2 + " must be a Number");
            }
            this[p2] = Number(v);
          };
        }(numericProps[j]);
      }
      for (var k2 = 0; k2 < stringProps.length; k2++) {
        StackFrame.prototype["get" + _capitalize(stringProps[k2])] = _getter(stringProps[k2]);
        StackFrame.prototype["set" + _capitalize(stringProps[k2])] = /* @__PURE__ */ function(p2) {
          return function(v) {
            this[p2] = String(v);
          };
        }(stringProps[k2]);
      }
      return StackFrame;
    });
  })(stackframe);
  return stackframe.exports;
}
(function(module2, exports2) {
  (function(root2, factory) {
    {
      module2.exports = factory(requireStackframe());
    }
  })(commonjsGlobal, function ErrorStackParser(StackFrame) {
    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
    return {
      /**
       * Given an Error object, extract the most information from it.
       *
       * @param {Error} error object
       * @return {Array} of StackFrames
       */
      parse: function ErrorStackParser$$parse(error) {
        if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
          return this.parseOpera(error);
        } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
          return this.parseV8OrIE(error);
        } else if (error.stack) {
          return this.parseFFOrSafari(error);
        } else {
          throw new Error("Cannot parse given Error object");
        }
      },
      // Separate line and column numbers from a string of the form: (URI:Line:Column)
      extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
        if (urlLike.indexOf(":") === -1) {
          return [urlLike];
        }
        var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
        var parts = regExp.exec(urlLike.replace(/[()]/g, ""));
        return [parts[1], parts[2] || void 0, parts[3] || void 0];
      },
      parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
        var filtered = error.stack.split("\n").filter(function(line) {
          return !!line.match(CHROME_IE_STACK_REGEXP);
        }, this);
        return filtered.map(function(line) {
          if (line.indexOf("(eval ") > -1) {
            line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(,.*$)/g, "");
          }
          var sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(").replace(/^.*?\s+/, "");
          var location = sanitizedLine.match(/ (\(.+\)$)/);
          sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
          var locationParts = this.extractLocation(location ? location[1] : sanitizedLine);
          var functionName = location && sanitizedLine || void 0;
          var fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? void 0 : locationParts[0];
          return new StackFrame({
            functionName,
            fileName,
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
            source: line
          });
        }, this);
      },
      parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
        var filtered = error.stack.split("\n").filter(function(line) {
          return !line.match(SAFARI_NATIVE_CODE_REGEXP);
        }, this);
        return filtered.map(function(line) {
          if (line.indexOf(" > eval") > -1) {
            line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
          }
          if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
            return new StackFrame({
              functionName: line
            });
          } else {
            var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
            var matches = line.match(functionNameRegex);
            var functionName = matches && matches[1] ? matches[1] : void 0;
            var locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
            return new StackFrame({
              functionName,
              fileName: locationParts[0],
              lineNumber: locationParts[1],
              columnNumber: locationParts[2],
              source: line
            });
          }
        }, this);
      },
      parseOpera: function ErrorStackParser$$parseOpera(e2) {
        if (!e2.stacktrace || e2.message.indexOf("\n") > -1 && e2.message.split("\n").length > e2.stacktrace.split("\n").length) {
          return this.parseOpera9(e2);
        } else if (!e2.stack) {
          return this.parseOpera10(e2);
        } else {
          return this.parseOpera11(e2);
        }
      },
      parseOpera9: function ErrorStackParser$$parseOpera9(e2) {
        var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e2.message.split("\n");
        var result = [];
        for (var i = 2, len = lines.length; i < len; i += 2) {
          var match = lineRE.exec(lines[i]);
          if (match) {
            result.push(new StackFrame({
              fileName: match[2],
              lineNumber: match[1],
              source: lines[i]
            }));
          }
        }
        return result;
      },
      parseOpera10: function ErrorStackParser$$parseOpera10(e2) {
        var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e2.stacktrace.split("\n");
        var result = [];
        for (var i = 0, len = lines.length; i < len; i += 2) {
          var match = lineRE.exec(lines[i]);
          if (match) {
            result.push(
              new StackFrame({
                functionName: match[3] || void 0,
                fileName: match[2],
                lineNumber: match[1],
                source: lines[i]
              })
            );
          }
        }
        return result;
      },
      // Opera 10.65+ Error.stack very similar to FF/Safari
      parseOpera11: function ErrorStackParser$$parseOpera11(error) {
        var filtered = error.stack.split("\n").filter(function(line) {
          return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
        }, this);
        return filtered.map(function(line) {
          var tokens = line.split("@");
          var locationParts = this.extractLocation(tokens.pop());
          var functionCall = tokens.shift() || "";
          var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || void 0;
          var argsRaw;
          if (functionCall.match(/\(([^)]*)\)/)) {
            argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, "$1");
          }
          var args = argsRaw === void 0 || argsRaw === "[arguments not available]" ? void 0 : argsRaw.split(",");
          return new StackFrame({
            functionName,
            args,
            fileName: locationParts[0],
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
            source: line
          });
        }, this);
      }
    };
  });
})(errorStackParser);
function k$1(r2, e2, n2, o2) {
  return { hookName: "", trace: [], resourcePath: null, legacyKey: false };
}
class Subscribable {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = this.subscribe.bind(this);
  }
  subscribe(listener) {
    const identity2 = {
      listener
    };
    this.listeners.add(identity2);
    this.onSubscribe();
    return () => {
      this.listeners.delete(identity2);
      this.onUnsubscribe();
    };
  }
  hasListeners() {
    return this.listeners.size > 0;
  }
  onSubscribe() {
  }
  onUnsubscribe() {
  }
}
const isServer = typeof window === "undefined" || "Deno" in window;
function noop$2() {
  return void 0;
}
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function parseQueryArgs(arg1, arg2, arg3) {
  if (!isQueryKey(arg1)) {
    return arg1;
  }
  if (typeof arg2 === "function") {
    return {
      ...arg3,
      queryKey: arg1,
      queryFn: arg2
    };
  }
  return {
    ...arg2,
    queryKey: arg1
  };
}
function parseMutationArgs(arg1, arg2, arg3) {
  if (isQueryKey(arg1)) {
    if (typeof arg2 === "function") {
      return {
        ...arg3,
        mutationKey: arg1,
        mutationFn: arg2
      };
    }
    return {
      ...arg2,
      mutationKey: arg1
    };
  }
  if (typeof arg1 === "function") {
    return {
      ...arg2,
      mutationFn: arg1
    };
  }
  return {
    ...arg1
  };
}
function parseFilterArgs(arg1, arg2, arg3) {
  return isQueryKey(arg1) ? [{
    ...arg2,
    queryKey: arg1
  }, arg3] : [arg1 || {}, arg2];
}
function matchQuery(filters, query) {
  const {
    type: type2 = "all",
    exact,
    fetchStatus,
    predicate,
    queryKey,
    stale
  } = filters;
  if (isQueryKey(queryKey)) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }
  if (type2 !== "all") {
    const isActive = query.isActive();
    if (type2 === "active" && !isActive) {
      return false;
    }
    if (type2 === "inactive" && isActive) {
      return false;
    }
  }
  if (typeof stale === "boolean" && query.isStale() !== stale) {
    return false;
  }
  if (typeof fetchStatus !== "undefined" && fetchStatus !== query.state.fetchStatus) {
    return false;
  }
  if (predicate && !predicate(query)) {
    return false;
  }
  return true;
}
function matchMutation(filters, mutation) {
  const {
    exact,
    fetching,
    predicate,
    mutationKey
  } = filters;
  if (isQueryKey(mutationKey)) {
    if (!mutation.options.mutationKey) {
      return false;
    }
    if (exact) {
      if (hashQueryKey(mutation.options.mutationKey) !== hashQueryKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }
  if (typeof fetching === "boolean" && mutation.state.status === "loading" !== fetching) {
    return false;
  }
  if (predicate && !predicate(mutation)) {
    return false;
  }
  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  const hashFn = (options == null ? void 0 : options.queryKeyHashFn) || hashQueryKey;
  return hashFn(queryKey);
}
function hashQueryKey(queryKey) {
  return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
    result[key] = val[key];
    return result;
  }, {}) : val);
}
function partialMatchKey(a, b) {
  return partialDeepEqual(a, b);
}
function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    return !Object.keys(b).some((key) => !partialDeepEqual(a[key], b[key]));
  }
  return false;
}
function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }
  const array = isPlainArray(a) && isPlainArray(b);
  if (array || isPlainObject(a) && isPlainObject(b)) {
    const aSize = array ? a.length : Object.keys(a).length;
    const bItems = array ? b : Object.keys(b);
    const bSize = bItems.length;
    const copy = array ? [] : {};
    let equalItems = 0;
    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i];
      copy[key] = replaceEqualDeep(a[key], b[key]);
      if (copy[key] === a[key]) {
        equalItems++;
      }
    }
    return aSize === bSize && equalItems === aSize ? a : copy;
  }
  return b;
}
function shallowEqualObjects(a, b) {
  if (a && !b || b && !a) {
    return false;
  }
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o2) {
  if (!hasObjectPrototype(o2)) {
    return false;
  }
  const ctor = o2.constructor;
  if (typeof ctor === "undefined") {
    return true;
  }
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  return true;
}
function hasObjectPrototype(o2) {
  return Object.prototype.toString.call(o2) === "[object Object]";
}
function isQueryKey(value) {
  return Array.isArray(value);
}
function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
function scheduleMicrotask(callback) {
  sleep(0).then(callback);
}
function getAbortController() {
  if (typeof AbortController === "function") {
    return new AbortController();
  }
  return;
}
function replaceData(prevData, data, options) {
  if (options.isDataEqual != null && options.isDataEqual(prevData, data)) {
    return prevData;
  } else if (typeof options.structuralSharing === "function") {
    return options.structuralSharing(prevData, data);
  } else if (options.structuralSharing !== false) {
    return replaceEqualDeep(prevData, data);
  }
  return data;
}
class FocusManager extends Subscribable {
  constructor() {
    super();
    this.setup = (onFocus) => {
      if (!isServer && window.addEventListener) {
        const listener = () => onFocus();
        window.addEventListener("visibilitychange", listener, false);
        window.addEventListener("focus", listener, false);
        return () => {
          window.removeEventListener("visibilitychange", listener);
          window.removeEventListener("focus", listener);
        };
      }
      return;
    };
  }
  onSubscribe() {
    if (!this.cleanup) {
      this.setEventListener(this.setup);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$cleanup;
      (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
      this.cleanup = void 0;
    }
  }
  setEventListener(setup) {
    var _this$cleanup2;
    this.setup = setup;
    (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
    this.cleanup = setup((focused) => {
      if (typeof focused === "boolean") {
        this.setFocused(focused);
      } else {
        this.onFocus();
      }
    });
  }
  setFocused(focused) {
    const changed = this.focused !== focused;
    if (changed) {
      this.focused = focused;
      this.onFocus();
    }
  }
  onFocus() {
    this.listeners.forEach(({
      listener
    }) => {
      listener();
    });
  }
  isFocused() {
    if (typeof this.focused === "boolean") {
      return this.focused;
    }
    if (typeof document === "undefined") {
      return true;
    }
    return [void 0, "visible", "prerender"].includes(document.visibilityState);
  }
}
const focusManager = new FocusManager();
const onlineEvents = ["online", "offline"];
class OnlineManager extends Subscribable {
  constructor() {
    super();
    this.setup = (onOnline) => {
      if (!isServer && window.addEventListener) {
        const listener = () => onOnline();
        onlineEvents.forEach((event) => {
          window.addEventListener(event, listener, false);
        });
        return () => {
          onlineEvents.forEach((event) => {
            window.removeEventListener(event, listener);
          });
        };
      }
      return;
    };
  }
  onSubscribe() {
    if (!this.cleanup) {
      this.setEventListener(this.setup);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$cleanup;
      (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
      this.cleanup = void 0;
    }
  }
  setEventListener(setup) {
    var _this$cleanup2;
    this.setup = setup;
    (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
    this.cleanup = setup((online) => {
      if (typeof online === "boolean") {
        this.setOnline(online);
      } else {
        this.onOnline();
      }
    });
  }
  setOnline(online) {
    const changed = this.online !== online;
    if (changed) {
      this.online = online;
      this.onOnline();
    }
  }
  onOnline() {
    this.listeners.forEach(({
      listener
    }) => {
      listener();
    });
  }
  isOnline() {
    if (typeof this.online === "boolean") {
      return this.online;
    }
    if (typeof navigator === "undefined" || typeof navigator.onLine === "undefined") {
      return true;
    }
    return navigator.onLine;
  }
}
const onlineManager = new OnlineManager();
function defaultRetryDelay(failureCount) {
  return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
  return (networkMode != null ? networkMode : "online") === "online" ? onlineManager.isOnline() : true;
}
class CancelledError {
  constructor(options) {
    this.revert = options == null ? void 0 : options.revert;
    this.silent = options == null ? void 0 : options.silent;
  }
}
function isCancelledError(value) {
  return value instanceof CancelledError;
}
function createRetryer(config) {
  let isRetryCancelled = false;
  let failureCount = 0;
  let isResolved = false;
  let continueFn;
  let promiseResolve;
  let promiseReject;
  const promise = new Promise((outerResolve, outerReject) => {
    promiseResolve = outerResolve;
    promiseReject = outerReject;
  });
  const cancel = (cancelOptions) => {
    if (!isResolved) {
      reject(new CancelledError(cancelOptions));
      config.abort == null ? void 0 : config.abort();
    }
  };
  const cancelRetry = () => {
    isRetryCancelled = true;
  };
  const continueRetry = () => {
    isRetryCancelled = false;
  };
  const shouldPause = () => !focusManager.isFocused() || config.networkMode !== "always" && !onlineManager.isOnline();
  const resolve = (value) => {
    if (!isResolved) {
      isResolved = true;
      config.onSuccess == null ? void 0 : config.onSuccess(value);
      continueFn == null ? void 0 : continueFn();
      promiseResolve(value);
    }
  };
  const reject = (value) => {
    if (!isResolved) {
      isResolved = true;
      config.onError == null ? void 0 : config.onError(value);
      continueFn == null ? void 0 : continueFn();
      promiseReject(value);
    }
  };
  const pause = () => {
    return new Promise((continueResolve) => {
      continueFn = (value) => {
        const canContinue = isResolved || !shouldPause();
        if (canContinue) {
          continueResolve(value);
        }
        return canContinue;
      };
      config.onPause == null ? void 0 : config.onPause();
    }).then(() => {
      continueFn = void 0;
      if (!isResolved) {
        config.onContinue == null ? void 0 : config.onContinue();
      }
    });
  };
  const run = () => {
    if (isResolved) {
      return;
    }
    let promiseOrValue;
    try {
      promiseOrValue = config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }
    Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
      var _config$retry, _config$retryDelay;
      if (isResolved) {
        return;
      }
      const retry = (_config$retry = config.retry) != null ? _config$retry : 3;
      const retryDelay = (_config$retryDelay = config.retryDelay) != null ? _config$retryDelay : defaultRetryDelay;
      const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
      if (isRetryCancelled || !shouldRetry) {
        reject(error);
        return;
      }
      failureCount++;
      config.onFail == null ? void 0 : config.onFail(failureCount, error);
      sleep(delay).then(() => {
        if (shouldPause()) {
          return pause();
        }
        return;
      }).then(() => {
        if (isRetryCancelled) {
          reject(error);
        } else {
          run();
        }
      });
    });
  };
  if (canFetch(config.networkMode)) {
    run();
  } else {
    pause().then(run);
  }
  return {
    promise,
    cancel,
    continue: () => {
      const didContinue = continueFn == null ? void 0 : continueFn();
      return didContinue ? promise : Promise.resolve();
    },
    cancelRetry,
    continueRetry
  };
}
const defaultLogger = console;
function createNotifyManager() {
  let queue = [];
  let transactions = 0;
  let notifyFn = (callback) => {
    callback();
  };
  let batchNotifyFn = (callback) => {
    callback();
  };
  const batch = (callback) => {
    let result;
    transactions++;
    try {
      result = callback();
    } finally {
      transactions--;
      if (!transactions) {
        flush();
      }
    }
    return result;
  };
  const schedule = (callback) => {
    if (transactions) {
      queue.push(callback);
    } else {
      scheduleMicrotask(() => {
        notifyFn(callback);
      });
    }
  };
  const batchCalls = (callback) => {
    return (...args) => {
      schedule(() => {
        callback(...args);
      });
    };
  };
  const flush = () => {
    const originalQueue = queue;
    queue = [];
    if (originalQueue.length) {
      scheduleMicrotask(() => {
        batchNotifyFn(() => {
          originalQueue.forEach((callback) => {
            notifyFn(callback);
          });
        });
      });
    }
  };
  const setNotifyFunction = (fn) => {
    notifyFn = fn;
  };
  const setBatchNotifyFunction = (fn) => {
    batchNotifyFn = fn;
  };
  return {
    batch,
    batchCalls,
    schedule,
    setNotifyFunction,
    setBatchNotifyFunction
  };
}
const notifyManager = createNotifyManager();
class Removable {
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout();
    if (isValidTimeout(this.cacheTime)) {
      this.gcTimeout = setTimeout(() => {
        this.optionalRemove();
      }, this.cacheTime);
    }
  }
  updateCacheTime(newCacheTime) {
    this.cacheTime = Math.max(this.cacheTime || 0, newCacheTime != null ? newCacheTime : isServer ? Infinity : 5 * 60 * 1e3);
  }
  clearGcTimeout() {
    if (this.gcTimeout) {
      clearTimeout(this.gcTimeout);
      this.gcTimeout = void 0;
    }
  }
}
class Query extends Removable {
  constructor(config) {
    super();
    this.abortSignalConsumed = false;
    this.defaultOptions = config.defaultOptions;
    this.setOptions(config.options);
    this.observers = [];
    this.cache = config.cache;
    this.logger = config.logger || defaultLogger;
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    this.initialState = config.state || getDefaultState$1(this.options);
    this.state = this.initialState;
    this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  setOptions(options) {
    this.options = {
      ...this.defaultOptions,
      ...options
    };
    this.updateCacheTime(this.options.cacheTime);
  }
  optionalRemove() {
    if (!this.observers.length && this.state.fetchStatus === "idle") {
      this.cache.remove(this);
    }
  }
  setData(newData, options) {
    const data = replaceData(this.state.data, newData, this.options);
    this.dispatch({
      data,
      type: "success",
      dataUpdatedAt: options == null ? void 0 : options.updatedAt,
      manual: options == null ? void 0 : options.manual
    });
    return data;
  }
  setState(state, setStateOptions) {
    this.dispatch({
      type: "setState",
      state,
      setStateOptions
    });
  }
  cancel(options) {
    var _this$retryer;
    const promise = this.promise;
    (_this$retryer = this.retryer) == null ? void 0 : _this$retryer.cancel(options);
    return promise ? promise.then(noop$2).catch(noop$2) : Promise.resolve();
  }
  destroy() {
    super.destroy();
    this.cancel({
      silent: true
    });
  }
  reset() {
    this.destroy();
    this.setState(this.initialState);
  }
  isActive() {
    return this.observers.some((observer) => observer.options.enabled !== false);
  }
  isDisabled() {
    return this.getObserversCount() > 0 && !this.isActive();
  }
  isStale() {
    return this.state.isInvalidated || !this.state.dataUpdatedAt || this.observers.some((observer) => observer.getCurrentResult().isStale);
  }
  isStaleByTime(staleTime = 0) {
    return this.state.isInvalidated || !this.state.dataUpdatedAt || !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  }
  onFocus() {
    var _this$retryer2;
    const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus());
    if (observer) {
      observer.refetch({
        cancelRefetch: false
      });
    }
    (_this$retryer2 = this.retryer) == null ? void 0 : _this$retryer2.continue();
  }
  onOnline() {
    var _this$retryer3;
    const observer = this.observers.find((x) => x.shouldFetchOnReconnect());
    if (observer) {
      observer.refetch({
        cancelRefetch: false
      });
    }
    (_this$retryer3 = this.retryer) == null ? void 0 : _this$retryer3.continue();
  }
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      this.clearGcTimeout();
      this.cache.notify({
        type: "observerAdded",
        query: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    if (this.observers.includes(observer)) {
      this.observers = this.observers.filter((x) => x !== observer);
      if (!this.observers.length) {
        if (this.retryer) {
          if (this.abortSignalConsumed) {
            this.retryer.cancel({
              revert: true
            });
          } else {
            this.retryer.cancelRetry();
          }
        }
        this.scheduleGc();
      }
      this.cache.notify({
        type: "observerRemoved",
        query: this,
        observer
      });
    }
  }
  getObserversCount() {
    return this.observers.length;
  }
  invalidate() {
    if (!this.state.isInvalidated) {
      this.dispatch({
        type: "invalidate"
      });
    }
  }
  fetch(options, fetchOptions) {
    var _this$options$behavio, _context$fetchOptions;
    if (this.state.fetchStatus !== "idle") {
      if (this.state.dataUpdatedAt && fetchOptions != null && fetchOptions.cancelRefetch) {
        this.cancel({
          silent: true
        });
      } else if (this.promise) {
        var _this$retryer4;
        (_this$retryer4 = this.retryer) == null ? void 0 : _this$retryer4.continueRetry();
        return this.promise;
      }
    }
    if (options) {
      this.setOptions(options);
    }
    if (!this.options.queryFn) {
      const observer = this.observers.find((x) => x.options.queryFn);
      if (observer) {
        this.setOptions(observer.options);
      }
    }
    const abortController = getAbortController();
    const queryFnContext = {
      queryKey: this.queryKey,
      pageParam: void 0,
      meta: this.meta
    };
    const addSignalProperty = (object) => {
      Object.defineProperty(object, "signal", {
        enumerable: true,
        get: () => {
          if (abortController) {
            this.abortSignalConsumed = true;
            return abortController.signal;
          }
          return void 0;
        }
      });
    };
    addSignalProperty(queryFnContext);
    const fetchFn = () => {
      if (!this.options.queryFn) {
        return Promise.reject("Missing queryFn for queryKey '" + this.options.queryHash + "'");
      }
      this.abortSignalConsumed = false;
      return this.options.queryFn(queryFnContext);
    };
    const context = {
      fetchOptions,
      options: this.options,
      queryKey: this.queryKey,
      state: this.state,
      fetchFn
    };
    addSignalProperty(context);
    (_this$options$behavio = this.options.behavior) == null ? void 0 : _this$options$behavio.onFetch(context);
    this.revertState = this.state;
    if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((_context$fetchOptions = context.fetchOptions) == null ? void 0 : _context$fetchOptions.meta)) {
      var _context$fetchOptions2;
      this.dispatch({
        type: "fetch",
        meta: (_context$fetchOptions2 = context.fetchOptions) == null ? void 0 : _context$fetchOptions2.meta
      });
    }
    const onError = (error) => {
      if (!(isCancelledError(error) && error.silent)) {
        this.dispatch({
          type: "error",
          error
        });
      }
      if (!isCancelledError(error)) {
        var _this$cache$config$on, _this$cache$config, _this$cache$config$on2, _this$cache$config2;
        (_this$cache$config$on = (_this$cache$config = this.cache.config).onError) == null ? void 0 : _this$cache$config$on.call(_this$cache$config, error, this);
        (_this$cache$config$on2 = (_this$cache$config2 = this.cache.config).onSettled) == null ? void 0 : _this$cache$config$on2.call(_this$cache$config2, this.state.data, error, this);
      }
      if (!this.isFetchingOptimistic) {
        this.scheduleGc();
      }
      this.isFetchingOptimistic = false;
    };
    this.retryer = createRetryer({
      fn: context.fetchFn,
      abort: abortController == null ? void 0 : abortController.abort.bind(abortController),
      onSuccess: (data) => {
        var _this$cache$config$on3, _this$cache$config3, _this$cache$config$on4, _this$cache$config4;
        if (typeof data === "undefined") {
          onError(new Error(this.queryHash + " data is undefined"));
          return;
        }
        this.setData(data);
        (_this$cache$config$on3 = (_this$cache$config3 = this.cache.config).onSuccess) == null ? void 0 : _this$cache$config$on3.call(_this$cache$config3, data, this);
        (_this$cache$config$on4 = (_this$cache$config4 = this.cache.config).onSettled) == null ? void 0 : _this$cache$config$on4.call(_this$cache$config4, data, this.state.error, this);
        if (!this.isFetchingOptimistic) {
          this.scheduleGc();
        }
        this.isFetchingOptimistic = false;
      },
      onError,
      onFail: (failureCount, error) => {
        this.dispatch({
          type: "failed",
          failureCount,
          error
        });
      },
      onPause: () => {
        this.dispatch({
          type: "pause"
        });
      },
      onContinue: () => {
        this.dispatch({
          type: "continue"
        });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay,
      networkMode: context.options.networkMode
    });
    this.promise = this.retryer.promise;
    return this.promise;
  }
  dispatch(action) {
    const reducer = (state) => {
      var _action$meta, _action$dataUpdatedAt;
      switch (action.type) {
        case "failed":
          return {
            ...state,
            fetchFailureCount: action.failureCount,
            fetchFailureReason: action.error
          };
        case "pause":
          return {
            ...state,
            fetchStatus: "paused"
          };
        case "continue":
          return {
            ...state,
            fetchStatus: "fetching"
          };
        case "fetch":
          return {
            ...state,
            fetchFailureCount: 0,
            fetchFailureReason: null,
            fetchMeta: (_action$meta = action.meta) != null ? _action$meta : null,
            fetchStatus: canFetch(this.options.networkMode) ? "fetching" : "paused",
            ...!state.dataUpdatedAt && {
              error: null,
              status: "loading"
            }
          };
        case "success":
          return {
            ...state,
            data: action.data,
            dataUpdateCount: state.dataUpdateCount + 1,
            dataUpdatedAt: (_action$dataUpdatedAt = action.dataUpdatedAt) != null ? _action$dataUpdatedAt : Date.now(),
            error: null,
            isInvalidated: false,
            status: "success",
            ...!action.manual && {
              fetchStatus: "idle",
              fetchFailureCount: 0,
              fetchFailureReason: null
            }
          };
        case "error":
          const error = action.error;
          if (isCancelledError(error) && error.revert && this.revertState) {
            return {
              ...this.revertState,
              fetchStatus: "idle"
            };
          }
          return {
            ...state,
            error,
            errorUpdateCount: state.errorUpdateCount + 1,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: state.fetchFailureCount + 1,
            fetchFailureReason: error,
            fetchStatus: "idle",
            status: "error"
          };
        case "invalidate":
          return {
            ...state,
            isInvalidated: true
          };
        case "setState":
          return {
            ...state,
            ...action.state
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.forEach((observer) => {
        observer.onQueryUpdate(action);
      });
      this.cache.notify({
        query: this,
        type: "updated",
        action
      });
    });
  }
}
function getDefaultState$1(options) {
  const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
  const hasData = typeof data !== "undefined";
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt != null ? initialDataUpdatedAt : Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? "success" : "loading",
    fetchStatus: "idle"
  };
}
class QueryCache extends Subscribable {
  constructor(config) {
    super();
    this.config = config || {};
    this.queries = [];
    this.queriesMap = {};
  }
  build(client, options, state) {
    var _options$queryHash;
    const queryKey = options.queryKey;
    const queryHash = (_options$queryHash = options.queryHash) != null ? _options$queryHash : hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        cache: this,
        logger: client.getLogger(),
        queryKey,
        queryHash,
        options: client.defaultQueryOptions(options),
        state,
        defaultOptions: client.getQueryDefaults(queryKey)
      });
      this.add(query);
    }
    return query;
  }
  add(query) {
    if (!this.queriesMap[query.queryHash]) {
      this.queriesMap[query.queryHash] = query;
      this.queries.push(query);
      this.notify({
        type: "added",
        query
      });
    }
  }
  remove(query) {
    const queryInMap = this.queriesMap[query.queryHash];
    if (queryInMap) {
      query.destroy();
      this.queries = this.queries.filter((x) => x !== query);
      if (queryInMap === query) {
        delete this.queriesMap[query.queryHash];
      }
      this.notify({
        type: "removed",
        query
      });
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.queries.forEach((query) => {
        this.remove(query);
      });
    });
  }
  get(queryHash) {
    return this.queriesMap[queryHash];
  }
  getAll() {
    return this.queries;
  }
  find(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    if (typeof filters.exact === "undefined") {
      filters.exact = true;
    }
    return this.queries.find((query) => matchQuery(filters, query));
  }
  findAll(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    return Object.keys(filters).length > 0 ? this.queries.filter((query) => matchQuery(filters, query)) : this.queries;
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach(({
        listener
      }) => {
        listener(event);
      });
    });
  }
  onFocus() {
    notifyManager.batch(() => {
      this.queries.forEach((query) => {
        query.onFocus();
      });
    });
  }
  onOnline() {
    notifyManager.batch(() => {
      this.queries.forEach((query) => {
        query.onOnline();
      });
    });
  }
}
class Mutation extends Removable {
  constructor(config) {
    super();
    this.defaultOptions = config.defaultOptions;
    this.mutationId = config.mutationId;
    this.mutationCache = config.mutationCache;
    this.logger = config.logger || defaultLogger;
    this.observers = [];
    this.state = config.state || getDefaultState();
    this.setOptions(config.options);
    this.scheduleGc();
  }
  setOptions(options) {
    this.options = {
      ...this.defaultOptions,
      ...options
    };
    this.updateCacheTime(this.options.cacheTime);
  }
  get meta() {
    return this.options.meta;
  }
  setState(state) {
    this.dispatch({
      type: "setState",
      state
    });
  }
  addObserver(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      this.clearGcTimeout();
      this.mutationCache.notify({
        type: "observerAdded",
        mutation: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    this.observers = this.observers.filter((x) => x !== observer);
    this.scheduleGc();
    this.mutationCache.notify({
      type: "observerRemoved",
      mutation: this,
      observer
    });
  }
  optionalRemove() {
    if (!this.observers.length) {
      if (this.state.status === "loading") {
        this.scheduleGc();
      } else {
        this.mutationCache.remove(this);
      }
    }
  }
  continue() {
    var _this$retryer$continu, _this$retryer;
    return (_this$retryer$continu = (_this$retryer = this.retryer) == null ? void 0 : _this$retryer.continue()) != null ? _this$retryer$continu : this.execute();
  }
  async execute() {
    const executeMutation = () => {
      var _this$options$retry;
      this.retryer = createRetryer({
        fn: () => {
          if (!this.options.mutationFn) {
            return Promise.reject("No mutationFn found");
          }
          return this.options.mutationFn(this.state.variables);
        },
        onFail: (failureCount, error) => {
          this.dispatch({
            type: "failed",
            failureCount,
            error
          });
        },
        onPause: () => {
          this.dispatch({
            type: "pause"
          });
        },
        onContinue: () => {
          this.dispatch({
            type: "continue"
          });
        },
        retry: (_this$options$retry = this.options.retry) != null ? _this$options$retry : 0,
        retryDelay: this.options.retryDelay,
        networkMode: this.options.networkMode
      });
      return this.retryer.promise;
    };
    const restored = this.state.status === "loading";
    try {
      var _this$mutationCache$c3, _this$mutationCache$c4, _this$options$onSucce, _this$options2, _this$mutationCache$c5, _this$mutationCache$c6, _this$options$onSettl, _this$options3;
      if (!restored) {
        var _this$mutationCache$c, _this$mutationCache$c2, _this$options$onMutat, _this$options;
        this.dispatch({
          type: "loading",
          variables: this.options.variables
        });
        await ((_this$mutationCache$c = (_this$mutationCache$c2 = this.mutationCache.config).onMutate) == null ? void 0 : _this$mutationCache$c.call(_this$mutationCache$c2, this.state.variables, this));
        const context = await ((_this$options$onMutat = (_this$options = this.options).onMutate) == null ? void 0 : _this$options$onMutat.call(_this$options, this.state.variables));
        if (context !== this.state.context) {
          this.dispatch({
            type: "loading",
            context,
            variables: this.state.variables
          });
        }
      }
      const data = await executeMutation();
      await ((_this$mutationCache$c3 = (_this$mutationCache$c4 = this.mutationCache.config).onSuccess) == null ? void 0 : _this$mutationCache$c3.call(_this$mutationCache$c4, data, this.state.variables, this.state.context, this));
      await ((_this$options$onSucce = (_this$options2 = this.options).onSuccess) == null ? void 0 : _this$options$onSucce.call(_this$options2, data, this.state.variables, this.state.context));
      await ((_this$mutationCache$c5 = (_this$mutationCache$c6 = this.mutationCache.config).onSettled) == null ? void 0 : _this$mutationCache$c5.call(_this$mutationCache$c6, data, null, this.state.variables, this.state.context, this));
      await ((_this$options$onSettl = (_this$options3 = this.options).onSettled) == null ? void 0 : _this$options$onSettl.call(_this$options3, data, null, this.state.variables, this.state.context));
      this.dispatch({
        type: "success",
        data
      });
      return data;
    } catch (error) {
      try {
        var _this$mutationCache$c7, _this$mutationCache$c8, _this$options$onError, _this$options4, _this$mutationCache$c9, _this$mutationCache$c10, _this$options$onSettl2, _this$options5;
        await ((_this$mutationCache$c7 = (_this$mutationCache$c8 = this.mutationCache.config).onError) == null ? void 0 : _this$mutationCache$c7.call(_this$mutationCache$c8, error, this.state.variables, this.state.context, this));
        if (false) ;
        await ((_this$options$onError = (_this$options4 = this.options).onError) == null ? void 0 : _this$options$onError.call(_this$options4, error, this.state.variables, this.state.context));
        await ((_this$mutationCache$c9 = (_this$mutationCache$c10 = this.mutationCache.config).onSettled) == null ? void 0 : _this$mutationCache$c9.call(_this$mutationCache$c10, void 0, error, this.state.variables, this.state.context, this));
        await ((_this$options$onSettl2 = (_this$options5 = this.options).onSettled) == null ? void 0 : _this$options$onSettl2.call(_this$options5, void 0, error, this.state.variables, this.state.context));
        throw error;
      } finally {
        this.dispatch({
          type: "error",
          error
        });
      }
    }
  }
  dispatch(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            failureCount: action.failureCount,
            failureReason: action.error
          };
        case "pause":
          return {
            ...state,
            isPaused: true
          };
        case "continue":
          return {
            ...state,
            isPaused: false
          };
        case "loading":
          return {
            ...state,
            context: action.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: !canFetch(this.options.networkMode),
            status: "loading",
            variables: action.variables
          };
        case "success":
          return {
            ...state,
            data: action.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: false
          };
        case "error":
          return {
            ...state,
            data: void 0,
            error: action.error,
            failureCount: state.failureCount + 1,
            failureReason: action.error,
            isPaused: false,
            status: "error"
          };
        case "setState":
          return {
            ...state,
            ...action.state
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.observers.forEach((observer) => {
        observer.onMutationUpdate(action);
      });
      this.mutationCache.notify({
        mutation: this,
        type: "updated",
        action
      });
    });
  }
}
function getDefaultState() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0
  };
}
class MutationCache extends Subscribable {
  constructor(config) {
    super();
    this.config = config || {};
    this.mutations = [];
    this.mutationId = 0;
  }
  build(client, options, state) {
    const mutation = new Mutation({
      mutationCache: this,
      logger: client.getLogger(),
      mutationId: ++this.mutationId,
      options: client.defaultMutationOptions(options),
      state,
      defaultOptions: options.mutationKey ? client.getMutationDefaults(options.mutationKey) : void 0
    });
    this.add(mutation);
    return mutation;
  }
  add(mutation) {
    this.mutations.push(mutation);
    this.notify({
      type: "added",
      mutation
    });
  }
  remove(mutation) {
    this.mutations = this.mutations.filter((x) => x !== mutation);
    this.notify({
      type: "removed",
      mutation
    });
  }
  clear() {
    notifyManager.batch(() => {
      this.mutations.forEach((mutation) => {
        this.remove(mutation);
      });
    });
  }
  getAll() {
    return this.mutations;
  }
  find(filters) {
    if (typeof filters.exact === "undefined") {
      filters.exact = true;
    }
    return this.mutations.find((mutation) => matchMutation(filters, mutation));
  }
  findAll(filters) {
    return this.mutations.filter((mutation) => matchMutation(filters, mutation));
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach(({
        listener
      }) => {
        listener(event);
      });
    });
  }
  resumePausedMutations() {
    var _this$resuming;
    this.resuming = ((_this$resuming = this.resuming) != null ? _this$resuming : Promise.resolve()).then(() => {
      const pausedMutations = this.mutations.filter((x) => x.state.isPaused);
      return notifyManager.batch(() => pausedMutations.reduce((promise, mutation) => promise.then(() => mutation.continue().catch(noop$2)), Promise.resolve()));
    }).then(() => {
      this.resuming = void 0;
    });
    return this.resuming;
  }
}
function infiniteQueryBehavior() {
  return {
    onFetch: (context) => {
      context.fetchFn = () => {
        var _context$fetchOptions, _context$fetchOptions2, _context$fetchOptions3, _context$fetchOptions4, _context$state$data, _context$state$data2;
        const refetchPage = (_context$fetchOptions = context.fetchOptions) == null ? void 0 : (_context$fetchOptions2 = _context$fetchOptions.meta) == null ? void 0 : _context$fetchOptions2.refetchPage;
        const fetchMore = (_context$fetchOptions3 = context.fetchOptions) == null ? void 0 : (_context$fetchOptions4 = _context$fetchOptions3.meta) == null ? void 0 : _context$fetchOptions4.fetchMore;
        const pageParam = fetchMore == null ? void 0 : fetchMore.pageParam;
        const isFetchingNextPage = (fetchMore == null ? void 0 : fetchMore.direction) === "forward";
        const isFetchingPreviousPage = (fetchMore == null ? void 0 : fetchMore.direction) === "backward";
        const oldPages = ((_context$state$data = context.state.data) == null ? void 0 : _context$state$data.pages) || [];
        const oldPageParams = ((_context$state$data2 = context.state.data) == null ? void 0 : _context$state$data2.pageParams) || [];
        let newPageParams = oldPageParams;
        let cancelled = false;
        const addSignalProperty = (object) => {
          Object.defineProperty(object, "signal", {
            enumerable: true,
            get: () => {
              var _context$signal;
              if ((_context$signal = context.signal) != null && _context$signal.aborted) {
                cancelled = true;
              } else {
                var _context$signal2;
                (_context$signal2 = context.signal) == null ? void 0 : _context$signal2.addEventListener("abort", () => {
                  cancelled = true;
                });
              }
              return context.signal;
            }
          });
        };
        const queryFn = context.options.queryFn || (() => Promise.reject("Missing queryFn for queryKey '" + context.options.queryHash + "'"));
        const buildNewPages = (pages, param, page, previous) => {
          newPageParams = previous ? [param, ...newPageParams] : [...newPageParams, param];
          return previous ? [page, ...pages] : [...pages, page];
        };
        const fetchPage = (pages, manual, param, previous) => {
          if (cancelled) {
            return Promise.reject("Cancelled");
          }
          if (typeof param === "undefined" && !manual && pages.length) {
            return Promise.resolve(pages);
          }
          const queryFnContext = {
            queryKey: context.queryKey,
            pageParam: param,
            meta: context.options.meta
          };
          addSignalProperty(queryFnContext);
          const queryFnResult = queryFn(queryFnContext);
          const promise2 = Promise.resolve(queryFnResult).then((page) => buildNewPages(pages, param, page, previous));
          return promise2;
        };
        let promise;
        if (!oldPages.length) {
          promise = fetchPage([]);
        } else if (isFetchingNextPage) {
          const manual = typeof pageParam !== "undefined";
          const param = manual ? pageParam : getNextPageParam(context.options, oldPages);
          promise = fetchPage(oldPages, manual, param);
        } else if (isFetchingPreviousPage) {
          const manual = typeof pageParam !== "undefined";
          const param = manual ? pageParam : getPreviousPageParam(context.options, oldPages);
          promise = fetchPage(oldPages, manual, param, true);
        } else {
          newPageParams = [];
          const manual = typeof context.options.getNextPageParam === "undefined";
          const shouldFetchFirstPage = refetchPage && oldPages[0] ? refetchPage(oldPages[0], 0, oldPages) : true;
          promise = shouldFetchFirstPage ? fetchPage([], manual, oldPageParams[0]) : Promise.resolve(buildNewPages([], oldPageParams[0], oldPages[0]));
          for (let i = 1; i < oldPages.length; i++) {
            promise = promise.then((pages) => {
              const shouldFetchNextPage = refetchPage && oldPages[i] ? refetchPage(oldPages[i], i, oldPages) : true;
              if (shouldFetchNextPage) {
                const param = manual ? oldPageParams[i] : getNextPageParam(context.options, pages);
                return fetchPage(pages, manual, param);
              }
              return Promise.resolve(buildNewPages(pages, oldPageParams[i], oldPages[i]));
            });
          }
        }
        const finalPromise = promise.then((pages) => ({
          pages,
          pageParams: newPageParams
        }));
        return finalPromise;
      };
    }
  };
}
function getNextPageParam(options, pages) {
  return options.getNextPageParam == null ? void 0 : options.getNextPageParam(pages[pages.length - 1], pages);
}
function getPreviousPageParam(options, pages) {
  return options.getPreviousPageParam == null ? void 0 : options.getPreviousPageParam(pages[0], pages);
}
function hasNextPage(options, pages) {
  if (options.getNextPageParam && Array.isArray(pages)) {
    const nextPageParam = getNextPageParam(options, pages);
    return typeof nextPageParam !== "undefined" && nextPageParam !== null && nextPageParam !== false;
  }
  return;
}
function hasPreviousPage(options, pages) {
  if (options.getPreviousPageParam && Array.isArray(pages)) {
    const previousPageParam = getPreviousPageParam(options, pages);
    return typeof previousPageParam !== "undefined" && previousPageParam !== null && previousPageParam !== false;
  }
  return;
}
class QueryClient {
  constructor(config = {}) {
    this.queryCache = config.queryCache || new QueryCache();
    this.mutationCache = config.mutationCache || new MutationCache();
    this.logger = config.logger || defaultLogger;
    this.defaultOptions = config.defaultOptions || {};
    this.queryDefaults = [];
    this.mutationDefaults = [];
    this.mountCount = 0;
  }
  mount() {
    this.mountCount++;
    if (this.mountCount !== 1) return;
    this.unsubscribeFocus = focusManager.subscribe(() => {
      if (focusManager.isFocused()) {
        this.resumePausedMutations();
        this.queryCache.onFocus();
      }
    });
    this.unsubscribeOnline = onlineManager.subscribe(() => {
      if (onlineManager.isOnline()) {
        this.resumePausedMutations();
        this.queryCache.onOnline();
      }
    });
  }
  unmount() {
    var _this$unsubscribeFocu, _this$unsubscribeOnli;
    this.mountCount--;
    if (this.mountCount !== 0) return;
    (_this$unsubscribeFocu = this.unsubscribeFocus) == null ? void 0 : _this$unsubscribeFocu.call(this);
    this.unsubscribeFocus = void 0;
    (_this$unsubscribeOnli = this.unsubscribeOnline) == null ? void 0 : _this$unsubscribeOnli.call(this);
    this.unsubscribeOnline = void 0;
  }
  isFetching(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    filters.fetchStatus = "fetching";
    return this.queryCache.findAll(filters).length;
  }
  isMutating(filters) {
    return this.mutationCache.findAll({
      ...filters,
      fetching: true
    }).length;
  }
  getQueryData(queryKey, filters) {
    var _this$queryCache$find;
    return (_this$queryCache$find = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find.state.data;
  }
  ensureQueryData(arg1, arg2, arg3) {
    const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    const cachedData = this.getQueryData(parsedOptions.queryKey);
    return cachedData ? Promise.resolve(cachedData) : this.fetchQuery(parsedOptions);
  }
  getQueriesData(queryKeyOrFilters) {
    return this.getQueryCache().findAll(queryKeyOrFilters).map(({
      queryKey,
      state
    }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }
  setQueryData(queryKey, updater, options) {
    const query = this.queryCache.find(queryKey);
    const prevData = query == null ? void 0 : query.state.data;
    const data = functionalUpdate(updater, prevData);
    if (typeof data === "undefined") {
      return void 0;
    }
    const parsedOptions = parseQueryArgs(queryKey);
    const defaultedOptions = this.defaultQueryOptions(parsedOptions);
    return this.queryCache.build(this, defaultedOptions).setData(data, {
      ...options,
      manual: true
    });
  }
  setQueriesData(queryKeyOrFilters, updater, options) {
    return notifyManager.batch(() => this.getQueryCache().findAll(queryKeyOrFilters).map(({
      queryKey
    }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
  }
  getQueryState(queryKey, filters) {
    var _this$queryCache$find2;
    return (_this$queryCache$find2 = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find2.state;
  }
  removeQueries(arg1, arg2) {
    const [filters] = parseFilterArgs(arg1, arg2);
    const queryCache = this.queryCache;
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query);
      });
    });
  }
  resetQueries(arg1, arg2, arg3) {
    const [filters, options] = parseFilterArgs(arg1, arg2, arg3);
    const queryCache = this.queryCache;
    const refetchFilters = {
      type: "active",
      ...filters
    };
    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        query.reset();
      });
      return this.refetchQueries(refetchFilters, options);
    });
  }
  cancelQueries(arg1, arg2, arg3) {
    const [filters, cancelOptions = {}] = parseFilterArgs(arg1, arg2, arg3);
    if (typeof cancelOptions.revert === "undefined") {
      cancelOptions.revert = true;
    }
    const promises = notifyManager.batch(() => this.queryCache.findAll(filters).map((query) => query.cancel(cancelOptions)));
    return Promise.all(promises).then(noop$2).catch(noop$2);
  }
  invalidateQueries(arg1, arg2, arg3) {
    const [filters, options] = parseFilterArgs(arg1, arg2, arg3);
    return notifyManager.batch(() => {
      var _ref, _filters$refetchType;
      this.queryCache.findAll(filters).forEach((query) => {
        query.invalidate();
      });
      if (filters.refetchType === "none") {
        return Promise.resolve();
      }
      const refetchFilters = {
        ...filters,
        type: (_ref = (_filters$refetchType = filters.refetchType) != null ? _filters$refetchType : filters.type) != null ? _ref : "active"
      };
      return this.refetchQueries(refetchFilters, options);
    });
  }
  refetchQueries(arg1, arg2, arg3) {
    const [filters, options] = parseFilterArgs(arg1, arg2, arg3);
    const promises = notifyManager.batch(() => this.queryCache.findAll(filters).filter((query) => !query.isDisabled()).map((query) => {
      var _options$cancelRefetc;
      return query.fetch(void 0, {
        ...options,
        cancelRefetch: (_options$cancelRefetc = options == null ? void 0 : options.cancelRefetch) != null ? _options$cancelRefetc : true,
        meta: {
          refetchPage: filters.refetchPage
        }
      });
    }));
    let promise = Promise.all(promises).then(noop$2);
    if (!(options != null && options.throwOnError)) {
      promise = promise.catch(noop$2);
    }
    return promise;
  }
  fetchQuery(arg1, arg2, arg3) {
    const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    const defaultedOptions = this.defaultQueryOptions(parsedOptions);
    if (typeof defaultedOptions.retry === "undefined") {
      defaultedOptions.retry = false;
    }
    const query = this.queryCache.build(this, defaultedOptions);
    return query.isStaleByTime(defaultedOptions.staleTime) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }
  prefetchQuery(arg1, arg2, arg3) {
    return this.fetchQuery(arg1, arg2, arg3).then(noop$2).catch(noop$2);
  }
  fetchInfiniteQuery(arg1, arg2, arg3) {
    const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    parsedOptions.behavior = infiniteQueryBehavior();
    return this.fetchQuery(parsedOptions);
  }
  prefetchInfiniteQuery(arg1, arg2, arg3) {
    return this.fetchInfiniteQuery(arg1, arg2, arg3).then(noop$2).catch(noop$2);
  }
  resumePausedMutations() {
    return this.mutationCache.resumePausedMutations();
  }
  getQueryCache() {
    return this.queryCache;
  }
  getMutationCache() {
    return this.mutationCache;
  }
  getLogger() {
    return this.logger;
  }
  getDefaultOptions() {
    return this.defaultOptions;
  }
  setDefaultOptions(options) {
    this.defaultOptions = options;
  }
  setQueryDefaults(queryKey, options) {
    const result = this.queryDefaults.find((x) => hashQueryKey(queryKey) === hashQueryKey(x.queryKey));
    if (result) {
      result.defaultOptions = options;
    } else {
      this.queryDefaults.push({
        queryKey,
        defaultOptions: options
      });
    }
  }
  getQueryDefaults(queryKey) {
    if (!queryKey) {
      return void 0;
    }
    const firstMatchingDefaults = this.queryDefaults.find((x) => partialMatchKey(queryKey, x.queryKey));
    return firstMatchingDefaults == null ? void 0 : firstMatchingDefaults.defaultOptions;
  }
  setMutationDefaults(mutationKey, options) {
    const result = this.mutationDefaults.find((x) => hashQueryKey(mutationKey) === hashQueryKey(x.mutationKey));
    if (result) {
      result.defaultOptions = options;
    } else {
      this.mutationDefaults.push({
        mutationKey,
        defaultOptions: options
      });
    }
  }
  getMutationDefaults(mutationKey) {
    if (!mutationKey) {
      return void 0;
    }
    const firstMatchingDefaults = this.mutationDefaults.find((x) => partialMatchKey(mutationKey, x.mutationKey));
    return firstMatchingDefaults == null ? void 0 : firstMatchingDefaults.defaultOptions;
  }
  defaultQueryOptions(options) {
    if (options != null && options._defaulted) {
      return options;
    }
    const defaultedOptions = {
      ...this.defaultOptions.queries,
      ...this.getQueryDefaults(options == null ? void 0 : options.queryKey),
      ...options,
      _defaulted: true
    };
    if (!defaultedOptions.queryHash && defaultedOptions.queryKey) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
    }
    if (typeof defaultedOptions.refetchOnReconnect === "undefined") {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
    }
    if (typeof defaultedOptions.useErrorBoundary === "undefined") {
      defaultedOptions.useErrorBoundary = !!defaultedOptions.suspense;
    }
    return defaultedOptions;
  }
  defaultMutationOptions(options) {
    if (options != null && options._defaulted) {
      return options;
    }
    return {
      ...this.defaultOptions.mutations,
      ...this.getMutationDefaults(options == null ? void 0 : options.mutationKey),
      ...options,
      _defaulted: true
    };
  }
  clear() {
    this.queryCache.clear();
    this.mutationCache.clear();
  }
}
class QueryObserver extends Subscribable {
  constructor(client, options) {
    super();
    this.client = client;
    this.options = options;
    this.trackedProps = /* @__PURE__ */ new Set();
    this.selectError = null;
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.remove = this.remove.bind(this);
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.currentQuery, this.options)) {
        this.executeFetch();
      }
      this.updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnReconnect);
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnWindowFocus);
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.clearStaleTimeout();
    this.clearRefetchInterval();
    this.currentQuery.removeObserver(this);
  }
  setOptions(options, notifyOptions) {
    const prevOptions = this.options;
    const prevQuery = this.currentQuery;
    this.options = this.client.defaultQueryOptions(options);
    if (!shallowEqualObjects(prevOptions, this.options)) {
      this.client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.currentQuery,
        observer: this
      });
    }
    if (typeof this.options.enabled !== "undefined" && typeof this.options.enabled !== "boolean") {
      throw new Error("Expected enabled to be a boolean");
    }
    if (!this.options.queryKey) {
      this.options.queryKey = prevOptions.queryKey;
    }
    this.updateQuery();
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(this.currentQuery, prevQuery, this.options, prevOptions)) {
      this.executeFetch();
    }
    this.updateResult(notifyOptions);
    if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || this.options.staleTime !== prevOptions.staleTime)) {
      this.updateStaleTimeout();
    }
    const nextRefetchInterval = this.computeRefetchInterval();
    if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || nextRefetchInterval !== this.currentRefetchInterval)) {
      this.updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.client.getQueryCache().build(this.client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result, options)) {
      this.currentResult = result;
      this.currentResultOptions = this.options;
      this.currentResultState = this.currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.currentResult;
  }
  trackResult(result) {
    const trackedResult = {};
    Object.keys(result).forEach((key) => {
      Object.defineProperty(trackedResult, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          this.trackedProps.add(key);
          return result[key];
        }
      });
    });
    return trackedResult;
  }
  getCurrentQuery() {
    return this.currentQuery;
  }
  remove() {
    this.client.getQueryCache().remove(this.currentQuery);
  }
  refetch({
    refetchPage,
    ...options
  } = {}) {
    return this.fetch({
      ...options,
      meta: {
        refetchPage
      }
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.client.defaultQueryOptions(options);
    const query = this.client.getQueryCache().build(this.client, defaultedOptions);
    query.isFetchingOptimistic = true;
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    var _fetchOptions$cancelR;
    return this.executeFetch({
      ...fetchOptions,
      cancelRefetch: (_fetchOptions$cancelR = fetchOptions.cancelRefetch) != null ? _fetchOptions$cancelR : true
    }).then(() => {
      this.updateResult();
      return this.currentResult;
    });
  }
  executeFetch(fetchOptions) {
    this.updateQuery();
    let promise = this.currentQuery.fetch(this.options, fetchOptions);
    if (!(fetchOptions != null && fetchOptions.throwOnError)) {
      promise = promise.catch(noop$2);
    }
    return promise;
  }
  updateStaleTimeout() {
    this.clearStaleTimeout();
    if (isServer || this.currentResult.isStale || !isValidTimeout(this.options.staleTime)) {
      return;
    }
    const time = timeUntilStale(this.currentResult.dataUpdatedAt, this.options.staleTime);
    const timeout = time + 1;
    this.staleTimeoutId = setTimeout(() => {
      if (!this.currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  computeRefetchInterval() {
    var _this$options$refetch;
    return typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.currentResult.data, this.currentQuery) : (_this$options$refetch = this.options.refetchInterval) != null ? _this$options$refetch : false;
  }
  updateRefetchInterval(nextInterval) {
    this.clearRefetchInterval();
    this.currentRefetchInterval = nextInterval;
    if (isServer || this.options.enabled === false || !isValidTimeout(this.currentRefetchInterval) || this.currentRefetchInterval === 0) {
      return;
    }
    this.refetchIntervalId = setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.executeFetch();
      }
    }, this.currentRefetchInterval);
  }
  updateTimers() {
    this.updateStaleTimeout();
    this.updateRefetchInterval(this.computeRefetchInterval());
  }
  clearStaleTimeout() {
    if (this.staleTimeoutId) {
      clearTimeout(this.staleTimeoutId);
      this.staleTimeoutId = void 0;
    }
  }
  clearRefetchInterval() {
    if (this.refetchIntervalId) {
      clearInterval(this.refetchIntervalId);
      this.refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.currentQuery;
    const prevOptions = this.options;
    const prevResult = this.currentResult;
    const prevResultState = this.currentResultState;
    const prevResultOptions = this.currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.currentQueryInitialState;
    const prevQueryResult = queryChange ? this.currentResult : this.previousQueryResult;
    const {
      state
    } = query;
    let {
      dataUpdatedAt,
      error,
      errorUpdatedAt,
      fetchStatus,
      status
    } = state;
    let isPreviousData = false;
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        fetchStatus = canFetch(query.options.networkMode) ? "fetching" : "paused";
        if (!dataUpdatedAt) {
          status = "loading";
        }
      }
      if (options._optimisticResults === "isRestoring") {
        fetchStatus = "idle";
      }
    }
    if (options.keepPreviousData && !state.dataUpdatedAt && prevQueryResult != null && prevQueryResult.isSuccess && status !== "error") {
      data = prevQueryResult.data;
      dataUpdatedAt = prevQueryResult.dataUpdatedAt;
      status = prevQueryResult.status;
      isPreviousData = true;
    } else if (options.select && typeof state.data !== "undefined") {
      if (prevResult && state.data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === this.selectFn) {
        data = this.selectResult;
      } else {
        try {
          this.selectFn = options.select;
          data = options.select(state.data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          this.selectResult = data;
          this.selectError = null;
        } catch (selectError) {
          this.selectError = selectError;
        }
      }
    } else {
      data = state.data;
    }
    if (typeof options.placeholderData !== "undefined" && typeof data === "undefined" && status === "loading") {
      let placeholderData;
      if (prevResult != null && prevResult.isPlaceholderData && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData() : options.placeholderData;
        if (options.select && typeof placeholderData !== "undefined") {
          try {
            placeholderData = options.select(placeholderData);
            this.selectError = null;
          } catch (selectError) {
            this.selectError = selectError;
          }
        }
      }
      if (typeof placeholderData !== "undefined") {
        status = "success";
        data = replaceData(prevResult == null ? void 0 : prevResult.data, placeholderData, options);
        isPlaceholderData = true;
      }
    }
    if (this.selectError) {
      error = this.selectError;
      data = this.selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = fetchStatus === "fetching";
    const isLoading = status === "loading";
    const isError2 = status === "error";
    const result = {
      status,
      fetchStatus,
      isLoading,
      isSuccess: status === "success",
      isError: isError2,
      isInitialLoading: isLoading && isFetching,
      data,
      dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: state.fetchFailureCount,
      failureReason: state.fetchFailureReason,
      errorUpdateCount: state.errorUpdateCount,
      isFetched: state.dataUpdateCount > 0 || state.errorUpdateCount > 0,
      isFetchedAfterMount: state.dataUpdateCount > queryInitialState.dataUpdateCount || state.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isLoading,
      isLoadingError: isError2 && state.dataUpdatedAt === 0,
      isPaused: fetchStatus === "paused",
      isPlaceholderData,
      isPreviousData,
      isRefetchError: isError2 && state.dataUpdatedAt !== 0,
      isStale: isStale(query, options),
      refetch: this.refetch,
      remove: this.remove
    };
    return result;
  }
  updateResult(notifyOptions) {
    const prevResult = this.currentResult;
    const nextResult = this.createResult(this.currentQuery, this.options);
    this.currentResultState = this.currentQuery.state;
    this.currentResultOptions = this.options;
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.currentResult = nextResult;
    const defaultNotifyOptions = {
      cache: true
    };
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const {
        notifyOnChangeProps
      } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.trackedProps.size) {
        return true;
      }
      const includedProps = new Set(notifyOnChangePropsValue != null ? notifyOnChangePropsValue : this.trackedProps);
      if (this.options.useErrorBoundary) {
        includedProps.add("error");
      }
      return Object.keys(this.currentResult).some((key) => {
        const typedKey = key;
        const changed = this.currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    if ((notifyOptions == null ? void 0 : notifyOptions.listeners) !== false && shouldNotifyListeners()) {
      defaultNotifyOptions.listeners = true;
    }
    this.notify({
      ...defaultNotifyOptions,
      ...notifyOptions
    });
  }
  updateQuery() {
    const query = this.client.getQueryCache().build(this.client, this.options);
    if (query === this.currentQuery) {
      return;
    }
    const prevQuery = this.currentQuery;
    this.currentQuery = query;
    this.currentQueryInitialState = query.state;
    this.previousQueryResult = this.currentResult;
    if (this.hasListeners()) {
      prevQuery == null ? void 0 : prevQuery.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate(action) {
    const notifyOptions = {};
    if (action.type === "success") {
      notifyOptions.onSuccess = !action.manual;
    } else if (action.type === "error" && !isCancelledError(action.error)) {
      notifyOptions.onError = true;
    }
    this.updateResult(notifyOptions);
    if (this.hasListeners()) {
      this.updateTimers();
    }
  }
  notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.onSuccess) {
        var _this$options$onSucce, _this$options, _this$options$onSettl, _this$options2;
        (_this$options$onSucce = (_this$options = this.options).onSuccess) == null ? void 0 : _this$options$onSucce.call(_this$options, this.currentResult.data);
        (_this$options$onSettl = (_this$options2 = this.options).onSettled) == null ? void 0 : _this$options$onSettl.call(_this$options2, this.currentResult.data, null);
      } else if (notifyOptions.onError) {
        var _this$options$onError, _this$options3, _this$options$onSettl2, _this$options4;
        (_this$options$onError = (_this$options3 = this.options).onError) == null ? void 0 : _this$options$onError.call(_this$options3, this.currentResult.error);
        (_this$options$onSettl2 = (_this$options4 = this.options).onSettled) == null ? void 0 : _this$options$onSettl2.call(_this$options4, void 0, this.currentResult.error);
      }
      if (notifyOptions.listeners) {
        this.listeners.forEach(({
          listener
        }) => {
          listener(this.currentResult);
        });
      }
      if (notifyOptions.cache) {
        this.client.getQueryCache().notify({
          query: this.currentQuery,
          type: "observerResultsUpdated"
        });
      }
    });
  }
}
function shouldLoadOnMount(query, options) {
  return options.enabled !== false && !query.state.dataUpdatedAt && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.dataUpdatedAt > 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (options.enabled !== false) {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return options.enabled !== false && (query !== prevQuery || prevOptions.enabled === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return query.isStaleByTime(options.staleTime);
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult, options) {
  if (options.keepPreviousData) {
    return false;
  }
  if (options.placeholderData !== void 0) {
    return optimisticResult.isPlaceholderData;
  }
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
class InfiniteQueryObserver extends QueryObserver {
  // Type override
  // Type override
  // Type override
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(client, options) {
    super(client, options);
  }
  bindMethods() {
    super.bindMethods();
    this.fetchNextPage = this.fetchNextPage.bind(this);
    this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
  }
  setOptions(options, notifyOptions) {
    super.setOptions({
      ...options,
      behavior: infiniteQueryBehavior()
    }, notifyOptions);
  }
  getOptimisticResult(options) {
    options.behavior = infiniteQueryBehavior();
    return super.getOptimisticResult(options);
  }
  fetchNextPage({
    pageParam,
    ...options
  } = {}) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: {
          direction: "forward",
          pageParam
        }
      }
    });
  }
  fetchPreviousPage({
    pageParam,
    ...options
  } = {}) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: {
          direction: "backward",
          pageParam
        }
      }
    });
  }
  createResult(query, options) {
    var _state$fetchMeta, _state$fetchMeta$fetc, _state$fetchMeta2, _state$fetchMeta2$fet, _state$data, _state$data2;
    const {
      state
    } = query;
    const result = super.createResult(query, options);
    const {
      isFetching,
      isRefetching
    } = result;
    const isFetchingNextPage = isFetching && ((_state$fetchMeta = state.fetchMeta) == null ? void 0 : (_state$fetchMeta$fetc = _state$fetchMeta.fetchMore) == null ? void 0 : _state$fetchMeta$fetc.direction) === "forward";
    const isFetchingPreviousPage = isFetching && ((_state$fetchMeta2 = state.fetchMeta) == null ? void 0 : (_state$fetchMeta2$fet = _state$fetchMeta2.fetchMore) == null ? void 0 : _state$fetchMeta2$fet.direction) === "backward";
    return {
      ...result,
      fetchNextPage: this.fetchNextPage,
      fetchPreviousPage: this.fetchPreviousPage,
      hasNextPage: hasNextPage(options, (_state$data = state.data) == null ? void 0 : _state$data.pages),
      hasPreviousPage: hasPreviousPage(options, (_state$data2 = state.data) == null ? void 0 : _state$data2.pages),
      isFetchingNextPage,
      isFetchingPreviousPage,
      isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
    };
  }
}
class MutationObserver extends Subscribable {
  constructor(client, options) {
    super();
    this.client = client;
    this.setOptions(options);
    this.bindMethods();
    this.updateResult();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    var _this$currentMutation;
    const prevOptions = this.options;
    this.options = this.client.defaultMutationOptions(options);
    if (!shallowEqualObjects(prevOptions, this.options)) {
      this.client.getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: this.currentMutation,
        observer: this
      });
    }
    (_this$currentMutation = this.currentMutation) == null ? void 0 : _this$currentMutation.setOptions(this.options);
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$currentMutation2;
      (_this$currentMutation2 = this.currentMutation) == null ? void 0 : _this$currentMutation2.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    this.updateResult();
    const notifyOptions = {
      listeners: true
    };
    if (action.type === "success") {
      notifyOptions.onSuccess = true;
    } else if (action.type === "error") {
      notifyOptions.onError = true;
    }
    this.notify(notifyOptions);
  }
  getCurrentResult() {
    return this.currentResult;
  }
  reset() {
    this.currentMutation = void 0;
    this.updateResult();
    this.notify({
      listeners: true
    });
  }
  mutate(variables, options) {
    this.mutateOptions = options;
    if (this.currentMutation) {
      this.currentMutation.removeObserver(this);
    }
    this.currentMutation = this.client.getMutationCache().build(this.client, {
      ...this.options,
      variables: typeof variables !== "undefined" ? variables : this.options.variables
    });
    this.currentMutation.addObserver(this);
    return this.currentMutation.execute();
  }
  updateResult() {
    const state = this.currentMutation ? this.currentMutation.state : getDefaultState();
    const result = {
      ...state,
      isLoading: state.status === "loading",
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
    this.currentResult = result;
  }
  notify(options) {
    notifyManager.batch(() => {
      if (this.mutateOptions && this.hasListeners()) {
        if (options.onSuccess) {
          var _this$mutateOptions$o, _this$mutateOptions, _this$mutateOptions$o2, _this$mutateOptions2;
          (_this$mutateOptions$o = (_this$mutateOptions = this.mutateOptions).onSuccess) == null ? void 0 : _this$mutateOptions$o.call(_this$mutateOptions, this.currentResult.data, this.currentResult.variables, this.currentResult.context);
          (_this$mutateOptions$o2 = (_this$mutateOptions2 = this.mutateOptions).onSettled) == null ? void 0 : _this$mutateOptions$o2.call(_this$mutateOptions2, this.currentResult.data, null, this.currentResult.variables, this.currentResult.context);
        } else if (options.onError) {
          var _this$mutateOptions$o3, _this$mutateOptions3, _this$mutateOptions$o4, _this$mutateOptions4;
          (_this$mutateOptions$o3 = (_this$mutateOptions3 = this.mutateOptions).onError) == null ? void 0 : _this$mutateOptions$o3.call(_this$mutateOptions3, this.currentResult.error, this.currentResult.variables, this.currentResult.context);
          (_this$mutateOptions$o4 = (_this$mutateOptions4 = this.mutateOptions).onSettled) == null ? void 0 : _this$mutateOptions$o4.call(_this$mutateOptions4, void 0, this.currentResult.error, this.currentResult.variables, this.currentResult.context);
        }
      }
      if (options.listeners) {
        this.listeners.forEach(({
          listener
        }) => {
          listener(this.currentResult);
        });
      }
    });
  }
}
var shim = { exports: {} };
var useSyncExternalStoreShim_production_min = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var e = reactExports;
function h(a, b) {
  return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
}
var k = "function" === typeof Object.is ? Object.is : h, l = e.useState, m = e.useEffect, n = e.useLayoutEffect, p = e.useDebugValue;
function q(a, b) {
  var d = b(), f = l({ inst: { value: d, getSnapshot: b } }), c = f[0].inst, g = f[1];
  n(function() {
    c.value = d;
    c.getSnapshot = b;
    r(c) && g({ inst: c });
  }, [a, d, b]);
  m(function() {
    r(c) && g({ inst: c });
    return a(function() {
      r(c) && g({ inst: c });
    });
  }, [a]);
  p(d);
  return d;
}
function r(a) {
  var b = a.getSnapshot;
  a = a.value;
  try {
    var d = b();
    return !k(a, d);
  } catch (f) {
    return true;
  }
}
function t(a, b) {
  return b();
}
var u = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? t : q;
useSyncExternalStoreShim_production_min.useSyncExternalStore = void 0 !== e.useSyncExternalStore ? e.useSyncExternalStore : u;
{
  shim.exports = useSyncExternalStoreShim_production_min;
}
var shimExports = shim.exports;
const useSyncExternalStore = shimExports.useSyncExternalStore;
const defaultContext = /* @__PURE__ */ reactExports.createContext(void 0);
const QueryClientSharingContext = /* @__PURE__ */ reactExports.createContext(false);
function getQueryClientContext(context, contextSharing) {
  if (context) {
    return context;
  }
  if (contextSharing && typeof window !== "undefined") {
    if (!window.ReactQueryClientContext) {
      window.ReactQueryClientContext = defaultContext;
    }
    return window.ReactQueryClientContext;
  }
  return defaultContext;
}
const useQueryClient = ({
  context
} = {}) => {
  const queryClient = reactExports.useContext(getQueryClientContext(context, reactExports.useContext(QueryClientSharingContext)));
  if (!queryClient) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }
  return queryClient;
};
const QueryClientProvider = ({
  client,
  children,
  context,
  contextSharing = false
}) => {
  reactExports.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);
  const Context = getQueryClientContext(context, contextSharing);
  return /* @__PURE__ */ reactExports.createElement(QueryClientSharingContext.Provider, {
    value: !context && contextSharing
  }, /* @__PURE__ */ reactExports.createElement(Context.Provider, {
    value: client
  }, children));
};
const IsRestoringContext = /* @__PURE__ */ reactExports.createContext(false);
const useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
const QueryErrorResetBoundaryContext = /* @__PURE__ */ reactExports.createContext(createValue());
const useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
function shouldThrowError(_useErrorBoundary, params) {
  if (typeof _useErrorBoundary === "function") {
    return _useErrorBoundary(...params);
  }
  return !!_useErrorBoundary;
}
const ensurePreventErrorBoundaryRetry = (options, errorResetBoundary) => {
  if (options.suspense || options.useErrorBoundary) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
const useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
const getHasError = ({
  result,
  errorResetBoundary,
  useErrorBoundary,
  query
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && shouldThrowError(useErrorBoundary, [result.error, query]);
};
const ensureStaleTime = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    if (typeof defaultedOptions.staleTime !== "number") {
      defaultedOptions.staleTime = 1e3;
    }
  }
};
const willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
const shouldSuspend = (defaultedOptions, result, isRestoring) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && willFetch(result, isRestoring);
const fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).then(({
  data
}) => {
  defaultedOptions.onSuccess == null ? void 0 : defaultedOptions.onSuccess(data);
  defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(data, null);
}).catch((error) => {
  errorResetBoundary.clearReset();
  defaultedOptions.onError == null ? void 0 : defaultedOptions.onError(error);
  defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(void 0, error);
});
function useBaseQuery(options, Observer) {
  const queryClient = useQueryClient({
    context: options.context
  });
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedOptions = queryClient.defaultQueryOptions(options);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
  }
  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
  }
  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
  }
  ensureStaleTime(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary);
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = reactExports.useState(() => new Observer(queryClient, defaultedOptions));
  const result = observer.getOptimisticResult(defaultedOptions);
  useSyncExternalStore(reactExports.useCallback((onStoreChange) => {
    const unsubscribe = isRestoring ? () => void 0 : observer.subscribe(notifyManager.batchCalls(onStoreChange));
    observer.updateResult();
    return unsubscribe;
  }, [observer, isRestoring]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions, {
      listeners: false
    });
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result, isRestoring)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    useErrorBoundary: defaultedOptions.useErrorBoundary,
    query: observer.getCurrentQuery()
  })) {
    throw result.error;
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(arg1, arg2, arg3) {
  const parsedOptions = parseQueryArgs(arg1, arg2, arg3);
  return useBaseQuery(parsedOptions, QueryObserver);
}
function useMutation(arg1, arg2, arg3) {
  const options = parseMutationArgs(arg1, arg2, arg3);
  const queryClient = useQueryClient({
    context: options.context
  });
  const [observer] = reactExports.useState(() => new MutationObserver(queryClient, options));
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = useSyncExternalStore(reactExports.useCallback((onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)), [observer]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
  const mutate = reactExports.useCallback((variables, mutateOptions) => {
    observer.mutate(variables, mutateOptions).catch(noop$1);
  }, [observer]);
  if (result.error && shouldThrowError(observer.options.useErrorBoundary, [result.error])) {
    throw result.error;
  }
  return {
    ...result,
    mutate,
    mutateAsync: result.mutate
  };
}
function noop$1() {
}
function useInfiniteQuery(arg1, arg2, arg3) {
  const options = parseQueryArgs(arg1, arg2, arg3);
  return useBaseQuery(options, InfiniteQueryObserver);
}
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$b = Object.prototype;
var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
var nativeObjectToString$1 = objectProto$b.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty$8.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e2) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto$a = Object.prototype;
var nativeObjectToString = objectProto$a.toString;
function objectToString$1(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString$1(value);
}
function isObject(value) {
  var type2 = typeof value;
  return value != null && (type2 == "object" || type2 == "function");
}
var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var coreJsData = root["__core-js_shared__"];
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e2) {
    }
    try {
      return func + "";
    } catch (e2) {
    }
  }
  return "";
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype, objectProto$9 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString.call(hasOwnProperty$7).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var nativeCreate = getNative(Object, "create");
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$8 = Object.prototype;
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$6.call(data, key) ? data[key] : void 0;
}
var objectProto$7 = Object.prototype;
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== void 0 : hasOwnProperty$5.call(data, key);
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  return index < 0 ? void 0 : data[index][1];
}
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map$1 = getNative(root, "Map");
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$1 || ListCache)(),
    "string": new Hash()
  };
}
function isKeyable(value) {
  var type2 = typeof value;
  return type2 == "string" || type2 == "number" || type2 == "symbol" || type2 == "boolean" ? value !== "__proto__" : value === null;
}
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function mapCacheDelete(key) {
  var result = getMapData(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
function setCacheHas(value) {
  return this.__data__.has(value);
}
function SetCache(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + -1;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
function baseIsNaN(value) {
  return value !== value;
}
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}
function arrayIncludesWith(array, value, comparator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
function cacheHas(cache, key) {
  return cache.has(key);
}
var LARGE_ARRAY_SIZE$2 = 200;
function baseDifference(array, values, iteratee, comparator) {
  var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
  if (!length) {
    return result;
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  } else if (values.length >= LARGE_ARRAY_SIZE$2) {
    includes = cacheHas;
    isCommon = false;
    values = new SetCache(values);
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      } else if (!includes(values, computed, comparator)) {
        result.push(value);
      }
    }
  return result;
}
function arrayPush(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var argsTag$2 = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$2;
}
var objectProto$6 = Object.prototype;
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;
var isArguments = baseIsArguments(/* @__PURE__ */ function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$4.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
var isArray$4 = Array.isArray;
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : void 0;
function isFlattenable(value) {
  return isArray$4(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1, length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (predicate(value)) {
      {
        arrayPush(result, value);
      }
    }
  }
  return result;
}
function identity(value) {
  return value;
}
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var nativeMax$3 = Math.max;
function overRest(func, start, transform) {
  start = nativeMax$3(start === void 0 ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax$3(args.length - start, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}
function constant(value) {
  return function() {
    return value;
  };
}
var defineProperty = function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e2) {
  }
}();
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string),
    "writable": true
  });
};
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
var setToString = shortOut(baseSetToString);
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + "");
}
var MAX_SAFE_INTEGER$1 = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : void 0;
}
var differenceWith = baseRest(function(array, values) {
  var comparator = last(values);
  if (isArrayLikeObject(comparator)) {
    comparator = void 0;
  }
  return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject), void 0, comparator) : [];
});
var Set$1 = getNative(root, "Set");
function noop() {
}
function setToArray(set) {
  var index = -1, result = Array(set.size);
  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var INFINITY$3 = 1 / 0;
var createSet = !(Set$1 && 1 / setToArray(new Set$1([, -0]))[1] == INFINITY$3) ? noop : function(values) {
  return new Set$1(values);
};
var LARGE_ARRAY_SIZE$1 = 200;
function baseUniq(array, iteratee, comparator) {
  var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE$1) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee ? [] : result;
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
  return result;
}
var unionWith = baseRest(function(arrays) {
  var comparator = last(arrays);
  comparator = typeof comparator == "function" ? comparator : void 0;
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject), void 0, comparator);
});
var esErrors = Error;
var _eval = EvalError;
var range = RangeError;
var ref = ReferenceError;
var syntax = SyntaxError;
var type = TypeError;
var uri = URIError;
var shams = function hasSymbols() {
  if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
    return false;
  }
  if (typeof Symbol.iterator === "symbol") {
    return true;
  }
  var obj = {};
  var sym = Symbol("test");
  var symObj = Object(sym);
  if (typeof sym === "string") {
    return false;
  }
  if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
    return false;
  }
  if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
    return false;
  }
  var symVal = 42;
  obj[sym] = symVal;
  for (sym in obj) {
    return false;
  }
  if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
    return false;
  }
  if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
    return false;
  }
  var syms = Object.getOwnPropertySymbols(obj);
  if (syms.length !== 1 || syms[0] !== sym) {
    return false;
  }
  if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
    return false;
  }
  if (typeof Object.getOwnPropertyDescriptor === "function") {
    var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
    if (descriptor.value !== symVal || descriptor.enumerable !== true) {
      return false;
    }
  }
  return true;
};
var origSymbol = typeof Symbol !== "undefined" && Symbol;
var hasSymbolSham = shams;
var hasSymbols$1 = function hasNativeSymbols() {
  if (typeof origSymbol !== "function") {
    return false;
  }
  if (typeof Symbol !== "function") {
    return false;
  }
  if (typeof origSymbol("foo") !== "symbol") {
    return false;
  }
  if (typeof Symbol("bar") !== "symbol") {
    return false;
  }
  return hasSymbolSham();
};
var test = {
  __proto__: null,
  foo: {}
};
var $Object = Object;
var hasProto$1 = function hasProto() {
  return { __proto__: test }.foo === test.foo && !(test instanceof $Object);
};
var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
var toStr$1 = Object.prototype.toString;
var max = Math.max;
var funcType = "[object Function]";
var concatty = function concatty2(a, b) {
  var arr = [];
  for (var i = 0; i < a.length; i += 1) {
    arr[i] = a[i];
  }
  for (var j = 0; j < b.length; j += 1) {
    arr[j + a.length] = b[j];
  }
  return arr;
};
var slicy = function slicy2(arrLike, offset) {
  var arr = [];
  for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
    arr[j] = arrLike[i];
  }
  return arr;
};
var joiny = function(arr, joiner) {
  var str = "";
  for (var i = 0; i < arr.length; i += 1) {
    str += arr[i];
    if (i + 1 < arr.length) {
      str += joiner;
    }
  }
  return str;
};
var implementation$1 = function bind(that) {
  var target = this;
  if (typeof target !== "function" || toStr$1.apply(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }
  var args = slicy(arguments, 1);
  var bound;
  var binder = function() {
    if (this instanceof bound) {
      var result = target.apply(
        this,
        concatty(args, arguments)
      );
      if (Object(result) === result) {
        return result;
      }
      return this;
    }
    return target.apply(
      that,
      concatty(args, arguments)
    );
  };
  var boundLength = max(0, target.length - args.length);
  var boundArgs = [];
  for (var i = 0; i < boundLength; i++) {
    boundArgs[i] = "$" + i;
  }
  bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
  if (target.prototype) {
    var Empty = function Empty2() {
    };
    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }
  return bound;
};
var implementation = implementation$1;
var functionBind = Function.prototype.bind || implementation;
var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind$1 = functionBind;
var hasown = bind$1.call(call, $hasOwn);
var undefined$1;
var $Error = esErrors;
var $EvalError = _eval;
var $RangeError = range;
var $ReferenceError = ref;
var $SyntaxError$1 = syntax;
var $TypeError$3 = type;
var $URIError = uri;
var $Function = Function;
var getEvalledConstructor = function(expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
  } catch (e2) {
  }
};
var $gOPD$1 = Object.getOwnPropertyDescriptor;
if ($gOPD$1) {
  try {
    $gOPD$1({}, "");
  } catch (e2) {
    $gOPD$1 = null;
  }
}
var throwTypeError = function() {
  throw new $TypeError$3();
};
var ThrowTypeError = $gOPD$1 ? function() {
  try {
    arguments.callee;
    return throwTypeError;
  } catch (calleeThrows) {
    try {
      return $gOPD$1(arguments, "callee").get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;
var hasSymbols2 = hasSymbols$1();
var hasProto2 = hasProto$1();
var getProto = Object.getPrototypeOf || (hasProto2 ? function(x) {
  return x.__proto__;
} : null);
var needsEval = {};
var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined$1 : getProto(Uint8Array);
var INTRINSICS = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
  "%ArrayIteratorPrototype%": hasSymbols2 && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
  "%AsyncFromSyncIteratorPrototype%": undefined$1,
  "%AsyncFunction%": needsEval,
  "%AsyncGenerator%": needsEval,
  "%AsyncGeneratorFunction%": needsEval,
  "%AsyncIteratorPrototype%": needsEval,
  "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
  "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
  "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": $Error,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": $EvalError,
  "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
  "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
  "%Function%": $Function,
  "%GeneratorFunction%": needsEval,
  "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
  "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
  "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": hasSymbols2 && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
  "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
  "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
  "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols2 || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": Object,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
  "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
  "%RangeError%": $RangeError,
  "%ReferenceError%": $ReferenceError,
  "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
  "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols2 || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": hasSymbols2 && getProto ? getProto(""[Symbol.iterator]()) : undefined$1,
  "%Symbol%": hasSymbols2 ? Symbol : undefined$1,
  "%SyntaxError%": $SyntaxError$1,
  "%ThrowTypeError%": ThrowTypeError,
  "%TypedArray%": TypedArray,
  "%TypeError%": $TypeError$3,
  "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
  "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
  "%URIError%": $URIError,
  "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
  "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
  "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet
};
if (getProto) {
  try {
    null.error;
  } catch (e2) {
    var errorProto = getProto(getProto(e2));
    INTRINSICS["%Error.prototype%"] = errorProto;
  }
}
var doEval = function doEval2(name) {
  var value;
  if (name === "%AsyncFunction%") {
    value = getEvalledConstructor("async function () {}");
  } else if (name === "%GeneratorFunction%") {
    value = getEvalledConstructor("function* () {}");
  } else if (name === "%AsyncGeneratorFunction%") {
    value = getEvalledConstructor("async function* () {}");
  } else if (name === "%AsyncGenerator%") {
    var fn = doEval2("%AsyncGeneratorFunction%");
    if (fn) {
      value = fn.prototype;
    }
  } else if (name === "%AsyncIteratorPrototype%") {
    var gen = doEval2("%AsyncGenerator%");
    if (gen && getProto) {
      value = getProto(gen.prototype);
    }
  }
  INTRINSICS[name] = value;
  return value;
};
var LEGACY_ALIASES = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
};
var bind2 = functionBind;
var hasOwn$1 = hasown;
var $concat$1 = bind2.call(Function.call, Array.prototype.concat);
var $spliceApply = bind2.call(Function.apply, Array.prototype.splice);
var $replace$1 = bind2.call(Function.call, String.prototype.replace);
var $strSlice = bind2.call(Function.call, String.prototype.slice);
var $exec = bind2.call(Function.call, RegExp.prototype.exec);
var rePropName$1 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar$1 = /\\(\\)?/g;
var stringToPath$1 = function stringToPath(string) {
  var first = $strSlice(string, 0, 1);
  var last2 = $strSlice(string, -1);
  if (first === "%" && last2 !== "%") {
    throw new $SyntaxError$1("invalid intrinsic syntax, expected closing `%`");
  } else if (last2 === "%" && first !== "%") {
    throw new $SyntaxError$1("invalid intrinsic syntax, expected opening `%`");
  }
  var result = [];
  $replace$1(string, rePropName$1, function(match, number, quote2, subString) {
    result[result.length] = quote2 ? $replace$1(subString, reEscapeChar$1, "$1") : number || match;
  });
  return result;
};
var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
  var intrinsicName = name;
  var alias;
  if (hasOwn$1(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = "%" + alias[0] + "%";
  }
  if (hasOwn$1(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];
    if (value === needsEval) {
      value = doEval(intrinsicName);
    }
    if (typeof value === "undefined" && !allowMissing) {
      throw new $TypeError$3("intrinsic " + name + " exists, but is not available. Please file an issue!");
    }
    return {
      alias,
      name: intrinsicName,
      value
    };
  }
  throw new $SyntaxError$1("intrinsic " + name + " does not exist!");
};
var getIntrinsic = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== "string" || name.length === 0) {
    throw new $TypeError$3("intrinsic name must be a non-empty string");
  }
  if (arguments.length > 1 && typeof allowMissing !== "boolean") {
    throw new $TypeError$3('"allowMissing" argument must be a boolean');
  }
  if ($exec(/^%?[^%]*%?$/, name) === null) {
    throw new $SyntaxError$1("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  }
  var parts = stringToPath$1(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
  var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;
  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat$1([0, 1], alias));
  }
  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    var part = parts[i];
    var first = $strSlice(part, 0, 1);
    var last2 = $strSlice(part, -1);
    if ((first === '"' || first === "'" || first === "`" || (last2 === '"' || last2 === "'" || last2 === "`")) && first !== last2) {
      throw new $SyntaxError$1("property names with quotes must have matching quotes");
    }
    if (part === "constructor" || !isOwn) {
      skipFurtherCaching = true;
    }
    intrinsicBaseName += "." + part;
    intrinsicRealName = "%" + intrinsicBaseName + "%";
    if (hasOwn$1(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError$3("base intrinsic for " + name + " exists, but the property is not available.");
        }
        return void 0;
      }
      if ($gOPD$1 && i + 1 >= parts.length) {
        var desc = $gOPD$1(value, part);
        isOwn = !!desc;
        if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn$1(value, part);
        value = value[part];
      }
      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }
  return value;
};
var callBind$1 = { exports: {} };
var esDefineProperty;
var hasRequiredEsDefineProperty;
function requireEsDefineProperty() {
  if (hasRequiredEsDefineProperty) return esDefineProperty;
  hasRequiredEsDefineProperty = 1;
  var GetIntrinsic3 = getIntrinsic;
  var $defineProperty2 = GetIntrinsic3("%Object.defineProperty%", true) || false;
  if ($defineProperty2) {
    try {
      $defineProperty2({}, "a", { value: 1 });
    } catch (e2) {
      $defineProperty2 = false;
    }
  }
  esDefineProperty = $defineProperty2;
  return esDefineProperty;
}
var GetIntrinsic$3 = getIntrinsic;
var $gOPD = GetIntrinsic$3("%Object.getOwnPropertyDescriptor%", true);
if ($gOPD) {
  try {
    $gOPD([], "length");
  } catch (e2) {
    $gOPD = null;
  }
}
var gopd$1 = $gOPD;
var $defineProperty$1 = requireEsDefineProperty();
var $SyntaxError = syntax;
var $TypeError$2 = type;
var gopd = gopd$1;
var defineDataProperty = function defineDataProperty2(obj, property2, value) {
  if (!obj || typeof obj !== "object" && typeof obj !== "function") {
    throw new $TypeError$2("`obj` must be an object or a function`");
  }
  if (typeof property2 !== "string" && typeof property2 !== "symbol") {
    throw new $TypeError$2("`property` must be a string or a symbol`");
  }
  if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
    throw new $TypeError$2("`nonEnumerable`, if provided, must be a boolean or null");
  }
  if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
    throw new $TypeError$2("`nonWritable`, if provided, must be a boolean or null");
  }
  if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
    throw new $TypeError$2("`nonConfigurable`, if provided, must be a boolean or null");
  }
  if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
    throw new $TypeError$2("`loose`, if provided, must be a boolean");
  }
  var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
  var nonWritable = arguments.length > 4 ? arguments[4] : null;
  var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
  var loose = arguments.length > 6 ? arguments[6] : false;
  var desc = !!gopd && gopd(obj, property2);
  if ($defineProperty$1) {
    $defineProperty$1(obj, property2, {
      configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
      enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
      value,
      writable: nonWritable === null && desc ? desc.writable : !nonWritable
    });
  } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
    obj[property2] = value;
  } else {
    throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
  }
};
var $defineProperty = requireEsDefineProperty();
var hasPropertyDescriptors = function hasPropertyDescriptors2() {
  return !!$defineProperty;
};
hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
  if (!$defineProperty) {
    return null;
  }
  try {
    return $defineProperty([], "length", { value: 1 }).length !== 1;
  } catch (e2) {
    return true;
  }
};
var hasPropertyDescriptors_1 = hasPropertyDescriptors;
var GetIntrinsic$2 = getIntrinsic;
var define = defineDataProperty;
var hasDescriptors = hasPropertyDescriptors_1();
var gOPD = gopd$1;
var $TypeError$1 = type;
var $floor$1 = GetIntrinsic$2("%Math.floor%");
var setFunctionLength = function setFunctionLength2(fn, length) {
  if (typeof fn !== "function") {
    throw new $TypeError$1("`fn` is not a function");
  }
  if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor$1(length) !== length) {
    throw new $TypeError$1("`length` must be a positive 32-bit integer");
  }
  var loose = arguments.length > 2 && !!arguments[2];
  var functionLengthIsConfigurable = true;
  var functionLengthIsWritable = true;
  if ("length" in fn && gOPD) {
    var desc = gOPD(fn, "length");
    if (desc && !desc.configurable) {
      functionLengthIsConfigurable = false;
    }
    if (desc && !desc.writable) {
      functionLengthIsWritable = false;
    }
  }
  if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
    if (hasDescriptors) {
      define(
        /** @type {Parameters<define>[0]} */
        fn,
        "length",
        length,
        true,
        true
      );
    } else {
      define(
        /** @type {Parameters<define>[0]} */
        fn,
        "length",
        length
      );
    }
  }
  return fn;
};
(function(module2) {
  var bind3 = functionBind;
  var GetIntrinsic3 = getIntrinsic;
  var setFunctionLength$1 = setFunctionLength;
  var $TypeError2 = type;
  var $apply = GetIntrinsic3("%Function.prototype.apply%");
  var $call = GetIntrinsic3("%Function.prototype.call%");
  var $reflectApply = GetIntrinsic3("%Reflect.apply%", true) || bind3.call($call, $apply);
  var $defineProperty2 = requireEsDefineProperty();
  var $max = GetIntrinsic3("%Math.max%");
  module2.exports = function callBind2(originalFunction) {
    if (typeof originalFunction !== "function") {
      throw new $TypeError2("a function is required");
    }
    var func = $reflectApply(bind3, $call, arguments);
    return setFunctionLength$1(
      func,
      1 + $max(0, originalFunction.length - (arguments.length - 1)),
      true
    );
  };
  var applyBind = function applyBind2() {
    return $reflectApply(bind3, $apply, arguments);
  };
  if ($defineProperty2) {
    $defineProperty2(module2.exports, "apply", { value: applyBind });
  } else {
    module2.exports.apply = applyBind;
  }
})(callBind$1);
var callBindExports = callBind$1.exports;
var GetIntrinsic$1 = getIntrinsic;
var callBind = callBindExports;
var $indexOf = callBind(GetIntrinsic$1("String.prototype.indexOf"));
var callBound$1 = function callBoundIntrinsic(name, allowMissing) {
  var intrinsic = GetIntrinsic$1(name, !!allowMissing);
  if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
    return callBind(intrinsic);
  }
  return intrinsic;
};
const fs$1 = {};
const __viteBrowserExternal = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: fs$1
}, Symbol.toStringTag, { value: "Module" }));
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal);
var hasMap = typeof Map === "function" && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === "function" && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;
var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
  return O.__proto__;
} : null);
function addNumericSeparator(num, str) {
  if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
    return str;
  }
  var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  if (typeof num === "number") {
    var int = num < 0 ? -$floor(-num) : $floor(num);
    if (int !== num) {
      var intStr = String(int);
      var dec = $slice.call(str, intStr.length + 1);
      return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
    }
  }
  return $replace.call(str, sepRegex, "$&_");
}
var utilInspect = require$$0;
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol$1(inspectCustom) ? inspectCustom : null;
var objectInspect = function inspect_(obj, options, depth, seen) {
  var opts = options || {};
  if (has$3(opts, "quoteStyle") && (opts.quoteStyle !== "single" && opts.quoteStyle !== "double")) {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }
  if (has$3(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  }
  var customInspect = has$3(opts, "customInspect") ? opts.customInspect : true;
  if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
    throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
  }
  if (has$3(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  }
  if (has$3(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  }
  var numericSeparator = opts.numericSeparator;
  if (typeof obj === "undefined") {
    return "undefined";
  }
  if (obj === null) {
    return "null";
  }
  if (typeof obj === "boolean") {
    return obj ? "true" : "false";
  }
  if (typeof obj === "string") {
    return inspectString(obj, opts);
  }
  if (typeof obj === "number") {
    if (obj === 0) {
      return Infinity / obj > 0 ? "0" : "-0";
    }
    var str = String(obj);
    return numericSeparator ? addNumericSeparator(obj, str) : str;
  }
  if (typeof obj === "bigint") {
    var bigIntStr = String(obj) + "n";
    return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
  }
  var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
  if (typeof depth === "undefined") {
    depth = 0;
  }
  if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
    return isArray$3(obj) ? "[Array]" : "[Object]";
  }
  var indent = getIndent(opts, depth);
  if (typeof seen === "undefined") {
    seen = [];
  } else if (indexOf(seen, obj) >= 0) {
    return "[Circular]";
  }
  function inspect2(value, from, noIndent) {
    if (from) {
      seen = $arrSlice.call(seen);
      seen.push(from);
    }
    if (noIndent) {
      var newOpts = {
        depth: opts.depth
      };
      if (has$3(opts, "quoteStyle")) {
        newOpts.quoteStyle = opts.quoteStyle;
      }
      return inspect_(value, newOpts, depth + 1, seen);
    }
    return inspect_(value, opts, depth + 1, seen);
  }
  if (typeof obj === "function" && !isRegExp$1(obj)) {
    var name = nameOf(obj);
    var keys2 = arrObjKeys(obj, inspect2);
    return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys2.length > 0 ? " { " + $join.call(keys2, ", ") + " }" : "");
  }
  if (isSymbol$1(obj)) {
    var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
    return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
  }
  if (isElement(obj)) {
    var s = "<" + $toLowerCase.call(String(obj.nodeName));
    var attrs = obj.attributes || [];
    for (var i = 0; i < attrs.length; i++) {
      s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
    }
    s += ">";
    if (obj.childNodes && obj.childNodes.length) {
      s += "...";
    }
    s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
    return s;
  }
  if (isArray$3(obj)) {
    if (obj.length === 0) {
      return "[]";
    }
    var xs = arrObjKeys(obj, inspect2);
    if (indent && !singleLineValues(xs)) {
      return "[" + indentedJoin(xs, indent) + "]";
    }
    return "[ " + $join.call(xs, ", ") + " ]";
  }
  if (isError(obj)) {
    var parts = arrObjKeys(obj, inspect2);
    if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
      return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect2(obj.cause), parts), ", ") + " }";
    }
    if (parts.length === 0) {
      return "[" + String(obj) + "]";
    }
    return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
  }
  if (typeof obj === "object" && customInspect) {
    if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
      return utilInspect(obj, { depth: maxDepth - depth });
    } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
      return obj.inspect();
    }
  }
  if (isMap(obj)) {
    var mapParts = [];
    if (mapForEach) {
      mapForEach.call(obj, function(value, key) {
        mapParts.push(inspect2(key, obj, true) + " => " + inspect2(value, obj));
      });
    }
    return collectionOf("Map", mapSize.call(obj), mapParts, indent);
  }
  if (isSet(obj)) {
    var setParts = [];
    if (setForEach) {
      setForEach.call(obj, function(value) {
        setParts.push(inspect2(value, obj));
      });
    }
    return collectionOf("Set", setSize.call(obj), setParts, indent);
  }
  if (isWeakMap(obj)) {
    return weakCollectionOf("WeakMap");
  }
  if (isWeakSet(obj)) {
    return weakCollectionOf("WeakSet");
  }
  if (isWeakRef(obj)) {
    return weakCollectionOf("WeakRef");
  }
  if (isNumber(obj)) {
    return markBoxed(inspect2(Number(obj)));
  }
  if (isBigInt(obj)) {
    return markBoxed(inspect2(bigIntValueOf.call(obj)));
  }
  if (isBoolean(obj)) {
    return markBoxed(booleanValueOf.call(obj));
  }
  if (isString(obj)) {
    return markBoxed(inspect2(String(obj)));
  }
  if (typeof window !== "undefined" && obj === window) {
    return "{ [object Window] }";
  }
  if (typeof globalThis !== "undefined" && obj === globalThis || typeof commonjsGlobal !== "undefined" && obj === commonjsGlobal) {
    return "{ [object globalThis] }";
  }
  if (!isDate(obj) && !isRegExp$1(obj)) {
    var ys = arrObjKeys(obj, inspect2);
    var isPlainObject2 = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
    var protoTag = obj instanceof Object ? "" : "null prototype";
    var stringTag2 = !isPlainObject2 && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
    var constructorTag = isPlainObject2 || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
    var tag = constructorTag + (stringTag2 || protoTag ? "[" + $join.call($concat.call([], stringTag2 || [], protoTag || []), ": ") + "] " : "");
    if (ys.length === 0) {
      return tag + "{}";
    }
    if (indent) {
      return tag + "{" + indentedJoin(ys, indent) + "}";
    }
    return tag + "{ " + $join.call(ys, ", ") + " }";
  }
  return String(obj);
};
function wrapQuotes(s, defaultStyle, opts) {
  var quoteChar = (opts.quoteStyle || defaultStyle) === "double" ? '"' : "'";
  return quoteChar + s + quoteChar;
}
function quote(s) {
  return $replace.call(String(s), /"/g, "&quot;");
}
function isArray$3(obj) {
  return toStr(obj) === "[object Array]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isDate(obj) {
  return toStr(obj) === "[object Date]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isRegExp$1(obj) {
  return toStr(obj) === "[object RegExp]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isError(obj) {
  return toStr(obj) === "[object Error]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isString(obj) {
  return toStr(obj) === "[object String]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isNumber(obj) {
  return toStr(obj) === "[object Number]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isBoolean(obj) {
  return toStr(obj) === "[object Boolean]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
}
function isSymbol$1(obj) {
  if (hasShammedSymbols) {
    return obj && typeof obj === "object" && obj instanceof Symbol;
  }
  if (typeof obj === "symbol") {
    return true;
  }
  if (!obj || typeof obj !== "object" || !symToString) {
    return false;
  }
  try {
    symToString.call(obj);
    return true;
  } catch (e2) {
  }
  return false;
}
function isBigInt(obj) {
  if (!obj || typeof obj !== "object" || !bigIntValueOf) {
    return false;
  }
  try {
    bigIntValueOf.call(obj);
    return true;
  } catch (e2) {
  }
  return false;
}
var hasOwn = Object.prototype.hasOwnProperty || function(key) {
  return key in this;
};
function has$3(obj, key) {
  return hasOwn.call(obj, key);
}
function toStr(obj) {
  return objectToString.call(obj);
}
function nameOf(f) {
  if (f.name) {
    return f.name;
  }
  var m2 = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
  if (m2) {
    return m2[1];
  }
  return null;
}
function indexOf(xs, x) {
  if (xs.indexOf) {
    return xs.indexOf(x);
  }
  for (var i = 0, l2 = xs.length; i < l2; i++) {
    if (xs[i] === x) {
      return i;
    }
  }
  return -1;
}
function isMap(x) {
  if (!mapSize || !x || typeof x !== "object") {
    return false;
  }
  try {
    mapSize.call(x);
    try {
      setSize.call(x);
    } catch (s) {
      return true;
    }
    return x instanceof Map;
  } catch (e2) {
  }
  return false;
}
function isWeakMap(x) {
  if (!weakMapHas || !x || typeof x !== "object") {
    return false;
  }
  try {
    weakMapHas.call(x, weakMapHas);
    try {
      weakSetHas.call(x, weakSetHas);
    } catch (s) {
      return true;
    }
    return x instanceof WeakMap;
  } catch (e2) {
  }
  return false;
}
function isWeakRef(x) {
  if (!weakRefDeref || !x || typeof x !== "object") {
    return false;
  }
  try {
    weakRefDeref.call(x);
    return true;
  } catch (e2) {
  }
  return false;
}
function isSet(x) {
  if (!setSize || !x || typeof x !== "object") {
    return false;
  }
  try {
    setSize.call(x);
    try {
      mapSize.call(x);
    } catch (m2) {
      return true;
    }
    return x instanceof Set;
  } catch (e2) {
  }
  return false;
}
function isWeakSet(x) {
  if (!weakSetHas || !x || typeof x !== "object") {
    return false;
  }
  try {
    weakSetHas.call(x, weakSetHas);
    try {
      weakMapHas.call(x, weakMapHas);
    } catch (s) {
      return true;
    }
    return x instanceof WeakSet;
  } catch (e2) {
  }
  return false;
}
function isElement(x) {
  if (!x || typeof x !== "object") {
    return false;
  }
  if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
    return true;
  }
  return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
}
function inspectString(str, opts) {
  if (str.length > opts.maxStringLength) {
    var remaining = str.length - opts.maxStringLength;
    var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
    return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
  }
  var s = $replace.call($replace.call(str, /(['\\])/g, "\\$1"), /[\x00-\x1f]/g, lowbyte);
  return wrapQuotes(s, "single", opts);
}
function lowbyte(c) {
  var n2 = c.charCodeAt(0);
  var x = {
    8: "b",
    9: "t",
    10: "n",
    12: "f",
    13: "r"
  }[n2];
  if (x) {
    return "\\" + x;
  }
  return "\\x" + (n2 < 16 ? "0" : "") + $toUpperCase.call(n2.toString(16));
}
function markBoxed(str) {
  return "Object(" + str + ")";
}
function weakCollectionOf(type2) {
  return type2 + " { ? }";
}
function collectionOf(type2, size, entries, indent) {
  var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
  return type2 + " (" + size + ") {" + joinedEntries + "}";
}
function singleLineValues(xs) {
  for (var i = 0; i < xs.length; i++) {
    if (indexOf(xs[i], "\n") >= 0) {
      return false;
    }
  }
  return true;
}
function getIndent(opts, depth) {
  var baseIndent;
  if (opts.indent === "	") {
    baseIndent = "	";
  } else if (typeof opts.indent === "number" && opts.indent > 0) {
    baseIndent = $join.call(Array(opts.indent + 1), " ");
  } else {
    return null;
  }
  return {
    base: baseIndent,
    prev: $join.call(Array(depth + 1), baseIndent)
  };
}
function indentedJoin(xs, indent) {
  if (xs.length === 0) {
    return "";
  }
  var lineJoiner = "\n" + indent.prev + indent.base;
  return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
}
function arrObjKeys(obj, inspect2) {
  var isArr = isArray$3(obj);
  var xs = [];
  if (isArr) {
    xs.length = obj.length;
    for (var i = 0; i < obj.length; i++) {
      xs[i] = has$3(obj, i) ? inspect2(obj[i], obj) : "";
    }
  }
  var syms = typeof gOPS === "function" ? gOPS(obj) : [];
  var symMap;
  if (hasShammedSymbols) {
    symMap = {};
    for (var k2 = 0; k2 < syms.length; k2++) {
      symMap["$" + syms[k2]] = syms[k2];
    }
  }
  for (var key in obj) {
    if (!has$3(obj, key)) {
      continue;
    }
    if (isArr && String(Number(key)) === key && key < obj.length) {
      continue;
    }
    if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
      continue;
    } else if ($test.call(/[^\w$]/, key)) {
      xs.push(inspect2(key, obj) + ": " + inspect2(obj[key], obj));
    } else {
      xs.push(key + ": " + inspect2(obj[key], obj));
    }
  }
  if (typeof gOPS === "function") {
    for (var j = 0; j < syms.length; j++) {
      if (isEnumerable.call(obj, syms[j])) {
        xs.push("[" + inspect2(syms[j]) + "]: " + inspect2(obj[syms[j]], obj));
      }
    }
  }
  return xs;
}
var GetIntrinsic2 = getIntrinsic;
var callBound = callBound$1;
var inspect = objectInspect;
var $TypeError = type;
var $WeakMap = GetIntrinsic2("%WeakMap%", true);
var $Map = GetIntrinsic2("%Map%", true);
var $weakMapGet = callBound("WeakMap.prototype.get", true);
var $weakMapSet = callBound("WeakMap.prototype.set", true);
var $weakMapHas = callBound("WeakMap.prototype.has", true);
var $mapGet = callBound("Map.prototype.get", true);
var $mapSet = callBound("Map.prototype.set", true);
var $mapHas = callBound("Map.prototype.has", true);
var listGetNode = function(list, key) {
  var prev = list;
  var curr;
  for (; (curr = prev.next) !== null; prev = curr) {
    if (curr.key === key) {
      prev.next = curr.next;
      curr.next = /** @type {NonNullable<typeof list.next>} */
      list.next;
      list.next = curr;
      return curr;
    }
  }
};
var listGet = function(objects, key) {
  var node = listGetNode(objects, key);
  return node && node.value;
};
var listSet = function(objects, key, value) {
  var node = listGetNode(objects, key);
  if (node) {
    node.value = value;
  } else {
    objects.next = /** @type {import('.').ListNode<typeof value>} */
    {
      // eslint-disable-line no-param-reassign, no-extra-parens
      key,
      next: objects.next,
      value
    };
  }
};
var listHas = function(objects, key) {
  return !!listGetNode(objects, key);
};
var sideChannel = function getSideChannel() {
  var $wm;
  var $m;
  var $o2;
  var channel = {
    assert: function(key) {
      if (!channel.has(key)) {
        throw new $TypeError("Side channel does not contain " + inspect(key));
      }
    },
    get: function(key) {
      if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
        if ($wm) {
          return $weakMapGet($wm, key);
        }
      } else if ($Map) {
        if ($m) {
          return $mapGet($m, key);
        }
      } else {
        if ($o2) {
          return listGet($o2, key);
        }
      }
    },
    has: function(key) {
      if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
        if ($wm) {
          return $weakMapHas($wm, key);
        }
      } else if ($Map) {
        if ($m) {
          return $mapHas($m, key);
        }
      } else {
        if ($o2) {
          return listHas($o2, key);
        }
      }
      return false;
    },
    set: function(key, value) {
      if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
        if (!$wm) {
          $wm = new $WeakMap();
        }
        $weakMapSet($wm, key, value);
      } else if ($Map) {
        if (!$m) {
          $m = new $Map();
        }
        $mapSet($m, key, value);
      } else {
        if (!$o2) {
          $o2 = { key: {}, next: null };
        }
        listSet($o2, key, value);
      }
    }
  };
  return channel;
};
var replace = String.prototype.replace;
var percentTwenties = /%20/g;
var Format = {
  RFC1738: "RFC1738",
  RFC3986: "RFC3986"
};
var formats$3 = {
  "default": Format.RFC3986,
  formatters: {
    RFC1738: function(value) {
      return replace.call(value, percentTwenties, "+");
    },
    RFC3986: function(value) {
      return String(value);
    }
  },
  RFC1738: Format.RFC1738,
  RFC3986: Format.RFC3986
};
var formats$2 = formats$3;
var has$2 = Object.prototype.hasOwnProperty;
var isArray$2 = Array.isArray;
var hexTable = function() {
  var array = [];
  for (var i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
}();
var compactQueue = function compactQueue2(queue) {
  while (queue.length > 1) {
    var item = queue.pop();
    var obj = item.obj[item.prop];
    if (isArray$2(obj)) {
      var compacted = [];
      for (var j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== "undefined") {
          compacted.push(obj[j]);
        }
      }
      item.obj[item.prop] = compacted;
    }
  }
};
var arrayToObject = function arrayToObject2(source, options) {
  var obj = options && options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  for (var i = 0; i < source.length; ++i) {
    if (typeof source[i] !== "undefined") {
      obj[i] = source[i];
    }
  }
  return obj;
};
var merge = function merge2(target, source, options) {
  if (!source) {
    return target;
  }
  if (typeof source !== "object") {
    if (isArray$2(target)) {
      target.push(source);
    } else if (target && typeof target === "object") {
      if (options && (options.plainObjects || options.allowPrototypes) || !has$2.call(Object.prototype, source)) {
        target[source] = true;
      }
    } else {
      return [target, source];
    }
    return target;
  }
  if (!target || typeof target !== "object") {
    return [target].concat(source);
  }
  var mergeTarget = target;
  if (isArray$2(target) && !isArray$2(source)) {
    mergeTarget = arrayToObject(target, options);
  }
  if (isArray$2(target) && isArray$2(source)) {
    source.forEach(function(item, i) {
      if (has$2.call(target, i)) {
        var targetItem = target[i];
        if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
          target[i] = merge2(targetItem, item, options);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }
  return Object.keys(source).reduce(function(acc, key) {
    var value = source[key];
    if (has$2.call(acc, key)) {
      acc[key] = merge2(acc[key], value, options);
    } else {
      acc[key] = value;
    }
    return acc;
  }, mergeTarget);
};
var assign = function assignSingleSource(target, source) {
  return Object.keys(source).reduce(function(acc, key) {
    acc[key] = source[key];
    return acc;
  }, target);
};
var decode = function(str, decoder, charset) {
  var strWithoutPlus = str.replace(/\+/g, " ");
  if (charset === "iso-8859-1") {
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  }
  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e2) {
    return strWithoutPlus;
  }
};
var limit = 1024;
var encode = function encode2(str, defaultEncoder, charset, kind, format) {
  if (str.length === 0) {
    return str;
  }
  var string = str;
  if (typeof str === "symbol") {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== "string") {
    string = String(str);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  var out = "";
  for (var j = 0; j < string.length; j += limit) {
    var segment = string.length >= limit ? string.slice(j, j + limit) : string;
    var arr = [];
    for (var i = 0; i < segment.length; ++i) {
      var c = segment.charCodeAt(i);
      if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats$2.RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hexTable[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
};
var compact = function compact2(value) {
  var queue = [{ obj: { o: value }, prop: "o" }];
  var refs = [];
  for (var i = 0; i < queue.length; ++i) {
    var item = queue[i];
    var obj = item.obj[item.prop];
    var keys2 = Object.keys(obj);
    for (var j = 0; j < keys2.length; ++j) {
      var key = keys2[j];
      var val = obj[key];
      if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
        queue.push({ obj, prop: key });
        refs.push(val);
      }
    }
  }
  compactQueue(queue);
  return value;
};
var isRegExp = function isRegExp2(obj) {
  return Object.prototype.toString.call(obj) === "[object RegExp]";
};
var isBuffer$1 = function isBuffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};
var combine = function combine2(a, b) {
  return [].concat(a, b);
};
var maybeMap = function maybeMap2(val, fn) {
  if (isArray$2(val)) {
    var mapped = [];
    for (var i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
};
var utils$2 = {
  arrayToObject,
  assign,
  combine,
  compact,
  decode,
  encode,
  isBuffer: isBuffer$1,
  isRegExp,
  maybeMap,
  merge
};
var getSideChannel2 = sideChannel;
var utils$1 = utils$2;
var formats$1 = formats$3;
var has$1 = Object.prototype.hasOwnProperty;
var arrayPrefixGenerators = {
  brackets: function brackets(prefix) {
    return prefix + "[]";
  },
  comma: "comma",
  indices: function indices(prefix, key) {
    return prefix + "[" + key + "]";
  },
  repeat: function repeat(prefix) {
    return prefix;
  }
};
var isArray$1 = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function(arr, valueOrArray) {
  push.apply(arr, isArray$1(valueOrArray) ? valueOrArray : [valueOrArray]);
};
var toISO = Date.prototype.toISOString;
var defaultFormat = formats$1["default"];
var defaults$1 = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: utils$1.encode,
  encodeValuesOnly: false,
  format: defaultFormat,
  formatter: formats$1.formatters[defaultFormat],
  // deprecated
  indices: false,
  serializeDate: function serializeDate(date) {
    return toISO.call(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
};
var sentinel = {};
var stringify$1 = function stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate2, format, formatter, encodeValuesOnly, charset, sideChannel2) {
  var obj = object;
  var tmpSc = sideChannel2;
  var step = 0;
  var findFlag = false;
  while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
    var pos = tmpSc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        findFlag = true;
      }
    }
    if (typeof tmpSc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate2(obj);
  } else if (generateArrayPrefix === "comma" && isArray$1(obj)) {
    obj = utils$1.maybeMap(obj, function(value2) {
      if (value2 instanceof Date) {
        return serializeDate2(value2);
      }
      return value2;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset, "key", format) : prefix;
    }
    obj = "";
  }
  if (isNonNullishPrimitive(obj) || utils$1.isBuffer(obj)) {
    if (encoder) {
      var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset, "key", format);
      return [formatter(keyValue) + "=" + formatter(encoder(obj, defaults$1.encoder, charset, "value", format))];
    }
    return [formatter(prefix) + "=" + formatter(String(obj))];
  }
  var values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  var objKeys;
  if (generateArrayPrefix === "comma" && isArray$1(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = utils$1.maybeMap(obj, encoder);
    }
    objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (isArray$1(filter)) {
    objKeys = filter;
  } else {
    var keys2 = Object.keys(obj);
    objKeys = sort ? keys2.sort(sort) : keys2;
  }
  var encodedPrefix = encodeDotInKeys ? prefix.replace(/\./g, "%2E") : prefix;
  var adjustedPrefix = commaRoundTrip && isArray$1(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
  if (allowEmptyArrays && isArray$1(obj) && obj.length === 0) {
    return adjustedPrefix + "[]";
  }
  for (var j = 0; j < objKeys.length; ++j) {
    var key = objKeys[j];
    var value = typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key];
    if (skipNulls && value === null) {
      continue;
    }
    var encodedKey = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    var keyPrefix = isArray$1(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
    sideChannel2.set(object, step);
    var valueSideChannel = getSideChannel2();
    valueSideChannel.set(sentinel, sideChannel2);
    pushToArray(values, stringify(
      value,
      keyPrefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      generateArrayPrefix === "comma" && encodeValuesOnly && isArray$1(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate2,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
};
var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
  if (!opts) {
    return defaults$1;
  }
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  var charset = opts.charset || defaults$1.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  var format = formats$1["default"];
  if (typeof opts.format !== "undefined") {
    if (!has$1.call(formats$1.formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  var formatter = formats$1.formatters[format];
  var filter = defaults$1.filter;
  if (typeof opts.filter === "function" || isArray$1(opts.filter)) {
    filter = opts.filter;
  }
  var arrayFormat;
  if (opts.arrayFormat in arrayPrefixGenerators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults$1.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults$1.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults$1.addQueryPrefix,
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults$1.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults$1.charsetSentinel,
    commaRoundTrip: opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults$1.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults$1.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults$1.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults$1.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults$1.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults$1.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults$1.skipNulls,
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults$1.strictNullHandling
  };
};
var stringify_1 = function(object, opts) {
  var obj = object;
  var options = normalizeStringifyOptions(opts);
  var objKeys;
  var filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (isArray$1(options.filter)) {
    filter = options.filter;
    objKeys = filter;
  }
  var keys2 = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
  var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!objKeys) {
    objKeys = Object.keys(obj);
  }
  if (options.sort) {
    objKeys.sort(options.sort);
  }
  var sideChannel2 = getSideChannel2();
  for (var i = 0; i < objKeys.length; ++i) {
    var key = objKeys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    pushToArray(keys2, stringify$1(
      obj[key],
      key,
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel2
    ));
  }
  var joined = keys2.join(options.delimiter);
  var prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
};
var utils = utils$2;
var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var defaults = {
  allowDots: false,
  allowEmptyArrays: false,
  allowPrototypes: false,
  allowSparse: false,
  arrayLimit: 20,
  charset: "utf-8",
  charsetSentinel: false,
  comma: false,
  decodeDotInKeys: false,
  decoder: utils.decode,
  delimiter: "&",
  depth: 5,
  duplicates: "combine",
  ignoreQueryPrefix: false,
  interpretNumericEntities: false,
  parameterLimit: 1e3,
  parseArrays: true,
  plainObjects: false,
  strictNullHandling: false
};
var interpretNumericEntities = function(str) {
  return str.replace(/&#(\d+);/g, function($0, numberStr) {
    return String.fromCharCode(parseInt(numberStr, 10));
  });
};
var parseArrayValue = function(val, options) {
  if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
    return val.split(",");
  }
  return val;
};
var isoSentinel = "utf8=%26%2310003%3B";
var charsetSentinel = "utf8=%E2%9C%93";
var parseValues = function parseQueryStringValues(str, options) {
  var obj = { __proto__: null };
  var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
  cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  var limit2 = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
  var parts = cleanStr.split(options.delimiter, limit2);
  var skipIndex = -1;
  var i;
  var charset = options.charset;
  if (options.charsetSentinel) {
    for (i = 0; i < parts.length; ++i) {
      if (parts[i].indexOf("utf8=") === 0) {
        if (parts[i] === charsetSentinel) {
          charset = "utf-8";
        } else if (parts[i] === isoSentinel) {
          charset = "iso-8859-1";
        }
        skipIndex = i;
        i = parts.length;
      }
    }
  }
  for (i = 0; i < parts.length; ++i) {
    if (i === skipIndex) {
      continue;
    }
    var part = parts[i];
    var bracketEqualsPos = part.indexOf("]=");
    var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
    var key, val;
    if (pos === -1) {
      key = options.decoder(part, defaults.decoder, charset, "key");
      val = options.strictNullHandling ? null : "";
    } else {
      key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
      val = utils.maybeMap(
        parseArrayValue(part.slice(pos + 1), options),
        function(encodedVal) {
          return options.decoder(encodedVal, defaults.decoder, charset, "value");
        }
      );
    }
    if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
      val = interpretNumericEntities(val);
    }
    if (part.indexOf("[]=") > -1) {
      val = isArray(val) ? [val] : val;
    }
    var existing = has.call(obj, key);
    if (existing && options.duplicates === "combine") {
      obj[key] = utils.combine(obj[key], val);
    } else if (!existing || options.duplicates === "last") {
      obj[key] = val;
    }
  }
  return obj;
};
var parseObject = function(chain, val, options, valuesParsed) {
  var leaf = valuesParsed ? val : parseArrayValue(val, options);
  for (var i = chain.length - 1; i >= 0; --i) {
    var obj;
    var root2 = chain[i];
    if (root2 === "[]" && options.parseArrays) {
      obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : [].concat(leaf);
    } else {
      obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
      var cleanRoot = root2.charAt(0) === "[" && root2.charAt(root2.length - 1) === "]" ? root2.slice(1, -1) : root2;
      var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
      var index = parseInt(decodedRoot, 10);
      if (!options.parseArrays && decodedRoot === "") {
        obj = { 0: leaf };
      } else if (!isNaN(index) && root2 !== decodedRoot && String(index) === decodedRoot && index >= 0 && (options.parseArrays && index <= options.arrayLimit)) {
        obj = [];
        obj[index] = leaf;
      } else if (decodedRoot !== "__proto__") {
        obj[decodedRoot] = leaf;
      }
    }
    leaf = obj;
  }
  return leaf;
};
var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
  if (!givenKey) {
    return;
  }
  var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, "[$1]") : givenKey;
  var brackets2 = /(\[[^[\]]*])/;
  var child = /(\[[^[\]]*])/g;
  var segment = options.depth > 0 && brackets2.exec(key);
  var parent = segment ? key.slice(0, segment.index) : key;
  var keys2 = [];
  if (parent) {
    if (!options.plainObjects && has.call(Object.prototype, parent)) {
      if (!options.allowPrototypes) {
        return;
      }
    }
    keys2.push(parent);
  }
  var i = 0;
  while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
    i += 1;
    if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
      if (!options.allowPrototypes) {
        return;
      }
    }
    keys2.push(segment[1]);
  }
  if (segment) {
    keys2.push("[" + key.slice(segment.index) + "]");
  }
  return parseObject(keys2, val, options, valuesParsed);
};
var normalizeParseOptions = function normalizeParseOptions2(opts) {
  if (!opts) {
    return defaults;
  }
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
    throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
    throw new TypeError("Decoder has to be a function.");
  }
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
  var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
  if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
    throw new TypeError("The duplicates option must be either combine, first, or last");
  }
  var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
    allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
    arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
    decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
    decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
    delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
    duplicates,
    ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
    interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
    parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
    parseArrays: opts.parseArrays !== false,
    plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
};
var parse$1 = function(str, opts) {
  var options = normalizeParseOptions(opts);
  if (str === "" || str === null || typeof str === "undefined") {
    return options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  }
  var tempObj = typeof str === "string" ? parseValues(str, options) : str;
  var obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {};
  var keys2 = Object.keys(tempObj);
  for (var i = 0; i < keys2.length; ++i) {
    var key = keys2[i];
    var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
    obj = utils.merge(obj, newObj, options);
  }
  if (options.allowSparse === true) {
    return obj;
  }
  return utils.compact(obj);
};
var stringify2 = stringify_1;
var parse = parse$1;
var formats = formats$3;
var lib = {
  formats,
  parse,
  stringify: stringify2
};
const G = /* @__PURE__ */ getDefaultExportFromCjs(lib);
function warnOnce(condition, ...rest) {
}
var warnOnce_1 = warnOnce;
const Fu = /* @__PURE__ */ getDefaultExportFromCjs(warnOnce_1);
function fromPairs(pairs) {
  var index = -1, length = pairs == null ? 0 : pairs.length, result = {};
  while (++index < length) {
    var pair = pairs[index];
    result[pair[0]] = pair[1];
  }
  return result;
}
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
function baseProperty(key) {
  return function(object) {
    return object == null ? void 0 : object[key];
  };
}
function baseTimes(n2, iteratee) {
  var index = -1, result = Array(n2);
  while (++index < n2) {
    result[index] = iteratee(index);
  }
  return result;
}
var nativeMax$2 = Math.max;
function unzip(array) {
  if (!(array && array.length)) {
    return [];
  }
  var length = 0;
  array = arrayFilter(array, function(group) {
    if (isArrayLikeObject(group)) {
      length = nativeMax$2(group.length, length);
      return true;
    }
  });
  return baseTimes(length, function(index) {
    return arrayMap(array, baseProperty(index));
  });
}
var zip = baseRest(unzip);
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var pluralize = { exports: {} };
(function(module2, exports2) {
  (function(root2, pluralize2) {
    if (typeof commonjsRequire === "function" && true && true) {
      module2.exports = pluralize2();
    } else {
      root2.pluralize = pluralize2();
    }
  })(commonjsGlobal, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token) return token;
      if (word === word.toLowerCase()) return token.toLowerCase();
      if (word === word.toUpperCase()) return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index) {
        return args[index] || "";
      });
    }
    function replace2(word, rule) {
      return word.replace(rule[0], function(match, index) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len = rules.length;
      while (len--) {
        var rule = rules[len];
        if (rule[0].test(word)) return replace2(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) return true;
        if (replaceMap.hasOwnProperty(token)) return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize2(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize2.singular(word) : pluralize2.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize2.plural = replaceWord(
      irregularSingles,
      irregularPlurals,
      pluralRules
    );
    pluralize2.isPlural = checkWord(
      irregularSingles,
      irregularPlurals,
      pluralRules
    );
    pluralize2.singular = replaceWord(
      irregularPlurals,
      irregularSingles,
      singularRules
    );
    pluralize2.isSingular = checkWord(
      irregularPlurals,
      irregularSingles,
      singularRules
    );
    pluralize2.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize2.addPluralRule(word, "$0");
      pluralize2.addSingularRule(word, "$0");
    };
    pluralize2.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      // Pronouns.
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      // Words ending in with a consonant and `o`.
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      // Ends with `us`.
      ["genus", "genera"],
      ["viscus", "viscera"],
      // Ends with `ma`.
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      // Other irregular rules.
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize2.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize2.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize2.addSingularRule(rule[0], rule[1]);
    });
    [
      // Singular words with no plurals.
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      // Regexes.
      /[^aeiou]ese$/i,
      // "chinese", "japanese"
      /deer$/i,
      // "deer", "reindeer"
      /fish$/i,
      // "fish", "blowfish", "angelfish"
      /measles$/i,
      /o[iu]s$/i,
      // "carnivorous"
      /pox$/i,
      // "chickpox", "smallpox"
      /sheep$/i
    ].forEach(pluralize2.addUncountableRule);
    return pluralize2;
  });
})(pluralize);
var pluralizeExports = pluralize.exports;
const ts = /* @__PURE__ */ getDefaultExportFromCjs(pluralizeExports);
var now = function() {
  return root.Date.now();
};
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
var symbolTag$1 = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag$1;
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var FUNC_ERROR_TEXT$1 = "Expected a function";
var nativeMax$1 = Math.max, nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax$1(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now());
  }
  function debounced() {
    var time = now(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
function stackGet(key) {
  return this.__data__.get(key);
}
function stackHas(key) {
  return this.__data__.has(key);
}
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$3 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
var Uint8Array$1 = root.Uint8Array;
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var COMPARE_PARTIAL_FLAG$2 = 1, COMPARE_UNORDERED_FLAG = 2;
var boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]";
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag$2:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag$1:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
        return false;
      }
      return true;
    case boolTag$1:
    case dateTag$1:
    case numberTag$1:
      return eq(+object, +other);
    case errorTag$1:
      return object.name == other.name && object.message == other.message;
    case regexpTag$1:
    case stringTag$1:
      return object == other + "";
    case mapTag$2:
      var convert = mapToArray;
    case setTag$2:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$4(object) ? result : arrayPush(result, symbolsFunc(object));
}
function stubArray() {
  return [];
}
var objectProto$5 = Object.prototype;
var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
function stubFalse() {
  return false;
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer = moduleExports$1 ? root.Buffer : void 0;
var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
var isBuffer2 = nativeIsBuffer || stubFalse;
var MAX_SAFE_INTEGER = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type2 = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type2 == "number" || type2 != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", mapTag$1 = "[object Map]", numberTag = "[object Number]", objectTag$2 = "[object Object]", regexpTag = "[object RegExp]", setTag$1 = "[object Set]", stringTag = "[object String]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag$1 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag$1] = typedArrayTags[numberTag] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag] = typedArrayTags[setTag$1] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal.process;
var nodeUtil = function() {
  try {
    var types = freeModule && freeModule.require && freeModule.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e2) {
  }
}();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray$4(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer2(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if (hasOwnProperty$3.call(value, key) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
var objectProto$3 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$3;
  return value === proto;
}
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var nativeKeys = overArg(Object.keys, Object);
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}
var COMPARE_PARTIAL_FLAG$1 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var DataView$1 = getNative(root, "DataView");
var Promise$1 = getNative(root, "Promise");
var WeakMap$1 = getNative(root, "WeakMap");
var mapTag = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag = "[object Set]", weakMapTag = "[object WeakMap]";
var dataViewTag = "[object DataView]";
var dataViewCtorString = toSource(DataView$1), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap$1);
var getTag = baseGetTag;
if (DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag || Map$1 && getTag(new Map$1()) != mapTag || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag || WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag) {
  getTag = function(value) {
    var result = baseGetTag(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}
var COMPARE_PARTIAL_FLAG = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$4(object), othIsArr = isArray$4(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer2(object)) {
    if (!isBuffer2(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
var papaparse_min = { exports: {} };
/* @license
Papa Parse
v5.4.1
https://github.com/mholt/PapaParse
License: MIT
*/
(function(module2, exports2) {
  !function(e2, t2) {
    module2.exports = t2();
  }(commonjsGlobal, function s() {
    var f = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== f ? f : {};
    var n2 = !f.document && !!f.postMessage, o2 = f.IS_PAPA_WORKER || false, a = {}, u2 = 0, b = { parse: function(e2, t2) {
      var r3 = (t2 = t2 || {}).dynamicTyping || false;
      J(r3) && (t2.dynamicTypingFunction = r3, r3 = {});
      if (t2.dynamicTyping = r3, t2.transform = !!J(t2.transform) && t2.transform, t2.worker && b.WORKERS_SUPPORTED) {
        var i = function() {
          if (!b.WORKERS_SUPPORTED) return false;
          var e3 = (r4 = f.URL || f.webkitURL || null, i2 = s.toString(), b.BLOB_URL || (b.BLOB_URL = r4.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", i2, ")();"], { type: "text/javascript" })))), t3 = new f.Worker(e3);
          var r4, i2;
          return t3.onmessage = _, t3.id = u2++, a[t3.id] = t3;
        }();
        return i.userStep = t2.step, i.userChunk = t2.chunk, i.userComplete = t2.complete, i.userError = t2.error, t2.step = J(t2.step), t2.chunk = J(t2.chunk), t2.complete = J(t2.complete), t2.error = J(t2.error), delete t2.worker, void i.postMessage({ input: e2, config: t2, workerId: i.id });
      }
      var n3 = null;
      b.NODE_STREAM_INPUT, "string" == typeof e2 ? (e2 = function(e3) {
        if (65279 === e3.charCodeAt(0)) return e3.slice(1);
        return e3;
      }(e2), n3 = t2.download ? new l2(t2) : new p2(t2)) : true === e2.readable && J(e2.read) && J(e2.on) ? n3 = new g(t2) : (f.File && e2 instanceof File || e2 instanceof Object) && (n3 = new c(t2));
      return n3.stream(e2);
    }, unparse: function(e2, t2) {
      var n3 = false, _2 = true, m3 = ",", y2 = "\r\n", s2 = '"', a2 = s2 + s2, r3 = false, i = null, o3 = false;
      !function() {
        if ("object" != typeof t2) return;
        "string" != typeof t2.delimiter || b.BAD_DELIMITERS.filter(function(e3) {
          return -1 !== t2.delimiter.indexOf(e3);
        }).length || (m3 = t2.delimiter);
        ("boolean" == typeof t2.quotes || "function" == typeof t2.quotes || Array.isArray(t2.quotes)) && (n3 = t2.quotes);
        "boolean" != typeof t2.skipEmptyLines && "string" != typeof t2.skipEmptyLines || (r3 = t2.skipEmptyLines);
        "string" == typeof t2.newline && (y2 = t2.newline);
        "string" == typeof t2.quoteChar && (s2 = t2.quoteChar);
        "boolean" == typeof t2.header && (_2 = t2.header);
        if (Array.isArray(t2.columns)) {
          if (0 === t2.columns.length) throw new Error("Option columns is empty");
          i = t2.columns;
        }
        void 0 !== t2.escapeChar && (a2 = t2.escapeChar + s2);
        ("boolean" == typeof t2.escapeFormulae || t2.escapeFormulae instanceof RegExp) && (o3 = t2.escapeFormulae instanceof RegExp ? t2.escapeFormulae : /^[=+\-@\t\r].*$/);
      }();
      var u3 = new RegExp(Q(s2), "g");
      "string" == typeof e2 && (e2 = JSON.parse(e2));
      if (Array.isArray(e2)) {
        if (!e2.length || Array.isArray(e2[0])) return h3(null, e2, r3);
        if ("object" == typeof e2[0]) return h3(i || Object.keys(e2[0]), e2, r3);
      } else if ("object" == typeof e2) return "string" == typeof e2.data && (e2.data = JSON.parse(e2.data)), Array.isArray(e2.data) && (e2.fields || (e2.fields = e2.meta && e2.meta.fields || i), e2.fields || (e2.fields = Array.isArray(e2.data[0]) ? e2.fields : "object" == typeof e2.data[0] ? Object.keys(e2.data[0]) : []), Array.isArray(e2.data[0]) || "object" == typeof e2.data[0] || (e2.data = [e2.data])), h3(e2.fields || [], e2.data || [], r3);
      throw new Error("Unable to serialize unrecognized input");
      function h3(e3, t3, r4) {
        var i2 = "";
        "string" == typeof e3 && (e3 = JSON.parse(e3)), "string" == typeof t3 && (t3 = JSON.parse(t3));
        var n4 = Array.isArray(e3) && 0 < e3.length, s3 = !Array.isArray(t3[0]);
        if (n4 && _2) {
          for (var a3 = 0; a3 < e3.length; a3++) 0 < a3 && (i2 += m3), i2 += v2(e3[a3], a3);
          0 < t3.length && (i2 += y2);
        }
        for (var o4 = 0; o4 < t3.length; o4++) {
          var u4 = n4 ? e3.length : t3[o4].length, h4 = false, f2 = n4 ? 0 === Object.keys(t3[o4]).length : 0 === t3[o4].length;
          if (r4 && !n4 && (h4 = "greedy" === r4 ? "" === t3[o4].join("").trim() : 1 === t3[o4].length && 0 === t3[o4][0].length), "greedy" === r4 && n4) {
            for (var d2 = [], l3 = 0; l3 < u4; l3++) {
              var c2 = s3 ? e3[l3] : l3;
              d2.push(t3[o4][c2]);
            }
            h4 = "" === d2.join("").trim();
          }
          if (!h4) {
            for (var p3 = 0; p3 < u4; p3++) {
              0 < p3 && !f2 && (i2 += m3);
              var g2 = n4 && s3 ? e3[p3] : p3;
              i2 += v2(t3[o4][g2], p3);
            }
            o4 < t3.length - 1 && (!r4 || 0 < u4 && !f2) && (i2 += y2);
          }
        }
        return i2;
      }
      function v2(e3, t3) {
        if (null == e3) return "";
        if (e3.constructor === Date) return JSON.stringify(e3).slice(1, 25);
        var r4 = false;
        o3 && "string" == typeof e3 && o3.test(e3) && (e3 = "'" + e3, r4 = true);
        var i2 = e3.toString().replace(u3, a2);
        return (r4 = r4 || true === n3 || "function" == typeof n3 && n3(e3, t3) || Array.isArray(n3) && n3[t3] || function(e4, t4) {
          for (var r5 = 0; r5 < t4.length; r5++) if (-1 < e4.indexOf(t4[r5])) return true;
          return false;
        }(i2, b.BAD_DELIMITERS) || -1 < i2.indexOf(m3) || " " === i2.charAt(0) || " " === i2.charAt(i2.length - 1)) ? s2 + i2 + s2 : i2;
      }
    } };
    if (b.RECORD_SEP = String.fromCharCode(30), b.UNIT_SEP = String.fromCharCode(31), b.BYTE_ORDER_MARK = "\uFEFF", b.BAD_DELIMITERS = ["\r", "\n", '"', b.BYTE_ORDER_MARK], b.WORKERS_SUPPORTED = !n2 && !!f.Worker, b.NODE_STREAM_INPUT = 1, b.LocalChunkSize = 10485760, b.RemoteChunkSize = 5242880, b.DefaultDelimiter = ",", b.Parser = E, b.ParserHandle = r2, b.NetworkStreamer = l2, b.FileStreamer = c, b.StringStreamer = p2, b.ReadableStreamStreamer = g, f.jQuery) {
      var d = f.jQuery;
      d.fn.parse = function(o3) {
        var r3 = o3.config || {}, u3 = [];
        return this.each(function(e3) {
          if (!("INPUT" === d(this).prop("tagName").toUpperCase() && "file" === d(this).attr("type").toLowerCase() && f.FileReader) || !this.files || 0 === this.files.length) return true;
          for (var t2 = 0; t2 < this.files.length; t2++) u3.push({ file: this.files[t2], inputElem: this, instanceConfig: d.extend({}, r3) });
        }), e2(), this;
        function e2() {
          if (0 !== u3.length) {
            var e3, t2, r4, i, n3 = u3[0];
            if (J(o3.before)) {
              var s2 = o3.before(n3.file, n3.inputElem);
              if ("object" == typeof s2) {
                if ("abort" === s2.action) return e3 = "AbortError", t2 = n3.file, r4 = n3.inputElem, i = s2.reason, void (J(o3.error) && o3.error({ name: e3 }, t2, r4, i));
                if ("skip" === s2.action) return void h3();
                "object" == typeof s2.config && (n3.instanceConfig = d.extend(n3.instanceConfig, s2.config));
              } else if ("skip" === s2) return void h3();
            }
            var a2 = n3.instanceConfig.complete;
            n3.instanceConfig.complete = function(e4) {
              J(a2) && a2(e4, n3.file, n3.inputElem), h3();
            }, b.parse(n3.file, n3.instanceConfig);
          } else J(o3.complete) && o3.complete();
        }
        function h3() {
          u3.splice(0, 1), e2();
        }
      };
    }
    function h2(e2) {
      this._handle = null, this._finished = false, this._completed = false, this._halted = false, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = true, this._completeResults = { data: [], errors: [], meta: {} }, (function(e3) {
        var t2 = w(e3);
        t2.chunkSize = parseInt(t2.chunkSize), e3.step || e3.chunk || (t2.chunkSize = null);
        this._handle = new r2(t2), (this._handle.streamer = this)._config = t2;
      }).call(this, e2), this.parseChunk = function(e3, t2) {
        if (this.isFirstChunk && J(this._config.beforeFirstChunk)) {
          var r3 = this._config.beforeFirstChunk(e3);
          void 0 !== r3 && (e3 = r3);
        }
        this.isFirstChunk = false, this._halted = false;
        var i = this._partialLine + e3;
        this._partialLine = "";
        var n3 = this._handle.parse(i, this._baseIndex, !this._finished);
        if (!this._handle.paused() && !this._handle.aborted()) {
          var s2 = n3.meta.cursor;
          this._finished || (this._partialLine = i.substring(s2 - this._baseIndex), this._baseIndex = s2), n3 && n3.data && (this._rowCount += n3.data.length);
          var a2 = this._finished || this._config.preview && this._rowCount >= this._config.preview;
          if (o2) f.postMessage({ results: n3, workerId: b.WORKER_ID, finished: a2 });
          else if (J(this._config.chunk) && !t2) {
            if (this._config.chunk(n3, this._handle), this._handle.paused() || this._handle.aborted()) return void (this._halted = true);
            n3 = void 0, this._completeResults = void 0;
          }
          return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(n3.data), this._completeResults.errors = this._completeResults.errors.concat(n3.errors), this._completeResults.meta = n3.meta), this._completed || !a2 || !J(this._config.complete) || n3 && n3.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = true), a2 || n3 && n3.meta.paused || this._nextChunk(), n3;
        }
        this._halted = true;
      }, this._sendError = function(e3) {
        J(this._config.error) ? this._config.error(e3) : o2 && this._config.error && f.postMessage({ workerId: b.WORKER_ID, error: e3, finished: false });
      };
    }
    function l2(e2) {
      var i;
      (e2 = e2 || {}).chunkSize || (e2.chunkSize = b.RemoteChunkSize), h2.call(this, e2), this._nextChunk = n2 ? function() {
        this._readChunk(), this._chunkLoaded();
      } : function() {
        this._readChunk();
      }, this.stream = function(e3) {
        this._input = e3, this._nextChunk();
      }, this._readChunk = function() {
        if (this._finished) this._chunkLoaded();
        else {
          if (i = new XMLHttpRequest(), this._config.withCredentials && (i.withCredentials = this._config.withCredentials), n2 || (i.onload = v(this._chunkLoaded, this), i.onerror = v(this._chunkError, this)), i.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !n2), this._config.downloadRequestHeaders) {
            var e3 = this._config.downloadRequestHeaders;
            for (var t2 in e3) i.setRequestHeader(t2, e3[t2]);
          }
          if (this._config.chunkSize) {
            var r3 = this._start + this._config.chunkSize - 1;
            i.setRequestHeader("Range", "bytes=" + this._start + "-" + r3);
          }
          try {
            i.send(this._config.downloadRequestBody);
          } catch (e4) {
            this._chunkError(e4.message);
          }
          n2 && 0 === i.status && this._chunkError();
        }
      }, this._chunkLoaded = function() {
        4 === i.readyState && (i.status < 200 || 400 <= i.status ? this._chunkError() : (this._start += this._config.chunkSize ? this._config.chunkSize : i.responseText.length, this._finished = !this._config.chunkSize || this._start >= function(e3) {
          var t2 = e3.getResponseHeader("Content-Range");
          if (null === t2) return -1;
          return parseInt(t2.substring(t2.lastIndexOf("/") + 1));
        }(i), this.parseChunk(i.responseText)));
      }, this._chunkError = function(e3) {
        var t2 = i.statusText || e3;
        this._sendError(new Error(t2));
      };
    }
    function c(e2) {
      var i, n3;
      (e2 = e2 || {}).chunkSize || (e2.chunkSize = b.LocalChunkSize), h2.call(this, e2);
      var s2 = "undefined" != typeof FileReader;
      this.stream = function(e3) {
        this._input = e3, n3 = e3.slice || e3.webkitSlice || e3.mozSlice, s2 ? ((i = new FileReader()).onload = v(this._chunkLoaded, this), i.onerror = v(this._chunkError, this)) : i = new FileReaderSync(), this._nextChunk();
      }, this._nextChunk = function() {
        this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
      }, this._readChunk = function() {
        var e3 = this._input;
        if (this._config.chunkSize) {
          var t2 = Math.min(this._start + this._config.chunkSize, this._input.size);
          e3 = n3.call(e3, this._start, t2);
        }
        var r3 = i.readAsText(e3, this._config.encoding);
        s2 || this._chunkLoaded({ target: { result: r3 } });
      }, this._chunkLoaded = function(e3) {
        this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e3.target.result);
      }, this._chunkError = function() {
        this._sendError(i.error);
      };
    }
    function p2(e2) {
      var r3;
      h2.call(this, e2 = e2 || {}), this.stream = function(e3) {
        return r3 = e3, this._nextChunk();
      }, this._nextChunk = function() {
        if (!this._finished) {
          var e3, t2 = this._config.chunkSize;
          return t2 ? (e3 = r3.substring(0, t2), r3 = r3.substring(t2)) : (e3 = r3, r3 = ""), this._finished = !r3, this.parseChunk(e3);
        }
      };
    }
    function g(e2) {
      h2.call(this, e2 = e2 || {});
      var t2 = [], r3 = true, i = false;
      this.pause = function() {
        h2.prototype.pause.apply(this, arguments), this._input.pause();
      }, this.resume = function() {
        h2.prototype.resume.apply(this, arguments), this._input.resume();
      }, this.stream = function(e3) {
        this._input = e3, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
      }, this._checkIsFinished = function() {
        i && 1 === t2.length && (this._finished = true);
      }, this._nextChunk = function() {
        this._checkIsFinished(), t2.length ? this.parseChunk(t2.shift()) : r3 = true;
      }, this._streamData = v(function(e3) {
        try {
          t2.push("string" == typeof e3 ? e3 : e3.toString(this._config.encoding)), r3 && (r3 = false, this._checkIsFinished(), this.parseChunk(t2.shift()));
        } catch (e4) {
          this._streamError(e4);
        }
      }, this), this._streamError = v(function(e3) {
        this._streamCleanUp(), this._sendError(e3);
      }, this), this._streamEnd = v(function() {
        this._streamCleanUp(), i = true, this._streamData("");
      }, this), this._streamCleanUp = v(function() {
        this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
      }, this);
    }
    function r2(m3) {
      var a2, o3, u3, i = Math.pow(2, 53), n3 = -i, s2 = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, h3 = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, t2 = this, r3 = 0, f2 = 0, d2 = false, e2 = false, l3 = [], c2 = { data: [], errors: [], meta: {} };
      if (J(m3.step)) {
        var p3 = m3.step;
        m3.step = function(e3) {
          if (c2 = e3, _2()) g2();
          else {
            if (g2(), 0 === c2.data.length) return;
            r3 += e3.data.length, m3.preview && r3 > m3.preview ? o3.abort() : (c2.data = c2.data[0], p3(c2, t2));
          }
        };
      }
      function y2(e3) {
        return "greedy" === m3.skipEmptyLines ? "" === e3.join("").trim() : 1 === e3.length && 0 === e3[0].length;
      }
      function g2() {
        return c2 && u3 && (k2("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + b.DefaultDelimiter + "'"), u3 = false), m3.skipEmptyLines && (c2.data = c2.data.filter(function(e3) {
          return !y2(e3);
        })), _2() && function() {
          if (!c2) return;
          function e3(e4, t4) {
            J(m3.transformHeader) && (e4 = m3.transformHeader(e4, t4)), l3.push(e4);
          }
          if (Array.isArray(c2.data[0])) {
            for (var t3 = 0; _2() && t3 < c2.data.length; t3++) c2.data[t3].forEach(e3);
            c2.data.splice(0, 1);
          } else c2.data.forEach(e3);
        }(), function() {
          if (!c2 || !m3.header && !m3.dynamicTyping && !m3.transform) return c2;
          function e3(e4, t4) {
            var r4, i2 = m3.header ? {} : [];
            for (r4 = 0; r4 < e4.length; r4++) {
              var n4 = r4, s3 = e4[r4];
              m3.header && (n4 = r4 >= l3.length ? "__parsed_extra" : l3[r4]), m3.transform && (s3 = m3.transform(s3, n4)), s3 = v2(n4, s3), "__parsed_extra" === n4 ? (i2[n4] = i2[n4] || [], i2[n4].push(s3)) : i2[n4] = s3;
            }
            return m3.header && (r4 > l3.length ? k2("FieldMismatch", "TooManyFields", "Too many fields: expected " + l3.length + " fields but parsed " + r4, f2 + t4) : r4 < l3.length && k2("FieldMismatch", "TooFewFields", "Too few fields: expected " + l3.length + " fields but parsed " + r4, f2 + t4)), i2;
          }
          var t3 = 1;
          !c2.data.length || Array.isArray(c2.data[0]) ? (c2.data = c2.data.map(e3), t3 = c2.data.length) : c2.data = e3(c2.data, 0);
          m3.header && c2.meta && (c2.meta.fields = l3);
          return f2 += t3, c2;
        }();
      }
      function _2() {
        return m3.header && 0 === l3.length;
      }
      function v2(e3, t3) {
        return r4 = e3, m3.dynamicTypingFunction && void 0 === m3.dynamicTyping[r4] && (m3.dynamicTyping[r4] = m3.dynamicTypingFunction(r4)), true === (m3.dynamicTyping[r4] || m3.dynamicTyping) ? "true" === t3 || "TRUE" === t3 || "false" !== t3 && "FALSE" !== t3 && (function(e4) {
          if (s2.test(e4)) {
            var t4 = parseFloat(e4);
            if (n3 < t4 && t4 < i) return true;
          }
          return false;
        }(t3) ? parseFloat(t3) : h3.test(t3) ? new Date(t3) : "" === t3 ? null : t3) : t3;
        var r4;
      }
      function k2(e3, t3, r4, i2) {
        var n4 = { type: e3, code: t3, message: r4 };
        void 0 !== i2 && (n4.row = i2), c2.errors.push(n4);
      }
      this.parse = function(e3, t3, r4) {
        var i2 = m3.quoteChar || '"';
        if (m3.newline || (m3.newline = function(e4, t4) {
          e4 = e4.substring(0, 1048576);
          var r5 = new RegExp(Q(t4) + "([^]*?)" + Q(t4), "gm"), i3 = (e4 = e4.replace(r5, "")).split("\r"), n5 = e4.split("\n"), s4 = 1 < n5.length && n5[0].length < i3[0].length;
          if (1 === i3.length || s4) return "\n";
          for (var a3 = 0, o4 = 0; o4 < i3.length; o4++) "\n" === i3[o4][0] && a3++;
          return a3 >= i3.length / 2 ? "\r\n" : "\r";
        }(e3, i2)), u3 = false, m3.delimiter) J(m3.delimiter) && (m3.delimiter = m3.delimiter(e3), c2.meta.delimiter = m3.delimiter);
        else {
          var n4 = function(e4, t4, r5, i3, n5) {
            var s4, a3, o4, u4;
            n5 = n5 || [",", "	", "|", ";", b.RECORD_SEP, b.UNIT_SEP];
            for (var h4 = 0; h4 < n5.length; h4++) {
              var f3 = n5[h4], d3 = 0, l4 = 0, c3 = 0;
              o4 = void 0;
              for (var p4 = new E({ comments: i3, delimiter: f3, newline: t4, preview: 10 }).parse(e4), g3 = 0; g3 < p4.data.length; g3++) if (r5 && y2(p4.data[g3])) c3++;
              else {
                var _3 = p4.data[g3].length;
                l4 += _3, void 0 !== o4 ? 0 < _3 && (d3 += Math.abs(_3 - o4), o4 = _3) : o4 = _3;
              }
              0 < p4.data.length && (l4 /= p4.data.length - c3), (void 0 === a3 || d3 <= a3) && (void 0 === u4 || u4 < l4) && 1.99 < l4 && (a3 = d3, s4 = f3, u4 = l4);
            }
            return { successful: !!(m3.delimiter = s4), bestDelimiter: s4 };
          }(e3, m3.newline, m3.skipEmptyLines, m3.comments, m3.delimitersToGuess);
          n4.successful ? m3.delimiter = n4.bestDelimiter : (u3 = true, m3.delimiter = b.DefaultDelimiter), c2.meta.delimiter = m3.delimiter;
        }
        var s3 = w(m3);
        return m3.preview && m3.header && s3.preview++, a2 = e3, o3 = new E(s3), c2 = o3.parse(a2, t3, r4), g2(), d2 ? { meta: { paused: true } } : c2 || { meta: { paused: false } };
      }, this.paused = function() {
        return d2;
      }, this.pause = function() {
        d2 = true, o3.abort(), a2 = J(m3.chunk) ? "" : a2.substring(o3.getCharIndex());
      }, this.resume = function() {
        t2.streamer._halted ? (d2 = false, t2.streamer.parseChunk(a2, true)) : setTimeout(t2.resume, 3);
      }, this.aborted = function() {
        return e2;
      }, this.abort = function() {
        e2 = true, o3.abort(), c2.meta.aborted = true, J(m3.complete) && m3.complete(c2), a2 = "";
      };
    }
    function Q(e2) {
      return e2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function E(j) {
      var z, M = (j = j || {}).delimiter, P = j.newline, U = j.comments, q2 = j.step, N = j.preview, B = j.fastMode, K = z = void 0 === j.quoteChar || null === j.quoteChar ? '"' : j.quoteChar;
      if (void 0 !== j.escapeChar && (K = j.escapeChar), ("string" != typeof M || -1 < b.BAD_DELIMITERS.indexOf(M)) && (M = ","), U === M) throw new Error("Comment character same as delimiter");
      true === U ? U = "#" : ("string" != typeof U || -1 < b.BAD_DELIMITERS.indexOf(U)) && (U = false), "\n" !== P && "\r" !== P && "\r\n" !== P && (P = "\n");
      var W = 0, H = false;
      this.parse = function(i, t2, r3) {
        if ("string" != typeof i) throw new Error("Input must be a string");
        var n3 = i.length, e2 = M.length, s2 = P.length, a2 = U.length, o3 = J(q2), u3 = [], h3 = [], f2 = [], d2 = W = 0;
        if (!i) return L();
        if (j.header && !t2) {
          var l3 = i.split(P)[0].split(M), c2 = [], p3 = {}, g2 = false;
          for (var _2 in l3) {
            var m3 = l3[_2];
            J(j.transformHeader) && (m3 = j.transformHeader(m3, _2));
            var y2 = m3, v2 = p3[m3] || 0;
            for (0 < v2 && (g2 = true, y2 = m3 + "_" + v2), p3[m3] = v2 + 1; c2.includes(y2); ) y2 = y2 + "_" + v2;
            c2.push(y2);
          }
          if (g2) {
            var k2 = i.split(P);
            k2[0] = c2.join(M), i = k2.join(P);
          }
        }
        if (B || false !== B && -1 === i.indexOf(z)) {
          for (var b2 = i.split(P), E2 = 0; E2 < b2.length; E2++) {
            if (f2 = b2[E2], W += f2.length, E2 !== b2.length - 1) W += P.length;
            else if (r3) return L();
            if (!U || f2.substring(0, a2) !== U) {
              if (o3) {
                if (u3 = [], I(f2.split(M)), F(), H) return L();
              } else I(f2.split(M));
              if (N && N <= E2) return u3 = u3.slice(0, N), L(true);
            }
          }
          return L();
        }
        for (var w2 = i.indexOf(M, W), R = i.indexOf(P, W), C = new RegExp(Q(K) + Q(z), "g"), S2 = i.indexOf(z, W); ; ) if (i[W] !== z) if (U && 0 === f2.length && i.substring(W, W + a2) === U) {
          if (-1 === R) return L();
          W = R + s2, R = i.indexOf(P, W), w2 = i.indexOf(M, W);
        } else if (-1 !== w2 && (w2 < R || -1 === R)) f2.push(i.substring(W, w2)), W = w2 + e2, w2 = i.indexOf(M, W);
        else {
          if (-1 === R) break;
          if (f2.push(i.substring(W, R)), D(R + s2), o3 && (F(), H)) return L();
          if (N && u3.length >= N) return L(true);
        }
        else for (S2 = W, W++; ; ) {
          if (-1 === (S2 = i.indexOf(z, S2 + 1))) return r3 || h3.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: u3.length, index: W }), T();
          if (S2 === n3 - 1) return T(i.substring(W, S2).replace(C, z));
          if (z !== K || i[S2 + 1] !== K) {
            if (z === K || 0 === S2 || i[S2 - 1] !== K) {
              -1 !== w2 && w2 < S2 + 1 && (w2 = i.indexOf(M, S2 + 1)), -1 !== R && R < S2 + 1 && (R = i.indexOf(P, S2 + 1));
              var O = A(-1 === R ? w2 : Math.min(w2, R));
              if (i.substr(S2 + 1 + O, e2) === M) {
                f2.push(i.substring(W, S2).replace(C, z)), i[W = S2 + 1 + O + e2] !== z && (S2 = i.indexOf(z, W)), w2 = i.indexOf(M, W), R = i.indexOf(P, W);
                break;
              }
              var x = A(R);
              if (i.substring(S2 + 1 + x, S2 + 1 + x + s2) === P) {
                if (f2.push(i.substring(W, S2).replace(C, z)), D(S2 + 1 + x + s2), w2 = i.indexOf(M, W), S2 = i.indexOf(z, W), o3 && (F(), H)) return L();
                if (N && u3.length >= N) return L(true);
                break;
              }
              h3.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: u3.length, index: W }), S2++;
            }
          } else S2++;
        }
        return T();
        function I(e3) {
          u3.push(e3), d2 = W;
        }
        function A(e3) {
          var t3 = 0;
          if (-1 !== e3) {
            var r4 = i.substring(S2 + 1, e3);
            r4 && "" === r4.trim() && (t3 = r4.length);
          }
          return t3;
        }
        function T(e3) {
          return r3 || (void 0 === e3 && (e3 = i.substring(W)), f2.push(e3), W = n3, I(f2), o3 && F()), L();
        }
        function D(e3) {
          W = e3, I(f2), f2 = [], R = i.indexOf(P, W);
        }
        function L(e3) {
          return { data: u3, errors: h3, meta: { delimiter: M, linebreak: P, aborted: H, truncated: !!e3, cursor: d2 + (t2 || 0) } };
        }
        function F() {
          q2(L()), u3 = [], h3 = [];
        }
      }, this.abort = function() {
        H = true;
      }, this.getCharIndex = function() {
        return W;
      };
    }
    function _(e2) {
      var t2 = e2.data, r3 = a[t2.workerId], i = false;
      if (t2.error) r3.userError(t2.error, t2.file);
      else if (t2.results && t2.results.data) {
        var n3 = { abort: function() {
          i = true, m2(t2.workerId, { data: [], errors: [], meta: { aborted: true } });
        }, pause: y, resume: y };
        if (J(r3.userStep)) {
          for (var s2 = 0; s2 < t2.results.data.length && (r3.userStep({ data: t2.results.data[s2], errors: t2.results.errors, meta: t2.results.meta }, n3), !i); s2++) ;
          delete t2.results;
        } else J(r3.userChunk) && (r3.userChunk(t2.results, n3, t2.file), delete t2.results);
      }
      t2.finished && !i && m2(t2.workerId, t2.results);
    }
    function m2(e2, t2) {
      var r3 = a[e2];
      J(r3.userComplete) && r3.userComplete(t2), r3.terminate(), delete a[e2];
    }
    function y() {
      throw new Error("Not implemented.");
    }
    function w(e2) {
      if ("object" != typeof e2 || null === e2) return e2;
      var t2 = Array.isArray(e2) ? [] : {};
      for (var r3 in e2) t2[r3] = w(e2[r3]);
      return t2;
    }
    function v(e2, t2) {
      return function() {
        e2.apply(t2, arguments);
      };
    }
    function J(e2) {
      return "function" == typeof e2;
    }
    return o2 && (f.onmessage = function(e2) {
      var t2 = e2.data;
      void 0 === b.WORKER_ID && t2 && (b.WORKER_ID = t2.workerId);
      if ("string" == typeof t2.input) f.postMessage({ workerId: b.WORKER_ID, results: b.parse(t2.input, t2.config), finished: true });
      else if (f.File && t2.input instanceof File || t2.input instanceof Object) {
        var r3 = b.parse(t2.input, t2.config);
        r3 && f.postMessage({ workerId: b.WORKER_ID, results: r3, finished: true });
      }
    }), (l2.prototype = Object.create(h2.prototype)).constructor = l2, (c.prototype = Object.create(h2.prototype)).constructor = c, (p2.prototype = Object.create(p2.prototype)).constructor = p2, (g.prototype = Object.create(h2.prototype)).constructor = g, b;
  });
})(papaparse_min);
var papaparse_minExports = papaparse_min.exports;
const yu = /* @__PURE__ */ getDefaultExportFromCjs(papaparse_minExports);
function baseSlice(array, start, end) {
  var index = -1, length = array.length;
  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}
var INFINITY$2 = 1 / 0, MAX_INTEGER = 17976931348623157e292;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY$2 || value === -INFINITY$2) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}
function toInteger(value) {
  var result = toFinite(value), remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}
var nativeCeil = Math.ceil, nativeMax = Math.max;
function chunk(array, size, guard) {
  if (size === void 0) {
    size = 1;
  } else {
    size = nativeMax(toInteger(size), 0);
  }
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) {
    return [];
  }
  var index = 0, resIndex = 0, result = Array(nativeCeil(length / size));
  while (index < length) {
    result[resIndex++] = baseSlice(array, index, index += size);
  }
  return result;
}
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray$4(value)) {
    return false;
  }
  var type2 = typeof value;
  if (type2 == "number" || type2 == "symbol" || type2 == "boolean" || value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
}
memoize.Cache = MapCache;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath2 = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote2, subString) {
    result.push(quote2 ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
var INFINITY$1 = 1 / 0;
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray$4(value)) {
    return arrayMap(value, baseToString) + "";
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function castPath(value, object) {
  if (isArray$4(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath2(toString(value));
}
var INFINITY = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY ? "-0" : result;
}
function baseGet(object, path) {
  path = castPath(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return index && index == length ? object : void 0;
}
function get(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet(object, path);
  return result === void 0 ? defaultValue : result;
}
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
function baseIteratee(value) {
  return property(value);
}
function uniqBy(array, iteratee) {
  return array && array.length ? baseUniq(array, baseIteratee(iteratee)) : [];
}
var qn = Object.defineProperty;
var o = (e2, t2) => qn(e2, "name", { value: t2, configurable: true });
var Ho = React.createContext({}), Wo = o(({ children: e2, isProvided: t2, ...r2 }) => {
  let { replace: s } = Pe(), n2 = o(async (c) => {
    var u2;
    try {
      return await ((u2 = r2.login) == null ? void 0 : u2.call(r2, c));
    } catch (l2) {
      return Promise.reject(l2);
    }
  }, "loginFunc"), a = o(async (c) => {
    var u2;
    try {
      return await ((u2 = r2.register) == null ? void 0 : u2.call(r2, c));
    } catch (l2) {
      return Promise.reject(l2);
    }
  }, "registerFunc"), i = o(async (c) => {
    var u2;
    try {
      return await ((u2 = r2.logout) == null ? void 0 : u2.call(r2, c));
    } catch (l2) {
      return Promise.reject(l2);
    }
  }, "logoutFunc"), p2 = o(async (c) => {
    var u2;
    try {
      return await ((u2 = r2.checkAuth) == null ? void 0 : u2.call(r2, c)), Promise.resolve();
    } catch (l2) {
      return l2 != null && l2.redirectPath && s(l2.redirectPath), Promise.reject(l2);
    }
  }, "checkAuthFunc");
  return React.createElement(Ho.Provider, { value: { ...r2, login: n2, logout: i, checkAuth: p2, register: a, isProvided: t2 } }, e2);
}, "LegacyAuthContextProvider"), $o = React.createContext({}), zo = o(({ children: e2, isProvided: t2, ...r2 }) => {
  let s = o(async (u2) => {
    var l2;
    try {
      return await ((l2 = r2.login) == null ? void 0 : l2.call(r2, u2));
    } catch (m2) {
      return console.warn("Unhandled Error in login: refine always expects a resolved promise.", m2), Promise.reject(m2);
    }
  }, "handleLogin"), n2 = o(async (u2) => {
    var l2;
    try {
      return await ((l2 = r2.register) == null ? void 0 : l2.call(r2, u2));
    } catch (m2) {
      return console.warn("Unhandled Error in register: refine always expects a resolved promise.", m2), Promise.reject(m2);
    }
  }, "handleRegister"), a = o(async (u2) => {
    var l2;
    try {
      return await ((l2 = r2.logout) == null ? void 0 : l2.call(r2, u2));
    } catch (m2) {
      return console.warn("Unhandled Error in logout: refine always expects a resolved promise.", m2), Promise.reject(m2);
    }
  }, "handleLogout"), i = o(async (u2) => {
    var l2;
    try {
      let m2 = await ((l2 = r2.check) == null ? void 0 : l2.call(r2, u2));
      return Promise.resolve(m2);
    } catch (m2) {
      return console.warn("Unhandled Error in check: refine always expects a resolved promise.", m2), Promise.reject(m2);
    }
  }, "handleCheck"), p2 = o(async (u2) => {
    var l2;
    try {
      let m2 = await ((l2 = r2.forgotPassword) == null ? void 0 : l2.call(r2, u2));
      return Promise.resolve(m2);
    } catch (m2) {
      return console.warn("Unhandled Error in forgotPassword: refine always expects a resolved promise.", m2), Promise.reject(m2);
    }
  }, "handleForgotPassword"), c = o(async (u2) => {
    var l2;
    try {
      let m2 = await ((l2 = r2.updatePassword) == null ? void 0 : l2.call(r2, u2));
      return Promise.resolve(m2);
    } catch (m2) {
      return console.warn("Unhandled Error in updatePassword: refine always expects a resolved promise.", m2), Promise.reject(m2);
    }
  }, "handleUpdatePassword");
  return React.createElement($o.Provider, { value: { ...r2, login: s, logout: a, check: i, register: n2, forgotPassword: p2, updatePassword: c, isProvided: t2 } }, e2);
}, "AuthBindingsContextProvider"), xe = o(() => React.useContext(Ho), "useLegacyAuthContext"), Ue = o(() => React.useContext($o), "useAuthBindingsContext");
var Bt = o((e2) => e2 / 1e3, "userFriendlySecond");
var or = o((e2, t2 = (r2) => r2) => {
  let [r2, ...s] = e2;
  return s.map((n2) => fromPairs(zip(r2, n2))).map((n2, a, i) => t2.call(void 0, n2, a, i));
}, "importCSVMapper");
var sr = o((e2 = "", t2) => {
  let r2 = Kt(e2);
  return t2 === "singular" ? ts.singular(r2) : ts.plural(r2);
}, "userFriendlyResourceName");
o((e2 = {}) => e2 != null && e2.id ? { ...e2, id: decodeURIComponent(e2.id) } : e2, "handleUseParams");
function pt(e2, t2) {
  return e2.findIndex((r2, s) => s <= e2.length - t2.length && t2.every((n2, a) => e2[s + a] === n2));
}
o(pt, "arrayFindIndex");
function ra(e2) {
  if (e2[0] === "data") {
    let t2 = e2.slice(1);
    if (t2[2] === "many") t2[2] = "getMany";
    else if (t2[2] === "infinite") t2[2] = "list";
    else if (t2[2] === "one") t2[2] = "detail";
    else if (t2[1] === "custom") {
      let r2 = { ...t2[2] };
      return delete r2.method, delete r2.url, [t2[0], t2[1], t2[2].method, t2[2].url, r2];
    }
    return t2;
  }
  if (e2[0] === "audit" && e2[2] === "list") return ["logList", e2[1], e2[3]];
  if (e2[0] === "access" && e2.length === 4) return ["useCan", { resource: e2[1], action: e2[2], ...e2[3] }];
  if (e2[0] === "auth") {
    if (pt(e2, ["auth", "login"]) !== -1) return ["useLogin"];
    if (pt(e2, ["auth", "logout"]) !== -1) return ["useLogout"];
    if (pt(e2, ["auth", "identity"]) !== -1) return ["getUserIdentity"];
    if (pt(e2, ["auth", "register"]) !== -1) return ["useRegister"];
    if (pt(e2, ["auth", "forgotPassword"]) !== -1) return ["useForgotPassword"];
    if (pt(e2, ["auth", "check"]) !== -1) return ["useAuthenticated", e2[2]];
    if (pt(e2, ["auth", "onError"]) !== -1) return ["useCheckError"];
    if (pt(e2, ["auth", "permissions"]) !== -1) return ["usePermissions"];
    if (pt(e2, ["auth", "updatePassword"]) !== -1) return ["useUpdatePassword"];
  }
  return e2;
}
o(ra, "convertToLegacy");
var He = class {
  constructor(t2 = []) {
    this.segments = [];
    this.segments = t2;
  }
  key() {
    return this.segments;
  }
  legacy() {
    return ra(this.segments);
  }
  get(t2) {
    return t2 ? this.legacy() : this.segments;
  }
};
o(He, "BaseKeyBuilder");
var st = class extends He {
  params(t2) {
    return new He([...this.segments, t2]);
  }
};
o(st, "ParamsKeyBuilder");
var nr = class extends He {
  id(t2) {
    return new st([...this.segments, t2 ? String(t2) : void 0]);
  }
};
o(nr, "DataIdRequiringKeyBuilder");
var ar = class extends He {
  ids(...t2) {
    return new st([...this.segments, ...t2.length ? [t2.map((r2) => String(r2))] : []]);
  }
};
o(ar, "DataIdsRequiringKeyBuilder");
var ir = class extends He {
  action(t2) {
    if (t2 === "one") return new nr([...this.segments, t2]);
    if (t2 === "many") return new ar([...this.segments, t2]);
    if (["list", "infinite"].includes(t2)) return new st([...this.segments, t2]);
    throw new Error("Invalid action type");
  }
};
o(ir, "DataResourceKeyBuilder");
var ur = class extends He {
  resource(t2) {
    return new ir([...this.segments, t2]);
  }
  mutation(t2) {
    return new st([...t2 === "custom" ? this.segments : [this.segments[0]], t2]);
  }
};
o(ur, "DataKeyBuilder");
var cr = class extends He {
  action(t2) {
    return new st([...this.segments, t2]);
  }
};
o(cr, "AuthKeyBuilder");
var pr = class extends He {
  action(t2) {
    return new st([...this.segments, t2]);
  }
};
o(pr, "AccessResourceKeyBuilder");
var dr = class extends He {
  resource(t2) {
    return new pr([...this.segments, t2]);
  }
};
o(dr, "AccessKeyBuilder");
var lr = class extends He {
  action(t2) {
    return new st([...this.segments, t2]);
  }
};
o(lr, "AuditActionKeyBuilder");
var mr = class extends He {
  resource(t2) {
    return new lr([...this.segments, t2]);
  }
  action(t2) {
    return new st([...this.segments, t2]);
  }
};
o(mr, "AuditKeyBuilder");
var wt = class extends He {
  data(t2) {
    return new ur(["data", t2 || "default"]);
  }
  auth() {
    return new cr(["auth"]);
  }
  access() {
    return new dr(["access"]);
  }
  audit() {
    return new mr(["audit"]);
  }
};
o(wt, "KeyBuilder");
var nt = o(() => new wt([]), "keys");
var S = o((...e2) => e2.find((t2) => typeof t2 < "u"), "pickNotDeprecated");
o((e2, t2, r2, s) => {
  let n2 = t2 || "default", a = { all: [n2], resourceAll: [n2, e2 || ""], list: (i) => [...a.resourceAll, "list", { ...i, ...S(r2, s) || {} }], many: (i) => [...a.resourceAll, "getMany", i == null ? void 0 : i.map(String), { ...S(r2, s) || {} }].filter((p2) => p2 !== void 0), detail: (i) => [...a.resourceAll, "detail", i == null ? void 0 : i.toString(), { ...S(r2, s) || {} }], logList: (i) => ["logList", e2, i, s].filter((p2) => p2 !== void 0) };
  return a;
}, "queryKeys");
var dt = o((e2) => (t2, r2, s, n2) => {
  let a = r2 || "default";
  return { all: nt().data(a).get(e2), resourceAll: nt().data(r2).resource(t2 ?? "").get(e2), list: (p2) => nt().data(r2).resource(t2 ?? "").action("list").params({ ...p2, ...S(s, n2) || {} }).get(e2), many: (p2) => nt().data(r2).resource(t2 ?? "").action("many").ids(...p2 ?? []).params({ ...S(s, n2) || {} }).get(e2), detail: (p2) => nt().data(r2).resource(t2 ?? "").action("one").id(p2 ?? "").params({ ...S(s, n2) || {} }).get(e2), logList: (p2) => [...nt().audit().resource(t2).action("list").params(p2).get(e2), n2].filter((c) => c !== void 0) };
}, "queryKeysReplacement");
var _r = o((e2, t2) => !e2 || !t2 ? false : !!e2.find((r2) => r2 === t2), "hasPermission");
var It = o((e2) => e2.startsWith(":"), "isParameter");
var it = o((e2) => e2.split("/").filter((r2) => r2 !== ""), "splitToSegments");
var Xo = o((e2, t2) => {
  let r2 = it(e2), s = it(t2);
  return r2.length === s.length;
}, "isSegmentCountsSame");
var ke = o((e2) => e2.replace(/^\/|\/$/g, ""), "removeLeadingTrailingSlashes");
var Zo = o((e2, t2) => {
  let r2 = ke(e2), s = ke(t2);
  if (!Xo(r2, s)) return false;
  let n2 = it(r2);
  return it(s).every((i, p2) => It(i) || i === n2[p2]);
}, "checkBySegments");
var Yo = o((e2, t2, r2) => {
  let s = ke(r2 || ""), n2 = `${s}${s ? "/" : ""}${e2}`;
  return t2 === "list" ? n2 = `${n2}` : t2 === "create" ? n2 = `${n2}/create` : t2 === "edit" ? n2 = `${n2}/edit/:id` : t2 === "show" ? n2 = `${n2}/show/:id` : t2 === "clone" && (n2 = `${n2}/clone/:id`), `/${n2.replace(/^\//, "")}`;
}, "getDefaultActionPath");
var Oe = o((e2, t2) => {
  var n2, a;
  let r2 = S((n2 = e2.meta) == null ? void 0 : n2.parent, (a = e2.options) == null ? void 0 : a.parent, e2.parentName);
  return r2 ? t2.find((i) => (i.identifier ?? i.name) === r2) ?? { name: r2 } : void 0;
}, "getParentResource");
var Gt = o((e2, t2, r2) => {
  let s = [], n2 = Oe(e2, t2);
  for (; n2; ) s.push(n2), n2 = Oe(n2, t2);
  if (s.length !== 0) return `/${s.reverse().map((a) => {
    var p2;
    let i = r2 ? ((p2 = a.options) == null ? void 0 : p2.route) ?? a.name : a.name;
    return ke(i);
  }).join("/")}`;
}, "getParentPrefixForResource");
var Se = o((e2, t2, r2) => {
  let s = [], n2 = ["list", "show", "edit", "create", "clone"], a = Gt(e2, t2, r2);
  return n2.forEach((i) => {
    var u2, l2;
    let p2 = r2 && i === "clone" ? e2.create : e2[i], c;
    typeof p2 == "function" || r2 ? c = Yo(r2 ? ((u2 = e2.meta) == null ? void 0 : u2.route) ?? ((l2 = e2.options) == null ? void 0 : l2.route) ?? e2.name : e2.name, i, r2 ? a : void 0) : typeof p2 == "string" ? c = p2 : typeof p2 == "object" && (c = p2.path), c && s.push({ action: i, resource: e2, route: `/${c.replace(/^\//, "")}` });
  }), s;
}, "getActionRoutesFromResource");
var Jo = o((e2) => {
  var n2;
  if (e2.length === 0) return;
  if (e2.length === 1) return e2[0];
  let t2 = e2.map((a) => ({ ...a, splitted: it(ke(a.route)) })), r2 = ((n2 = t2[0]) == null ? void 0 : n2.splitted.length) ?? 0, s = [...t2];
  for (let a = 0; a < r2; a++) {
    let i = s.filter((p2) => !It(p2.splitted[a]));
    if (i.length !== 0) {
      if (i.length === 1) {
        s = i;
        break;
      }
      s = i;
    }
  }
  return s[0];
}, "pickMatchedRoute");
var qo = o((e2, t2) => {
  let s = t2.flatMap((a) => Se(a, t2)).filter((a) => Zo(e2, a.route)), n2 = Jo(s);
  return { found: !!n2, resource: n2 == null ? void 0 : n2.resource, action: n2 == null ? void 0 : n2.action, matchedRoute: n2 == null ? void 0 : n2.route };
}, "matchResourceFromRoute");
var fr = o((e2, t2) => {
  var n2;
  let r2, s = Gt(e2, t2, true);
  if (s) {
    let a = S(e2.meta, e2.options);
    r2 = `${s}/${(a == null ? void 0 : a.route) ?? e2.name}`;
  } else r2 = ((n2 = e2.options) == null ? void 0 : n2.route) ?? e2.name;
  return `/${r2.replace(/^\//, "")}`;
}, "routeGenerator");
o((e2) => {
  var i;
  let t2 = [], r2 = {}, s = {}, n2, a;
  for (let p2 = 0; p2 < e2.length; p2++) {
    n2 = e2[p2];
    let c = n2.route ?? ((i = S(n2 == null ? void 0 : n2.meta, n2.options)) == null ? void 0 : i.route) ?? "";
    r2[c] = n2, r2[c].children = [], s[n2.name] = n2, s[n2.name].children = [];
  }
  for (let p2 in r2) Object.hasOwn(r2, p2) && (a = r2[p2], a.parentName && s[a.parentName] ? s[a.parentName].children.push(a) : t2.push(a));
  return t2;
}, "createTreeView");
var Kt = o((e2) => (e2 = e2.replace(/([a-z]{1})([A-Z]{1})/g, "$1-$2"), e2 = e2.replace(/([A-Z]{1})([A-Z]{1})([a-z]{1})/g, "$1-$2$3"), e2 = e2.toLowerCase().replace(/[_-]+/g, " ").replace(/\s{2,}/g, " ").trim(), e2 = e2.charAt(0).toUpperCase() + e2.slice(1), e2), "humanizeString");
var jr = o(({ children: e2 }) => React.createElement("div", null, e2), "DefaultLayout");
var sa = { icon: React.createElement("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", "data-testid": "refine-logo", id: "refine-default-logo" }, React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M13.7889 0.422291C12.6627 -0.140764 11.3373 -0.140764 10.2111 0.422291L2.21115 4.42229C0.85601 5.09986 0 6.48491 0 8V16C0 17.5151 0.85601 18.9001 2.21115 19.5777L10.2111 23.5777C11.3373 24.1408 12.6627 24.1408 13.7889 23.5777L21.7889 19.5777C23.144 18.9001 24 17.5151 24 16V8C24 6.48491 23.144 5.09986 21.7889 4.42229L13.7889 0.422291ZM8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V16C16 18.2091 14.2091 20 12 20C9.79086 20 8 18.2091 8 16V8Z", fill: "currentColor" }), React.createElement("path", { d: "M14 8C14 9.10457 13.1046 10 12 10C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6C13.1046 6 14 6.89543 14 8Z", fill: "currentColor" })), text: "Refine Project" }, Fe = { mutationMode: "pessimistic", syncWithLocation: false, undoableTimeout: 5e3, warnWhenUnsavedChanges: false, liveMode: "off", redirect: { afterCreate: "list", afterClone: "list", afterEdit: "list" }, overtime: { interval: 1e3 }, textTransformers: { humanize: Kt, plural: ts.plural, singular: ts.singular }, disableServerSideValidation: false, title: sa }, Qe = React.createContext({ hasDashboard: false, mutationMode: "pessimistic", warnWhenUnsavedChanges: false, syncWithLocation: false, undoableTimeout: 5e3, Title: void 0, Sider: void 0, Header: void 0, Footer: void 0, Layout: jr, OffLayoutArea: void 0, liveMode: "off", onLiveEvent: void 0, options: Fe }), rs = o(({ hasDashboard: e2, mutationMode: t2, warnWhenUnsavedChanges: r2, syncWithLocation: s, undoableTimeout: n2, children: a, DashboardPage: i, Title: p2, Layout: c = jr, Header: u2, Sider: l2, Footer: m2, OffLayoutArea: g, LoginPage: d = Xr, catchAll: y, liveMode: P = "off", onLiveEvent: C, options: f }) => React.createElement(Qe.Provider, { value: { __initialized: true, hasDashboard: e2, mutationMode: t2, warnWhenUnsavedChanges: r2, syncWithLocation: s, Title: p2, undoableTimeout: n2, Layout: c, Header: u2, Sider: l2, Footer: m2, OffLayoutArea: g, DashboardPage: i, LoginPage: d, catchAll: y, liveMode: P, onLiveEvent: C, options: f } }, a), "RefineContextProvider");
var Zr = o(({ options: e2, disableTelemetry: t2, liveMode: r2, mutationMode: s, reactQueryClientConfig: n2, reactQueryDevtoolConfig: a, syncWithLocation: i, undoableTimeout: p2, warnWhenUnsavedChanges: c } = {}) => {
  var g, d, y, P, C, f, R, M, w, T, b, x;
  let u2 = { breadcrumb: e2 == null ? void 0 : e2.breadcrumb, mutationMode: (e2 == null ? void 0 : e2.mutationMode) ?? s ?? Fe.mutationMode, undoableTimeout: (e2 == null ? void 0 : e2.undoableTimeout) ?? p2 ?? Fe.undoableTimeout, syncWithLocation: (e2 == null ? void 0 : e2.syncWithLocation) ?? i ?? Fe.syncWithLocation, warnWhenUnsavedChanges: (e2 == null ? void 0 : e2.warnWhenUnsavedChanges) ?? c ?? Fe.warnWhenUnsavedChanges, liveMode: (e2 == null ? void 0 : e2.liveMode) ?? r2 ?? Fe.liveMode, redirect: { afterCreate: ((g = e2 == null ? void 0 : e2.redirect) == null ? void 0 : g.afterCreate) ?? Fe.redirect.afterCreate, afterClone: ((d = e2 == null ? void 0 : e2.redirect) == null ? void 0 : d.afterClone) ?? Fe.redirect.afterClone, afterEdit: ((y = e2 == null ? void 0 : e2.redirect) == null ? void 0 : y.afterEdit) ?? Fe.redirect.afterEdit }, overtime: (e2 == null ? void 0 : e2.overtime) ?? Fe.overtime, textTransformers: { humanize: ((P = e2 == null ? void 0 : e2.textTransformers) == null ? void 0 : P.humanize) ?? Fe.textTransformers.humanize, plural: ((C = e2 == null ? void 0 : e2.textTransformers) == null ? void 0 : C.plural) ?? Fe.textTransformers.plural, singular: ((f = e2 == null ? void 0 : e2.textTransformers) == null ? void 0 : f.singular) ?? Fe.textTransformers.singular }, disableServerSideValidation: (e2 == null ? void 0 : e2.disableServerSideValidation) ?? Fe.disableServerSideValidation, projectId: e2 == null ? void 0 : e2.projectId, useNewQueryKeys: e2 == null ? void 0 : e2.useNewQueryKeys, title: { icon: typeof ((R = e2 == null ? void 0 : e2.title) == null ? void 0 : R.icon) > "u" ? Fe.title.icon : (M = e2 == null ? void 0 : e2.title) == null ? void 0 : M.icon, text: typeof ((w = e2 == null ? void 0 : e2.title) == null ? void 0 : w.text) > "u" ? Fe.title.text : (T = e2 == null ? void 0 : e2.title) == null ? void 0 : T.text } }, l2 = (e2 == null ? void 0 : e2.disableTelemetry) ?? t2 ?? false, m2 = { clientConfig: ((b = e2 == null ? void 0 : e2.reactQuery) == null ? void 0 : b.clientConfig) ?? n2 ?? {}, devtoolConfig: ((x = e2 == null ? void 0 : e2.reactQuery) == null ? void 0 : x.devtoolConfig) ?? a ?? {} };
  return { optionsWithDefaults: u2, disableTelemetryWithDefault: l2, reactQueryWithDefaults: m2 };
}, "handleRefineOptions");
var Yr = o(({ redirectFromProps: e2, action: t2, redirectOptions: r2 }) => {
  if (e2 || e2 === false) return e2;
  switch (t2) {
    case "clone":
      return r2.afterClone;
    case "create":
      return r2.afterCreate;
    case "edit":
      return r2.afterEdit;
    default:
      return false;
  }
}, "redirectPage");
var yr = o(async (e2, t2, r2) => {
  let s = [];
  for (let [n2, a] of e2.entries()) try {
    let i = await a();
    s.push(t2(i, n2));
  } catch (i) {
    s.push(r2(i, n2));
  }
  return s;
}, "sequentialPromises");
var Ee = o((e2, t2 = [], r2 = false) => {
  if (!e2) return;
  if (r2) {
    let n2 = t2.find((i) => ke(i.route ?? "") === ke(e2));
    return n2 || t2.find((i) => i.name === e2);
  }
  let s = t2.find((n2) => n2.identifier === e2);
  return s || (s = t2.find((n2) => n2.name === e2)), s;
}, "pickResource");
var ee = o((e2, t2, r2) => {
  if (t2) return t2;
  let s = Ee(e2, r2), n2 = S(s == null ? void 0 : s.meta, s == null ? void 0 : s.options);
  return n2 != null && n2.dataProviderName ? n2.dataProviderName : "default";
}, "pickDataProvider");
var lt = o(async (e2) => ({ data: (await Promise.all(e2)).map((t2) => t2.data) }), "handleMultiple");
var gr = o((e2) => {
  let { pagination: t2, cursor: r2 } = e2;
  if (r2 != null && r2.next) return r2.next;
  let s = (t2 == null ? void 0 : t2.current) || 1, n2 = (t2 == null ? void 0 : t2.pageSize) || 10, a = Math.ceil((e2.total || 0) / n2);
  return s < a ? Number(s) + 1 : void 0;
}, "getNextPageParam"), Tr = o((e2) => {
  let { pagination: t2, cursor: r2 } = e2;
  if (r2 != null && r2.prev) return r2.prev;
  let s = (t2 == null ? void 0 : t2.current) || 1;
  return s === 1 ? void 0 : s - 1;
}, "getPreviousPageParam");
var xr = o((e2) => {
  let t2 = [];
  return e2.forEach((r2) => {
    var s, n2;
    t2.push({ ...r2, label: ((s = r2.meta) == null ? void 0 : s.label) ?? ((n2 = r2.options) == null ? void 0 : n2.label), route: fr(r2, e2), canCreate: !!r2.create, canEdit: !!r2.edit, canShow: !!r2.show, canDelete: r2.canDelete });
  }), t2;
}, "legacyResourceTransform");
var os = o((e2) => it(ke(e2)).flatMap((r2) => It(r2) ? [r2.slice(1)] : []), "pickRouteParams");
var ss = o((e2, t2 = {}) => e2.reduce((r2, s) => {
  let n2 = t2[s];
  return typeof n2 < "u" && (r2[s] = n2), r2;
}, {}), "prepareRouteParams");
var We = o((e2, t2 = {}, r2 = {}, s = {}) => {
  let n2 = os(e2), a = ss(n2, { ...t2, ...typeof (r2 == null ? void 0 : r2.id) < "u" ? { id: r2.id } : {}, ...typeof (r2 == null ? void 0 : r2.action) < "u" ? { action: r2.action } : {}, ...typeof (r2 == null ? void 0 : r2.resource) < "u" ? { resource: r2.resource } : {}, ...r2 == null ? void 0 : r2.params, ...s });
  return e2.replace(/:([^\/]+)/g, (i, p2) => {
    let c = a[p2];
    return typeof c < "u" ? `${c}` : i;
  });
}, "composeRoute");
var ie = o(() => {
  let e2 = xe(), t2 = Ue();
  return t2.isProvided ? { isLegacy: false, ...t2 } : e2.isProvided ? { isLegacy: true, ...e2, check: e2.checkAuth, onError: e2.checkError, getIdentity: e2.getUserIdentity } : null;
}, "useActiveAuthProvider");
var Wt = o(({ hasPagination: e2, pagination: t2, configPagination: r2 } = {}) => {
  let s = e2 === false ? "off" : "server", n2 = (t2 == null ? void 0 : t2.mode) ?? s, a = S(t2 == null ? void 0 : t2.current, r2 == null ? void 0 : r2.current) ?? 1, i = S(t2 == null ? void 0 : t2.pageSize, r2 == null ? void 0 : r2.pageSize) ?? 10;
  return { current: a, pageSize: i, mode: n2 };
}, "handlePaginationParams");
var Pr = o((e2) => {
  let [t2, r2] = reactExports.useState(false);
  return reactExports.useEffect(() => {
    let s = window.matchMedia(e2);
    s.matches !== t2 && r2(s.matches);
    let n2 = o(() => r2(s.matches), "listener");
    return window.addEventListener("resize", n2), () => window.removeEventListener("resize", n2);
  }, [t2, e2]), t2;
}, "useMediaQuery");
var hr = o((e2, t2, r2, s) => {
  let n2 = s ? e2(t2, s, r2) : e2(t2, r2), a = r2 ?? t2;
  return n2 === t2 || typeof n2 > "u" ? a : n2;
}, "safeTranslate");
function ns(e2, t2, r2, s, n2) {
  var g;
  let a = { create: "Create new ", clone: `#${s ?? ""} Clone `, edit: `#${s ?? ""} Edit `, show: `#${s ?? ""} Show `, list: "" }, i = (t2 == null ? void 0 : t2.identifier) ?? (t2 == null ? void 0 : t2.name), p2 = (t2 == null ? void 0 : t2.label) ?? ((g = t2 == null ? void 0 : t2.meta) == null ? void 0 : g.label) ?? sr(i, r2 === "list" ? "plural" : "singular"), c = n2 ?? p2, u2 = hr(e2, "documentTitle.default", "Refine"), l2 = hr(e2, "documentTitle.suffix", " | Refine"), m2 = u2;
  return r2 && i && (m2 = hr(e2, `documentTitle.${i}.${r2}`, `${a[r2] ?? ""}${c}${l2}`, { id: s })), m2;
}
o(ns, "generateDefaultDocumentTitle");
var _e = o((e2, t2) => {
  let { mutationMode: r2, undoableTimeout: s } = reactExports.useContext(Qe);
  return { mutationMode: e2 ?? r2, undoableTimeout: t2 ?? s };
}, "useMutationMode");
var Jr = React.createContext({}), is = o(({ children: e2 }) => {
  let [t2, r2] = reactExports.useState(false);
  return React.createElement(Jr.Provider, { value: { warnWhen: t2, setWarnWhen: r2 } }, e2);
}, "UnsavedWarnContextProvider");
var vt = o(() => {
  let { warnWhenUnsavedChanges: e2 } = reactExports.useContext(Qe), { warnWhen: t2, setWarnWhen: r2 } = reactExports.useContext(Jr);
  return { warnWhenUnsavedChanges: e2, warnWhen: !!t2, setWarnWhen: r2 ?? (() => {
  }) };
}, "useWarnAboutChange");
var qr = o(() => {
  let { syncWithLocation: e2 } = reactExports.useContext(Qe);
  return { syncWithLocation: e2 };
}, "useSyncWithLocation");
o(() => {
  let { Title: e2 } = reactExports.useContext(Qe);
  return e2;
}, "useTitle");
var ge = o(() => {
  let { Footer: e2, Header: t2, Layout: r2, OffLayoutArea: s, Sider: n2, Title: a, hasDashboard: i, mutationMode: p2, syncWithLocation: c, undoableTimeout: u2, warnWhenUnsavedChanges: l2, DashboardPage: m2, LoginPage: g, catchAll: d, options: y, __initialized: P } = reactExports.useContext(Qe);
  return { __initialized: P, Footer: e2, Header: t2, Layout: r2, OffLayoutArea: s, Sider: n2, Title: a, hasDashboard: i, mutationMode: p2, syncWithLocation: c, undoableTimeout: u2, warnWhenUnsavedChanges: l2, DashboardPage: m2, LoginPage: g, catchAll: d, options: y };
}, "useRefineContext");
var Pt = o(() => {
  let { options: { textTransformers: e2 } } = ge();
  return o((r2 = "", s) => {
    let n2 = e2.humanize(r2);
    return s === "singular" ? e2.singular(n2) : e2.plural(n2);
  }, "getFriendlyName");
}, "useUserFriendlyName");
var cs = o((e2) => typeof e2 == "object" && e2 !== null, "isNested"), ma = o((e2) => Array.isArray(e2), "isArray"), Rr = o((e2, t2 = "") => cs(e2) ? Object.keys(e2).reduce((r2, s) => {
  let n2 = t2.length ? `${t2}.` : "";
  return cs(e2[s]) && Object.keys(e2[s]).length && (ma(e2[s]) && e2[s].length ? e2[s].forEach((a, i) => {
    Object.assign(r2, Rr(a, `${n2 + s}.${i}`));
  }) : Object.assign(r2, Rr(e2[s], n2 + s))), r2[n2 + s] = e2[s], r2;
}, {}) : { [t2]: e2 }, "flattenObjectKeys");
o((e2) => e2.split(".").map((t2) => Number.isNaN(Number(t2)) ? t2 : Number(t2)), "propertyPathToArray");
var eo = o((e2, t2, r2) => {
  if (typeof window > "u") return;
  let s = new Blob([t2], { type: r2 }), n2 = document.createElement("a");
  n2.setAttribute("visibility", "hidden"), n2.download = e2;
  let a = URL.createObjectURL(s);
  n2.href = a, document.body.appendChild(n2), n2.click(), document.body.removeChild(n2), setTimeout(() => {
    URL.revokeObjectURL(a);
  });
}, "downloadInBrowser");
var Cr = o((e2) => {
  setTimeout(e2, 0);
}, "deferExecution");
var to = o((e2, t2 = 1e3, r2) => {
  let s = [], n2 = o(() => {
    s.forEach((p2) => {
      var c;
      return (c = p2.reject) == null ? void 0 : c.call(p2, r2);
    }), s = [];
  }, "cancelPrevious"), a = debounce((...p2) => {
    let { resolve: c, reject: u2 } = s.pop() || {};
    Promise.resolve(e2(...p2)).then(c).catch(u2);
  }, t2), i = o((...p2) => new Promise((c, u2) => {
    n2(), s.push({ resolve: c, reject: u2 }), a(...p2);
  }), "runner");
  return i.flush = () => a.flush(), i.cancel = () => {
    a.cancel(), n2();
  }, i;
}, "asyncDebounce");
var je = o((e2) => {
  let t2 = { queryKey: e2.queryKey, pageParam: e2.pageParam };
  return Object.defineProperty(t2, "signal", { enumerable: true, get: () => e2.signal }), t2;
}, "prepareQueryContext");
var br = o((e2) => {
  let { current: t2, pageSize: r2, sorter: s, sorters: n2, filters: a } = G.parse(e2.substring(1));
  return { parsedCurrent: t2 && Number(t2), parsedPageSize: r2 && Number(r2), parsedSorter: S(n2, s) ?? [], parsedFilters: a ?? [] };
}, "parseTableParams");
o((e2) => {
  let t2 = G.stringify(e2);
  return br(`/${t2}`);
}, "parseTableParamsFromQuery");
var vr = o((e2) => {
  let t2 = { skipNulls: true, arrayFormat: "indices", encode: false }, { pagination: r2, sorter: s, sorters: n2, filters: a, ...i } = e2;
  return G.stringify({ ...i, ...r2 || {}, sorters: S(n2, s), filters: a }, t2);
}, "stringifyTableParams"), ms = o((e2, t2) => e2.operator !== "and" && e2.operator !== "or" && t2.operator !== "and" && t2.operator !== "or" ? ("field" in e2 ? e2.field : void 0) === ("field" in t2 ? t2.field : void 0) && e2.operator === t2.operator : ("key" in e2 ? e2.key : void 0) === ("key" in t2 ? t2.key : void 0) && e2.operator === t2.operator, "compareFilters"), fs = o((e2, t2) => e2.field === t2.field, "compareSorters"), St = o((e2, t2, r2 = []) => (t2.filter((n2) => (n2.operator === "or" || n2.operator === "and") && !n2.key).length > 1 && Fu(true, `[conditionalFilters]: You have created multiple Conditional Filters at the top level, this requires the key parameter. 
For more information, see https://refine.dev/docs/advanced-tutorials/data-provider/handling-filters/#top-level-multiple-conditional-filters-usage`), unionWith(e2, t2, r2, ms).filter((n2) => n2.value !== void 0 && n2.value !== null && (n2.operator !== "or" || n2.operator === "or" && n2.value.length !== 0) && (n2.operator !== "and" || n2.operator === "and" && n2.value.length !== 0))), "unionFilters"), Dr = o((e2, t2) => unionWith(e2, t2, fs).filter((r2) => r2.order !== void 0 && r2.order !== null), "unionSorters"), Ur = o((e2, t2) => [...differenceWith(t2, e2, ms), ...e2], "setInitialFilters"), Er = o((e2, t2) => [...differenceWith(t2, e2, fs), ...e2], "setInitialSorters");
o((e2, t2) => {
  if (!t2) return;
  let r2 = t2.find((s) => s.field === e2);
  if (r2) return r2.order;
}, "getDefaultSortOrder");
o((e2, t2, r2 = "eq") => {
  let s = t2 == null ? void 0 : t2.find((n2) => {
    if (n2.operator !== "or" && n2.operator !== "and" && "field" in n2) {
      let { operator: a, field: i } = n2;
      return i === e2 && a === r2;
    }
  });
  if (s) return s.value || [];
}, "getDefaultFilter");
o((e2) => new Promise((t2, r2) => {
  let s = new FileReader(), n2 = o(() => {
    s.result && (s.removeEventListener("load", n2, false), t2(s.result));
  }, "resultHandler");
  s.addEventListener("load", n2, false), s.readAsDataURL(e2.originFileObj), s.onerror = (a) => (s.removeEventListener("load", n2, false), r2(a));
}), "file2Base64");
var Z = o(() => {
  let { options: { useNewQueryKeys: e2 } } = ge();
  return { keys: nt, preferLegacyKeys: !e2 };
}, "useKeys");
function ha({ v3LegacyAuthProviderCompatible: e2 = false, options: t2, params: r2 } = {}) {
  let { getPermissions: s } = xe(), { getPermissions: n2 } = Ue(), { keys: a, preferLegacyKeys: i } = Z(), p2 = useQuery({ queryKey: a().auth().action("permissions").get(i), queryFn: n2 ? () => n2(r2) : () => Promise.resolve(void 0), enabled: !e2 && !!n2, ...e2 ? {} : t2, meta: { ...e2 ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), c = useQuery({ queryKey: [...a().auth().action("permissions").get(i), "v3LegacyAuthProviderCompatible"], queryFn: s ? () => s(r2) : () => Promise.resolve(void 0), enabled: e2 && !!s, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? c : p2;
}
o(ha, "usePermissions");
function oo({ v3LegacyAuthProviderCompatible: e2 = false, queryOptions: t2 } = {}) {
  let { getUserIdentity: r2 } = xe(), { getIdentity: s } = Ue(), { keys: n2, preferLegacyKeys: a } = Z(), i = useQuery({ queryKey: n2().auth().action("identity").get(a), queryFn: s ?? (() => Promise.resolve({})), enabled: !e2 && !!s, retry: false, ...e2 === true ? {} : t2, meta: { ...e2 === true ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), p2 = useQuery({ queryKey: [...n2().auth().action("identity").get(a), "v3LegacyAuthProviderCompatible"], queryFn: r2 ?? (() => Promise.resolve({})), enabled: e2 && !!r2, retry: false, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? p2 : i;
}
o(oo, "useGetIdentity");
var Dt = o(() => {
  let e2 = useQueryClient(), { keys: t2, preferLegacyKeys: r2 } = Z();
  return o(async () => {
    await Promise.all(["check", "identity", "permissions"].map((n2) => e2.invalidateQueries(t2().auth().action(n2).get(r2))));
  }, "invalidate");
}, "useInvalidateAuthStore");
function Lr({ v3LegacyAuthProviderCompatible: e2, mutationOptions: t2 } = {}) {
  let r2 = Dt(), s = se(), n2 = Le(), { push: a } = Pe(), { open: i, close: p2 } = $e(), { logout: c } = xe(), { logout: u2 } = Ue(), { keys: l2, preferLegacyKeys: m2 } = Z(), g = useMutation({ mutationKey: l2().auth().action("logout").get(m2), mutationFn: u2, onSuccess: async (y, P) => {
    let { success: C, error: f, redirectTo: R, successNotification: M } = y, { redirectPath: w } = P ?? {}, T = w ?? R;
    C && (p2 == null || p2("useLogout-error"), M && (i == null || i(Ca(M)))), (f || !C) && (i == null || i(so(f))), T !== false && (s === "legacy" ? a(T ?? "/login") : T && n2({ to: T })), await r2();
  }, onError: (y) => {
    i == null || i(so(y));
  }, ...e2 === true ? {} : t2, meta: { ...e2 === true ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), d = useMutation({ mutationKey: [...l2().auth().action("logout").get(m2), "v3LegacyAuthProviderCompatible"], mutationFn: c, onSuccess: async (y, P) => {
    let C = (P == null ? void 0 : P.redirectPath) ?? y;
    if (C !== false) {
      if (C) {
        s === "legacy" ? a(C) : n2({ to: C });
        return;
      }
      s === "legacy" ? a("/login") : n2({ to: "/login" }), await r2();
    }
  }, onError: (y) => {
    i == null || i(so(y));
  }, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? d : g;
}
o(Lr, "useLogout");
var so = o((e2) => ({ key: "useLogout-error", type: "error", message: (e2 == null ? void 0 : e2.name) || "Logout Error", description: (e2 == null ? void 0 : e2.message) || "Something went wrong during logout" }), "buildNotification"), Ca = o((e2) => ({ message: e2.message, description: e2.description, key: "logout-success", type: "success" }), "buildSuccessNotification");
function $t({ v3LegacyAuthProviderCompatible: e2, mutationOptions: t2 } = {}) {
  let r2 = Dt(), s = se(), n2 = Le(), { replace: a } = Pe(), i = Te(), { useLocation: p2 } = le(), { search: c } = p2(), { close: u2, open: l2 } = $e(), { login: m2 } = xe(), { login: g } = Ue(), { keys: d, preferLegacyKeys: y } = Z(), P = React.useMemo(() => {
    var R;
    return s === "legacy" ? G.parse(c, { ignoreQueryPrefix: true }).to : (R = i.params) == null ? void 0 : R.to;
  }, [s, i.params, c]), C = useMutation({ mutationKey: d().auth().action("login").get(y), mutationFn: g, onSuccess: async ({ success: R, redirectTo: M, error: w, successNotification: T }) => {
    R && (u2 == null || u2("login-error"), T && (l2 == null || l2(Da(T)))), (w || !R) && (l2 == null || l2(no(w))), P && R ? s === "legacy" ? a(P) : n2({ to: P, type: "replace" }) : M ? s === "legacy" ? a(M) : n2({ to: M, type: "replace" }) : s === "legacy" && a("/"), await r2();
  }, onError: (R) => {
    l2 == null || l2(no(R));
  }, ...e2 === true ? {} : t2, meta: { ...e2 === true ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), f = useMutation({ mutationKey: [...d().auth().action("login").get(y), "v3LegacyAuthProviderCompatible"], mutationFn: m2, onSuccess: async (R) => {
    P && a(P), R !== false && !P && (typeof R == "string" ? s === "legacy" ? a(R) : n2({ to: R, type: "replace" }) : s === "legacy" ? a("/") : n2({ to: "/", type: "replace" })), await r2(), u2 == null || u2("login-error");
  }, onError: (R) => {
    l2 == null || l2(no(R));
  }, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? f : C;
}
o($t, "useLogin");
var no = o((e2) => ({ message: (e2 == null ? void 0 : e2.name) || "Login Error", description: (e2 == null ? void 0 : e2.message) || "Invalid credentials", key: "login-error", type: "error" }), "buildNotification"), Da = o((e2) => ({ message: e2.message, description: e2.description, key: "login-success", type: "success" }), "buildSuccessNotification");
function io({ v3LegacyAuthProviderCompatible: e2, mutationOptions: t2 } = {}) {
  let r2 = Dt(), s = se(), n2 = Le(), { replace: a } = Pe(), { register: i } = xe(), { register: p2 } = Ue(), { close: c, open: u2 } = $e(), { keys: l2, preferLegacyKeys: m2 } = Z(), g = useMutation({ mutationKey: l2().auth().action("register").get(m2), mutationFn: p2, onSuccess: async ({ success: y, redirectTo: P, error: C, successNotification: f }) => {
    y && (c == null || c("register-error"), f && (u2 == null || u2(Ua(f)))), (C || !y) && (u2 == null || u2(ao(C))), P ? s === "legacy" ? a(P) : n2({ to: P, type: "replace" }) : s === "legacy" && a("/"), await r2();
  }, onError: (y) => {
    u2 == null || u2(ao(y));
  }, ...e2 === true ? {} : t2, meta: { ...e2 === true ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), d = useMutation({ mutationKey: [...l2().auth().action("register").get(m2), "v3LegacyAuthProviderCompatible"], mutationFn: i, onSuccess: async (y) => {
    y !== false && (y ? s === "legacy" ? a(y) : n2({ to: y, type: "replace" }) : s === "legacy" ? a("/") : n2({ to: "/", type: "replace" }), await r2(), c == null || c("register-error"));
  }, onError: (y) => {
    u2 == null || u2(ao(y));
  }, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? d : g;
}
o(io, "useRegister");
var ao = o((e2) => ({ message: (e2 == null ? void 0 : e2.name) || "Register Error", description: (e2 == null ? void 0 : e2.message) || "Error while registering", key: "register-error", type: "error" }), "buildNotification"), Ua = o((e2) => ({ message: e2.message, description: e2.description, key: "register-success", type: "success" }), "buildSuccessNotification");
function co({ v3LegacyAuthProviderCompatible: e2, mutationOptions: t2 } = {}) {
  let r2 = se(), s = Le(), { replace: n2 } = Pe(), { forgotPassword: a } = xe(), { forgotPassword: i } = Ue(), { close: p2, open: c } = $e(), { keys: u2, preferLegacyKeys: l2 } = Z(), m2 = useMutation({ mutationKey: u2().auth().action("forgotPassword").get(l2), mutationFn: i, onSuccess: ({ success: d, redirectTo: y, error: P, successNotification: C }) => {
    d && (p2 == null || p2("forgot-password-error"), C && (c == null || c(Ea(C)))), (P || !d) && (c == null || c(uo(P))), y && (r2 === "legacy" ? n2(y) : s({ to: y, type: "replace" }));
  }, onError: (d) => {
    c == null || c(uo(d));
  }, ...e2 === true ? {} : t2, meta: { ...e2 === true ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), g = useMutation({ mutationKey: [...u2().auth().action("forgotPassword").get(l2), "v3LegacyAuthProviderCompatible"], mutationFn: a, onSuccess: (d) => {
    d !== false && d && (r2 === "legacy" ? n2(d) : s({ to: d, type: "replace" })), p2 == null || p2("forgot-password-error");
  }, onError: (d) => {
    c == null || c(uo(d));
  }, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? g : m2;
}
o(co, "useForgotPassword");
var uo = o((e2) => ({ message: (e2 == null ? void 0 : e2.name) || "Forgot Password Error", description: (e2 == null ? void 0 : e2.message) || "Error while resetting password", key: "forgot-password-error", type: "error" }), "buildNotification"), Ea = o((e2) => ({ message: e2.message, description: e2.description, key: "forgot-password-success", type: "success" }), "buildSuccessNotification");
function lo({ v3LegacyAuthProviderCompatible: e2, mutationOptions: t2 } = {}) {
  let r2 = se(), s = Le(), { replace: n2 } = Pe(), { updatePassword: a } = xe(), { updatePassword: i } = Ue(), { close: p2, open: c } = $e(), { keys: u2, preferLegacyKeys: l2 } = Z(), m2 = Te(), { useLocation: g } = le(), { search: d } = g(), y = React.useMemo(() => r2 === "legacy" ? G.parse(d, { ignoreQueryPrefix: true }) ?? {} : m2.params ?? {}, [d, m2, r2]), P = useMutation({ mutationKey: u2().auth().action("updatePassword").get(l2), mutationFn: async (f) => i == null ? void 0 : i({ ...y, ...f }), onSuccess: ({ success: f, redirectTo: R, error: M, successNotification: w }) => {
    f && (p2 == null || p2("update-password-error"), w && (c == null || c(wa(w)))), (M || !f) && (c == null || c(po(M))), R && (r2 === "legacy" ? n2(R) : s({ to: R, type: "replace" }));
  }, onError: (f) => {
    c == null || c(po(f));
  }, ...e2 === true ? {} : t2, meta: { ...e2 === true ? {} : t2 == null ? void 0 : t2.meta, ...k$1() } }), C = useMutation({ mutationKey: [...u2().auth().action("updatePassword").get(l2), "v3LegacyAuthProviderCompatible"], mutationFn: async (f) => a == null ? void 0 : a({ ...y, ...f }), onSuccess: (f) => {
    f !== false && f && (r2 === "legacy" ? n2(f) : s({ to: f, type: "replace" })), p2 == null || p2("update-password-error");
  }, onError: (f) => {
    c == null || c(po(f));
  }, ...e2 ? t2 : {}, meta: { ...e2 ? t2 == null ? void 0 : t2.meta : {}, ...k$1() } });
  return e2 ? C : P;
}
o(lo, "useUpdatePassword");
var po = o((e2) => ({ message: (e2 == null ? void 0 : e2.name) || "Update Password Error", description: (e2 == null ? void 0 : e2.message) || "Error while updating password", key: "update-password-error", type: "error" }), "buildNotification"), wa = o((e2) => ({ message: e2.message, description: e2.description, key: "update-password-success", type: "success" }), "buildSuccessNotification");
function Mr({ v3LegacyAuthProviderCompatible: e2 = false, params: t2 } = {}) {
  let { checkAuth: r2 } = xe(), { check: s } = Ue(), { keys: n2, preferLegacyKeys: a } = Z(), i = useQuery({ queryKey: n2().auth().action("check").params(t2).get(a), queryFn: async () => await (s == null ? void 0 : s(t2)) ?? {}, retry: false, enabled: !e2, meta: { ...k$1() } }), p2 = useQuery({ queryKey: [...n2().auth().action("check").params(t2).get(a), "v3LegacyAuthProviderCompatible"], queryFn: async () => await (r2 == null ? void 0 : r2(t2)) ?? {}, retry: false, enabled: e2, meta: { ...k$1() } });
  return e2 ? p2 : i;
}
o(Mr, "useIsAuthenticated");
function he({ v3LegacyAuthProviderCompatible: e2 = false } = {}) {
  let t2 = se(), r2 = Le(), { replace: s } = Pe(), { checkError: n2 } = xe(), { onError: a } = Ue(), { keys: i, preferLegacyKeys: p2 } = Z(), { mutate: c } = Lr({ v3LegacyAuthProviderCompatible: !!e2 }), { mutate: u2 } = Lr({ v3LegacyAuthProviderCompatible: !!e2 }), l2 = useMutation({ mutationKey: i().auth().action("onError").get(p2), ...a ? { mutationFn: a, onSuccess: ({ logout: g, redirectTo: d }) => {
    if (g) {
      u2({ redirectPath: d });
      return;
    }
    if (d) {
      t2 === "legacy" ? s(d) : r2({ to: d, type: "replace" });
      return;
    }
  } } : { mutationFn: () => ({}) }, meta: { ...k$1() } }), m2 = useMutation({ mutationKey: [...i().auth().action("onError").get(p2), "v3LegacyAuthProviderCompatible"], mutationFn: n2, onError: (g) => {
    c({ redirectPath: g });
  }, meta: { ...k$1() } });
  return e2 ? m2 : l2;
}
o(he, "useOnError");
var mo = o(() => {
  let { isProvided: e2 } = xe(), { isProvided: t2 } = Ue();
  return !!(t2 || e2);
}, "useIsExistAuthentication");
var pe = o(({ isLoading: e2, interval: t2, onInterval: r2 }) => {
  let [s, n2] = reactExports.useState(void 0), { options: a } = ge(), { overtime: i } = a, p2 = t2 ?? i.interval, c = r2 ?? (i == null ? void 0 : i.onInterval);
  return reactExports.useEffect(() => {
    let u2;
    return e2 && (u2 = setInterval(() => {
      n2((l2) => l2 === void 0 ? p2 : l2 + p2);
    }, p2)), () => {
      clearInterval(u2), n2(void 0);
    };
  }, [e2, p2]), reactExports.useEffect(() => {
    c && s && c(s);
  }, [s]), { elapsedTime: s };
}, "useLoadingOvertime");
var zt = o(({ resource: e2, config: t2, filters: r2, hasPagination: s, pagination: n2, sorters: a, queryOptions: i, successNotification: p2, errorNotification: c, meta: u2, metaData: l2, liveMode: m2, onLiveEvent: g, liveParams: d, dataProviderName: y, overtimeOptions: P } = {}) => {
  let { resources: C, resource: f, identifier: R } = Y(e2), M = fe(), w = $(), T = ie(), { mutate: b } = he({ v3LegacyAuthProviderCompatible: !!(T != null && T.isLegacy) }), x = Re(), k2 = ue(), { keys: F, preferLegacyKeys: v } = Z(), V = ee(R, y, C), U = S(u2, l2), L = S(r2, t2 == null ? void 0 : t2.filters), B = S(a, t2 == null ? void 0 : t2.sort), h2 = S(s, t2 == null ? void 0 : t2.hasPagination), I = Wt({ pagination: n2, configPagination: t2 == null ? void 0 : t2.pagination, hasPagination: h2 }), Q = I.mode === "server", W = k2({ resource: f, meta: U }), _ = { meta: W, metaData: W, filters: L, hasPagination: Q, pagination: I, sorters: B, config: { ...t2, sort: B } }, K = (i == null ? void 0 : i.enabled) === void 0 || (i == null ? void 0 : i.enabled) === true, { getList: j } = M(V);
  ht({ resource: R, types: ["*"], params: { meta: W, metaData: W, pagination: I, hasPagination: Q, sort: B, sorters: B, filters: L, subscriptionType: "useList", ...d }, channel: `resources/${f == null ? void 0 : f.name}`, enabled: K, liveMode: m2, onLiveEvent: g, dataProviderName: V, meta: { ...u2, dataProviderName: y } });
  let te = useQuery({ queryKey: F().data(V).resource(R ?? "").action("list").params({ ...U || {}, filters: L, hasPagination: Q, ...Q && { pagination: I }, ...a && { sorters: a }, ...(t2 == null ? void 0 : t2.sort) && { sort: t2 == null ? void 0 : t2.sort } }).get(v), queryFn: (D) => {
    let E = { ...W, queryContext: je(D) };
    return j({ resource: (f == null ? void 0 : f.name) ?? "", pagination: I, hasPagination: Q, filters: L, sort: B, sorters: B, meta: E, metaData: E });
  }, ...i, enabled: typeof (i == null ? void 0 : i.enabled) < "u" ? i == null ? void 0 : i.enabled : !!(f != null && f.name), select: (D) => {
    var q2;
    let E = D, { current: N, mode: G2, pageSize: X } = I;
    return G2 === "client" && (E = { ...E, data: E.data.slice((N - 1) * X, N * X), total: E.total }), i != null && i.select ? (q2 = i == null ? void 0 : i.select) == null ? void 0 : q2.call(i, E) : E;
  }, onSuccess: (D) => {
    var N;
    (N = i == null ? void 0 : i.onSuccess) == null || N.call(i, D);
    let E = typeof p2 == "function" ? p2(D, _, R) : p2;
    x(E);
  }, onError: (D) => {
    var N;
    b(D), (N = i == null ? void 0 : i.onError) == null || N.call(i, D);
    let E = typeof c == "function" ? c(D, _, R) : c;
    x(E, { key: `${R}-useList-notification`, message: w("notifications.error", { statusCode: D.statusCode }, `Error (status code: ${D.statusCode})`), description: D.message, type: "error" });
  }, meta: { ...i == null ? void 0 : i.meta, ...k$1("useList", v, f == null ? void 0 : f.name) } }), { elapsedTime: ae } = pe({ isLoading: te.isFetching, interval: P == null ? void 0 : P.interval, onInterval: P == null ? void 0 : P.onInterval });
  return { ...te, overtime: { elapsedTime: ae } };
}, "useList");
var Ot = o(({ resource: e2, id: t2, queryOptions: r2, successNotification: s, errorNotification: n2, meta: a, metaData: i, liveMode: p2, onLiveEvent: c, liveParams: u2, dataProviderName: l2, overtimeOptions: m2 }) => {
  let { resources: g, resource: d, identifier: y } = Y(e2), P = fe(), C = $(), f = ie(), { mutate: R } = he({ v3LegacyAuthProviderCompatible: !!(f != null && f.isLegacy) }), M = Re(), w = ue(), { keys: T, preferLegacyKeys: b } = Z(), x = S(a, i), k2 = ee(y, l2, g), { getOne: F } = P(k2), v = w({ resource: d, meta: x });
  ht({ resource: y, types: ["*"], channel: `resources/${d == null ? void 0 : d.name}`, params: { ids: t2 ? [t2] : [], id: t2, meta: v, metaData: v, subscriptionType: "useOne", ...u2 }, enabled: typeof (r2 == null ? void 0 : r2.enabled) < "u" ? r2 == null ? void 0 : r2.enabled : typeof (d == null ? void 0 : d.name) < "u" && typeof t2 < "u", liveMode: p2, onLiveEvent: c, dataProviderName: k2, meta: { ...a, dataProviderName: l2 } });
  let V = useQuery({ queryKey: T().data(k2).resource(y ?? "").action("one").id(t2 ?? "").params({ ...x || {} }).get(b), queryFn: (L) => F({ resource: (d == null ? void 0 : d.name) ?? "", id: t2, meta: { ...v, queryContext: je(L) }, metaData: { ...v, queryContext: je(L) } }), ...r2, enabled: typeof (r2 == null ? void 0 : r2.enabled) < "u" ? r2 == null ? void 0 : r2.enabled : typeof t2 < "u", onSuccess: (L) => {
    var h2;
    (h2 = r2 == null ? void 0 : r2.onSuccess) == null || h2.call(r2, L);
    let B = typeof s == "function" ? s(L, { id: t2, ...v }, y) : s;
    M(B);
  }, onError: (L) => {
    var h2;
    R(L), (h2 = r2 == null ? void 0 : r2.onError) == null || h2.call(r2, L);
    let B = typeof n2 == "function" ? n2(L, { id: t2, ...v }, y) : n2;
    M(B, { key: `${t2}-${y}-getOne-notification`, message: C("notifications.error", { statusCode: L.statusCode }, `Error (status code: ${L.statusCode})`), description: L.message, type: "error" });
  }, meta: { ...r2 == null ? void 0 : r2.meta, ...k$1("useOne", b, d == null ? void 0 : d.name) } }), { elapsedTime: U } = pe({ isLoading: V.isFetching, interval: m2 == null ? void 0 : m2.interval, onInterval: m2 == null ? void 0 : m2.onInterval });
  return { ...V, overtime: { elapsedTime: U } };
}, "useOne");
var fo = o(({ resource: e2, ids: t2, queryOptions: r2, successNotification: s, errorNotification: n2, meta: a, metaData: i, liveMode: p2, onLiveEvent: c, liveParams: u2, dataProviderName: l2, overtimeOptions: m2 }) => {
  let { resources: g, resource: d, identifier: y } = Y(e2), P = fe(), C = $(), f = ie(), { mutate: R } = he({ v3LegacyAuthProviderCompatible: !!(f != null && f.isLegacy) }), M = Re(), w = ue(), { keys: T, preferLegacyKeys: b } = Z(), x = S(a, i), k2 = ee(y, l2, g), F = (r2 == null ? void 0 : r2.enabled) === void 0 || (r2 == null ? void 0 : r2.enabled) === true, { getMany: v, getOne: V } = P(k2), U = w({ resource: d, meta: x });
  ht({ resource: y, types: ["*"], params: { ids: t2, meta: U, metaData: U, subscriptionType: "useMany", ...u2 }, channel: `resources/${d.name}`, enabled: F, liveMode: p2, onLiveEvent: c, dataProviderName: k2, meta: { ...a, dataProviderName: l2 } });
  let L = useQuery({ queryKey: T().data(k2).resource(y).action("many").ids(...t2).params({ ...x || {} }).get(b), queryFn: (h2) => {
    let I = { ...U, queryContext: je(h2) };
    return v ? v({ resource: d == null ? void 0 : d.name, ids: t2, meta: I, metaData: I }) : lt(t2.map((Q) => V({ resource: d == null ? void 0 : d.name, id: Q, meta: I, metaData: I })));
  }, ...r2, onSuccess: (h2) => {
    var Q;
    (Q = r2 == null ? void 0 : r2.onSuccess) == null || Q.call(r2, h2);
    let I = typeof s == "function" ? s(h2, t2, y) : s;
    M(I);
  }, onError: (h2) => {
    var Q;
    R(h2), (Q = r2 == null ? void 0 : r2.onError) == null || Q.call(r2, h2);
    let I = typeof n2 == "function" ? n2(h2, t2, y) : n2;
    M(I, { key: `${t2[0]}-${y}-getMany-notification`, message: C("notifications.error", { statusCode: h2.statusCode }, `Error (status code: ${h2.statusCode})`), description: h2.message, type: "error" });
  }, meta: { ...r2 == null ? void 0 : r2.meta, ...k$1("useMany", b, d == null ? void 0 : d.name) } }), { elapsedTime: B } = pe({ isLoading: L.isFetching, interval: m2 == null ? void 0 : m2.interval, onInterval: m2 == null ? void 0 : m2.onInterval });
  return { ...L, overtime: { elapsedTime: B } };
}, "useMany");
var ks = ((s) => (s.ADD = "ADD", s.REMOVE = "REMOVE", s.DECREASE_NOTIFICATION_SECOND = "DECREASE_NOTIFICATION_SECOND", s))(ks || {});
var yo = o(({ id: e2, resource: t2, values: r2, dataProviderName: s, successNotification: n2, errorNotification: a, meta: i, metaData: p2, mutationMode: c, undoableTimeout: u2, onCancel: l2, optimisticUpdateMap: m2, invalidates: g, mutationOptions: d, overtimeOptions: y } = {}) => {
  let { resources: P, select: C } = Y(), f = useQueryClient(), R = fe(), { mutationMode: M, undoableTimeout: w } = _e(), T = $(), b = ie(), { mutate: x } = he({ v3LegacyAuthProviderCompatible: !!(b != null && b.isLegacy) }), k2 = Ye(), { log: F } = Je(), { notificationDispatch: v } = ut(), V = Re(), U = Ae(), L = ue(), { options: { textTransformers: B } } = ge(), { keys: h2, preferLegacyKeys: I } = Z(), Q = useMutation({ mutationFn: ({ id: D = e2, values: E = r2, resource: N = t2, mutationMode: G2 = c, undoableTimeout: X = u2, onCancel: q2 = l2, meta: re = i, metaData: z = p2, dataProviderName: H = s }) => {
    if (!D) throw jt;
    if (!E) throw wr;
    if (!N) throw _t;
    let { resource: O, identifier: oe } = C(N), J = L({ resource: O, meta: S(re, z) }), be = G2 ?? M, ce = X ?? w;
    return be !== "undoable" ? R(ee(oe, H, P)).update({ resource: O.name, id: D, variables: E, meta: J, metaData: J }) : new Promise((Ne, ne) => {
      let ye = o(() => {
        R(ee(oe, H, P)).update({ resource: O.name, id: D, variables: E, meta: J, metaData: J }).then((ve) => Ne(ve)).catch((ve) => ne(ve));
      }, "doMutation"), de = o(() => {
        ne({ message: "mutationCancelled" });
      }, "cancelMutation");
      q2 && q2(de), v({ type: "ADD", payload: { id: D, resource: oe, cancelMutation: de, doMutation: ye, seconds: ce, isSilent: !!q2 } });
    });
  }, onMutate: async ({ resource: D = t2, id: E = e2, mutationMode: N = c, values: G2 = r2, dataProviderName: X = s, meta: q2 = i, metaData: re = p2, optimisticUpdateMap: z = m2 ?? { list: true, many: true, detail: true } }) => {
    if (!E) throw jt;
    if (!G2) throw wr;
    if (!D) throw _t;
    let { identifier: H } = C(D), { gqlMutation: O, gqlQuery: oe, ...J } = S(q2, re) ?? {}, be = dt(I)(H, ee(H, X, P), J), ce = h2().data(ee(H, X, P)).resource(H), Ve = f.getQueriesData(ce.get(I)), Ne = N ?? M;
    return await f.cancelQueries(ce.get(I), void 0, { silent: true }), Ne !== "pessimistic" && (z.list && f.setQueriesData(ce.action("list").params(J ?? {}).get(I), (ne) => {
      if (typeof z.list == "function") return z.list(ne, G2, E);
      if (!ne) return null;
      let ye = ne.data.map((de) => {
        var ve;
        return ((ve = de.id) == null ? void 0 : ve.toString()) === (E == null ? void 0 : E.toString()) ? { id: E, ...de, ...G2 } : de;
      });
      return { ...ne, data: ye };
    }), z.many && f.setQueriesData(ce.action("many").get(I), (ne) => {
      if (typeof z.many == "function") return z.many(ne, G2, E);
      if (!ne) return null;
      let ye = ne.data.map((de) => {
        var ve;
        return ((ve = de.id) == null ? void 0 : ve.toString()) === (E == null ? void 0 : E.toString()) && (de = { id: E, ...de, ...G2 }), de;
      });
      return { ...ne, data: ye };
    }), z.detail && f.setQueriesData(ce.action("one").id(E).params(J ?? {}).get(I), (ne) => typeof z.detail == "function" ? z.detail(ne, G2, E) : ne ? { ...ne, data: { ...ne.data, ...G2 } } : null)), { previousQueries: Ve, queryKey: be };
  }, onSettled: (D, E, N, G2) => {
    var O;
    let { id: X = e2, resource: q2 = t2, dataProviderName: re = s, invalidates: z = g ?? ["list", "many", "detail"] } = N;
    if (!X) throw jt;
    if (!q2) throw _t;
    let { identifier: H } = C(q2);
    U({ resource: H, dataProviderName: ee(H, re, P), invalidates: z, id: X }), v({ type: "REMOVE", payload: { id: X, resource: H } }), (O = d == null ? void 0 : d.onSettled) == null || O.call(d, D, E, N, G2);
  }, onSuccess: (D, E, N) => {
    var Ke, Ct;
    let { id: G2 = e2, resource: X = t2, successNotification: q2 = n2, dataProviderName: re = s, values: z = r2, meta: H = i, metaData: O = p2 } = E;
    if (!G2) throw jt;
    if (!z) throw wr;
    if (!X) throw _t;
    let { resource: oe, identifier: J } = C(X), be = B.singular(J), ce = ee(J, re, P), Ve = L({ resource: oe, meta: S(H, O) }), Ne = typeof q2 == "function" ? q2(D, { id: G2, values: z }, J) : q2;
    V(Ne, { key: `${G2}-${J}-notification`, description: T("notifications.success", "Successful"), message: T("notifications.editSuccess", { resource: T(`${J}.${J}`, be) }, `Successfully updated ${be}`), type: "success" }), k2 == null || k2({ channel: `resources/${oe.name}`, type: "updated", payload: { ids: (Ke = D.data) != null && Ke.id ? [D.data.id] : void 0 }, date: /* @__PURE__ */ new Date(), meta: { ...Ve, dataProviderName: ce } });
    let ne;
    if (N) {
      let Ge = f.getQueryData(N.queryKey.detail(G2));
      ne = Object.keys(z || {}).reduce((Tt, xt) => {
        var bt;
        return Tt[xt] = (bt = Ge == null ? void 0 : Ge.data) == null ? void 0 : bt[xt], Tt;
      }, {});
    }
    let { fields: ye, operation: de, variables: ve, ...rt } = Ve || {};
    F == null || F.mutate({ action: "update", resource: oe.name, data: z, previousData: ne, meta: { id: G2, dataProviderName: ce, ...rt } }), (Ct = d == null ? void 0 : d.onSuccess) == null || Ct.call(d, D, E, N);
  }, onError: (D, E, N) => {
    var H;
    let { id: G2 = e2, resource: X = t2, errorNotification: q2 = a, values: re = r2 } = E;
    if (!G2) throw jt;
    if (!re) throw wr;
    if (!X) throw _t;
    let { identifier: z } = C(X);
    if (N) for (let O of N.previousQueries) f.setQueryData(O[0], O[1]);
    if (D.message !== "mutationCancelled") {
      x == null || x(D);
      let O = B.singular(z), oe = typeof q2 == "function" ? q2(D, { id: G2, values: re }, z) : q2;
      V(oe, { key: `${G2}-${z}-notification`, message: T("notifications.editError", { resource: T(`${z}.${z}`, O), statusCode: D.statusCode }, `Error when updating ${O} (status code: ${D.statusCode})`), description: D.message, type: "error" });
    }
    (H = d == null ? void 0 : d.onError) == null || H.call(d, D, E, N);
  }, mutationKey: h2().data().mutation("update").get(I), ...d, meta: { ...d == null ? void 0 : d.meta, ...k$1() } }), { mutate: W, mutateAsync: _, ...K } = Q, { elapsedTime: j } = pe({ isLoading: K.isLoading, interval: y == null ? void 0 : y.interval, onInterval: y == null ? void 0 : y.onInterval });
  return { ...K, mutate: o((D, E) => W(D || {}, E), "handleMutation"), mutateAsync: o((D, E) => _(D || {}, E), "handleMutateAsync"), overtime: { elapsedTime: j } };
}, "useUpdate"), _t = new Error("[useUpdate]: `resource` is not defined or not matched but is required"), jt = new Error("[useUpdate]: `id` is not defined but is required in edit and clone actions"), wr = new Error("[useUpdate]: `values` is not provided but is required");
var Xt = o(({ resource: e2, values: t2, dataProviderName: r2, successNotification: s, errorNotification: n2, invalidates: a, meta: i, metaData: p2, mutationOptions: c, overtimeOptions: u2 } = {}) => {
  let l2 = ie(), { mutate: m2 } = he({ v3LegacyAuthProviderCompatible: !!(l2 != null && l2.isLegacy) }), g = fe(), d = Ae(), { resources: y, select: P } = Y(), C = $(), f = Ye(), { log: R } = Je(), M = Re(), w = ue(), { options: { textTransformers: T } } = ge(), { keys: b, preferLegacyKeys: x } = Z(), k2 = useMutation({ mutationFn: ({ resource: h2 = e2, values: I = t2, meta: Q = i, metaData: W = p2, dataProviderName: _ = r2 }) => {
    if (!I) throw To;
    if (!h2) throw go;
    let { resource: K, identifier: j } = P(h2), te = w({ resource: K, meta: S(Q, W) });
    return g(ee(j, _, y)).create({ resource: K.name, variables: I, meta: te, metaData: te });
  }, onSuccess: (h2, I, Q) => {
    var J, be, ce;
    let { resource: W = e2, successNotification: _ = s, dataProviderName: K = r2, invalidates: j = a ?? ["list", "many"], values: te = t2, meta: ae = i, metaData: D = p2 } = I;
    if (!te) throw To;
    if (!W) throw go;
    let { resource: E, identifier: N } = P(W), G2 = T.singular(N), X = ee(N, K, y), q2 = w({ resource: E, meta: S(ae, D) }), re = typeof _ == "function" ? _(h2, te, N) : _;
    M(re, { key: `create-${N}-notification`, message: C("notifications.createSuccess", { resource: C(`${N}.${N}`, G2) }, `Successfully created ${G2}`), description: C("notifications.success", "Success"), type: "success" }), d({ resource: N, dataProviderName: X, invalidates: j }), f == null || f({ channel: `resources/${E.name}`, type: "created", payload: { ids: (J = h2 == null ? void 0 : h2.data) != null && J.id ? [h2.data.id] : void 0 }, date: /* @__PURE__ */ new Date(), meta: { ...q2, dataProviderName: X } });
    let { fields: z, operation: H, variables: O, ...oe } = q2 || {};
    R == null || R.mutate({ action: "create", resource: E.name, data: te, meta: { dataProviderName: X, id: ((be = h2 == null ? void 0 : h2.data) == null ? void 0 : be.id) ?? void 0, ...oe } }), (ce = c == null ? void 0 : c.onSuccess) == null || ce.call(c, h2, I, Q);
  }, onError: (h2, I, Q) => {
    var D;
    let { resource: W = e2, errorNotification: _ = n2, values: K = t2 } = I;
    if (!K) throw To;
    if (!W) throw go;
    m2(h2);
    let { identifier: j } = P(W), te = T.singular(j), ae = typeof _ == "function" ? _(h2, K, j) : _;
    M(ae, { key: `create-${j}-notification`, description: h2.message, message: C("notifications.createError", { resource: C(`${j}.${j}`, te), statusCode: h2.statusCode }, `There was an error creating ${te} (status code: ${h2.statusCode})`), type: "error" }), (D = c == null ? void 0 : c.onError) == null || D.call(c, h2, I, Q);
  }, mutationKey: b().data().mutation("create").get(x), ...c, meta: { ...c == null ? void 0 : c.meta, ...k$1() } }), { mutate: F, mutateAsync: v, ...V } = k2, { elapsedTime: U } = pe({ isLoading: V.isLoading, interval: u2 == null ? void 0 : u2.interval, onInterval: u2 == null ? void 0 : u2.onInterval });
  return { ...V, mutate: o((h2, I) => F(h2 || {}, I), "handleMutation"), mutateAsync: o((h2, I) => v(h2 || {}, I), "handleMutateAsync"), overtime: { elapsedTime: U } };
}, "useCreate"), go = new Error("[useCreate]: `resource` is not defined or not matched but is required"), To = new Error("[useCreate]: `values` is not provided but is required");
var xo = o(({ mutationOptions: e2, overtimeOptions: t2 } = {}) => {
  let r2 = ie(), { mutate: s } = he({ v3LegacyAuthProviderCompatible: !!(r2 != null && r2.isLegacy) }), n2 = fe(), { resources: a, select: i } = Y(), p2 = useQueryClient(), { mutationMode: c, undoableTimeout: u2 } = _e(), { notificationDispatch: l2 } = ut(), m2 = $(), g = Ye(), { log: d } = Je(), y = Re(), P = Ae(), C = ue(), { options: { textTransformers: f } } = ge(), { keys: R, preferLegacyKeys: M } = Z(), w = useMutation({ mutationFn: ({ id: b, mutationMode: x, undoableTimeout: k2, resource: F, onCancel: v, meta: V, metaData: U, dataProviderName: L, values: B }) => {
    let { resource: h2, identifier: I } = i(F), Q = C({ resource: h2, meta: S(V, U) }), W = x ?? c, _ = k2 ?? u2;
    return W !== "undoable" ? n2(ee(I, L, a)).deleteOne({ resource: h2.name, id: b, meta: Q, metaData: Q, variables: B }) : new Promise((j, te) => {
      let ae = o(() => {
        n2(ee(I, L, a)).deleteOne({ resource: h2.name, id: b, meta: Q, metaData: Q, variables: B }).then((E) => j(E)).catch((E) => te(E));
      }, "doMutation"), D = o(() => {
        te({ message: "mutationCancelled" });
      }, "cancelMutation");
      v && v(D), l2({ type: "ADD", payload: { id: b, resource: I, cancelMutation: D, doMutation: ae, seconds: _, isSilent: !!v } });
    });
  }, onMutate: async ({ id: b, resource: x, mutationMode: k2, dataProviderName: F, meta: v, metaData: V }) => {
    let { identifier: U } = i(x), { gqlMutation: L, gqlQuery: B, ...h2 } = S(v, V) ?? {}, I = dt(M)(U, ee(U, F, a), h2), Q = R().data(ee(U, F, a)).resource(U), W = k2 ?? c;
    await p2.cancelQueries(Q.get(M), void 0, { silent: true });
    let _ = p2.getQueriesData(Q.get(M));
    return W !== "pessimistic" && (p2.setQueriesData(Q.action("list").params(h2 ?? {}).get(M), (K) => K ? { data: K.data.filter((te) => {
      var ae;
      return ((ae = te.id) == null ? void 0 : ae.toString()) !== b.toString();
    }), total: K.total - 1 } : null), p2.setQueriesData(Q.action("many").get(M), (K) => {
      if (!K) return null;
      let j = K.data.filter((te) => {
        var ae;
        return ((ae = te.id) == null ? void 0 : ae.toString()) !== (b == null ? void 0 : b.toString());
      });
      return { ...K, data: j };
    })), { previousQueries: _, queryKey: I };
  }, onSettled: (b, x, { id: k2, resource: F, dataProviderName: v, invalidates: V = ["list", "many"] }) => {
    let { identifier: U } = i(F);
    P({ resource: U, dataProviderName: ee(U, v, a), invalidates: V }), l2({ type: "REMOVE", payload: { id: k2, resource: U } });
  }, onSuccess: (b, { id: x, resource: k2, successNotification: F, dataProviderName: v, meta: V, metaData: U }, L) => {
    let { resource: B, identifier: h2 } = i(k2), I = f.singular(h2), Q = ee(h2, v, a), W = C({ resource: B, meta: S(V, U) });
    p2.removeQueries(L == null ? void 0 : L.queryKey.detail(x));
    let _ = typeof F == "function" ? F(b, x, h2) : F;
    y(_, { key: `${x}-${h2}-notification`, description: m2("notifications.success", "Success"), message: m2("notifications.deleteSuccess", { resource: m2(`${h2}.${h2}`, I) }, `Successfully deleted a ${I}`), type: "success" }), g == null || g({ channel: `resources/${B.name}`, type: "deleted", payload: { ids: [x] }, date: /* @__PURE__ */ new Date(), meta: { ...W, dataProviderName: Q } });
    let { fields: K, operation: j, variables: te, ...ae } = W || {};
    d == null || d.mutate({ action: "delete", resource: B.name, meta: { id: x, dataProviderName: Q, ...ae } }), p2.removeQueries(L == null ? void 0 : L.queryKey.detail(x));
  }, onError: (b, { id: x, resource: k2, errorNotification: F }, v) => {
    let { identifier: V } = i(k2);
    if (v) for (let U of v.previousQueries) p2.setQueryData(U[0], U[1]);
    if (b.message !== "mutationCancelled") {
      s(b);
      let U = f.singular(V), L = typeof F == "function" ? F(b, x, V) : F;
      y(L, { key: `${x}-${V}-notification`, message: m2("notifications.deleteError", { resource: U, statusCode: b.statusCode }, `Error (status code: ${b.statusCode})`), description: b.message, type: "error" });
    }
  }, mutationKey: R().data().mutation("delete").get(M), ...e2, meta: { ...e2 == null ? void 0 : e2.meta, ...k$1() } }), { elapsedTime: T } = pe({ isLoading: w.isLoading, interval: t2 == null ? void 0 : t2.interval, onInterval: t2 == null ? void 0 : t2.onInterval });
  return { ...w, overtime: { elapsedTime: T } };
}, "useDelete");
var Ro = o(({ resource: e2, values: t2, dataProviderName: r2, successNotification: s, errorNotification: n2, meta: a, metaData: i, invalidates: p2, mutationOptions: c, overtimeOptions: u2 } = {}) => {
  let l2 = fe(), { resources: m2, select: g } = Y(), d = $(), y = Ye(), P = Re(), C = Ae(), { log: f } = Je(), R = ue(), { options: { textTransformers: M } } = ge(), { keys: w, preferLegacyKeys: T } = Z(), b = useMutation({ mutationFn: ({ resource: L = e2, values: B = t2, meta: h2 = a, metaData: I = i, dataProviderName: Q = r2 }) => {
    if (!B) throw ho;
    if (!L) throw Po;
    let { resource: W, identifier: _ } = g(L), K = R({ resource: W, meta: S(h2, I) }), j = l2(ee(_, Q, m2));
    return j.createMany ? j.createMany({ resource: W.name, variables: B, meta: K, metaData: K }) : lt(B.map((te) => j.create({ resource: W.name, variables: te, meta: K, metaData: K })));
  }, onSuccess: (L, B, h2) => {
    var oe;
    let { resource: I = e2, successNotification: Q = s, dataProviderName: W = r2, invalidates: _ = p2 ?? ["list", "many"], values: K = t2, meta: j = a, metaData: te = i } = B;
    if (!K) throw ho;
    if (!I) throw Po;
    let { resource: ae, identifier: D } = g(I), E = M.plural(D), N = ee(D, W, m2), G2 = R({ resource: ae, meta: S(j, te) }), X = typeof Q == "function" ? Q(L, K, D) : Q;
    P(X, { key: `createMany-${D}-notification`, message: d("notifications.createSuccess", { resource: d(`${D}.${D}`, D) }, `Successfully created ${E}`), description: d("notifications.success", "Success"), type: "success" }), C({ resource: D, dataProviderName: N, invalidates: _ });
    let q2 = L == null ? void 0 : L.data.filter((J) => (J == null ? void 0 : J.id) !== void 0).map((J) => J.id);
    y == null || y({ channel: `resources/${ae.name}`, type: "created", payload: { ids: q2 }, date: /* @__PURE__ */ new Date(), meta: { ...G2, dataProviderName: N } });
    let { fields: re, operation: z, variables: H, ...O } = G2 || {};
    f == null || f.mutate({ action: "createMany", resource: ae.name, data: K, meta: { dataProviderName: N, ids: q2, ...O } }), (oe = c == null ? void 0 : c.onSuccess) == null || oe.call(c, L, B, h2);
  }, onError: (L, B, h2) => {
    var j;
    let { resource: I = e2, errorNotification: Q = n2, values: W = t2 } = B;
    if (!W) throw ho;
    if (!I) throw Po;
    let { identifier: _ } = g(I), K = typeof Q == "function" ? Q(L, W, _) : Q;
    P(K, { key: `createMany-${_}-notification`, description: L.message, message: d("notifications.createError", { resource: d(`${_}.${_}`, _), statusCode: L.statusCode }, `There was an error creating ${_} (status code: ${L.statusCode}`), type: "error" }), (j = c == null ? void 0 : c.onError) == null || j.call(c, L, B, h2);
  }, mutationKey: w().data().mutation("createMany").get(T), ...c, meta: { ...c == null ? void 0 : c.meta, ...k$1() } }), { mutate: x, mutateAsync: k2, ...F } = b, { elapsedTime: v } = pe({ isLoading: F.isLoading, interval: u2 == null ? void 0 : u2.interval, onInterval: u2 == null ? void 0 : u2.onInterval });
  return { ...F, mutate: o((L, B) => x(L || {}, B), "handleMutation"), mutateAsync: o((L, B) => k2(L || {}, B), "handleMutateAsync"), overtime: { elapsedTime: v } };
}, "useCreateMany"), Po = new Error("[useCreateMany]: `resource` is not defined or not matched but is required"), ho = new Error("[useCreateMany]: `values` is not provided but is required");
o(({ ids: e2, resource: t2, values: r2, dataProviderName: s, successNotification: n2, errorNotification: a, meta: i, metaData: p2, mutationMode: c, undoableTimeout: u2, onCancel: l2, optimisticUpdateMap: m2, invalidates: g, mutationOptions: d, overtimeOptions: y } = {}) => {
  let { resources: P, select: C } = Y(), f = useQueryClient(), R = fe(), M = $(), { mutationMode: w, undoableTimeout: T } = _e(), b = ie(), { mutate: x } = he({ v3LegacyAuthProviderCompatible: !!(b != null && b.isLegacy) }), { notificationDispatch: k2 } = ut(), F = Ye(), v = Re(), V = Ae(), { log: U } = Je(), L = ue(), { options: { textTransformers: B } } = ge(), { keys: h2, preferLegacyKeys: I } = Z(), Q = useMutation({ mutationFn: ({ ids: D = e2, values: E = r2, resource: N = t2, onCancel: G2 = l2, mutationMode: X = c, undoableTimeout: q2 = u2, meta: re = i, metaData: z = p2, dataProviderName: H = s }) => {
    if (!D) throw Yt;
    if (!E) throw Ir;
    if (!N) throw Zt;
    let { resource: O, identifier: oe } = C(N), J = L({ resource: O, meta: S(re, z) }), be = X ?? w, ce = q2 ?? T, Ve = R(ee(oe, H, P)), Ne = o(() => Ve.updateMany ? Ve.updateMany({ resource: O.name, ids: D, variables: E, meta: J, metaData: J }) : lt(D.map((ye) => Ve.update({ resource: O.name, id: ye, variables: E, meta: J, metaData: J }))), "mutationFn");
    return be !== "undoable" ? Ne() : new Promise((ye, de) => {
      let ve = o(() => {
        Ne().then((Ke) => ye(Ke)).catch((Ke) => de(Ke));
      }, "doMutation"), rt = o(() => {
        de({ message: "mutationCancelled" });
      }, "cancelMutation");
      G2 && G2(rt), k2({ type: "ADD", payload: { id: D, resource: oe, cancelMutation: rt, doMutation: ve, seconds: ce, isSilent: !!G2 } });
    });
  }, onMutate: async ({ resource: D = t2, ids: E = e2, values: N = r2, mutationMode: G2 = c, dataProviderName: X = s, meta: q2 = i, metaData: re = p2, optimisticUpdateMap: z = m2 ?? { list: true, many: true, detail: true } }) => {
    if (!E) throw Yt;
    if (!N) throw Ir;
    if (!D) throw Zt;
    let { identifier: H } = C(D), { gqlMutation: O, gqlQuery: oe, ...J } = S(q2, re) ?? {}, be = dt(I)(H, ee(H, X, P), J), ce = h2().data(ee(H, X, P)).resource(H), Ve = G2 ?? w;
    await f.cancelQueries(ce.get(I), void 0, { silent: true });
    let Ne = f.getQueriesData(ce.get(I));
    if (Ve !== "pessimistic" && (z.list && f.setQueriesData(ce.action("list").params(J ?? {}).get(I), (ne) => {
      if (typeof z.list == "function") return z.list(ne, N, E);
      if (!ne) return null;
      let ye = ne.data.map((de) => de.id !== void 0 && E.filter((ve) => ve !== void 0).map(String).includes(de.id.toString()) ? { ...de, ...N } : de);
      return { ...ne, data: ye };
    }), z.many && f.setQueriesData(ce.action("many").get(I), (ne) => {
      if (typeof z.many == "function") return z.many(ne, N, E);
      if (!ne) return null;
      let ye = ne.data.map((de) => de.id !== void 0 && E.filter((ve) => ve !== void 0).map(String).includes(de.id.toString()) ? { ...de, ...N } : de);
      return { ...ne, data: ye };
    }), z.detail)) for (let ne of E) f.setQueriesData(ce.action("one").id(ne).params(J ?? {}).get(I), (ye) => {
      if (typeof z.detail == "function") return z.detail(ye, N, ne);
      if (!ye) return null;
      let de = { ...ye.data, ...N };
      return { ...ye, data: de };
    });
    return { previousQueries: Ne, queryKey: be };
  }, onSettled: (D, E, N, G2) => {
    var O;
    let { ids: X = e2, resource: q2 = t2, dataProviderName: re = s, invalidates: z = g } = N;
    if (!X) throw Yt;
    if (!q2) throw Zt;
    let { identifier: H } = C(q2);
    V({ resource: H, invalidates: z ?? ["list", "many"], dataProviderName: ee(H, re, P) }), X.forEach((oe) => V({ resource: H, invalidates: z ?? ["detail"], dataProviderName: ee(H, re, P), id: oe })), k2({ type: "REMOVE", payload: { id: X, resource: H } }), (O = d == null ? void 0 : d.onSettled) == null || O.call(d, D, E, N, G2);
  }, onSuccess: (D, E, N) => {
    var Ke;
    let { ids: G2 = e2, resource: X = t2, values: q2 = r2, meta: re = i, metaData: z = p2, dataProviderName: H = s, successNotification: O = n2 } = E;
    if (!G2) throw Yt;
    if (!q2) throw Ir;
    if (!X) throw Zt;
    let { resource: oe, identifier: J } = C(X), be = B.singular(J), ce = ee(J, H, P), Ve = L({ resource: oe, meta: S(re, z) }), Ne = typeof O == "function" ? O(D, { ids: G2, values: q2 }, J) : O;
    v(Ne, { key: `${G2}-${J}-notification`, description: M("notifications.success", "Successful"), message: M("notifications.editSuccess", { resource: M(`${J}.${J}`, J) }, `Successfully updated ${be}`), type: "success" }), F == null || F({ channel: `resources/${oe.name}`, type: "updated", payload: { ids: G2.map(String) }, date: /* @__PURE__ */ new Date(), meta: { ...Ve, dataProviderName: ce } });
    let ne = [];
    N && G2.forEach((Ct) => {
      let Ge = f.getQueryData(N.queryKey.detail(Ct));
      ne.push(Object.keys(q2 || {}).reduce((Tt, xt) => {
        var bt;
        return Tt[xt] = (bt = Ge == null ? void 0 : Ge.data) == null ? void 0 : bt[xt], Tt;
      }, {}));
    });
    let { fields: ye, operation: de, variables: ve, ...rt } = Ve || {};
    U == null || U.mutate({ action: "updateMany", resource: oe.name, data: q2, previousData: ne, meta: { ids: G2, dataProviderName: ce, ...rt } }), (Ke = d == null ? void 0 : d.onSuccess) == null || Ke.call(d, D, E, N);
  }, onError: (D, E, N) => {
    var H;
    let { ids: G2 = e2, resource: X = t2, errorNotification: q2 = a, values: re = r2 } = E;
    if (!G2) throw Yt;
    if (!re) throw Ir;
    if (!X) throw Zt;
    let { identifier: z } = C(X);
    if (N) for (let O of N.previousQueries) f.setQueryData(O[0], O[1]);
    if (D.message !== "mutationCancelled") {
      x == null || x(D);
      let O = B.singular(z), oe = typeof q2 == "function" ? q2(D, { ids: G2, values: re }, z) : q2;
      v(oe, { key: `${G2}-${z}-updateMany-error-notification`, message: M("notifications.editError", { resource: O, statusCode: D.statusCode }, `Error when updating ${O} (status code: ${D.statusCode})`), description: D.message, type: "error" });
    }
    (H = d == null ? void 0 : d.onError) == null || H.call(d, D, E, N);
  }, mutationKey: h2().data().mutation("updateMany").get(I), ...d, meta: { ...d == null ? void 0 : d.meta, ...k$1() } }), { mutate: W, mutateAsync: _, ...K } = Q, { elapsedTime: j } = pe({ isLoading: K.isLoading, interval: y == null ? void 0 : y.interval, onInterval: y == null ? void 0 : y.onInterval });
  return { ...K, mutate: o((D, E) => W(D || {}, E), "handleMutation"), mutateAsync: o((D, E) => _(D || {}, E), "handleMutateAsync"), overtime: { elapsedTime: j } };
}, "useUpdateMany");
var Zt = new Error("[useUpdateMany]: `resource` is not defined or not matched but is required"), Yt = new Error("[useUpdateMany]: `id` is not defined but is required in edit and clone actions"), Ir = new Error("[useUpdateMany]: `values` is not provided but is required");
o(({ mutationOptions: e2, overtimeOptions: t2 } = {}) => {
  let r2 = ie(), { mutate: s } = he({ v3LegacyAuthProviderCompatible: !!(r2 != null && r2.isLegacy) }), { mutationMode: n2, undoableTimeout: a } = _e(), i = fe(), { notificationDispatch: p2 } = ut(), c = $(), u2 = Ye(), l2 = Re(), m2 = Ae(), { log: g } = Je(), { resources: d, select: y } = Y(), P = useQueryClient(), C = ue(), { options: { textTransformers: f } } = ge(), { keys: R, preferLegacyKeys: M } = Z(), w = useMutation({ mutationFn: ({ resource: b, ids: x, mutationMode: k2, undoableTimeout: F, onCancel: v, meta: V, metaData: U, dataProviderName: L, values: B }) => {
    let { resource: h2, identifier: I } = y(b), Q = C({ resource: h2, meta: S(V, U) }), W = k2 ?? n2, _ = F ?? a, K = i(ee(I, L, d)), j = o(() => K.deleteMany ? K.deleteMany({ resource: h2.name, ids: x, meta: Q, metaData: Q, variables: B }) : lt(x.map((ae) => K.deleteOne({ resource: h2.name, id: ae, meta: Q, metaData: Q, variables: B }))), "mutationFn");
    return W !== "undoable" ? j() : new Promise((ae, D) => {
      let E = o(() => {
        j().then((G2) => ae(G2)).catch((G2) => D(G2));
      }, "doMutation"), N = o(() => {
        D({ message: "mutationCancelled" });
      }, "cancelMutation");
      v && v(N), p2({ type: "ADD", payload: { id: x, resource: I, cancelMutation: N, doMutation: E, seconds: _, isSilent: !!v } });
    });
  }, onMutate: async ({ ids: b, resource: x, mutationMode: k2, dataProviderName: F, meta: v, metaData: V }) => {
    let { identifier: U } = y(x), { gqlMutation: L, gqlQuery: B, ...h2 } = S(v, V) ?? {}, I = dt(M)(U, ee(U, F, d), h2), Q = R().data(ee(U, F, d)).resource(U), W = k2 ?? n2;
    await P.cancelQueries(Q.get(M), void 0, { silent: true });
    let _ = P.getQueriesData(Q.get(M));
    if (W !== "pessimistic") {
      P.setQueriesData(Q.action("list").params(h2 ?? {}).get(M), (K) => K ? { data: K.data.filter((te) => te.id && !b.map(String).includes(te.id.toString())), total: K.total - 1 } : null), P.setQueriesData(Q.action("many").get(M), (K) => {
        if (!K) return null;
        let j = K.data.filter((te) => te.id ? !b.map(String).includes(te.id.toString()) : false);
        return { ...K, data: j };
      });
      for (let K of b) P.setQueriesData(Q.action("one").id(K).params(h2).get(M), (j) => !j || j.data.id === K ? null : { ...j });
    }
    return { previousQueries: _, queryKey: I };
  }, onSettled: (b, x, { resource: k2, ids: F, dataProviderName: v, invalidates: V = ["list", "many"] }) => {
    let { identifier: U } = y(k2);
    m2({ resource: U, dataProviderName: ee(U, v, d), invalidates: V }), p2({ type: "REMOVE", payload: { id: F, resource: U } });
  }, onSuccess: (b, { ids: x, resource: k2, meta: F, metaData: v, dataProviderName: V, successNotification: U }, L) => {
    let { resource: B, identifier: h2 } = y(k2), I = ee(h2, V, d), Q = C({ resource: B, meta: S(F, v) });
    x.forEach((ae) => P.removeQueries(L == null ? void 0 : L.queryKey.detail(ae)));
    let W = typeof U == "function" ? U(b, x, h2) : U;
    l2(W, { key: `${x}-${h2}-notification`, description: c("notifications.success", "Success"), message: c("notifications.deleteSuccess", { resource: c(`${h2}.${h2}`, h2) }, `Successfully deleted ${h2}`), type: "success" }), u2 == null || u2({ channel: `resources/${B.name}`, type: "deleted", payload: { ids: x }, date: /* @__PURE__ */ new Date(), meta: { ...Q, dataProviderName: I } });
    let { fields: _, operation: K, variables: j, ...te } = Q || {};
    g == null || g.mutate({ action: "deleteMany", resource: B.name, meta: { ids: x, dataProviderName: I, ...te } }), x.forEach((ae) => P.removeQueries(L == null ? void 0 : L.queryKey.detail(ae)));
  }, onError: (b, { ids: x, resource: k2, errorNotification: F }, v) => {
    let { identifier: V } = y(k2);
    if (v) for (let U of v.previousQueries) P.setQueryData(U[0], U[1]);
    if (b.message !== "mutationCancelled") {
      s(b);
      let U = f.singular(V), L = typeof F == "function" ? F(b, x, V) : F;
      l2(L, { key: `${x}-${V}-notification`, message: c("notifications.deleteError", { resource: U, statusCode: b.statusCode }, `Error (status code: ${b.statusCode})`), description: b.message, type: "error" });
    }
  }, mutationKey: R().data().mutation("deleteMany").get(M), ...e2, meta: { ...e2 == null ? void 0 : e2.meta, ...k$1() } }), { elapsedTime: T } = pe({ isLoading: w.isLoading, interval: t2 == null ? void 0 : t2.interval, onInterval: t2 == null ? void 0 : t2.onInterval });
  return { ...w, overtime: { elapsedTime: T } };
}, "useDeleteMany");
var si = o((e2) => {
  var n2;
  let t2 = fe(), { resource: r2 } = Y(), { getApiUrl: s } = t2(e2 ?? ((n2 = S(r2 == null ? void 0 : r2.meta, r2 == null ? void 0 : r2.options)) == null ? void 0 : n2.dataProviderName));
  return s();
}, "useApiUrl");
var ii = o(({ url: e2, method: t2, config: r2, queryOptions: s, successNotification: n2, errorNotification: a, meta: i, metaData: p2, dataProviderName: c, overtimeOptions: u2 }) => {
  let l2 = fe(), m2 = ie(), { mutate: g } = he({ v3LegacyAuthProviderCompatible: !!(m2 != null && m2.isLegacy) }), d = $(), y = Re(), P = ue(), { keys: C, preferLegacyKeys: f } = Z(), R = S(i, p2), { custom: M } = l2(c), w = P({ meta: R });
  if (M) {
    let T = useQuery({ queryKey: C().data(c).mutation("custom").params({ method: t2, url: e2, ...r2, ...R || {} }).get(f), queryFn: (x) => M({ url: e2, method: t2, ...r2, meta: { ...w, queryContext: je(x) }, metaData: { ...w, queryContext: je(x) } }), ...s, onSuccess: (x) => {
      var F;
      (F = s == null ? void 0 : s.onSuccess) == null || F.call(s, x);
      let k2 = typeof n2 == "function" ? n2(x, { ...r2, ...w }) : n2;
      y(k2);
    }, onError: (x) => {
      var F;
      g(x), (F = s == null ? void 0 : s.onError) == null || F.call(s, x);
      let k2 = typeof a == "function" ? a(x, { ...r2, ...w }) : a;
      y(k2, { key: `${t2}-notification`, message: d("notifications.error", { statusCode: x.statusCode }, `Error (status code: ${x.statusCode})`), description: x.message, type: "error" });
    }, meta: { ...s == null ? void 0 : s.meta, ...k$1() } }), { elapsedTime: b } = pe({ isLoading: T.isFetching, interval: u2 == null ? void 0 : u2.interval, onInterval: u2 == null ? void 0 : u2.onInterval });
    return { ...T, overtime: { elapsedTime: b } };
  }
  throw Error("Not implemented custom on data provider.");
}, "useCustom");
var pi = o(({ mutationOptions: e2, overtimeOptions: t2 } = {}) => {
  let r2 = ie(), { mutate: s } = he({ v3LegacyAuthProviderCompatible: !!(r2 != null && r2.isLegacy) }), n2 = Re(), a = fe(), i = $(), p2 = ue(), { keys: c, preferLegacyKeys: u2 } = Z(), l2 = useMutation(({ url: g, method: d, values: y, meta: P, metaData: C, dataProviderName: f, config: R }) => {
    let M = p2({ meta: S(P, C) }), { custom: w } = a(f);
    if (w) return w({ url: g, method: d, payload: y, meta: M, metaData: M, headers: { ...R == null ? void 0 : R.headers } });
    throw Error("Not implemented custom on data provider.");
  }, { onSuccess: (g, { successNotification: d, config: y, meta: P, metaData: C }) => {
    let f = typeof d == "function" ? d(g, { ...y, ...S(P, C) || {} }) : d;
    n2(f);
  }, onError: (g, { errorNotification: d, method: y, config: P, meta: C, metaData: f }) => {
    s(g);
    let R = typeof d == "function" ? d(g, { ...P, ...S(C, f) || {} }) : d;
    n2(R, { key: `${y}-notification`, message: i("notifications.error", { statusCode: g.statusCode }, `Error (status code: ${g.statusCode})`), description: g.message, type: "error" });
  }, mutationKey: c().data().mutation("customMutation").get(u2), ...e2, meta: { ...e2 == null ? void 0 : e2.meta, ...k$1() } }), { elapsedTime: m2 } = pe({ isLoading: l2.isLoading, interval: t2 == null ? void 0 : t2.interval, onInterval: t2 == null ? void 0 : t2.onInterval });
  return { ...l2, overtime: { elapsedTime: m2 } };
}, "useCustomMutation");
var Qs = { default: {} }, Jt = React.createContext(Qs), Vs = o(({ children: e2, dataProvider: t2 }) => {
  let r2 = Qs;
  return t2 && (!("default" in t2) && ("getList" in t2 || "getOne" in t2) ? r2 = { default: t2 } : r2 = t2), React.createElement(Jt.Provider, { value: r2 }, e2);
}, "DataContextProvider");
var fe = o(() => {
  let e2 = reactExports.useContext(Jt);
  return reactExports.useCallback((r2) => {
    if (r2) {
      let s = e2 == null ? void 0 : e2[r2];
      if (!s) throw new Error(`"${r2}" Data provider not found`);
      if (s && !(e2 != null && e2.default)) throw new Error("If you have multiple data providers, you must provide default data provider property");
      return e2[r2];
    }
    if (e2.default) return e2.default;
    throw new Error('There is no "default" data provider. Please pass dataProviderName.');
  }, [e2]);
}, "useDataProvider");
o(({ resource: e2, config: t2, filters: r2, hasPagination: s, pagination: n2, sorters: a, queryOptions: i, successNotification: p2, errorNotification: c, meta: u2, metaData: l2, liveMode: m2, onLiveEvent: g, liveParams: d, dataProviderName: y, overtimeOptions: P }) => {
  let { resources: C, resource: f, identifier: R } = Y(e2), M = fe(), w = $(), T = ie(), { mutate: b } = he({ v3LegacyAuthProviderCompatible: !!(T != null && T.isLegacy) }), x = Re(), k2 = ue(), { keys: F, preferLegacyKeys: v } = Z(), V = ee(R, y, C), U = S(u2, l2), L = S(r2, t2 == null ? void 0 : t2.filters), B = S(a, t2 == null ? void 0 : t2.sort), h2 = S(s, t2 == null ? void 0 : t2.hasPagination), I = Wt({ pagination: n2, configPagination: t2 == null ? void 0 : t2.pagination, hasPagination: h2 }), Q = I.mode === "server", W = { meta: U, metaData: U, filters: L, hasPagination: Q, pagination: I, sorters: B, config: { ...t2, sort: B } }, _ = (i == null ? void 0 : i.enabled) === void 0 || (i == null ? void 0 : i.enabled) === true, K = k2({ resource: f, meta: U }), { getList: j } = M(V);
  ht({ resource: R, types: ["*"], params: { meta: K, metaData: K, pagination: I, hasPagination: Q, sort: B, sorters: B, filters: L, subscriptionType: "useList", ...d }, channel: `resources/${f.name}`, enabled: _, liveMode: m2, onLiveEvent: g, dataProviderName: V, meta: { ...K, dataProviderName: y } });
  let te = useInfiniteQuery({ queryKey: F().data(V).resource(R).action("infinite").params({ ...U || {}, filters: L, hasPagination: Q, ...Q && { pagination: I }, ...a && { sorters: a }, ...(t2 == null ? void 0 : t2.sort) && { sort: t2 == null ? void 0 : t2.sort } }).get(v), queryFn: (D) => {
    let E = { ...I, current: D.pageParam }, N = { ...K, queryContext: je(D) };
    return j({ resource: f.name, pagination: E, hasPagination: Q, filters: L, sort: B, sorters: B, meta: N, metaData: N }).then(({ data: G2, total: X, ...q2 }) => ({ data: G2, total: X, pagination: E, ...q2 }));
  }, getNextPageParam: (D) => gr(D), getPreviousPageParam: (D) => Tr(D), ...i, onSuccess: (D) => {
    var N;
    (N = i == null ? void 0 : i.onSuccess) == null || N.call(i, D);
    let E = typeof p2 == "function" ? p2(D, W, R) : p2;
    x(E);
  }, onError: (D) => {
    var N;
    b(D), (N = i == null ? void 0 : i.onError) == null || N.call(i, D);
    let E = typeof c == "function" ? c(D, W, R) : c;
    x(E, { key: `${R}-useInfiniteList-notification`, message: w("notifications.error", { statusCode: D.statusCode }, `Error (status code: ${D.statusCode})`), description: D.message, type: "error" });
  }, meta: { ...i == null ? void 0 : i.meta, ...k$1("useInfiniteList", v, f == null ? void 0 : f.name) } }), { elapsedTime: ae } = pe({ isLoading: te.isFetching, interval: P == null ? void 0 : P.interval, onInterval: P == null ? void 0 : P.onInterval });
  return { ...te, overtime: { elapsedTime: ae } };
}, "useInfiniteList");
var mt = React.createContext({}), Bs = o(({ liveProvider: e2, children: t2 }) => React.createElement(mt.Provider, { value: { liveProvider: e2 } }, t2), "LiveContextProvider");
var Ae = o(() => {
  let { resources: e2 } = Y(), t2 = useQueryClient(), { keys: r2, preferLegacyKeys: s } = Z();
  return reactExports.useCallback(async ({ resource: a, dataProviderName: i, invalidates: p2, id: c, invalidationFilters: u2 = { type: "all", refetchType: "active" }, invalidationOptions: l2 = { cancelRefetch: false } }) => {
    if (p2 === false) return;
    let m2 = ee(a, i, e2), g = r2().data(m2).resource(a ?? "");
    await Promise.all(p2.map((d) => {
      switch (d) {
        case "all":
          return t2.invalidateQueries(r2().data(m2).get(s), u2, l2);
        case "list":
          return t2.invalidateQueries(g.action("list").get(s), u2, l2);
        case "many":
          return t2.invalidateQueries(g.action("many").get(s), u2, l2);
        case "resourceAll":
          return t2.invalidateQueries(g.get(s), u2, l2);
        case "detail":
          return t2.invalidateQueries(g.action("one").id(c || "").get(s), u2, l2);
        default:
          return;
      }
    }));
  }, []);
}, "useInvalidate");
var Ks = o((e2) => {
  let t2 = reactExports.useRef(e2);
  return isEqual(t2.current, e2) || (t2.current = e2), t2.current;
}, "useMemoized");
var Sr = o((e2, t2) => {
  let r2 = Ks(t2);
  return reactExports.useMemo(e2, r2);
}, "useDeepMemo");
var Rt = React.createContext({ resources: [] }), Hs = o(({ resources: e2, children: t2 }) => {
  let r2 = Sr(() => xr(e2 ?? []), [e2]);
  return React.createElement(Rt.Provider, { value: { resources: r2 } }, t2);
}, "ResourceContextProvider");
var $s = React.createContext("new"), zs = $s.Provider, se = o(() => React.useContext($s), "useRouterType");
var Os = {}, ft = reactExports.createContext(Os), _s = o(({ children: e2, router: t2 }) => React.createElement(ft.Provider, { value: t2 ?? Os }, e2), "RouterContextProvider");
var Co = o(() => {
  let e2 = reactExports.useContext(ft);
  return React.useMemo(() => (e2 == null ? void 0 : e2.parse) ?? (() => () => ({})), [e2 == null ? void 0 : e2.parse])();
}, "useParse");
var Te = o(() => {
  let e2 = Co();
  return React.useMemo(() => e2(), [e2]);
}, "useParsed");
function Y(e2) {
  let { resources: t2 } = reactExports.useContext(Rt), r2 = se(), s = Te(), n2 = { resourceName: e2 && typeof e2 != "string" ? e2.resourceName : e2, resourceNameOrRouteName: e2 && typeof e2 != "string" ? e2.resourceNameOrRouteName : e2, recordItemId: e2 && typeof e2 != "string" ? e2.recordItemId : void 0 }, a = o((m2, g = true) => {
    let y = Ee(m2, t2, r2 === "legacy");
    if (y) return { resource: y, identifier: y.identifier ?? y.name };
    if (g) {
      let P = { name: m2, identifier: m2 }, C = P.identifier ?? P.name;
      return { resource: P, identifier: C };
    }
  }, "select"), i = js(), { useParams: p2 } = le(), c = p2();
  if (r2 === "legacy") {
    let m2 = n2.resourceNameOrRouteName ? n2.resourceNameOrRouteName : c.resource, g = m2 ? i(m2) : void 0, d = (n2 == null ? void 0 : n2.recordItemId) ?? c.id, y = c.action, P = (n2 == null ? void 0 : n2.resourceName) ?? (g == null ? void 0 : g.name), C = (g == null ? void 0 : g.identifier) ?? (g == null ? void 0 : g.name);
    return { resources: t2, resource: g, resourceName: P, id: d, action: y, select: a, identifier: C };
  }
  let u2, l2 = typeof e2 == "string" ? e2 : n2 == null ? void 0 : n2.resourceNameOrRouteName;
  if (l2) {
    let m2 = Ee(l2, t2);
    m2 ? u2 = m2 : u2 = { name: l2 };
  } else s != null && s.resource && (u2 = s.resource);
  return { resources: t2, resource: u2, resourceName: u2 == null ? void 0 : u2.name, id: s.id, action: s.action, select: a, identifier: (u2 == null ? void 0 : u2.identifier) ?? (u2 == null ? void 0 : u2.name) };
}
o(Y, "useResource");
var js = o(() => {
  let { resources: e2 } = reactExports.useContext(Rt);
  return reactExports.useCallback((r2) => {
    let s = Ee(r2, e2, true);
    return s || { name: r2, route: r2 };
  }, [e2]);
}, "useResourceWithRoute");
var ht = o(({ resource: e2, params: t2, channel: r2, types: s, enabled: n2 = true, liveMode: a, onLiveEvent: i, dataProviderName: p2, meta: c }) => {
  var f;
  let { resource: u2, identifier: l2 } = Y(e2), { liveProvider: m2 } = reactExports.useContext(mt), { liveMode: g, onLiveEvent: d } = reactExports.useContext(Qe), y = a ?? g, P = Ae(), C = p2 ?? (c == null ? void 0 : c.dataProviderName) ?? ((f = u2 == null ? void 0 : u2.meta) == null ? void 0 : f.dataProviderName);
  reactExports.useEffect(() => {
    let R, M = o((w) => {
      y === "auto" && P({ resource: l2, dataProviderName: C, invalidates: ["resourceAll"], invalidationFilters: { type: "active", refetchType: "active" }, invalidationOptions: { cancelRefetch: false } }), i == null || i(w), d == null || d(w);
    }, "callback");
    return y && y !== "off" && n2 && (R = m2 == null ? void 0 : m2.subscribe({ channel: r2, params: { resource: u2 == null ? void 0 : u2.name, ...t2 }, types: s, callback: M, dataProviderName: C, meta: { ...c, dataProviderName: C } })), () => {
      R && (m2 == null || m2.unsubscribe(R));
    };
  }, [n2]);
}, "useResourceSubscription");
var Zs = o((e2) => {
  let { liveMode: t2 } = reactExports.useContext(Qe);
  return e2 ?? t2;
}, "useLiveMode");
o(({ params: e2, channel: t2, types: r2 = ["*"], enabled: s = true, onLiveEvent: n2, dataProviderName: a = "default", meta: i }) => {
  let { liveProvider: p2 } = reactExports.useContext(mt);
  reactExports.useEffect(() => {
    let c;
    return s && (c = p2 == null ? void 0 : p2.subscribe({ channel: t2, params: e2, types: r2, callback: n2, dataProviderName: a, meta: { ...i, dataProviderName: a } })), () => {
      c && (p2 == null || p2.unsubscribe(c));
    };
  }, [s]);
}, "useSubscription");
var Ye = o(() => {
  let { liveProvider: e2 } = reactExports.useContext(mt);
  return e2 == null ? void 0 : e2.publish;
}, "usePublish");
var vo = reactExports.createContext({ notifications: [], notificationDispatch: () => false }), Qi = [], Vi = o((e2, t2) => {
  switch (t2.type) {
    case "ADD":
      return [...e2.filter((s) => !(isEqual(s.id, t2.payload.id) && s.resource === t2.payload.resource)), { ...t2.payload, isRunning: true }];
    case "REMOVE":
      return e2.filter((r2) => !(isEqual(r2.id, t2.payload.id) && r2.resource === t2.payload.resource));
    case "DECREASE_NOTIFICATION_SECOND":
      return e2.map((r2) => isEqual(r2.id, t2.payload.id) && r2.resource === t2.payload.resource ? { ...r2, seconds: t2.payload.seconds - 1e3 } : r2);
    default:
      return e2;
  }
}, "undoableQueueReducer"), Js = o(({ children: e2 }) => {
  let [t2, r2] = reactExports.useReducer(Vi, Qi), s = { notifications: t2, notificationDispatch: r2 };
  return React.createElement(vo.Provider, { value: s }, e2, typeof window < "u" ? t2.map((n2) => React.createElement(qs, { key: `${n2.id}-${n2.resource}-queue`, notification: n2 })) : null);
}, "UndoableQueueContextProvider");
var ut = o(() => {
  let { notifications: e2, notificationDispatch: t2 } = reactExports.useContext(vo);
  return { notifications: e2, notificationDispatch: t2 };
}, "useCancelNotification");
var qt = reactExports.createContext({}), en = o(({ open: e2, close: t2, children: r2 }) => React.createElement(qt.Provider, { value: { open: e2, close: t2 } }, r2), "NotificationContextProvider");
var $e = o(() => {
  let { open: e2, close: t2 } = reactExports.useContext(qt);
  return { open: e2, close: t2 };
}, "useNotification");
var Re = o(() => {
  let { open: e2 } = $e();
  return reactExports.useCallback((r2, s) => {
    r2 !== false && (r2 ? e2 == null || e2(r2) : s && (e2 == null || e2(s)));
  }, []);
}, "useHandleNotification");
var Xe = React.createContext({}), rn = o(({ children: e2, i18nProvider: t2 }) => React.createElement(Xe.Provider, { value: { i18nProvider: t2 } }, e2), "I18nContextProvider");
var Do = o(() => {
  let { i18nProvider: e2 } = reactExports.useContext(Xe);
  return reactExports.useCallback((t2) => e2 == null ? void 0 : e2.changeLocale(t2), []);
}, "useSetLocale");
var $ = o(() => {
  let { i18nProvider: e2 } = reactExports.useContext(Xe);
  return reactExports.useMemo(() => {
    function r2(s, n2, a) {
      return (e2 == null ? void 0 : e2.translate(s, n2, a)) ?? a ?? (typeof n2 == "string" && typeof a > "u" ? n2 : s);
    }
    return o(r2, "translate"), r2;
  }, [e2]);
}, "useTranslate");
var Uo = o(() => {
  let { i18nProvider: e2 } = reactExports.useContext(Xe);
  return reactExports.useCallback(() => e2 == null ? void 0 : e2.getLocale(), []);
}, "useGetLocale");
o(() => {
  let e2 = $(), t2 = Do(), r2 = Uo();
  return { translate: e2, changeLocale: t2, getLocale: r2 };
}, "useTranslation");
o(({ resourceName: e2, resource: t2, sorter: r2, sorters: s, filters: n2, maxItemCount: a, pageSize: i = 20, mapData: p2 = o((P) => P, "mapData"), exportOptions: c, unparseConfig: u2, meta: l2, metaData: m2, dataProviderName: g, onError: d, download: y } = {}) => {
  let [P, C] = reactExports.useState(false), f = fe(), R = ue(), { resource: M, resources: w, identifier: T } = Y(S(t2, e2)), x = `${Pt()(T, "plural")}-${(/* @__PURE__ */ new Date()).toLocaleString()}`, { getList: k2 } = f(ee(T, g, w)), F = R({ resource: M, meta: S(l2, m2) });
  return { isLoading: P, triggerExport: o(async () => {
    C(true);
    let V = [], U = 1, L = true;
    for (; L; ) try {
      let { data: Q, total: W } = await k2({ resource: (M == null ? void 0 : M.name) ?? "", filters: n2, sort: S(s, r2), sorters: S(s, r2), pagination: { current: U, pageSize: i, mode: "server" }, meta: F, metaData: F });
      U++, V.push(...Q), a && V.length >= a && (V = V.slice(0, a), L = false), W === V.length && (L = false);
    } catch (Q) {
      C(false), L = false, d == null || d(Q);
      return;
    }
    let B = typeof u2 < "u" && u2 !== null;
    Fu(B && typeof c < "u" && c !== null, `[useExport]: resource: "${T}" 

Both \`unparseConfig\` and \`exportOptions\` are set, \`unparseConfig\` will take precedence`);
    let h2 = { filename: x, useKeysAsHeaders: true, useBom: true, title: "My Generated Report", quoteStrings: '"', ...c };
    Fu((c == null ? void 0 : c.decimalSeparator) !== void 0, `[useExport]: resource: "${T}" 

Use of \`decimalSeparator\` no longer supported, please use \`mapData\` instead.

See https://refine.dev/docs/api-reference/core/hooks/import-export/useExport/`), B ? u2 = { quotes: true, ...u2 } : u2 = { columns: h2.useKeysAsHeaders ? void 0 : h2.headers, delimiter: h2.fieldSeparator, header: h2.showLabels || h2.useKeysAsHeaders, quoteChar: h2.quoteStrings, quotes: true };
    let I = yu.unparse(V.map(p2), u2);
    if (h2.showTitle && (I = `${h2.title}\r

${I}`), typeof window < "u" && I.length > 0 && (y ?? true)) {
      let Q = h2.useTextFile ? ".txt" : ".csv", W = `text/${h2.useTextFile ? "plain" : "csv"};charset=utf8;`, _ = `${(h2.filename ?? "download").replace(/ /g, "_")}${Q}`;
      eo(_, `${h2 != null && h2.useBom ? "\uFEFF" : ""}${I}`, W);
    }
    return C(false), I;
  }, "triggerExport") };
}, "useExport");
var ah = o((e2 = {}) => {
  var K, j, te, ae, D;
  let t2 = ue(), r2 = Ae(), { redirect: s } = At(), { mutationMode: n2 } = _e(), { setWarnWhen: a } = vt(), i = nn(), p2 = S(e2.meta, e2.metaData), c = e2.mutationMode ?? n2, { id: u2, setId: l2, resource: m2, identifier: g, formAction: d } = qe({ resource: e2.resource, id: e2.id, action: e2.action }), [y, P] = React.useState(false), C = d === "edit", f = d === "clone", R = d === "create", M = t2({ resource: m2, meta: p2 }), w = (C || f) && !!e2.resource, T = typeof e2.id < "u", b = ((K = e2.queryOptions) == null ? void 0 : K.enabled) === false;
  Fu(w && !T && !b, ru(d, g, u2));
  let x = Yr({ redirectFromProps: e2.redirect, action: d, redirectOptions: s }), k2 = o((E = C ? "list" : "edit", N = u2, G2 = {}) => {
    i({ redirect: E, resource: m2, id: N, meta: { ...p2, ...G2 } });
  }, "redirect"), F = Ot({ resource: g, id: u2, queryOptions: { enabled: !R && u2 !== void 0, ...e2.queryOptions }, liveMode: e2.liveMode, onLiveEvent: e2.onLiveEvent, liveParams: e2.liveParams, meta: { ...M, ...e2.queryMeta }, dataProviderName: e2.dataProviderName }), v = Xt({ mutationOptions: e2.createMutationOptions }), V = yo({ mutationOptions: e2.updateMutationOptions }), U = C ? V : v, B = U.isLoading || F.isFetching, { elapsedTime: h2 } = pe({ isLoading: B, interval: (j = e2.overtimeOptions) == null ? void 0 : j.interval, onInterval: (te = e2.overtimeOptions) == null ? void 0 : te.onInterval });
  React.useEffect(() => () => {
    var E;
    (E = e2.autoSave) != null && E.invalidateOnUnmount && y && g && typeof u2 < "u" && r2({ id: u2, invalidates: e2.invalidates || ["list", "many", "detail"], dataProviderName: e2.dataProviderName, resource: g });
  }, [(ae = e2.autoSave) == null ? void 0 : ae.invalidateOnUnmount, y]);
  let I = o(async (E, { isAutosave: N = false } = {}) => {
    let G2 = c === "pessimistic";
    a(false);
    let X = o((re) => k2(x, re), "onSuccessRedirect");
    return new Promise((re, z) => {
      if (!m2) return z(Ji);
      if (f && !u2) return z(qi);
      if (!E) return z(eu);
      if (N && !C) return z(tu);
      !G2 && !N && (Cr(() => X()), re());
      let H = { values: E, resource: g ?? m2.name, meta: { ...M, ...e2.mutationMeta }, metaData: { ...M, ...e2.mutationMeta }, dataProviderName: e2.dataProviderName, invalidates: N ? [] : e2.invalidates, successNotification: N ? false : e2.successNotification, errorNotification: N ? false : e2.errorNotification, ...C ? { id: u2 ?? "", mutationMode: c, undoableTimeout: e2.undoableTimeout, optimisticUpdateMap: e2.optimisticUpdateMap } : {} }, { mutateAsync: O } = C ? V : v;
      O(H, { onSuccess: e2.onMutationSuccess ? (oe, J, be) => {
        var ce;
        (ce = e2.onMutationSuccess) == null || ce.call(e2, oe, E, be, N);
      } : void 0, onError: e2.onMutationError ? (oe, J, be) => {
        var ce;
        (ce = e2.onMutationError) == null || ce.call(e2, oe, E, be, N);
      } : void 0 }).then((oe) => {
        G2 && !N && Cr(() => {
          var J;
          return X((J = oe == null ? void 0 : oe.data) == null ? void 0 : J.id);
        }), N && P(true), re(oe);
      }).catch(z);
    });
  }, "onFinish"), Q = to((E) => I(E, { isAutosave: true }), ((D = e2.autoSave) == null ? void 0 : D.debounce) || 1e3, "Cancelled by debounce"), W = { elapsedTime: h2 }, _ = { status: V.status, data: V.data, error: V.error };
  return { onFinish: I, onFinishAutoSave: Q, formLoading: B, mutationResult: U, mutation: U, queryResult: F, query: F, autoSaveProps: _, id: u2, setId: l2, redirect: k2, overtime: W };
}, "useForm"), Ji = new Error("[useForm]: `resource` is not defined or not matched but is required"), qi = new Error("[useForm]: `id` is not defined but is required in edit and clone actions"), eu = new Error("[useForm]: `values` is not provided but is required"), tu = new Error("[useForm]: `autoSave` is only allowed in edit action"), ru = o((e2, t2, r2) => `[useForm]: action: "${e2}", resource: "${t2}", id: ${r2}

If you don't use the \`setId\` method to set the \`id\`, you should pass the \`id\` prop to \`useForm\`. Otherwise, \`useForm\` will not be able to infer the \`id\` from the current URL with custom resource provided.

See https://refine.dev/docs/data/hooks/use-form/#id-`, "idWarningMessage");
var nn = o(() => {
  let { show: e2, edit: t2, list: r2, create: s } = Pe();
  return reactExports.useCallback(({ redirect: a, resource: i, id: p2, meta: c = {} }) => {
    if (a && i) return i.show && a === "show" && p2 ? e2(i, p2, void 0, c) : i.edit && a === "edit" && p2 ? t2(i, p2, void 0, c) : i.create && a === "create" ? s(i, void 0, c) : r2(i, "push", c);
  }, []);
}, "useRedirectionAfterSubmission");
var Eo = o(() => {
  let e2 = reactExports.useContext(ft);
  return React.useMemo(() => (e2 == null ? void 0 : e2.back) ?? (() => () => {
  }), [e2 == null ? void 0 : e2.back])();
}, "useBack");
var Ut = o(() => {
  let e2 = se(), { resource: t2, resources: r2 } = Y(), s = Te();
  return React.useCallback(({ resource: a, action: i, meta: p2 }) => {
    var g;
    let c = a || t2;
    if (!c) return;
    let l2 = (g = Se(c, r2, e2 === "legacy").find((d) => d.action === i)) == null ? void 0 : g.route;
    return l2 ? We(l2, c == null ? void 0 : c.meta, s, p2) : void 0;
  }, [r2, t2, s]);
}, "useGetToPath");
var Le = o(() => {
  let e2 = reactExports.useContext(ft), { select: t2 } = Y(), r2 = Ut(), n2 = React.useMemo(() => (e2 == null ? void 0 : e2.go) ?? (() => () => {
  }), [e2 == null ? void 0 : e2.go])();
  return reactExports.useCallback((i) => {
    if (typeof i.to != "object") return n2({ ...i, to: i.to });
    let { resource: p2 } = t2(i.to.resource);
    pu(i.to, p2);
    let c = r2({ resource: p2, action: i.to.action, meta: { id: i.to.id, ...i.to.meta } });
    return n2({ ...i, to: c });
  }, [t2, n2]);
}, "useGo"), pu = o((e2, t2) => {
  if (!(e2 != null && e2.action) || !(e2 != null && e2.resource)) throw new Error('[useGo]: "action" or "resource" is required.');
  if (["edit", "show", "clone"].includes(e2 == null ? void 0 : e2.action) && !e2.id) throw new Error(`[useGo]: [action: ${e2.action}] requires an "id" for resource [resource: ${e2.resource}]`);
  if (!t2[e2.action]) throw new Error(`[useGo]: [action: ${e2.action}] is not defined for [resource: ${e2.resource}]`);
}, "handleResourceErrors");
var Pe = o(() => {
  let { resources: e2 } = Y(), t2 = se(), { useHistory: r2 } = le(), s = r2(), n2 = Te(), a = Le(), i = Eo(), p2 = o((T, b = "push") => {
    t2 === "legacy" ? s[b](T) : a({ to: T, type: b });
  }, "handleUrl"), c = o((T, b = {}) => {
    var F;
    if (t2 === "legacy") {
      let v = typeof T == "string" ? Ee(T, e2, true) ?? { name: T, route: T } : T, V = Se(v, e2, true).find((U) => U.action === "create");
      return V ? We(V.route, v == null ? void 0 : v.meta, n2, b) : "";
    }
    let x = typeof T == "string" ? Ee(T, e2) ?? { name: T } : T, k2 = (F = Se(x, e2).find((v) => v.action === "create")) == null ? void 0 : F.route;
    return k2 ? a({ to: We(k2, x == null ? void 0 : x.meta, n2, b), type: "path" }) : "";
  }, "createUrl"), u2 = o((T, b, x = {}) => {
    var V;
    let k2 = encodeURIComponent(b);
    if (t2 === "legacy") {
      let U = typeof T == "string" ? Ee(T, e2, true) ?? { name: T, route: T } : T, L = Se(U, e2, true).find((B) => B.action === "edit");
      return L ? We(L.route, U == null ? void 0 : U.meta, n2, { ...x, id: k2 }) : "";
    }
    let F = typeof T == "string" ? Ee(T, e2) ?? { name: T } : T, v = (V = Se(F, e2).find((U) => U.action === "edit")) == null ? void 0 : V.route;
    return v ? a({ to: We(v, F == null ? void 0 : F.meta, n2, { ...x, id: k2 }), type: "path" }) : "";
  }, "editUrl"), l2 = o((T, b, x = {}) => {
    var V;
    let k2 = encodeURIComponent(b);
    if (t2 === "legacy") {
      let U = typeof T == "string" ? Ee(T, e2, true) ?? { name: T, route: T } : T, L = Se(U, e2, true).find((B) => B.action === "clone");
      return L ? We(L.route, U == null ? void 0 : U.meta, n2, { ...x, id: k2 }) : "";
    }
    let F = typeof T == "string" ? Ee(T, e2) ?? { name: T } : T, v = (V = Se(F, e2).find((U) => U.action === "clone")) == null ? void 0 : V.route;
    return v ? a({ to: We(v, F == null ? void 0 : F.meta, n2, { ...x, id: k2 }), type: "path" }) : "";
  }, "cloneUrl"), m2 = o((T, b, x = {}) => {
    var V;
    let k2 = encodeURIComponent(b);
    if (t2 === "legacy") {
      let U = typeof T == "string" ? Ee(T, e2, true) ?? { name: T, route: T } : T, L = Se(U, e2, true).find((B) => B.action === "show");
      return L ? We(L.route, U == null ? void 0 : U.meta, n2, { ...x, id: k2 }) : "";
    }
    let F = typeof T == "string" ? Ee(T, e2) ?? { name: T } : T, v = (V = Se(F, e2).find((U) => U.action === "show")) == null ? void 0 : V.route;
    return v ? a({ to: We(v, F == null ? void 0 : F.meta, n2, { ...x, id: k2 }), type: "path" }) : "";
  }, "showUrl"), g = o((T, b = {}) => {
    var F;
    if (t2 === "legacy") {
      let v = typeof T == "string" ? Ee(T, e2, true) ?? { name: T, route: T } : T, V = Se(v, e2, true).find((U) => U.action === "list");
      return V ? We(V.route, v == null ? void 0 : v.meta, n2, b) : "";
    }
    let x = typeof T == "string" ? Ee(T, e2) ?? { name: T } : T, k2 = (F = Se(x, e2).find((v) => v.action === "list")) == null ? void 0 : F.route;
    return k2 ? a({ to: We(k2, x == null ? void 0 : x.meta, n2, b), type: "path" }) : "";
  }, "listUrl");
  return { create: o((T, b = "push", x = {}) => {
    p2(c(T, x), b);
  }, "create"), createUrl: c, edit: o((T, b, x = "push", k2 = {}) => {
    p2(u2(T, b, k2), x);
  }, "edit"), editUrl: u2, clone: o((T, b, x = "push", k2 = {}) => {
    p2(l2(T, b, k2), x);
  }, "clone"), cloneUrl: l2, show: o((T, b, x = "push", k2 = {}) => {
    p2(m2(T, b, k2), x);
  }, "show"), showUrl: m2, list: o((T, b = "push", x = {}) => {
    p2(g(T, x), b);
  }, "list"), listUrl: g, push: o((T, ...b) => {
    t2 === "legacy" ? s.push(T, ...b) : a({ to: T, type: "push" });
  }, "push"), replace: o((T, ...b) => {
    t2 === "legacy" ? s.replace(T, ...b) : a({ to: T, type: "replace" });
  }, "replace"), goBack: o(() => {
    t2 === "legacy" ? s.goBack() : i();
  }, "goBack") };
}, "useNavigation");
o(({ resource: e2, id: t2, meta: r2, metaData: s, queryOptions: n2, overtimeOptions: a, ...i } = {}) => {
  let { resource: p2, identifier: c, id: u2, setId: l2 } = qe({ id: t2, resource: e2 }), g = ue()({ resource: p2, meta: S(r2, s) });
  Fu(!!e2 && !u2, lu(c, u2));
  let d = Ot({ resource: c, id: u2 ?? "", queryOptions: { enabled: u2 !== void 0, ...n2 }, meta: g, metaData: g, ...i }), { elapsedTime: y } = pe({ isLoading: d.isFetching, interval: a == null ? void 0 : a.interval, onInterval: a == null ? void 0 : a.onInterval });
  return { queryResult: d, query: d, showId: u2, setShowId: l2, overtime: { elapsedTime: y } };
}, "useShow");
var lu = o((e2, t2) => `[useShow]: resource: "${e2}", id: ${t2} 

If you don't use the \`setShowId\` method to set the \`showId\`, you should pass the \`id\` prop to \`useShow\`. Otherwise, \`useShow\` will not be able to infer the \`id\` from the current URL. 

See https://refine.dev/docs/data/hooks/use-show/#resource`, "idWarningMessage");
o(({ resourceName: e2, resource: t2, mapData: r2 = o((l2) => l2, "mapData"), paparseOptions: s, batchSize: n2 = Number.MAX_SAFE_INTEGER, onFinish: a, meta: i, metaData: p2, onProgress: c, dataProviderName: u2 } = {}) => {
  let [l2, m2] = reactExports.useState(0), [g, d] = reactExports.useState(0), [y, P] = reactExports.useState(false), { resource: C, identifier: f } = Y(t2 ?? e2), R = ue(), M = Ro(), w = Xt(), T = R({ resource: C, meta: S(i, p2) }), b;
  n2 === 1 ? b = w : b = M;
  let x = o(() => {
    d(0), m2(0), P(false);
  }, "handleCleanup"), k2 = o((v) => {
    let V = { succeeded: v.filter((U) => U.type === "success"), errored: v.filter((U) => U.type === "error") };
    a == null || a(V), P(false);
  }, "handleFinish");
  reactExports.useEffect(() => {
    c == null || c({ totalAmount: g, processedAmount: l2 });
  }, [g, l2]);
  let F = o(({ file: v }) => (x(), new Promise((V) => {
    P(true), yu.parse(v, { complete: async ({ data: U }) => {
      let L = or(U, r2);
      if (d(L.length), n2 === 1) {
        let B = L.map((I) => o(async () => ({ response: await w.mutateAsync({ resource: f ?? "", values: I, successNotification: false, errorNotification: false, dataProviderName: u2, meta: T, metaData: T }), value: I }), "fn")), h2 = await yr(B, ({ response: I, value: Q }) => (m2((W) => W + 1), { response: [I.data], type: "success", request: [Q] }), (I, Q) => ({ response: [I], type: "error", request: [L[Q]] }));
        V(h2);
      } else {
        let B = chunk(L, n2), h2 = B.map((Q) => o(async () => ({ response: await M.mutateAsync({ resource: f ?? "", values: Q, successNotification: false, errorNotification: false, dataProviderName: u2, meta: T, metaData: T }), value: Q, currentBatchLength: Q.length }), "fn")), I = await yr(h2, ({ response: Q, currentBatchLength: W, value: _ }) => (m2((K) => K + W), { response: Q.data, type: "success", request: _ }), (Q, W) => ({ response: [Q], type: "error", request: B[W] }));
        V(I);
      }
    }, ...s });
  }).then((V) => (k2(V), V))), "handleChange");
  return { inputProps: { type: "file", accept: ".csv", onChange: (v) => {
    v.target.files && v.target.files.length > 0 && F({ file: v.target.files[0] });
  } }, mutationResult: b, isLoading: y, handleChange: F };
}, "useImport");
var rR = o(({ defaultVisible: e2 = false } = {}) => {
  let [t2, r2] = reactExports.useState(e2), s = reactExports.useCallback(() => r2(true), [t2]), n2 = reactExports.useCallback(() => r2(false), [t2]);
  return { visible: t2, show: s, close: n2 };
}, "useModal");
o(({ resource: e2, action: t2, meta: r2, legacy: s }) => Ut()({ resource: e2, action: t2, meta: r2, legacy: s }), "useToPath");
var yt = o(() => {
  let e2 = reactExports.useContext(ft);
  return e2 != null && e2.Link ? e2.Link : o(({ to: r2, ...s }) => React.createElement("a", { href: r2, ...s }), "FallbackLink");
}, "useLink");
var gt = { useHistory: () => false, useLocation: () => false, useParams: () => ({}), Prompt: () => null, Link: () => null }, er = React.createContext(gt), cn = o(({ children: e2, useHistory: t2, useLocation: r2, useParams: s, Prompt: n2, Link: a, routes: i }) => React.createElement(er.Provider, { value: { useHistory: t2 ?? gt.useHistory, useLocation: r2 ?? gt.useLocation, useParams: s ?? gt.useParams, Prompt: n2 ?? gt.Prompt, Link: a ?? gt.Link, routes: i ?? gt.routes } }, e2), "LegacyRouterContextProvider");
var le = o(() => {
  let e2 = reactExports.useContext(er), { useHistory: t2, useLocation: r2, useParams: s, Prompt: n2, Link: a, routes: i } = e2 ?? gt;
  return { useHistory: t2, useLocation: r2, useParams: s, Prompt: n2, Link: a, routes: i };
}, "useRouterContext");
var ct = React.createContext({ options: { buttons: { enableAccessControl: true, hideIfUnauthorized: false } } }), dn = o(({ can: e2, children: t2, options: r2 }) => React.createElement(ct.Provider, { value: { can: e2, options: r2 ? { ...r2, buttons: { enableAccessControl: true, hideIfUnauthorized: false, ...r2.buttons } } : { buttons: { enableAccessControl: true, hideIfUnauthorized: false }, queryOptions: void 0 } } }, t2), "AccessControlContextProvider");
var kt = o((e2) => {
  if (!e2) return;
  let { icon: t2, list: r2, edit: s, create: n2, show: a, clone: i, children: p2, meta: c, options: u2, ...l2 } = e2, { icon: m2, ...g } = c ?? {}, { icon: d, ...y } = u2 ?? {};
  return { ...l2, ...c ? { meta: g } : {}, ...u2 ? { options: y } : {} };
}, "sanitizeResource");
var Ar = o(({ action: e2, resource: t2, params: r2, queryOptions: s }) => {
  let { can: n2, options: a } = reactExports.useContext(ct), { keys: i, preferLegacyKeys: p2 } = Z(), { queryOptions: c } = a || {}, u2 = { ...c, ...s }, { resource: l2, ...m2 } = r2 ?? {}, g = kt(l2), d = useQuery({ queryKey: i().access().resource(t2).action(e2).params({ params: { ...m2, resource: g }, enabled: u2 == null ? void 0 : u2.enabled }).get(p2), queryFn: () => (n2 == null ? void 0 : n2({ action: e2, resource: t2, params: { ...m2, resource: g } })) ?? Promise.resolve({ can: true }), enabled: typeof n2 < "u", ...u2, meta: { ...u2 == null ? void 0 : u2.meta, ...k$1() }, retry: false });
  return typeof n2 > "u" ? { data: { can: true } } : d;
}, "useCan");
o(() => {
  let { can: e2 } = React.useContext(ct);
  return { can: React.useMemo(() => e2 ? o(async ({ params: s, ...n2 }) => {
    let a = s != null && s.resource ? kt(s.resource) : void 0;
    return e2({ ...n2, ...s ? { params: { ...s, resource: a } } : {} });
  }, "canWithSanitizedResource") : void 0, [e2]) };
}, "useCanWithoutCache");
o((e2) => {
  let [t2, r2] = reactExports.useState([]), [s, n2] = reactExports.useState([]), [a, i] = reactExports.useState([]), { resource: p2, sort: c, sorters: u2, filters: l2 = [], optionLabel: m2 = "title", optionValue: g = "id", searchField: d = typeof m2 == "string" ? m2 : "title", debounce: y = 300, successNotification: P, errorNotification: C, defaultValueQueryOptions: f, queryOptions: R, fetchSize: M, pagination: w, hasPagination: T = false, liveMode: b, defaultValue: x = [], selectedOptionsOrder: k2 = "in-place", onLiveEvent: F, onSearch: v, liveParams: V, meta: U, metaData: L, dataProviderName: B, overtimeOptions: h2 } = e2, I = reactExports.useCallback((H) => typeof m2 == "string" ? get(H, m2) : m2(H), [m2]), Q = reactExports.useCallback((H) => typeof g == "string" ? get(H, g) : g(H), [g]), { resource: W, identifier: _ } = Y(p2), j = ue()({ resource: W, meta: S(U, L) }), te = Array.isArray(x) ? x : [x], ae = reactExports.useCallback((H) => {
    i(H.data.map((O) => ({ label: I(O), value: Q(O) })));
  }, [m2, g]), D = f ?? R, E = fo({ resource: _, ids: te, queryOptions: { ...D, enabled: te.length > 0 && ((D == null ? void 0 : D.enabled) ?? true), onSuccess: (H) => {
    var O;
    ae(H), (O = D == null ? void 0 : D.onSuccess) == null || O.call(D, H);
  } }, meta: j, metaData: j, liveMode: "off", dataProviderName: B }), N = reactExports.useCallback((H) => {
    n2(H.data.map((O) => ({ label: I(O), value: Q(O) })));
  }, [m2, g]), G2 = zt({ resource: _, sorters: S(u2, c), filters: l2.concat(t2), pagination: { current: w == null ? void 0 : w.current, pageSize: (w == null ? void 0 : w.pageSize) ?? M, mode: w == null ? void 0 : w.mode }, hasPagination: T, queryOptions: { ...R, onSuccess: (H) => {
    var O;
    N(H), (O = R == null ? void 0 : R.onSuccess) == null || O.call(R, H);
  } }, successNotification: P, errorNotification: C, meta: j, metaData: j, liveMode: b, liveParams: V, onLiveEvent: F, dataProviderName: B }), { elapsedTime: X } = pe({ isLoading: G2.isFetching || E.isFetching, interval: h2 == null ? void 0 : h2.interval, onInterval: h2 == null ? void 0 : h2.onInterval }), q2 = reactExports.useMemo(() => uniqBy(k2 === "in-place" ? [...s, ...a] : [...a, ...s], "value"), [s, a]), re = reactExports.useRef(v), z = reactExports.useMemo(() => debounce((H) => {
    if (re.current) {
      r2(re.current(H));
      return;
    }
    if (!H) {
      r2([]);
      return;
    }
    r2([{ field: d, operator: "contains", value: H }]);
  }, y), [d, y]);
  return reactExports.useEffect(() => {
    re.current = v;
  }, [v]), { queryResult: G2, defaultValueQueryResult: E, query: G2, defaultValueQuery: E, options: q2, onSearch: z, overtime: { elapsedTime: X } };
}, "useSelect");
var Tn = [], xn = [];
function lC({ initialCurrent: e2, initialPageSize: t2, hasPagination: r2 = true, pagination: s, initialSorter: n2, permanentSorter: a = xn, defaultSetFilterBehavior: i, initialFilter: p2, permanentFilter: c = Tn, filters: u2, sorters: l2, syncWithLocation: m2, resource: g, successNotification: d, errorNotification: y, queryOptions: P, liveMode: C, onLiveEvent: f, liveParams: R, meta: M, metaData: w, dataProviderName: T, overtimeOptions: b } = {}) {
  var Qo, Vo, No, Bo, Ko;
  let { syncWithLocation: x } = qr(), k2 = m2 ?? x, F = Zs(C), v = se(), { useLocation: V } = le(), { search: U, pathname: L } = V(), B = ue(), h2 = Te(), I = ((u2 == null ? void 0 : u2.mode) || "server") === "server", Q = ((l2 == null ? void 0 : l2.mode) || "server") === "server", W = r2 === false ? "off" : "server", _ = ((s == null ? void 0 : s.mode) ?? W) !== "off", K = S(s == null ? void 0 : s.current, e2), j = S(s == null ? void 0 : s.pageSize, t2), te = S(M, w), { parsedCurrent: ae, parsedPageSize: D, parsedSorter: E, parsedFilters: N } = br(U ?? "?"), G$1 = S(u2 == null ? void 0 : u2.initial, p2), X = S(u2 == null ? void 0 : u2.permanent, c) ?? Tn, q2 = S(l2 == null ? void 0 : l2.initial, n2), re = S(l2 == null ? void 0 : l2.permanent, a) ?? xn, z = S(u2 == null ? void 0 : u2.defaultBehavior, i) ?? "merge", H, O, oe, J;
  k2 ? (H = ((Qo = h2 == null ? void 0 : h2.params) == null ? void 0 : Qo.current) || ae || K || 1, O = ((Vo = h2 == null ? void 0 : h2.params) == null ? void 0 : Vo.pageSize) || D || j || 10, oe = ((No = h2 == null ? void 0 : h2.params) == null ? void 0 : No.sorters) || (E.length ? E : q2), J = ((Bo = h2 == null ? void 0 : h2.params) == null ? void 0 : Bo.filters) || (N.length ? N : G$1)) : (H = K || 1, O = j || 10, oe = q2, J = G$1);
  let { replace: be } = Pe(), ce = Le(), { resource: Ve, identifier: Ne } = Y(g), ne = B({ resource: Ve, meta: te });
  React.useEffect(() => {
    Fu(typeof Ne > "u", "useTable: `resource` is not defined.");
  }, [Ne]);
  let [ye, de] = reactExports.useState(Er(re, oe ?? [])), [ve, rt] = reactExports.useState(Ur(X, J ?? [])), [Ke, Ct] = reactExports.useState(H), [Ge, Tt] = reactExports.useState(O), xt = o(() => {
    if (v === "new") {
      let { sorters: Go, filters: vc, pageSize: Dc, current: Uc, ...Jn } = (h2 == null ? void 0 : h2.params) ?? {};
      return Jn;
    }
    let { sorter: Ie, filters: ot, pageSize: $r, current: zr, ...Or } = G.parse(U, { ignoreQueryPrefix: true });
    return Or;
  }, "getCurrentQueryParams"), bt = o(({ pagination: { current: Ie, pageSize: ot }, sorter: $r, filters: zr }) => {
    if (v === "new") return ce({ type: "path", options: { keepHash: true, keepQuery: true }, query: { ..._ ? { current: Ie, pageSize: ot } : {}, sorters: $r, filters: zr, ...xt() } }) ?? "";
    let Or = G.parse(U == null ? void 0 : U.substring(1)), Go = vr({ pagination: { pageSize: ot, current: Ie }, sorters: ye ?? $r, filters: zr, ...Or });
    return `${L ?? ""}?${Go ?? ""}`;
  }, "createLinkForSyncWithLocation");
  reactExports.useEffect(() => {
    U === "" && (Ct(H), Tt(O), de(Er(re, oe ?? [])), rt(Ur(X, J ?? [])));
  }, [U]), reactExports.useEffect(() => {
    if (k2) {
      let Ie = xt();
      if (v === "new") ce({ type: "replace", options: { keepQuery: true }, query: { ..._ ? { pageSize: Ge, current: Ke } : {}, sorters: differenceWith(ye, re, isEqual), filters: differenceWith(ve, X, isEqual) } });
      else {
        let ot = vr({ ..._ ? { pagination: { pageSize: Ge, current: Ke } } : {}, sorters: differenceWith(ye, re, isEqual), filters: differenceWith(ve, X, isEqual), ...Ie });
        return be == null ? void 0 : be(`${L}?${ot}`, void 0, { shallow: true });
      }
    }
  }, [k2, Ke, Ge, ye, ve]);
  let rr = zt({ resource: Ne, hasPagination: r2, pagination: { current: Ke, pageSize: Ge, mode: s == null ? void 0 : s.mode }, filters: I ? St(X, ve) : void 0, sorters: Q ? Dr(re, ye) : void 0, queryOptions: P, successNotification: d, errorNotification: y, meta: ne, metaData: ne, liveMode: F, liveParams: R, onLiveEvent: f, dataProviderName: T }), _n = o((Ie) => {
    rt((ot) => St(X, Ie, ot));
  }, "setFiltersAsMerge"), jn = o((Ie) => {
    rt(St(X, Ie));
  }, "setFiltersAsReplace"), Xn = o((Ie) => {
    rt((ot) => St(X, Ie(ot)));
  }, "setFiltersWithSetter"), Zn = o((Ie, ot = z) => {
    typeof Ie == "function" ? Xn(Ie) : ot === "replace" ? jn(Ie) : _n(Ie);
  }, "setFiltersFn"), Fo = o((Ie) => {
    de(() => Dr(re, Ie));
  }, "setSortWithUnion"), { elapsedTime: Yn } = pe({ isLoading: rr.isFetching, interval: b == null ? void 0 : b.interval, onInterval: b == null ? void 0 : b.onInterval });
  return { tableQueryResult: rr, tableQuery: rr, sorters: ye, setSorters: Fo, sorter: ye, setSorter: Fo, filters: ve, setFilters: Zn, current: Ke, setCurrent: Ct, pageSize: Ge, setPageSize: Tt, pageCount: Ge ? Math.ceil((((Ko = rr.data) == null ? void 0 : Ko.total) ?? 0) / Ge) : 1, createLinkForSyncWithLocation: bt, overtime: { elapsedTime: Yn } };
}
o(lC, "useTable");
var Et = React.createContext({}), hn = o(({ create: e2, get: t2, update: r2, children: s }) => React.createElement(Et.Provider, { value: { create: e2, get: t2, update: r2 } }, s), "AuditLogContextProvider");
var Je = o(({ logMutationOptions: e2, renameMutationOptions: t2 } = {}) => {
  let r2 = useQueryClient(), s = reactExports.useContext(Et), { keys: n2, preferLegacyKeys: a } = Z(), i = ie(), { resources: p2 } = reactExports.useContext(Rt), { data: c, refetch: u2, isLoading: l2 } = oo({ v3LegacyAuthProviderCompatible: !!(i != null && i.isLegacy), queryOptions: { enabled: !!(s != null && s.create) } }), m2 = useMutation(async (d) => {
    var f, R, M, w, T;
    let y = Ee(d.resource, p2), P = S((f = y == null ? void 0 : y.meta) == null ? void 0 : f.audit, (R = y == null ? void 0 : y.options) == null ? void 0 : R.audit, (w = (M = y == null ? void 0 : y.options) == null ? void 0 : M.auditLog) == null ? void 0 : w.permissions);
    if (P && !_r(P, d.action)) return;
    let C;
    return l2 && (s != null && s.create) && (C = await u2()), await ((T = s.create) == null ? void 0 : T.call(s, { ...d, author: c ?? (C == null ? void 0 : C.data) }));
  }, { mutationKey: n2().audit().action("log").get(), ...e2, meta: { ...e2 == null ? void 0 : e2.meta, ...k$1() } }), g = useMutation(async (d) => {
    var y;
    return await ((y = s.update) == null ? void 0 : y.call(s, d));
  }, { onSuccess: (d) => {
    d != null && d.resource && r2.invalidateQueries(n2().audit().resource((d == null ? void 0 : d.resource) ?? "").action("list").get(a));
  }, mutationKey: n2().audit().action("rename").get(), ...t2, meta: { ...t2 == null ? void 0 : t2.meta, ...k$1() } });
  return { log: m2, rename: g };
}, "useLog");
o(({ resource: e2, action: t2, meta: r2, author: s, metaData: n2, queryOptions: a }) => {
  let { get: i } = reactExports.useContext(Et), { keys: p2, preferLegacyKeys: c } = Z();
  return useQuery({ queryKey: p2().audit().resource(e2).action("list").params(r2).get(c), queryFn: () => (i == null ? void 0 : i({ resource: e2, action: t2, author: s, meta: r2, metaData: n2 })) ?? Promise.resolve([]), enabled: typeof i < "u", ...a, retry: false, meta: { ...a == null ? void 0 : a.meta, ...k$1() } });
}, "useLogList");
o(({ meta: e2 = {} } = {}) => {
  let t2 = se(), { i18nProvider: r2 } = reactExports.useContext(Xe), s = Te(), n2 = $(), { resources: a, resource: i, action: p2 } = Y(), { options: { textTransformers: c } } = ge(), u2 = [];
  if (!(i != null && i.name)) return { breadcrumbs: u2 };
  let l2 = o((m2) => {
    var d, y, P, C, f, R;
    let g = typeof m2 == "string" ? Ee(m2, a, t2 === "legacy") ?? { name: m2 } : m2;
    if (g) {
      let M = S((d = g == null ? void 0 : g.meta) == null ? void 0 : d.parent, g == null ? void 0 : g.parentName);
      M && l2(M);
      let w = Se(g, a, t2 === "legacy").find((x) => x.action === "list"), T = (y = w == null ? void 0 : w.resource) != null && y.list ? w == null ? void 0 : w.route : void 0, b = T ? t2 === "legacy" ? T : We(T, g == null ? void 0 : g.meta, s, e2) : void 0;
      u2.push({ label: S((P = g.meta) == null ? void 0 : P.label, (C = g.options) == null ? void 0 : C.label) ?? n2(`${g.name}.${g.name}`, c.humanize(g.name)), href: b, icon: S((f = g.meta) == null ? void 0 : f.icon, (R = g.options) == null ? void 0 : R.icon, g.icon) });
    }
  }, "addBreadcrumb");
  if (l2(i), p2 && p2 !== "list") {
    let m2 = `actions.${p2}`, g = n2(m2);
    typeof r2 < "u" && g === m2 ? (Fu(true, `[useBreadcrumb]: Breadcrumb missing translate key for the "${p2}" action. Please add "actions.${p2}" key to your translation file.
For more information, see https://refine.dev/docs/api-reference/core/hooks/useBreadcrumb/#i18n-support`), u2.push({ label: n2(`buttons.${p2}`, c.humanize(p2)) })) : u2.push({ label: n2(m2, c.humanize(p2)) });
  }
  return { breadcrumbs: u2 };
}, "useBreadcrumb");
var Ft = o((e2, t2, r2 = false) => {
  let s = [], n2 = Oe(e2, t2);
  for (; n2; ) s.push(n2), n2 = Oe(n2, t2);
  return s.reverse(), `/${[...s, e2].map((i) => ke((r2 ? i.route : void 0) ?? i.identifier ?? i.name)).join("/").replace(/^\//, "")}`;
}, "createResourceKey");
var vn = o((e2, t2 = false) => {
  let r2 = { item: { name: "__root__" }, children: {} };
  e2.forEach((n2) => {
    let a = [], i = Oe(n2, e2);
    for (; i; ) a.push(i), i = Oe(i, e2);
    a.reverse();
    let p2 = r2;
    a.forEach((u2) => {
      let l2 = (t2 ? u2.route : void 0) ?? u2.identifier ?? u2.name;
      p2.children[l2] || (p2.children[l2] = { item: u2, children: {} }), p2 = p2.children[l2];
    });
    let c = (t2 ? n2.route : void 0) ?? n2.identifier ?? n2.name;
    p2.children[c] || (p2.children[c] = { item: n2, children: {} });
  });
  let s = o((n2) => {
    let a = [];
    return Object.keys(n2.children).forEach((i) => {
      let p2 = Ft(n2.children[i].item, e2, t2), c = { ...n2.children[i].item, key: p2, children: s(n2.children[i]) };
      a.push(c);
    }), a;
  }, "flatten");
  return s(r2);
}, "createTree");
var Dn = o((e2) => e2.split("?")[0].split("#")[0].replace(/(.+)(\/$)/, "$1"), "getCleanPath");
o(({ meta: e2, hideOnMissingParameter: t2 = true } = { hideOnMissingParameter: true }) => {
  let r2 = $(), s = Ut(), n2 = se(), { resource: a, resources: i } = Y(), { pathname: p2 } = Te(), { useLocation: c } = le(), { pathname: u2 } = c(), l2 = Pt(), g = `/${((n2 === "legacy" ? Dn(u2) : p2 ? Dn(p2) : void 0) ?? "").replace(/^\//, "")}`, d = a ? Ft(a, i, n2 === "legacy") : g ?? "", y = React.useMemo(() => {
    if (!a) return [];
    let f = Oe(a, i), R = [Ft(a, i)];
    for (; f; ) R.push(Ft(f, i)), f = Oe(f, i);
    return R;
  }, []), P = React.useCallback((f) => {
    var M, w, T, b, x, k2;
    if ((((M = f == null ? void 0 : f.meta) == null ? void 0 : M.hide) ?? ((w = f == null ? void 0 : f.options) == null ? void 0 : w.hide)) || !(f != null && f.list) && f.children.length === 0) return;
    let R = f.list ? s({ resource: f, action: "list", legacy: n2 === "legacy", meta: e2 }) : void 0;
    if (!(t2 && R && R.match(/(\/|^):(.+?)(\/|$){1}/))) return { ...f, route: R, icon: S((T = f.meta) == null ? void 0 : T.icon, (b = f.options) == null ? void 0 : b.icon, f.icon), label: S((x = f == null ? void 0 : f.meta) == null ? void 0 : x.label, (k2 = f == null ? void 0 : f.options) == null ? void 0 : k2.label) ?? r2(`${f.name}.${f.name}`, l2(f.name, "plural")) };
  }, [n2, e2, s, r2, t2]), C = React.useMemo(() => {
    let f = vn(i, n2 === "legacy"), R = o((M) => M.flatMap((w) => {
      let T = R(w.children), b = P({ ...w, children: T });
      return b ? [b] : [];
    }), "prepare");
    return R(f);
  }, [i, n2, P]);
  return { defaultOpenKeys: y, selectedKey: d, menuItems: C };
}, "useMenu");
var ue = o(() => {
  let { params: e2 } = Te();
  return o(({ resource: r2, meta: s } = {}) => {
    let { meta: n2 } = kt(r2) ?? { meta: {} }, { filters: a, sorters: i, current: p2, pageSize: c, ...u2 } = e2 ?? {};
    return { ...n2, ...u2, ...s };
  }, "getMetaFn");
}, "useMeta");
var At = o(() => {
  let { options: e2 } = React.useContext(Qe);
  return e2;
}, "useRefineOptions");
var Un = o((e2) => {
  let t2 = se(), { useParams: r2 } = le(), s = Te(), n2 = r2(), a = t2 === "legacy" ? n2.id : s.id;
  return e2 ?? a;
}, "useId");
var En = o((e2) => {
  let t2 = se(), { useParams: r2 } = le(), s = Te(), n2 = r2(), a = t2 === "legacy" ? n2.action : s.action;
  return e2 ?? a;
}, "useAction");
function qe(e2) {
  let { select: t2, identifier: r2 } = Y(), s = (e2 == null ? void 0 : e2.resource) ?? r2, { identifier: n2 = void 0, resource: a = void 0 } = s ? t2(s, true) : {}, i = r2 === n2, p2 = Un(), c = En(e2 == null ? void 0 : e2.action), u2 = React.useMemo(() => i ? (e2 == null ? void 0 : e2.id) ?? p2 : e2 == null ? void 0 : e2.id, [i, e2 == null ? void 0 : e2.id, p2]), [l2, m2] = React.useState(u2);
  React.useMemo(() => m2(u2), [u2]);
  let g = React.useMemo(() => !i && !(e2 != null && e2.action) ? "create" : c === "edit" || c === "clone" ? c : "create", [c, i, e2 == null ? void 0 : e2.action]);
  return { id: l2, setId: m2, resource: a, action: c, identifier: n2, formAction: g };
}
o(qe, "useResourceParams");
function Br({ type: e2 }) {
  let t2 = $(), { textTransformers: { humanize: r2 } } = At(), s = `buttons.${e2}`, n2 = r2(e2);
  return { label: t2(s, n2) };
}
o(Br, "useActionableButton");
var Kr = o((e2) => {
  var u2, l2, m2;
  let t2 = $(), r2 = React.useContext(ct), s = ((u2 = e2.accessControl) == null ? void 0 : u2.enabled) ?? r2.options.buttons.enableAccessControl, n2 = ((l2 = e2.accessControl) == null ? void 0 : l2.hideIfUnauthorized) ?? r2.options.buttons.hideIfUnauthorized, { data: a } = Ar({ resource: (m2 = e2.resource) == null ? void 0 : m2.name, action: e2.action === "clone" ? "create" : e2.action, params: { id: e2.id, resource: e2.resource }, queryOptions: { enabled: s } }), i = React.useMemo(() => a != null && a.can ? "" : a != null && a.reason ? a.reason : t2("buttons.notAccessTitle", "You don't have permission to access"), [a == null ? void 0 : a.can, a == null ? void 0 : a.reason, t2]), p2 = s && n2 && !(a != null && a.can), c = (a == null ? void 0 : a.can) === false;
  return { title: i, hidden: p2, disabled: c, canAccess: a };
}, "useButtonCanAccess");
function Qt(e2) {
  var R;
  let t2 = Pe(), r2 = se(), s = yt(), { Link: n2 } = le(), a = $(), i = Pt(), { textTransformers: { humanize: p2 } } = At(), { id: c, resource: u2, identifier: l2 } = qe({ resource: e2.resource, id: e2.action === "create" ? void 0 : e2.id }), { canAccess: m2, title: g, hidden: d, disabled: y } = Kr({ action: e2.action, accessControl: e2.accessControl, id: c, resource: u2 }), P = r2 === "legacy" ? n2 : s, C = React.useMemo(() => {
    if (!u2) return "";
    switch (e2.action) {
      case "create":
      case "list":
        return t2[`${e2.action}Url`](u2, e2.meta);
      default:
        return c ? t2[`${e2.action}Url`](u2, c, e2.meta) : "";
    }
  }, [u2, c, e2.meta, t2[`${e2.action}Url`]]), f = e2.action === "list" ? a(`${l2 ?? e2.resource}.titles.list`, i(((R = u2 == null ? void 0 : u2.meta) == null ? void 0 : R.label) ?? (u2 == null ? void 0 : u2.label) ?? l2 ?? e2.resource, "plural")) : a(`buttons.${e2.action}`, p2(e2.action));
  return { to: C, label: f, title: g, disabled: y, hidden: d, canAccess: m2, LinkComponent: P };
}
o(Qt, "useNavigationButton");
function Bu(e2) {
  let t2 = $(), { mutate: r2, isLoading: s, variables: n2 } = xo(), { setWarnWhen: a } = vt(), { mutationMode: i } = _e(e2.mutationMode), { id: p2, resource: c, identifier: u2 } = qe({ resource: e2.resource, id: e2.id }), { title: l2, disabled: m2, hidden: g, canAccess: d } = Kr({ action: "delete", accessControl: e2.accessControl, id: p2, resource: c }), y = t2("buttons.delete", "Delete"), P = t2("buttons.delete", "Delete"), C = t2("buttons.confirm", "Are you sure?"), f = t2("buttons.cancel", "Cancel"), R = p2 === (n2 == null ? void 0 : n2.id) && s;
  return { label: y, title: l2, hidden: g, disabled: m2, canAccess: d, loading: R, confirmOkLabel: P, cancelLabel: f, confirmTitle: C, onConfirm: o(() => {
    p2 && u2 && (a(false), r2({ id: p2, resource: u2, mutationMode: i, successNotification: e2.successNotification, errorNotification: e2.errorNotification, meta: e2.meta, metaData: e2.meta, dataProviderName: e2.dataProviderName, invalidates: e2.invalidates }, { onSuccess: e2.onSuccess }));
  }, "onConfirm") };
}
o(Bu, "useDeleteButton");
function Gu(e2) {
  let t2 = $(), { keys: r2, preferLegacyKeys: s } = Z(), n2 = useQueryClient(), a = Ae(), { identifier: i, id: p2 } = qe({ resource: e2.resource, id: e2.id }), { resources: c } = Y(), u2 = !!n2.isFetching({ queryKey: r2().data(ee(i, e2.dataProviderName, c)).resource(i).action("one").get(s) }), l2 = o(() => {
    a({ id: p2, invalidates: ["detail"], dataProviderName: e2.dataProviderName, resource: i });
  }, "onClick"), m2 = t2("buttons.refresh", "Refresh");
  return { onClick: l2, label: m2, loading: u2 };
}
o(Gu, "useRefreshButton");
o((e2) => Qt({ ...e2, action: "show" }), "useShowButton");
o((e2) => Qt({ ...e2, action: "edit" }), "useEditButton");
o((e2) => Qt({ ...e2, action: "clone" }), "useCloneButton");
o((e2) => Qt({ ...e2, action: "create" }), "useCreateButton");
o((e2) => Qt({ ...e2, action: "list" }), "useListButton");
o(() => Br({ type: "save" }), "useSaveButton");
o(() => Br({ type: "export" }), "useExportButton");
o(() => Br({ type: "import" }), "useImportButton");
o(() => {
  let [e2, t2] = reactExports.useState(), r2 = $(), { push: s } = Pe(), n2 = Le(), a = se(), { resource: i, action: p2 } = Y();
  return reactExports.useEffect(() => {
    i && p2 && t2(r2("pages.error.info", { action: p2, resource: i.name }, `You may have forgotten to add the "${p2}" component to "${i.name}" resource.`));
  }, [i, p2]), React.createElement(React.Fragment, null, React.createElement("h1", null, r2("pages.error.404", void 0, "Sorry, the page you visited does not exist.")), e2 && React.createElement("p", null, e2), React.createElement("button", { onClick: () => {
    a === "legacy" ? s("/") : n2({ to: "/" });
  } }, r2("pages.error.backHome", void 0, "Back Home")));
}, "ErrorComponent");
var Xr = o(() => {
  let [e2, t2] = reactExports.useState(""), [r2, s] = reactExports.useState(""), n2 = $(), a = ie(), { mutate: i } = $t({ v3LegacyAuthProviderCompatible: !!(a != null && a.isLegacy) });
  return React.createElement(React.Fragment, null, React.createElement("h1", null, n2("pages.login.title", "Sign in your account")), React.createElement("form", { onSubmit: (p2) => {
    p2.preventDefault(), i({ username: e2, password: r2 });
  } }, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, n2("pages.login.username", void 0, "username"), ":"), React.createElement("td", null, React.createElement("input", { type: "text", size: 20, autoCorrect: "off", spellCheck: false, autoCapitalize: "off", autoFocus: true, required: true, value: e2, onChange: (p2) => t2(p2.target.value) }))), React.createElement("tr", null, React.createElement("td", null, n2("pages.login.password", void 0, "password"), ":"), React.createElement("td", null, React.createElement("input", { type: "password", required: true, size: 20, value: r2, onChange: (p2) => s(p2.target.value) }))))), React.createElement("br", null), React.createElement("input", { type: "submit", value: "login" })));
}, "LoginPage");
var wn = o(({ providers: e2, registerLink: t2, forgotPasswordLink: r2, rememberMe: s, contentProps: n2, wrapperProps: a, renderContent: i, formProps: p2, title: c = void 0, hideForm: u2 }) => {
  let l2 = se(), m2 = yt(), { Link: g } = le(), d = l2 === "legacy" ? g : m2, [y, P] = reactExports.useState(""), [C, f] = reactExports.useState(""), [R, M] = reactExports.useState(false), w = $(), T = ie(), { mutate: b } = $t({ v3LegacyAuthProviderCompatible: !!(T != null && T.isLegacy) }), x = o((v, V) => React.createElement(d, { to: v }, V), "renderLink"), k2 = o(() => e2 ? e2.map((v) => React.createElement("div", { key: v.name, style: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" } }, React.createElement("button", { onClick: () => b({ providerName: v.name }), style: { display: "flex", alignItems: "center" } }, v == null ? void 0 : v.icon, v.label ?? React.createElement("label", null, v.label)))) : null, "renderProviders"), F = React.createElement("div", { ...n2 }, React.createElement("h1", { style: { textAlign: "center" } }, w("pages.login.title", "Sign in to your account")), k2(), !u2 && React.createElement(React.Fragment, null, React.createElement("hr", null), React.createElement("form", { onSubmit: (v) => {
    v.preventDefault(), b({ email: y, password: C, remember: R });
  }, ...p2 }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "email-input" }, w("pages.login.fields.email", "Email")), React.createElement("input", { id: "email-input", name: "email", type: "text", size: 20, autoCorrect: "off", spellCheck: false, autoCapitalize: "off", required: true, value: y, onChange: (v) => P(v.target.value) }), React.createElement("label", { htmlFor: "password-input" }, w("pages.login.fields.password", "Password")), React.createElement("input", { id: "password-input", type: "password", name: "password", required: true, size: 20, value: C, onChange: (v) => f(v.target.value) }), s ?? React.createElement(React.Fragment, null, React.createElement("label", { htmlFor: "remember-me-input" }, w("pages.login.buttons.rememberMe", "Remember me"), React.createElement("input", { id: "remember-me-input", name: "remember", type: "checkbox", size: 20, checked: R, value: R.toString(), onChange: () => {
    M(!R);
  } }))), React.createElement("br", null), r2 ?? x("/forgot-password", w("pages.login.buttons.forgotPassword", "Forgot password?")), React.createElement("input", { type: "submit", value: w("pages.login.signin", "Sign in") }), t2 ?? React.createElement("span", null, w("pages.login.buttons.noAccount", "Don’t have an account?"), " ", x("/register", w("pages.login.register", "Sign up")))))), t2 !== false && u2 && React.createElement("div", { style: { textAlign: "center" } }, w("pages.login.buttons.noAccount", "Don’t have an account?"), " ", x("/register", w("pages.login.register", "Sign up"))));
  return React.createElement("div", { ...a }, i ? i(F, c) : F);
}, "LoginPage");
var Sn = o(({ providers: e2, loginLink: t2, wrapperProps: r2, contentProps: s, renderContent: n2, formProps: a, title: i = void 0, hideForm: p2 }) => {
  let c = se(), u2 = yt(), { Link: l2 } = le(), m2 = c === "legacy" ? l2 : u2, [g, d] = reactExports.useState(""), [y, P] = reactExports.useState(""), C = $(), f = ie(), { mutate: R, isLoading: M } = io({ v3LegacyAuthProviderCompatible: !!(f != null && f.isLegacy) }), w = o((x, k2) => React.createElement(m2, { to: x }, k2), "renderLink"), T = o(() => e2 ? e2.map((x) => React.createElement("div", { key: x.name, style: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" } }, React.createElement("button", { onClick: () => R({ providerName: x.name }), style: { display: "flex", alignItems: "center" } }, x == null ? void 0 : x.icon, x.label ?? React.createElement("label", null, x.label)))) : null, "renderProviders"), b = React.createElement("div", { ...s }, React.createElement("h1", { style: { textAlign: "center" } }, C("pages.register.title", "Sign up for your account")), T(), !p2 && React.createElement(React.Fragment, null, React.createElement("hr", null), React.createElement("form", { onSubmit: (x) => {
    x.preventDefault(), R({ email: g, password: y });
  }, ...a }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "email-input" }, C("pages.register.fields.email", "Email")), React.createElement("input", { id: "email-input", name: "email", type: "email", size: 20, autoCorrect: "off", spellCheck: false, autoCapitalize: "off", required: true, value: g, onChange: (x) => d(x.target.value) }), React.createElement("label", { htmlFor: "password-input" }, C("pages.register.fields.password", "Password")), React.createElement("input", { id: "password-input", name: "password", type: "password", required: true, size: 20, value: y, onChange: (x) => P(x.target.value) }), React.createElement("input", { type: "submit", value: C("pages.register.buttons.submit", "Sign up"), disabled: M }), t2 ?? React.createElement(React.Fragment, null, React.createElement("span", null, C("pages.login.buttons.haveAccount", "Have an account?"), " ", w("/login", C("pages.login.signin", "Sign in"))))))), t2 !== false && p2 && React.createElement("div", { style: { textAlign: "center" } }, C("pages.login.buttons.haveAccount", "Have an account?"), " ", w("/login", C("pages.login.signin", "Sign in"))));
  return React.createElement("div", { ...r2 }, n2 ? n2(b, i) : b);
}, "RegisterPage");
var An = o(({ loginLink: e2, wrapperProps: t2, contentProps: r2, renderContent: s, formProps: n2, title: a = void 0 }) => {
  let i = $(), p2 = se(), c = yt(), { Link: u2 } = le(), l2 = p2 === "legacy" ? u2 : c, [m2, g] = reactExports.useState(""), { mutate: d, isLoading: y } = co(), P = o((f, R) => React.createElement(l2, { to: f }, R), "renderLink"), C = React.createElement("div", { ...r2 }, React.createElement("h1", { style: { textAlign: "center" } }, i("pages.forgotPassword.title", "Forgot your password?")), React.createElement("hr", null), React.createElement("form", { onSubmit: (f) => {
    f.preventDefault(), d({ email: m2 });
  }, ...n2 }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "email-input" }, i("pages.forgotPassword.fields.email", "Email")), React.createElement("input", { id: "email-input", name: "email", type: "mail", autoCorrect: "off", spellCheck: false, autoCapitalize: "off", required: true, value: m2, onChange: (f) => g(f.target.value) }), React.createElement("input", { type: "submit", disabled: y, value: i("pages.forgotPassword.buttons.submit", "Send reset instructions") }), React.createElement("br", null), e2 ?? React.createElement("span", null, i("pages.register.buttons.haveAccount", "Have an account? "), " ", P("/login", i("pages.login.signin", "Sign in"))))));
  return React.createElement("div", { ...t2 }, s ? s(C, a) : C);
}, "ForgotPasswordPage");
var Fn = o(({ wrapperProps: e2, contentProps: t2, renderContent: r2, formProps: s, title: n2 = void 0 }) => {
  let a = $(), i = ie(), { mutate: p2, isLoading: c } = lo({ v3LegacyAuthProviderCompatible: !!(i != null && i.isLegacy) }), [u2, l2] = reactExports.useState(""), [m2, g] = reactExports.useState(""), d = React.createElement("div", { ...t2 }, React.createElement("h1", { style: { textAlign: "center" } }, a("pages.updatePassword.title", "Update Password")), React.createElement("hr", null), React.createElement("form", { onSubmit: (y) => {
    y.preventDefault(), p2({ password: u2, confirmPassword: m2 });
  }, ...s }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "password-input" }, a("pages.updatePassword.fields.password", "New Password")), React.createElement("input", { id: "password-input", name: "password", type: "password", required: true, size: 20, value: u2, onChange: (y) => l2(y.target.value) }), React.createElement("label", { htmlFor: "confirm-password-input" }, a("pages.updatePassword.fields.confirmPassword", "Confirm New Password")), React.createElement("input", { id: "confirm-password-input", name: "confirmPassword", type: "password", required: true, size: 20, value: m2, onChange: (y) => g(y.target.value) }), React.createElement("input", { type: "submit", disabled: c, value: a("pages.updatePassword.buttons.submit", "Update") }))));
  return React.createElement("div", { ...e2 }, r2 ? r2(d, n2) : d);
}, "UpdatePasswordPage");
o((e2) => {
  let { type: t2 } = e2;
  return React.createElement(React.Fragment, null, o(() => {
    switch (t2) {
      case "register":
        return React.createElement(Sn, { ...e2 });
      case "forgotPassword":
        return React.createElement(An, { ...e2 });
      case "updatePassword":
        return React.createElement(Fn, { ...e2 });
      default:
        return React.createElement(wn, { ...e2 });
    }
  }, "renderView")());
}, "AuthPage");
var So = o(() => React.createElement(React.Fragment, null, React.createElement("h1", null, "Welcome on board"), React.createElement("p", null, "Your configuration is completed."), React.createElement("p", null, "Now you can get started by adding your resources to the", " ", React.createElement("code", null, "`resources`"), " property of ", React.createElement("code", null, "`<Refine>`")), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement("a", { href: "https://refine.dev", target: "_blank", rel: "noreferrer" }, React.createElement("button", null, "Documentation")), React.createElement("a", { href: "https://refine.dev/examples", target: "_blank", rel: "noreferrer" }, React.createElement("button", null, "Examples")), React.createElement("a", { href: "https://discord.gg/refine", target: "_blank", rel: "noreferrer" }, React.createElement("button", null, "Community")))), "ReadyPage");
var ju = [{ title: "Documentation", description: "Learn about the technical details of using Refine in your projects.", link: "https://refine.dev/docs", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/book.svg" }, { title: "Tutorial", description: "Learn how to use Refine by building a fully-functioning CRUD app, from scratch to full launch.", link: "https://refine.dev/tutorial", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/hat.svg" }, { title: "Templates", description: "Explore a range of pre-built templates, perfect everything from admin panels to dashboards and CRMs.", link: "https://refine.dev/templates", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/application.svg" }, { title: "Community", description: "Join our Discord community and keep up with the latest news.", link: "https://discord.gg/refine", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/discord.svg" }], Qn = o(() => {
  let e2 = Pr("(max-width: 1010px)"), t2 = Pr("(max-width: 650px)"), r2 = o(() => t2 ? "1, 280px" : e2 ? "2, 280px" : "4, 1fr", "getGridTemplateColumns"), s = o(() => t2 ? "32px" : e2 ? "40px" : "48px", "getHeaderFontSize"), n2 = o(() => t2 ? "16px" : e2 ? "20px" : "24px", "getSubHeaderFontSize");
  return React.createElement("div", { style: { position: "fixed", zIndex: 10, inset: 0, overflow: "auto", width: "100dvw", height: "100dvh" } }, React.createElement("div", { style: { overflow: "hidden", position: "relative", backgroundSize: "cover", backgroundRepeat: "no-repeat", background: t2 ? "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(88.89% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(88.89% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30" : e2 ? "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(66.67% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(66.67% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30" : "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(35.56% 50% at 50% 100%, rgba(38, 217, 127, 0.12) 0%, rgba(38, 217, 127, 0) 100%), radial-gradient(35.56% 50% at 50% 0%, rgba(71, 235, 235, 0.18) 0%, rgba(71, 235, 235, 0) 100%), #1D1E30", minHeight: "100%", minWidth: "100%", fontFamily: "Arial", color: "#FFFFFF" } }, React.createElement("div", { style: { zIndex: 2, position: "absolute", width: t2 ? "400px" : "800px", height: "552px", opacity: "0.5", background: "url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/welcome-page-hexagon.png)", backgroundRepeat: "no-repeat", backgroundSize: "contain", top: "0", left: "50%", transform: "translateX(-50%)" } }), React.createElement("div", { style: { height: t2 ? "40px" : "80px" } }), React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, React.createElement("div", { style: { backgroundRepeat: "no-repeat", backgroundSize: t2 ? "112px 58px" : "224px 116px", backgroundImage: "url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/refine-logo.svg)", width: t2 ? 112 : 224, height: t2 ? 58 : 116 } })), React.createElement("div", { style: { height: t2 ? "120px" : e2 ? "200px" : "30vh", minHeight: t2 ? "120px" : "200px" } }), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" } }, React.createElement("h1", { style: { fontSize: s(), fontWeight: 700, margin: "0px" } }, "Welcome Aboard!"), React.createElement("h4", { style: { fontSize: n2(), fontWeight: 400, margin: "0px" } }, "Your configuration is completed.")), React.createElement("div", { style: { height: "64px" } }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${r2()})`, justifyContent: "center", gap: "48px", paddingRight: "16px", paddingLeft: "16px", paddingBottom: "32px", maxWidth: "976px", margin: "auto" } }, ju.map((a) => React.createElement(Xu, { key: `welcome-page-${a.title}`, card: a })))));
}, "ConfigSuccessPage"), Xu = o(({ card: e2 }) => {
  let { title: t2, description: r2, iconUrl: s, link: n2 } = e2, [a, i] = reactExports.useState(false);
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center" } }, React.createElement("a", { onPointerEnter: () => i(true), onPointerLeave: () => i(false), style: { display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" }, href: n2 }, React.createElement("div", { style: { width: "16px", height: "16px", backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundImage: `url(${s})` } }), React.createElement("span", { style: { fontSize: "16px", fontWeight: 700, marginLeft: "13px", marginRight: "14px" } }, t2), React.createElement("svg", { style: { transition: "transform 0.5s ease-in-out, opacity 0.2s ease-in-out", ...a && { transform: "translateX(4px)", opacity: 1 } }, width: "12", height: "8", fill: "none", opacity: "0.5", xmlns: "http://www.w3.org/2000/svg" }, React.createElement("path", { d: "M7.293.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.586 5H1a1 1 0 0 1 0-2h7.586L7.293 1.707a1 1 0 0 1 0-1.414Z", fill: "#fff" })))), React.createElement("span", { style: { fontSize: "12px", opacity: 0.5, lineHeight: "16px" } }, r2));
}, "Card");
var Vn = o(() => React.createElement("div", { style: { position: "fixed", zIndex: 11, inset: 0, overflow: "auto", width: "100dvw", height: "100dvh" } }, React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px", background: "#14141FBF", backdropFilter: "blur(3px)" } }, React.createElement("div", { style: { maxWidth: "640px", width: "100%", background: "#1D1E30", borderRadius: "16px", border: "1px solid #303450", boxShadow: "0px 0px 120px -24px #000000" } }, React.createElement("div", { style: { padding: "16px 20px", borderBottom: "1px solid #303450", display: "flex", alignItems: "center", gap: "8px", position: "relative" } }, React.createElement(Yu, { style: { position: "absolute", left: 0, top: 0 } }), React.createElement("div", { style: { lineHeight: "24px", fontSize: "16px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "16px" } }, React.createElement(Ju, null), React.createElement("span", { style: { fontWeight: 400 } }, "Configuration Error"))), React.createElement("div", { style: { padding: "20px", color: "#A3ADC2", lineHeight: "20px", fontSize: "14px", display: "flex", flexDirection: "column", gap: "20px" } }, React.createElement("p", { style: { margin: 0, padding: 0, lineHeight: "28px", fontSize: "16px" } }, React.createElement("code", { style: { display: "inline-block", background: "#30345080", padding: "0 4px", lineHeight: "24px", fontSize: "16px", borderRadius: "4px", color: "#FFFFFF" } }, "<Refine />"), " ", "is not initialized. Please make sure you have it mounted in your app and placed your components inside it."), React.createElement("div", null, React.createElement(Zu, null)))))), "ConfigErrorPage"), Zu = o(() => React.createElement("pre", { style: { display: "block", overflowX: "auto", borderRadius: "8px", fontSize: "14px", lineHeight: "24px", backgroundColor: "#14141F", color: "#E5ECF2", padding: "16px", margin: "0", maxHeight: "400px", overflow: "auto" } }, React.createElement("span", { style: { color: "#FF7B72" } }, "import"), " ", "{", " Refine, WelcomePage", " ", "}", " ", React.createElement("span", { style: { color: "#FF7B72" } }, "from"), " ", React.createElement("span", { style: { color: "#A5D6FF" } }, '"@refinedev/core"'), ";", `
`, `
`, React.createElement("span", { style: { color: "#FF7B72" } }, "export"), " ", React.createElement("span", { style: { color: "#FF7B72" } }, "default"), " ", React.createElement("span", null, React.createElement("span", { style: { color: "#FF7B72" } }, "function"), " ", React.createElement("span", { style: { color: "#FFA657" } }, "App"), "(", React.createElement("span", { style: { color: "rgb(222, 147, 95)" } }), ")", " "), "{", `
`, "  ", React.createElement("span", { style: { color: "#FF7B72" } }, "return"), " (", `
`, "    ", React.createElement("span", null, React.createElement("span", { style: { color: "#79C0FF" } }, "<", React.createElement("span", { style: { color: "#79C0FF" } }, "Refine"), `
`, "      ", React.createElement("span", { style: { color: "#E5ECF2", opacity: 0.6 } }, "// ", React.createElement("span", null, "...")), `
`, "    ", ">"), `
`, "      ", React.createElement("span", { style: { opacity: 0.6 } }, "{", "/* ... */", "}"), `
`, "      ", React.createElement("span", { style: { color: "#79C0FF" } }, "<", React.createElement("span", { style: { color: "#79C0FF" } }, "WelcomePage"), " />"), `
`, "      ", React.createElement("span", { style: { opacity: 0.6 } }, "{", "/* ... */", "}"), `
`, "    ", React.createElement("span", { style: { color: "#79C0FF" } }, "</", React.createElement("span", { style: { color: "#79C0FF" } }, "Refine"), ">")), `
`, "  ", ");", `
`, "}"), "ExampleImplementation"), Yu = o((e2) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 204, height: 56, viewBox: "0 0 204 56", fill: "none", ...e2 }, React.createElement("path", { fill: "url(#welcome-page-error-gradient-a)", d: "M12 0H0v12L12 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-b)", d: "M28 0h-8L0 20v8L28 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-c)", d: "M36 0h8L0 44v-8L36 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-d)", d: "M60 0h-8L0 52v4h4L60 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-e)", d: "M68 0h8L20 56h-8L68 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-f)", d: "M92 0h-8L28 56h8L92 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-g)", d: "M100 0h8L52 56h-8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-h)", d: "M124 0h-8L60 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-i)", d: "M140 0h-8L76 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-j)", d: "M132 0h8L84 56h-8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-k)", d: "M156 0h-8L92 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-l)", d: "M164 0h8l-56 56h-8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-m)", d: "M188 0h-8l-56 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-n)", d: "M204 0h-8l-56 56h8l56-56Z" }), React.createElement("defs", null, React.createElement("radialGradient", { id: "welcome-page-error-gradient-a", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-b", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-c", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-d", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-e", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-f", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-g", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-h", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-i", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-j", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-k", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-l", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-m", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-n", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })))), "ErrorGradient"), Ju = o((e2) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", ...e2 }, React.createElement("path", { fill: "#FF4C4D", fillRule: "evenodd", d: "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z", clipRule: "evenodd" }), React.createElement("path", { fill: "#fff", fillRule: "evenodd", d: "M7 8a1 1 0 1 0 2 0V5a1 1 0 1 0-2 0v3Zm0 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z", clipRule: "evenodd" })), "ErrorIcon");
o(() => {
  let { __initialized: e2 } = ge();
  return React.createElement(React.Fragment, null, React.createElement(Qn, null), !e2 && React.createElement(Vn, null));
}, "WelcomePage");
var ec = "4.54.1", Nn = o(() => {
  var R;
  let e2 = mo(), t2 = reactExports.useContext(Et), { liveProvider: r2 } = reactExports.useContext(mt), s = reactExports.useContext(er), n2 = reactExports.useContext(Jt), { i18nProvider: a } = reactExports.useContext(Xe), i = reactExports.useContext(qt), p2 = reactExports.useContext(ct), { resources: c } = Y(), u2 = ge(), l2 = !!t2.create || !!t2.get || !!t2.update, m2 = !!(r2 != null && r2.publish) || !!(r2 != null && r2.subscribe) || !!(r2 != null && r2.unsubscribe), g = !!s.useHistory || !!s.Link || !!s.Prompt || !!s.useLocation || !!s.useParams, d = !!n2, y = !!(a != null && a.changeLocale) || !!(a != null && a.getLocale) || !!(a != null && a.translate), P = !!i.close || !!i.open, C = !!p2.can, f = (R = u2 == null ? void 0 : u2.options) == null ? void 0 : R.projectId;
  return { providers: { auth: e2, auditLog: l2, live: m2, router: g, data: d, i18n: y, notification: P, accessControl: C }, version: ec, resourceCount: c.length, projectId: f };
}, "useTelemetryData");
var tc = o((e2) => {
  try {
    let t2 = JSON.stringify(e2 || {});
    return typeof btoa < "u" ? btoa(t2) : Buffer$1.from(t2).toString("base64");
  } catch {
    return;
  }
}, "encode"), rc = o((e2) => {
  let t2 = new Image();
  t2.src = e2;
}, "throughImage"), oc = o((e2) => {
  fetch(e2);
}, "throughFetch"), sc = o((e2) => {
  typeof Image < "u" ? rc(e2) : typeof fetch < "u" && oc(e2);
}, "transport"), Kn = o(() => {
  let e2 = Nn(), t2 = React.useRef(false);
  return React.useEffect(() => {
    if (t2.current) return;
    let r2 = tc(e2);
    r2 && (sc(`https://telemetry.refine.dev/telemetry?payload=${r2}`), t2.current = true);
  }, []), null;
}, "Telemetry");
var Gn = o((e2) => {
  let t2 = ["go", "parse", "back", "Link"], r2 = Object.keys(e2).filter((n2) => !t2.includes(n2));
  return r2.length > 0 ? (console.warn(`Unsupported properties are found in \`routerProvider\` prop. You provided \`${r2.join(", ")}\`. Supported properties are \`${t2.join(", ")}\`. You may wanted to use \`legacyRouterProvider\` prop instead.`), true) : false;
}, "checkRouterPropMisuse");
var Wn = o((e2) => {
  let t2 = React.useRef(false);
  React.useEffect(() => {
    t2.current === false && e2 && Gn(e2) && (t2.current = true);
  }, [e2]);
}, "useRouterMisuseWarning");
var ic = o(({ legacyAuthProvider: e2, authProvider: t2, dataProvider: r2, legacyRouterProvider: s, routerProvider: n2, notificationProvider: a, accessControlProvider: i, auditLogProvider: p2, resources: c, DashboardPage: u2, ReadyPage: l2, LoginPage: m2, catchAll: g, children: d, liveProvider: y, i18nProvider: P, Title: C, Layout: f, Sider: R, Header: M, Footer: w, OffLayoutArea: T, onLiveEvent: b, options: x }) => {
  let { optionsWithDefaults: k2, disableTelemetryWithDefault: F, reactQueryWithDefaults: v } = Zr({ options: x }), V = Sr(() => {
    var h2;
    return v.clientConfig instanceof QueryClient ? v.clientConfig : new QueryClient({ ...v.clientConfig, defaultOptions: { ...v.clientConfig.defaultOptions, queries: { refetchOnWindowFocus: false, keepPreviousData: true, ...(h2 = v.clientConfig.defaultOptions) == null ? void 0 : h2.queries } } });
  }, [v.clientConfig]);
  let L = React.useMemo(() => typeof a == "function" ? a : () => a, [a])();
  if (Wn(n2), s && !n2 && (c ?? []).length === 0) return l2 ? React.createElement(l2, null) : React.createElement(So, null);
  let { RouterComponent: B = React.Fragment } = n2 ? {} : s ?? {};
  return React.createElement(QueryClientProvider, { client: V }, React.createElement(en, { ...L }, React.createElement(Wo, { ...e2 ?? {}, isProvided: !!e2 }, React.createElement(zo, { ...t2 ?? {}, isProvided: !!t2 }, React.createElement(Vs, { dataProvider: r2 }, React.createElement(Bs, { liveProvider: y }, React.createElement(zs, { value: s && !n2 ? "legacy" : "new" }, React.createElement(_s, { router: n2 }, React.createElement(cn, { ...s }, React.createElement(Hs, { resources: c ?? [] }, React.createElement(rn, { i18nProvider: P }, React.createElement(dn, { ...i ?? {} }, React.createElement(hn, { ...p2 ?? {} }, React.createElement(Js, null, React.createElement(rs, { mutationMode: k2.mutationMode, warnWhenUnsavedChanges: k2.warnWhenUnsavedChanges, syncWithLocation: k2.syncWithLocation, Title: C, undoableTimeout: k2.undoableTimeout, catchAll: g, DashboardPage: u2, LoginPage: m2, Layout: f, Sider: R, Footer: w, Header: M, OffLayoutArea: T, hasDashboard: !!u2, liveMode: k2.liveMode, onLiveEvent: b, options: k2 }, React.createElement(is, null, React.createElement(B, null, d, !F && React.createElement(Kn, null), React.createElement(Ao, null))))))))))))))))));
}, "Refine");
var qs = o(({ notification: e2 }) => {
  let t2 = $(), { notificationDispatch: r2 } = ut(), { open: s } = $e(), [n2, a] = reactExports.useState(), i = o(() => {
    if (e2.isRunning === true && (e2.seconds === 0 && e2.doMutation(), e2.isSilent || s == null || s({ key: `${e2.id}-${e2.resource}-notification`, type: "progress", message: t2("notifications.undoable", { seconds: Bt(e2.seconds) }, `You have ${Bt(e2.seconds)} seconds to undo`), cancelMutation: e2.cancelMutation, undoableTimeout: Bt(e2.seconds) }), e2.seconds > 0)) {
      n2 && clearTimeout(n2);
      let p2 = setTimeout(() => {
        r2({ type: "DECREASE_NOTIFICATION_SECOND", payload: { id: e2.id, seconds: e2.seconds, resource: e2.resource } });
      }, 1e3);
      a(p2);
    }
  }, "cancelNotification");
  return reactExports.useEffect(() => {
    i();
  }, [e2]), null;
}, "UndoableQueue");
o(({ children: e2, Layout: t2, Sider: r2, Header: s, Title: n2, Footer: a, OffLayoutArea: i }) => {
  let { Layout: p2, Footer: c, Header: u2, Sider: l2, Title: m2, OffLayoutArea: g } = ge();
  return React.createElement(t2 ?? p2, { Sider: r2 ?? l2, Header: s ?? u2, Footer: a ?? c, Title: n2 ?? m2, OffLayoutArea: i ?? g }, e2, React.createElement(lc, null));
}, "LayoutWrapper");
var lc = o(() => {
  let { Prompt: e2 } = le(), t2 = $(), { warnWhen: r2, setWarnWhen: s } = vt(), n2 = o((a) => (a.preventDefault(), a.returnValue = t2("warnWhenUnsavedChanges", "Are you sure you want to leave? You have unsaved changes."), a.returnValue), "warnWhenListener");
  return reactExports.useEffect(() => (r2 && window.addEventListener("beforeunload", n2), window.removeEventListener("beforeunload", n2)), [r2]), React.createElement(e2, { when: r2, message: t2("warnWhenUnsavedChanges", "Are you sure you want to leave? You have unsaved changes."), setWarnWhen: s });
}, "UnsavedPrompt");
function mc({ redirectOnFail: e2 = true, appendCurrentPathToQuery: t2 = true, children: r2, fallback: s, loading: n2 }) {
  var T;
  let a = ie(), i = se(), p2 = !!(a != null && a.isProvided), c = !!(a != null && a.isLegacy), u2 = i === "legacy", l2 = Te(), m2 = Le(), { useLocation: g } = le(), d = g(), { isFetching: y, isSuccess: P, data: { authenticated: C, redirectTo: f } = {} } = Mr({ v3LegacyAuthProviderCompatible: c }), R = p2 ? c ? P : C : true;
  if (!p2) return React.createElement(React.Fragment, null, r2 ?? null);
  if (y) return React.createElement(React.Fragment, null, n2 ?? null);
  if (R) return React.createElement(React.Fragment, null, r2 ?? null);
  if (typeof s < "u") return React.createElement(React.Fragment, null, s ?? null);
  let M = c ? typeof e2 == "string" ? e2 : "/login" : typeof e2 == "string" ? e2 : f, w = `${u2 ? d == null ? void 0 : d.pathname : l2.pathname}`.replace(/(\?.*|#.*)$/, "");
  if (M) {
    if (u2) {
      let x = t2 ? `?to=${encodeURIComponent(w)}` : "";
      return React.createElement(yc, { to: `${M}${x}` });
    }
    let b = (T = l2.params) != null && T.to ? l2.params.to : m2({ to: w, options: { keepQuery: true }, type: "path" });
    return React.createElement(fc, { config: { to: M, query: t2 && (b ?? "").length > 1 ? { to: b } : void 0, type: "replace" } });
  }
  return null;
}
o(mc, "Authenticated");
var fc = o(({ config: e2 }) => {
  let t2 = Le();
  return React.useEffect(() => {
    t2(e2);
  }, [t2, e2]), null;
}, "Redirect"), yc = o(({ to: e2 }) => {
  let { replace: t2 } = Pe();
  return React.useEffect(() => {
    t2(e2);
  }, [t2, e2]), null;
}, "RedirectLegacy");
var Ao = o(() => {
  let { useLocation: e2 } = le(), { checkAuth: t2 } = xe(), r2 = e2();
  return reactExports.useEffect(() => {
    t2 == null || t2().catch(() => false);
  }, [r2 == null ? void 0 : r2.pathname]), null;
}, "RouteChangeHandler");
o(({ resource: e2, action: t2, params: r2, fallback: s, onUnauthorized: n2, children: a, queryOptions: i, ...p2 }) => {
  let { id: c, resource: u2, action: l2 = "" } = qe({ resource: e2, id: r2 == null ? void 0 : r2.id }), m2 = t2 ?? l2, g = r2 ?? { id: c, resource: u2 }, { data: d } = Ar({ resource: u2 == null ? void 0 : u2.name, action: m2, params: g, queryOptions: i });
  return reactExports.useEffect(() => {
    n2 && (d == null ? void 0 : d.can) === false && n2({ resource: u2 == null ? void 0 : u2.name, action: m2, reason: d == null ? void 0 : d.reason, params: g });
  }, [d == null ? void 0 : d.can]), d != null && d.can ? React.isValidElement(a) ? React.cloneElement(a, p2) : React.createElement(React.Fragment, null, a) : (d == null ? void 0 : d.can) === false ? React.createElement(React.Fragment, null, s ?? null) : null;
}, "CanAccess");
var zn = [`
    .bg-top-announcement {
        border-bottom: 1px solid rgba(71, 235, 235, 0.15);
        background: radial-gradient(
                218.19% 111.8% at 0% 0%,
                rgba(71, 235, 235, 0.1) 0%,
                rgba(71, 235, 235, 0.2) 100%
            ),
            #14141f;
    }
    `, `
    .top-announcement-mask {
        mask-image: url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/hexagon.svg);
        -webkit-mask-image: url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/hexagon.svg);
        mask-repeat: repeat;
        -webkit-mask-repeat: repeat;
        background: rgba(71, 235, 235, 0.25);
    }
    `, `
    .banner {
        display: flex;
        @media (max-width: 1000px) {
            display: none;
        }
    }`, `
    .gh-link, .gh-link:hover, .gh-link:active, .gh-link:visited, .gh-link:focus {
        text-decoration: none;
        z-index: 9;
    }
    `, `
    @keyframes top-announcement-glow {
        0% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }
    `];
var hc = "If you find Refine useful, you can contribute to its growth by giving it a star on GitHub";
o(({ containerStyle: e2 }) => (reactExports.useEffect(() => {
  let t2 = document.createElement("style");
  document.head.appendChild(t2), zn.forEach((r2) => {
    var s;
    return (s = t2.sheet) == null ? void 0 : s.insertRule(r2, t2.sheet.cssRules.length);
  });
}, []), React.createElement("div", { className: "banner bg-top-announcement", style: { width: "100%", height: "48px" } }, React.createElement("div", { style: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", paddingLeft: "200px", width: "100%", maxWidth: "100vw", height: "100%", borderBottom: "1px solid #47ebeb26", ...e2 } }, React.createElement("div", { className: "top-announcement-mask", style: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", borderBottom: "1px solid #47ebeb26" } }, React.createElement("div", { style: { position: "relative", width: "960px", height: "100%", display: "flex", justifyContent: "space-between", margin: "0 auto" } }, React.createElement("div", { style: { width: "calc(50% - 300px)", height: "100%", position: "relative" } }, React.createElement(Hr, { style: { animationDelay: "1.5s", position: "absolute", top: "2px", right: "220px" }, id: "1" }), React.createElement(Hr, { style: { animationDelay: "1s", position: "absolute", top: "8px", right: "100px", transform: "rotate(180deg)" }, id: "2" }), React.createElement(On, { style: { position: "absolute", right: "10px" }, id: "3" })), React.createElement("div", { style: { width: "calc(50% - 300px)", height: "100%", position: "relative" } }, React.createElement(Hr, { style: { animationDelay: "2s", position: "absolute", top: "6px", right: "180px", transform: "rotate(180deg)" }, id: "4" }), React.createElement(Hr, { style: { animationDelay: "0.5s", transitionDelay: "1.3s", position: "absolute", top: "2px", right: "40px" }, id: "5" }), React.createElement(On, { style: { position: "absolute", right: "-70px" }, id: "6" })))), React.createElement(Cc, { text: hc })))), "GitHubBanner");
var Cc = o(({ text: e2 }) => React.createElement("a", { className: "gh-link", href: "https://s.refine.dev/github-support", target: "_blank", rel: "noreferrer", style: { position: "absolute", height: "100%", padding: "0 60px", display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", alignItems: "center", backgroundImage: "linear-gradient(90deg, rgba(31, 63, 72, 0.00) 0%, #1F3F48 10%, #1F3F48 90%, rgba(31, 63, 72, 0.00) 100%)" } }, React.createElement("div", { style: { color: "#fff", display: "flex", flexDirection: "row", gap: "8px" } }, React.createElement("span", { style: { display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" } }, "⭐️"), React.createElement("span", { className: "text", style: { fontSize: "16px", lineHeight: "24px" } }, e2), React.createElement("span", { style: { display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" } }, "⭐️"))), "Text"), Hr = o(({ style: e2, ...t2 }) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 80, height: 40, fill: "none", style: { opacity: 1, animation: "top-announcement-glow 1s ease-in-out infinite alternate", ...e2 } }, React.createElement("circle", { cx: 40, r: 40, fill: `url(#${t2.id}-a)`, fillOpacity: 0.5 }), React.createElement("defs", null, React.createElement("radialGradient", { id: `${t2.id}-a`, cx: 0, cy: 0, r: 1, gradientTransform: "matrix(0 40 -40 0 40 0)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#47EBEB" }), React.createElement("stop", { offset: 1, stopColor: "#47EBEB", stopOpacity: 0 })))), "GlowSmall"), On = o(({ style: e2, ...t2 }) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 120, height: 48, fill: "none", ...t2, style: { opacity: 1, animation: "top-announcement-glow 1s ease-in-out infinite alternate", ...e2 } }, React.createElement("circle", { cx: 60, cy: 24, r: 60, fill: `url(#${t2.id}-a)`, fillOpacity: 0.5 }), React.createElement("defs", null, React.createElement("radialGradient", { id: `${t2.id}-a`, cx: 0, cy: 0, r: 1, gradientTransform: "matrix(0 60 -60 0 60 24)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#47EBEB" }), React.createElement("stop", { offset: 1, stopColor: "#47EBEB", stopOpacity: 0 })))), "GlowBig");
o(({ status: e2, elements: { success: t2 = React.createElement(Wr, { translationKey: "autoSave.success", defaultMessage: "saved" }), error: r2 = React.createElement(Wr, { translationKey: "autoSave.error", defaultMessage: "auto save failure" }), loading: s = React.createElement(Wr, { translationKey: "autoSave.loading", defaultMessage: "saving..." }), idle: n2 = React.createElement(Wr, { translationKey: "autoSave.idle", defaultMessage: "waiting for changes" }) } = {} }) => {
  switch (e2) {
    case "success":
      return React.createElement(React.Fragment, null, t2);
    case "error":
      return React.createElement(React.Fragment, null, r2);
    case "loading":
      return React.createElement(React.Fragment, null, s);
    default:
      return React.createElement(React.Fragment, null, n2);
  }
}, "AutoSaveIndicator");
var Wr = o(({ translationKey: e2, defaultMessage: t2 }) => {
  let r2 = $();
  return React.createElement("span", null, r2(e2, t2));
}, "Message");
export {
  $t as $,
  ah as A,
  Buffer$1 as B,
  Rr as C,
  Dt as D,
  get as E,
  Ae as F,
  G,
  Pt as H,
  rR as I,
  useQuery as J,
  useMutation as K,
  Le as L,
  Mr as M,
  co as N,
  Pe as P,
  Rt as R,
  Te as T,
  Y,
  __viteBrowserExternal as _,
  ii as a,
  io as b,
  $e as c,
  Lr as d,
  lC as e,
  si as f,
  global as g,
  castPath as h,
  ic as i,
  isLength as j,
  isIndex as k,
  lo as l,
  mc as m,
  isArray$4 as n,
  oo as o,
  pi as p,
  qo as q,
  isArguments as r,
  shimExports as s,
  toKey as t,
  ge as u,
  $ as v,
  vt as w,
  xo as x,
  yo as y,
  zt as z
};
