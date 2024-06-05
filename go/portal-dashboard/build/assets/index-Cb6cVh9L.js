var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _focused, _cleanup, _setup, _a, _online, _cleanup2, _setup2, _b, _gcTimeout, _c, _initialState, _revertState, _cache, _retryer, _observers, _defaultOptions, _abortSignalConsumed, _dispatch, dispatch_fn, _d, _queries, _e2, _observers2, _defaultOptions2, _mutationCache, _retryer2, _dispatch2, dispatch_fn2, _f, _mutations, _mutationId, _resuming, _g, _queryCache, _mutationCache2, _defaultOptions3, _queryDefaults, _mutationDefaults, _mountCount, _unsubscribeFocus, _unsubscribeOnline, _h, _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _executeFetch, executeFetch_fn, _updateStaleTimeout, updateStaleTimeout_fn, _computeRefetchInterval, computeRefetchInterval_fn, _updateRefetchInterval, updateRefetchInterval_fn, _updateTimers, updateTimers_fn, _clearStaleTimeout, clearStaleTimeout_fn, _clearRefetchInterval, clearRefetchInterval_fn, _updateQuery, updateQuery_fn, _notify, notify_fn, _i, _client2, _currentResult2, _currentMutation, _mutateOptions, _updateResult, updateResult_fn, _notify2, notify_fn2, _j;
import { n as commonjsGlobal, r as reactExports, j as jsxRuntimeExports, l as getAugmentedNamespace, k as getDefaultExportFromCjs, R as React } from "./index-BIsqO_uY.js";
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
  if (validLen === -1)
    validLen = len;
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
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer2[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer2[offset + i], i += d, nBits -= 8) {
  }
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer2[offset + i], i += d, nBits -= 8) {
  }
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};
ieee754.write = function(buffer2, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt2 = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt2 / c;
    } else {
      value += rt2 * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer2[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
  }
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer2[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
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
  exports2.Buffer = Buffer3;
  exports2.Buffer.Buffer = Buffer3;
  exports2.SlowBuffer = SlowBuffer;
  exports2.INSPECT_MAX_BYTES = 50;
  const K_MAX_LENGTH = 2147483647;
  exports2.kMaxLength = K_MAX_LENGTH;
  const { Uint8Array: GlobalUint8Array, ArrayBuffer: GlobalArrayBuffer, SharedArrayBuffer: GlobalSharedArrayBuffer } = globalThis;
  Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
  if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
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
    } catch (e) {
      return false;
    }
  }
  Object.defineProperty(Buffer3.prototype, "parent", {
    enumerable: true,
    get: function() {
      if (!Buffer3.isBuffer(this))
        return void 0;
      return this.buffer;
    }
  });
  Object.defineProperty(Buffer3.prototype, "offset", {
    enumerable: true,
    get: function() {
      if (!Buffer3.isBuffer(this))
        return void 0;
      return this.byteOffset;
    }
  });
  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    const buf = new GlobalUint8Array(length);
    Object.setPrototypeOf(buf, Buffer3.prototype);
    return buf;
  }
  function Buffer3(arg, encodingOrOffset, length) {
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
  Buffer3.poolSize = 8192;
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
      return Buffer3.from(valueOf, encodingOrOffset, length);
    }
    const b = fromObject(value);
    if (b)
      return b;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
      return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    }
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
    );
  }
  Buffer3.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };
  Object.setPrototypeOf(Buffer3.prototype, GlobalUint8Array.prototype);
  Object.setPrototypeOf(Buffer3, GlobalUint8Array);
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
  Buffer3.alloc = function(size, fill, encoding) {
    return alloc(size, fill, encoding);
  };
  function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
  }
  Buffer3.allocUnsafe = function(size) {
    return allocUnsafe(size);
  };
  Buffer3.allocUnsafeSlow = function(size) {
    return allocUnsafe(size);
  };
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer3.isEncoding(encoding)) {
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
    Object.setPrototypeOf(buf, Buffer3.prototype);
    return buf;
  }
  function fromObject(obj) {
    if (Buffer3.isBuffer(obj)) {
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
    return Buffer3.alloc(+length);
  }
  Buffer3.isBuffer = function isBuffer3(b) {
    return b != null && b._isBuffer === true && b !== Buffer3.prototype;
  };
  Buffer3.compare = function compare(a, b) {
    if (isInstance(a, GlobalUint8Array))
      a = Buffer3.from(a, a.offset, a.byteLength);
    if (isInstance(b, GlobalUint8Array))
      b = Buffer3.from(b, b.offset, b.byteLength);
    if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    }
    if (a === b)
      return 0;
    let x = a.length;
    let y = b.length;
    for (let i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer3.isEncoding = function isEncoding(encoding) {
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
  Buffer3.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
      return Buffer3.alloc(0);
    }
    let i;
    if (length === void 0) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }
    const buffer2 = Buffer3.allocUnsafe(length);
    let pos = 0;
    for (i = 0; i < list.length; ++i) {
      let buf = list[i];
      if (isInstance(buf, GlobalUint8Array)) {
        if (pos + buf.length > buffer2.length) {
          if (!Buffer3.isBuffer(buf))
            buf = Buffer3.from(buf);
          buf.copy(buffer2, pos);
        } else {
          GlobalUint8Array.prototype.set.call(
            buffer2,
            buf,
            pos
          );
        }
      } else if (!Buffer3.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      } else {
        buf.copy(buffer2, pos);
      }
      pos += buf.length;
    }
    return buffer2;
  };
  function byteLength2(string, encoding) {
    if (Buffer3.isBuffer(string)) {
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
    if (!mustMatch && len === 0)
      return 0;
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
  Buffer3.byteLength = byteLength2;
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
    if (!encoding)
      encoding = "utf8";
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
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer3.prototype._isBuffer = true;
  function swap(b, n, m) {
    const i = b[n];
    b[n] = b[m];
    b[m] = i;
  }
  Buffer3.prototype.swap16 = function swap16() {
    const len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for (let i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this;
  };
  Buffer3.prototype.swap32 = function swap32() {
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
  Buffer3.prototype.swap64 = function swap64() {
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
  Buffer3.prototype.toString = function toString2() {
    const length = this.length;
    if (length === 0)
      return "";
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
  Buffer3.prototype.equals = function equals(b) {
    if (!Buffer3.isBuffer(b))
      throw new TypeError("Argument must be a Buffer");
    if (this === b)
      return true;
    return Buffer3.compare(this, b) === 0;
  };
  Buffer3.prototype.inspect = function inspect2() {
    let str = "";
    const max2 = exports2.INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max2).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max2)
      str += " ... ";
    return "<Buffer " + str + ">";
  };
  if (customInspectSymbol) {
    Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
  }
  Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, GlobalUint8Array)) {
      target = Buffer3.from(target, target.offset, target.byteLength);
    }
    if (!Buffer3.isBuffer(target)) {
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
    if (this === target)
      return 0;
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
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  function bidirectionalIndexOf(buffer2, val, byteOffset, encoding, dir) {
    if (buffer2.length === 0)
      return -1;
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
    if (byteOffset < 0)
      byteOffset = buffer2.length + byteOffset;
    if (byteOffset >= buffer2.length) {
      if (dir)
        return -1;
      else
        byteOffset = buffer2.length - 1;
    } else if (byteOffset < 0) {
      if (dir)
        byteOffset = 0;
      else
        return -1;
    }
    if (typeof val === "string") {
      val = Buffer3.from(val, encoding);
    }
    if (Buffer3.isBuffer(val)) {
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
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        let found = true;
        for (let j2 = 0; j2 < valLength; j2++) {
          if (read(arr, i + j2) !== read(val, j2)) {
            found = false;
            break;
          }
        }
        if (found)
          return i;
      }
    }
    return -1;
  }
  Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };
  Buffer3.prototype.indexOf = function indexOf2(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };
  Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
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
      if (numberIsNaN(parsed))
        return i;
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
  Buffer3.prototype.write = function write(string, offset, length, encoding) {
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
        if (encoding === void 0)
          encoding = "utf8";
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
    if (length === void 0 || length > remaining)
      length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding)
      encoding = "utf8";
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
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer3.prototype.toJSON = function toJSON() {
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
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
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
  Buffer3.prototype.slice = function slice(start, end) {
    const len = this.length;
    start = ~~start;
    end = end === void 0 ? len : ~~end;
    if (start < 0) {
      start += len;
      if (start < 0)
        start = 0;
    } else if (start > len) {
      start = len;
    }
    if (end < 0) {
      end += len;
      if (end < 0)
        end = 0;
    } else if (end > len) {
      end = len;
    }
    if (end < start)
      end = start;
    const newBuf = this.subarray(start, end);
    Object.setPrototypeOf(newBuf, Buffer3.prototype);
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw new RangeError("offset is not uint");
    if (offset + ext > length)
      throw new RangeError("Trying to access beyond buffer length");
  }
  Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength3 && (mul *= 256)) {
      val += this[offset + i] * mul;
    }
    return val;
  };
  Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength3, noAssert) {
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
  Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };
  Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };
  Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
  };
  Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };
  Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last2 = this[offset + 7];
    if (first === void 0 || last2 === void 0) {
      boundsError(offset, this.length - 8);
    }
    const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last2 * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
  });
  Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last2 = this[offset + 7];
    if (first === void 0 || last2 === void 0) {
      boundsError(offset, this.length - 8);
    }
    const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last2;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
  });
  Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength3 && (mul *= 256)) {
      val += this[offset + i] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength3, noAssert) {
    offset = offset >>> 0;
    byteLength3 = byteLength3 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength3, this.length);
    let i = byteLength3;
    let mul = 1;
    let val = this[offset + --i];
    while (i > 0 && (mul *= 256)) {
      val += this[offset + --i] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength3);
    return val;
  };
  Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128))
      return this[offset];
    return (255 - this[offset] + 1) * -1;
  };
  Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };
  Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };
  Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
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
  Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
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
  Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, true, 23, 4);
  };
  Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754$1.read(this, offset, false, 23, 4);
  };
  Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, true, 52, 8);
  };
  Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754$1.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max2, min) {
    if (!Buffer3.isBuffer(buf))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max2 || value < min)
      throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
  }
  Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength3, noAssert) {
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
  Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength3, noAssert) {
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
  Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 255, 0);
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
    return offset + 4;
  };
  Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  function wrtBigUInt64LE(buf, value, offset, min, max2) {
    checkIntBI(value, min, max2, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
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
    let lo = Number(value & BigInt(4294967295));
    buf[offset + 7] = lo;
    lo = lo >> 8;
    buf[offset + 6] = lo;
    lo = lo >> 8;
    buf[offset + 5] = lo;
    lo = lo >> 8;
    buf[offset + 4] = lo;
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
  Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit - 1, -limit);
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
  Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength3, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength3 - 1);
      checkInt(this, value, offset, byteLength3, limit - 1, -limit);
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
  Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 127, -128);
    if (value < 0)
      value = 255 + value + 1;
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };
  Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0)
      value = 4294967295 + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function checkIEEE754(buf, value, offset, ext, max2, min) {
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
    if (offset < 0)
      throw new RangeError("Index out of range");
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
  Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
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
  Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer3.isBuffer(target))
      throw new TypeError("argument should be a Buffer");
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length)
      throw new RangeError("Index out of range");
    if (end < 0)
      throw new RangeError("sourceEnd out of bounds");
    if (end > this.length)
      end = this.length;
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
  Buffer3.prototype.fill = function fill(val, start, end, encoding) {
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
      if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
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
    if (!val)
      val = 0;
    let i;
    if (typeof val === "number") {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
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
      const n = typeof min === "bigint" ? "n" : "";
      let range2;
      if (byteLength3 > 3) {
        if (min === 0 || min === BigInt(0)) {
          range2 = `>= 0${n} and < 2${n} ** ${(byteLength3 + 1) * 8}${n}`;
        } else {
          range2 = `>= -(2${n} ** ${(byteLength3 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength3 + 1) * 8 - 1}${n}`;
        }
      } else {
        range2 = `>= ${min}${n} and <= ${max2}${n}`;
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
      throw new errors.ERR_OUT_OF_RANGE(type2 || "offset", "an integer", value);
    }
    if (length < 0) {
      throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
    }
    throw new errors.ERR_OUT_OF_RANGE(
      type2 || "offset",
      `>= ${type2 ? 1 : 0} and <= ${length}`,
      value
    );
  }
  const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = str.split("=")[0];
    str = str.trim().replace(INVALID_BASE64_RE, "");
    if (str.length < 2)
      return "";
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
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(
          codePoint >> 6 | 192,
          codePoint & 63 | 128
        );
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(
          codePoint >> 12 | 224,
          codePoint >> 6 & 63 | 128,
          codePoint & 63 | 128
        );
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
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
    let c, hi, lo;
    const byteArray = [];
    for (let i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
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
      if (i + offset >= dst.length || i >= src.length)
        break;
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
      for (let j2 = 0; j2 < 16; ++j2) {
        table[i16 + j2] = alphabet[i] + alphabet[j2];
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
const Buffer$1$1 = buffer.Buffer;
var errorStackParser = { exports: {} };
var stackframe = { exports: {} };
var hasRequiredStackframe;
function requireStackframe() {
  if (hasRequiredStackframe)
    return stackframe.exports;
  hasRequiredStackframe = 1;
  (function(module2, exports2) {
    (function(root2, factory) {
      {
        module2.exports = factory();
      }
    })(commonjsGlobal, function() {
      function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
      }
      function _getter(p) {
        return function() {
          return this[p];
        };
      }
      var booleanProps = ["isConstructor", "isEval", "isNative", "isToplevel"];
      var numericProps = ["columnNumber", "lineNumber"];
      var stringProps = ["fileName", "functionName", "source"];
      var arrayProps = ["args"];
      var objectProps = ["evalOrigin"];
      var props = booleanProps.concat(numericProps, stringProps, arrayProps, objectProps);
      function StackFrame(obj) {
        if (!obj)
          return;
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
        StackFrame.prototype["set" + _capitalize(booleanProps[i])] = /* @__PURE__ */ function(p) {
          return function(v) {
            this[p] = Boolean(v);
          };
        }(booleanProps[i]);
      }
      for (var j2 = 0; j2 < numericProps.length; j2++) {
        StackFrame.prototype["get" + _capitalize(numericProps[j2])] = _getter(numericProps[j2]);
        StackFrame.prototype["set" + _capitalize(numericProps[j2])] = /* @__PURE__ */ function(p) {
          return function(v) {
            if (!_isNumber(v)) {
              throw new TypeError(p + " must be a Number");
            }
            this[p] = Number(v);
          };
        }(numericProps[j2]);
      }
      for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype["get" + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype["set" + _capitalize(stringProps[k])] = /* @__PURE__ */ function(p) {
          return function(v) {
            this[p] = String(v);
          };
        }(stringProps[k]);
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
      parseOpera: function ErrorStackParser$$parseOpera(e) {
        if (!e.stacktrace || e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length) {
          return this.parseOpera9(e);
        } else if (!e.stack) {
          return this.parseOpera10(e);
        } else {
          return this.parseOpera11(e);
        }
      },
      parseOpera9: function ErrorStackParser$$parseOpera9(e) {
        var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split("\n");
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
      parseOpera10: function ErrorStackParser$$parseOpera10(e) {
        var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split("\n");
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
function P(r, e) {
  return { hookName: "", trace: [], resourcePath: null, legacyKey: false };
}
var Subscribable = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.subscribe = this.subscribe.bind(this);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    this.onSubscribe();
    return () => {
      this.listeners.delete(listener);
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
};
var isServer = typeof window === "undefined" || "Deno" in globalThis;
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
function matchQuery(filters, query) {
  const {
    type: type2 = "all",
    exact,
    fetchStatus,
    predicate,
    queryKey,
    stale
  } = filters;
  if (queryKey) {
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
  if (fetchStatus && fetchStatus !== query.state.fetchStatus) {
    return false;
  }
  if (predicate && !predicate(query)) {
    return false;
  }
  return true;
}
function matchMutation(filters, mutation) {
  const { exact, status, predicate, mutationKey } = filters;
  if (mutationKey) {
    if (!mutation.options.mutationKey) {
      return false;
    }
    if (exact) {
      if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }
  if (status && mutation.state.status !== status) {
    return false;
  }
  if (predicate && !predicate(mutation)) {
    return false;
  }
  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  const hashFn = (options == null ? void 0 : options.queryKeyHashFn) || hashKey;
  return hashFn(queryKey);
}
function hashKey(queryKey) {
  return JSON.stringify(
    queryKey,
    (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
      result[key] = val[key];
      return result;
    }, {}) : val
  );
}
function partialMatchKey(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    return !Object.keys(b).some((key) => !partialMatchKey(a[key], b[key]));
  }
  return false;
}
function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }
  const array = isPlainArray(a) && isPlainArray(b);
  if (array || isPlainObject(a) && isPlainObject(b)) {
    const aItems = array ? a : Object.keys(a);
    const aSize = aItems.length;
    const bItems = array ? b : Object.keys(b);
    const bSize = bItems.length;
    const copy = array ? [] : {};
    let equalItems = 0;
    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i];
      if (!array && a[key] === void 0 && b[key] === void 0 && aItems.includes(key)) {
        copy[key] = void 0;
        equalItems++;
      } else {
        copy[key] = replaceEqualDeep(a[key], b[key]);
        if (copy[key] === a[key] && a[key] !== void 0) {
          equalItems++;
        }
      }
    }
    return aSize === bSize && equalItems === aSize ? a : copy;
  }
  return b;
}
function shallowEqualObjects(a, b) {
  if (!b || Object.keys(a).length !== Object.keys(b).length) {
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
  if (ctor === void 0) {
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
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function replaceData(prevData, data, options) {
  if (typeof options.structuralSharing === "function") {
    return options.structuralSharing(prevData, data);
  } else if (options.structuralSharing !== false) {
    return replaceEqualDeep(prevData, data);
  }
  return data;
}
function addToEnd(items, item, max2 = 0) {
  const newItems = [...items, item];
  return max2 && newItems.length > max2 ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max2 = 0) {
  const newItems = [item, ...items];
  return max2 && newItems.length > max2 ? newItems.slice(0, -1) : newItems;
}
var skipToken = Symbol();
var FocusManager = (_a = class extends Subscribable {
  constructor() {
    super();
    __privateAdd(this, _focused, void 0);
    __privateAdd(this, _cleanup, void 0);
    __privateAdd(this, _setup, void 0);
    __privateSet(this, _setup, (onFocus) => {
      if (!isServer && window.addEventListener) {
        const listener = () => onFocus();
        window.addEventListener("visibilitychange", listener, false);
        return () => {
          window.removeEventListener("visibilitychange", listener);
        };
      }
      return;
    });
  }
  onSubscribe() {
    if (!__privateGet(this, _cleanup)) {
      this.setEventListener(__privateGet(this, _setup));
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _cleanup)) == null ? void 0 : _a2.call(this);
      __privateSet(this, _cleanup, void 0);
    }
  }
  setEventListener(setup) {
    var _a2;
    __privateSet(this, _setup, setup);
    (_a2 = __privateGet(this, _cleanup)) == null ? void 0 : _a2.call(this);
    __privateSet(this, _cleanup, setup((focused) => {
      if (typeof focused === "boolean") {
        this.setFocused(focused);
      } else {
        this.onFocus();
      }
    }));
  }
  setFocused(focused) {
    const changed = __privateGet(this, _focused) !== focused;
    if (changed) {
      __privateSet(this, _focused, focused);
      this.onFocus();
    }
  }
  onFocus() {
    const isFocused = this.isFocused();
    this.listeners.forEach((listener) => {
      listener(isFocused);
    });
  }
  isFocused() {
    var _a2;
    if (typeof __privateGet(this, _focused) === "boolean") {
      return __privateGet(this, _focused);
    }
    return ((_a2 = globalThis.document) == null ? void 0 : _a2.visibilityState) !== "hidden";
  }
}, _focused = new WeakMap(), _cleanup = new WeakMap(), _setup = new WeakMap(), _a);
var focusManager = new FocusManager();
var OnlineManager = (_b = class extends Subscribable {
  constructor() {
    super();
    __privateAdd(this, _online, true);
    __privateAdd(this, _cleanup2, void 0);
    __privateAdd(this, _setup2, void 0);
    __privateSet(this, _setup2, (onOnline) => {
      if (!isServer && window.addEventListener) {
        const onlineListener = () => onOnline(true);
        const offlineListener = () => onOnline(false);
        window.addEventListener("online", onlineListener, false);
        window.addEventListener("offline", offlineListener, false);
        return () => {
          window.removeEventListener("online", onlineListener);
          window.removeEventListener("offline", offlineListener);
        };
      }
      return;
    });
  }
  onSubscribe() {
    if (!__privateGet(this, _cleanup2)) {
      this.setEventListener(__privateGet(this, _setup2));
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _cleanup2)) == null ? void 0 : _a2.call(this);
      __privateSet(this, _cleanup2, void 0);
    }
  }
  setEventListener(setup) {
    var _a2;
    __privateSet(this, _setup2, setup);
    (_a2 = __privateGet(this, _cleanup2)) == null ? void 0 : _a2.call(this);
    __privateSet(this, _cleanup2, setup(this.setOnline.bind(this)));
  }
  setOnline(online) {
    const changed = __privateGet(this, _online) !== online;
    if (changed) {
      __privateSet(this, _online, online);
      this.listeners.forEach((listener) => {
        listener(online);
      });
    }
  }
  isOnline() {
    return __privateGet(this, _online);
  }
}, _online = new WeakMap(), _cleanup2 = new WeakMap(), _setup2 = new WeakMap(), _b);
var onlineManager = new OnlineManager();
function defaultRetryDelay(failureCount) {
  return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
  return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
var CancelledError = class {
  constructor(options) {
    this.revert = options == null ? void 0 : options.revert;
    this.silent = options == null ? void 0 : options.silent;
  }
};
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
    var _a2;
    if (!isResolved) {
      reject(new CancelledError(cancelOptions));
      (_a2 = config.abort) == null ? void 0 : _a2.call(config);
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
    var _a2;
    if (!isResolved) {
      isResolved = true;
      (_a2 = config.onSuccess) == null ? void 0 : _a2.call(config, value);
      continueFn == null ? void 0 : continueFn();
      promiseResolve(value);
    }
  };
  const reject = (value) => {
    var _a2;
    if (!isResolved) {
      isResolved = true;
      (_a2 = config.onError) == null ? void 0 : _a2.call(config, value);
      continueFn == null ? void 0 : continueFn();
      promiseReject(value);
    }
  };
  const pause = () => {
    return new Promise((continueResolve) => {
      var _a2;
      continueFn = (value) => {
        const canContinue = isResolved || !shouldPause();
        if (canContinue) {
          continueResolve(value);
        }
        return canContinue;
      };
      (_a2 = config.onPause) == null ? void 0 : _a2.call(config);
    }).then(() => {
      var _a2;
      continueFn = void 0;
      if (!isResolved) {
        (_a2 = config.onContinue) == null ? void 0 : _a2.call(config);
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
      var _a2;
      if (isResolved) {
        return;
      }
      const retry = config.retry ?? (isServer ? 0 : 3);
      const retryDelay = config.retryDelay ?? defaultRetryDelay;
      const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
      if (isRetryCancelled || !shouldRetry) {
        reject(error);
        return;
      }
      failureCount++;
      (_a2 = config.onFail) == null ? void 0 : _a2.call(config, failureCount, error);
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
function createNotifyManager() {
  let queue = [];
  let transactions = 0;
  let notifyFn = (callback) => {
    callback();
  };
  let batchNotifyFn = (callback) => {
    callback();
  };
  let scheduleFn = (cb) => setTimeout(cb, 0);
  const setScheduler = (fn) => {
    scheduleFn = fn;
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
      scheduleFn(() => {
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
      scheduleFn(() => {
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
    setBatchNotifyFunction,
    setScheduler
  };
}
var notifyManager = createNotifyManager();
var Removable = (_c = class {
  constructor() {
    __privateAdd(this, _gcTimeout, void 0);
  }
  destroy() {
    this.clearGcTimeout();
  }
  scheduleGc() {
    this.clearGcTimeout();
    if (isValidTimeout(this.gcTime)) {
      __privateSet(this, _gcTimeout, setTimeout(() => {
        this.optionalRemove();
      }, this.gcTime));
    }
  }
  updateGcTime(newGcTime) {
    this.gcTime = Math.max(
      this.gcTime || 0,
      newGcTime ?? (isServer ? Infinity : 5 * 60 * 1e3)
    );
  }
  clearGcTimeout() {
    if (__privateGet(this, _gcTimeout)) {
      clearTimeout(__privateGet(this, _gcTimeout));
      __privateSet(this, _gcTimeout, void 0);
    }
  }
}, _gcTimeout = new WeakMap(), _c);
var Query = (_d = class extends Removable {
  constructor(config) {
    super();
    __privateAdd(this, _dispatch);
    __privateAdd(this, _initialState, void 0);
    __privateAdd(this, _revertState, void 0);
    __privateAdd(this, _cache, void 0);
    __privateAdd(this, _retryer, void 0);
    __privateAdd(this, _observers, void 0);
    __privateAdd(this, _defaultOptions, void 0);
    __privateAdd(this, _abortSignalConsumed, void 0);
    __privateSet(this, _abortSignalConsumed, false);
    __privateSet(this, _defaultOptions, config.defaultOptions);
    this.setOptions(config.options);
    __privateSet(this, _observers, []);
    __privateSet(this, _cache, config.cache);
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    __privateSet(this, _initialState, config.state || getDefaultState$1(this.options));
    this.state = __privateGet(this, _initialState);
    this.scheduleGc();
  }
  get meta() {
    return this.options.meta;
  }
  setOptions(options) {
    this.options = { ...__privateGet(this, _defaultOptions), ...options };
    this.updateGcTime(this.options.gcTime);
  }
  optionalRemove() {
    if (!__privateGet(this, _observers).length && this.state.fetchStatus === "idle") {
      __privateGet(this, _cache).remove(this);
    }
  }
  setData(newData, options) {
    const data = replaceData(this.state.data, newData, this.options);
    __privateMethod(this, _dispatch, dispatch_fn).call(this, {
      data,
      type: "success",
      dataUpdatedAt: options == null ? void 0 : options.updatedAt,
      manual: options == null ? void 0 : options.manual
    });
    return data;
  }
  setState(state, setStateOptions) {
    __privateMethod(this, _dispatch, dispatch_fn).call(this, { type: "setState", state, setStateOptions });
  }
  cancel(options) {
    var _a2, _b2;
    const promise = (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.promise;
    (_b2 = __privateGet(this, _retryer)) == null ? void 0 : _b2.cancel(options);
    return promise ? promise.then(noop$2).catch(noop$2) : Promise.resolve();
  }
  destroy() {
    super.destroy();
    this.cancel({ silent: true });
  }
  reset() {
    this.destroy();
    this.setState(__privateGet(this, _initialState));
  }
  isActive() {
    return __privateGet(this, _observers).some(
      (observer) => observer.options.enabled !== false
    );
  }
  isDisabled() {
    return this.getObserversCount() > 0 && !this.isActive();
  }
  isStale() {
    if (this.state.isInvalidated) {
      return true;
    }
    if (this.getObserversCount() > 0) {
      return __privateGet(this, _observers).some(
        (observer) => observer.getCurrentResult().isStale
      );
    }
    return this.state.data === void 0;
  }
  isStaleByTime(staleTime = 0) {
    return this.state.isInvalidated || this.state.data === void 0 || !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  }
  onFocus() {
    var _a2;
    const observer = __privateGet(this, _observers).find((x) => x.shouldFetchOnWindowFocus());
    observer == null ? void 0 : observer.refetch({ cancelRefetch: false });
    (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.continue();
  }
  onOnline() {
    var _a2;
    const observer = __privateGet(this, _observers).find((x) => x.shouldFetchOnReconnect());
    observer == null ? void 0 : observer.refetch({ cancelRefetch: false });
    (_a2 = __privateGet(this, _retryer)) == null ? void 0 : _a2.continue();
  }
  addObserver(observer) {
    if (!__privateGet(this, _observers).includes(observer)) {
      __privateGet(this, _observers).push(observer);
      this.clearGcTimeout();
      __privateGet(this, _cache).notify({ type: "observerAdded", query: this, observer });
    }
  }
  removeObserver(observer) {
    if (__privateGet(this, _observers).includes(observer)) {
      __privateSet(this, _observers, __privateGet(this, _observers).filter((x) => x !== observer));
      if (!__privateGet(this, _observers).length) {
        if (__privateGet(this, _retryer)) {
          if (__privateGet(this, _abortSignalConsumed)) {
            __privateGet(this, _retryer).cancel({ revert: true });
          } else {
            __privateGet(this, _retryer).cancelRetry();
          }
        }
        this.scheduleGc();
      }
      __privateGet(this, _cache).notify({ type: "observerRemoved", query: this, observer });
    }
  }
  getObserversCount() {
    return __privateGet(this, _observers).length;
  }
  invalidate() {
    if (!this.state.isInvalidated) {
      __privateMethod(this, _dispatch, dispatch_fn).call(this, { type: "invalidate" });
    }
  }
  fetch(options, fetchOptions) {
    var _a2, _b2, _c2;
    if (this.state.fetchStatus !== "idle") {
      if (this.state.data !== void 0 && (fetchOptions == null ? void 0 : fetchOptions.cancelRefetch)) {
        this.cancel({ silent: true });
      } else if (__privateGet(this, _retryer)) {
        __privateGet(this, _retryer).continueRetry();
        return __privateGet(this, _retryer).promise;
      }
    }
    if (options) {
      this.setOptions(options);
    }
    if (!this.options.queryFn) {
      const observer = __privateGet(this, _observers).find((x) => x.options.queryFn);
      if (observer) {
        this.setOptions(observer.options);
      }
    }
    const abortController = new AbortController();
    const queryFnContext = {
      queryKey: this.queryKey,
      meta: this.meta
    };
    const addSignalProperty = (object) => {
      Object.defineProperty(object, "signal", {
        enumerable: true,
        get: () => {
          __privateSet(this, _abortSignalConsumed, true);
          return abortController.signal;
        }
      });
    };
    addSignalProperty(queryFnContext);
    const fetchFn = () => {
      if (!this.options.queryFn || this.options.queryFn === skipToken) {
        return Promise.reject(
          new Error(`Missing queryFn: '${this.options.queryHash}'`)
        );
      }
      __privateSet(this, _abortSignalConsumed, false);
      if (this.options.persister) {
        return this.options.persister(
          this.options.queryFn,
          queryFnContext,
          this
        );
      }
      return this.options.queryFn(
        queryFnContext
      );
    };
    const context = {
      fetchOptions,
      options: this.options,
      queryKey: this.queryKey,
      state: this.state,
      fetchFn
    };
    addSignalProperty(context);
    (_a2 = this.options.behavior) == null ? void 0 : _a2.onFetch(
      context,
      this
    );
    __privateSet(this, _revertState, this.state);
    if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((_b2 = context.fetchOptions) == null ? void 0 : _b2.meta)) {
      __privateMethod(this, _dispatch, dispatch_fn).call(this, { type: "fetch", meta: (_c2 = context.fetchOptions) == null ? void 0 : _c2.meta });
    }
    const onError = (error) => {
      var _a3, _b3, _c3, _d2;
      if (!(isCancelledError(error) && error.silent)) {
        __privateMethod(this, _dispatch, dispatch_fn).call(this, {
          type: "error",
          error
        });
      }
      if (!isCancelledError(error)) {
        (_b3 = (_a3 = __privateGet(this, _cache).config).onError) == null ? void 0 : _b3.call(
          _a3,
          error,
          this
        );
        (_d2 = (_c3 = __privateGet(this, _cache).config).onSettled) == null ? void 0 : _d2.call(
          _c3,
          this.state.data,
          error,
          this
        );
      }
      if (!this.isFetchingOptimistic) {
        this.scheduleGc();
      }
      this.isFetchingOptimistic = false;
    };
    __privateSet(this, _retryer, createRetryer({
      fn: context.fetchFn,
      abort: abortController.abort.bind(abortController),
      onSuccess: (data) => {
        var _a3, _b3, _c3, _d2;
        if (data === void 0) {
          onError(new Error(`${this.queryHash} data is undefined`));
          return;
        }
        this.setData(data);
        (_b3 = (_a3 = __privateGet(this, _cache).config).onSuccess) == null ? void 0 : _b3.call(_a3, data, this);
        (_d2 = (_c3 = __privateGet(this, _cache).config).onSettled) == null ? void 0 : _d2.call(
          _c3,
          data,
          this.state.error,
          this
        );
        if (!this.isFetchingOptimistic) {
          this.scheduleGc();
        }
        this.isFetchingOptimistic = false;
      },
      onError,
      onFail: (failureCount, error) => {
        __privateMethod(this, _dispatch, dispatch_fn).call(this, { type: "failed", failureCount, error });
      },
      onPause: () => {
        __privateMethod(this, _dispatch, dispatch_fn).call(this, { type: "pause" });
      },
      onContinue: () => {
        __privateMethod(this, _dispatch, dispatch_fn).call(this, { type: "continue" });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay,
      networkMode: context.options.networkMode
    }));
    return __privateGet(this, _retryer).promise;
  }
}, _initialState = new WeakMap(), _revertState = new WeakMap(), _cache = new WeakMap(), _retryer = new WeakMap(), _observers = new WeakMap(), _defaultOptions = new WeakMap(), _abortSignalConsumed = new WeakMap(), _dispatch = new WeakSet(), dispatch_fn = function(action) {
  const reducer = (state) => {
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
          ...fetchState(state.data, this.options),
          fetchMeta: action.meta ?? null
        };
      case "success":
        return {
          ...state,
          data: action.data,
          dataUpdateCount: state.dataUpdateCount + 1,
          dataUpdatedAt: action.dataUpdatedAt ?? Date.now(),
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
        if (isCancelledError(error) && error.revert && __privateGet(this, _revertState)) {
          return { ...__privateGet(this, _revertState), fetchStatus: "idle" };
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
    __privateGet(this, _observers).forEach((observer) => {
      observer.onQueryUpdate();
    });
    __privateGet(this, _cache).notify({ query: this, type: "updated", action });
  });
}, _d);
function fetchState(data, options) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
    ...data === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function getDefaultState$1(options) {
  const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
  const hasData = data !== void 0;
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var QueryCache = (_e2 = class extends Subscribable {
  constructor(config = {}) {
    super();
    __privateAdd(this, _queries, void 0);
    this.config = config;
    __privateSet(this, _queries, /* @__PURE__ */ new Map());
  }
  build(client, options, state) {
    const queryKey = options.queryKey;
    const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        cache: this,
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
    if (!__privateGet(this, _queries).has(query.queryHash)) {
      __privateGet(this, _queries).set(query.queryHash, query);
      this.notify({
        type: "added",
        query
      });
    }
  }
  remove(query) {
    const queryInMap = __privateGet(this, _queries).get(query.queryHash);
    if (queryInMap) {
      query.destroy();
      if (queryInMap === query) {
        __privateGet(this, _queries).delete(query.queryHash);
      }
      this.notify({ type: "removed", query });
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        this.remove(query);
      });
    });
  }
  get(queryHash) {
    return __privateGet(this, _queries).get(queryHash);
  }
  getAll() {
    return [...__privateGet(this, _queries).values()];
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (query) => matchQuery(defaultedFilters, query)
    );
  }
  findAll(filters = {}) {
    const queries = this.getAll();
    return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  onFocus() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onFocus();
      });
    });
  }
  onOnline() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onOnline();
      });
    });
  }
}, _queries = new WeakMap(), _e2);
var Mutation = (_f = class extends Removable {
  constructor(config) {
    super();
    __privateAdd(this, _dispatch2);
    __privateAdd(this, _observers2, void 0);
    __privateAdd(this, _defaultOptions2, void 0);
    __privateAdd(this, _mutationCache, void 0);
    __privateAdd(this, _retryer2, void 0);
    this.mutationId = config.mutationId;
    __privateSet(this, _defaultOptions2, config.defaultOptions);
    __privateSet(this, _mutationCache, config.mutationCache);
    __privateSet(this, _observers2, []);
    this.state = config.state || getDefaultState();
    this.setOptions(config.options);
    this.scheduleGc();
  }
  setOptions(options) {
    this.options = { ...__privateGet(this, _defaultOptions2), ...options };
    this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(observer) {
    if (!__privateGet(this, _observers2).includes(observer)) {
      __privateGet(this, _observers2).push(observer);
      this.clearGcTimeout();
      __privateGet(this, _mutationCache).notify({
        type: "observerAdded",
        mutation: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    __privateSet(this, _observers2, __privateGet(this, _observers2).filter((x) => x !== observer));
    this.scheduleGc();
    __privateGet(this, _mutationCache).notify({
      type: "observerRemoved",
      mutation: this,
      observer
    });
  }
  optionalRemove() {
    if (!__privateGet(this, _observers2).length) {
      if (this.state.status === "pending") {
        this.scheduleGc();
      } else {
        __privateGet(this, _mutationCache).remove(this);
      }
    }
  }
  continue() {
    var _a2;
    return ((_a2 = __privateGet(this, _retryer2)) == null ? void 0 : _a2.continue()) ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(variables) {
    var _a2, _b2, _c2, _d2, _e3, _f2, _g2, _h2, _i2, _j2, _k, _l, _m, _n, _o, _p, _q, _r2, _s, _t2;
    const executeMutation = () => {
      __privateSet(this, _retryer2, createRetryer({
        fn: () => {
          if (!this.options.mutationFn) {
            return Promise.reject(new Error("No mutationFn found"));
          }
          return this.options.mutationFn(variables);
        },
        onFail: (failureCount, error) => {
          __privateMethod(this, _dispatch2, dispatch_fn2).call(this, { type: "failed", failureCount, error });
        },
        onPause: () => {
          __privateMethod(this, _dispatch2, dispatch_fn2).call(this, { type: "pause" });
        },
        onContinue: () => {
          __privateMethod(this, _dispatch2, dispatch_fn2).call(this, { type: "continue" });
        },
        retry: this.options.retry ?? 0,
        retryDelay: this.options.retryDelay,
        networkMode: this.options.networkMode
      }));
      return __privateGet(this, _retryer2).promise;
    };
    const restored = this.state.status === "pending";
    try {
      if (!restored) {
        __privateMethod(this, _dispatch2, dispatch_fn2).call(this, { type: "pending", variables });
        await ((_b2 = (_a2 = __privateGet(this, _mutationCache).config).onMutate) == null ? void 0 : _b2.call(
          _a2,
          variables,
          this
        ));
        const context = await ((_d2 = (_c2 = this.options).onMutate) == null ? void 0 : _d2.call(_c2, variables));
        if (context !== this.state.context) {
          __privateMethod(this, _dispatch2, dispatch_fn2).call(this, {
            type: "pending",
            context,
            variables
          });
        }
      }
      const data = await executeMutation();
      await ((_f2 = (_e3 = __privateGet(this, _mutationCache).config).onSuccess) == null ? void 0 : _f2.call(
        _e3,
        data,
        variables,
        this.state.context,
        this
      ));
      await ((_h2 = (_g2 = this.options).onSuccess) == null ? void 0 : _h2.call(_g2, data, variables, this.state.context));
      await ((_j2 = (_i2 = __privateGet(this, _mutationCache).config).onSettled) == null ? void 0 : _j2.call(
        _i2,
        data,
        null,
        this.state.variables,
        this.state.context,
        this
      ));
      await ((_l = (_k = this.options).onSettled) == null ? void 0 : _l.call(_k, data, null, variables, this.state.context));
      __privateMethod(this, _dispatch2, dispatch_fn2).call(this, { type: "success", data });
      return data;
    } catch (error) {
      try {
        await ((_n = (_m = __privateGet(this, _mutationCache).config).onError) == null ? void 0 : _n.call(
          _m,
          error,
          variables,
          this.state.context,
          this
        ));
        await ((_p = (_o = this.options).onError) == null ? void 0 : _p.call(
          _o,
          error,
          variables,
          this.state.context
        ));
        await ((_r2 = (_q = __privateGet(this, _mutationCache).config).onSettled) == null ? void 0 : _r2.call(
          _q,
          void 0,
          error,
          this.state.variables,
          this.state.context,
          this
        ));
        await ((_t2 = (_s = this.options).onSettled) == null ? void 0 : _t2.call(
          _s,
          void 0,
          error,
          variables,
          this.state.context
        ));
        throw error;
      } finally {
        __privateMethod(this, _dispatch2, dispatch_fn2).call(this, { type: "error", error });
      }
    }
  }
}, _observers2 = new WeakMap(), _defaultOptions2 = new WeakMap(), _mutationCache = new WeakMap(), _retryer2 = new WeakMap(), _dispatch2 = new WeakSet(), dispatch_fn2 = function(action) {
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
      case "pending":
        return {
          ...state,
          context: action.context,
          data: void 0,
          failureCount: 0,
          failureReason: null,
          error: null,
          isPaused: !canFetch(this.options.networkMode),
          status: "pending",
          variables: action.variables,
          submittedAt: Date.now()
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
    }
  };
  this.state = reducer(this.state);
  notifyManager.batch(() => {
    __privateGet(this, _observers2).forEach((observer) => {
      observer.onMutationUpdate(action);
    });
    __privateGet(this, _mutationCache).notify({
      mutation: this,
      type: "updated",
      action
    });
  });
}, _f);
function getDefaultState() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var MutationCache = (_g = class extends Subscribable {
  constructor(config = {}) {
    super();
    __privateAdd(this, _mutations, void 0);
    __privateAdd(this, _mutationId, void 0);
    __privateAdd(this, _resuming, void 0);
    this.config = config;
    __privateSet(this, _mutations, []);
    __privateSet(this, _mutationId, 0);
  }
  build(client, options, state) {
    const mutation = new Mutation({
      mutationCache: this,
      mutationId: ++__privateWrapper(this, _mutationId)._,
      options: client.defaultMutationOptions(options),
      state
    });
    this.add(mutation);
    return mutation;
  }
  add(mutation) {
    __privateGet(this, _mutations).push(mutation);
    this.notify({ type: "added", mutation });
  }
  remove(mutation) {
    __privateSet(this, _mutations, __privateGet(this, _mutations).filter((x) => x !== mutation));
    this.notify({ type: "removed", mutation });
  }
  clear() {
    notifyManager.batch(() => {
      __privateGet(this, _mutations).forEach((mutation) => {
        this.remove(mutation);
      });
    });
  }
  getAll() {
    return __privateGet(this, _mutations);
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return __privateGet(this, _mutations).find(
      (mutation) => matchMutation(defaultedFilters, mutation)
    );
  }
  findAll(filters = {}) {
    return __privateGet(this, _mutations).filter(
      (mutation) => matchMutation(filters, mutation)
    );
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  resumePausedMutations() {
    __privateSet(this, _resuming, (__privateGet(this, _resuming) ?? Promise.resolve()).then(() => {
      const pausedMutations = __privateGet(this, _mutations).filter((x) => x.state.isPaused);
      return notifyManager.batch(
        () => pausedMutations.reduce(
          (promise, mutation) => promise.then(() => mutation.continue().catch(noop$2)),
          Promise.resolve()
        )
      );
    }).then(() => {
      __privateSet(this, _resuming, void 0);
    }));
    return __privateGet(this, _resuming);
  }
}, _mutations = new WeakMap(), _mutationId = new WeakMap(), _resuming = new WeakMap(), _g);
function infiniteQueryBehavior(pages) {
  return {
    onFetch: (context, query) => {
      const fetchFn = async () => {
        var _a2, _b2, _c2, _d2, _e3;
        const options = context.options;
        const direction = (_c2 = (_b2 = (_a2 = context.fetchOptions) == null ? void 0 : _a2.meta) == null ? void 0 : _b2.fetchMore) == null ? void 0 : _c2.direction;
        const oldPages = ((_d2 = context.state.data) == null ? void 0 : _d2.pages) || [];
        const oldPageParams = ((_e3 = context.state.data) == null ? void 0 : _e3.pageParams) || [];
        const empty = { pages: [], pageParams: [] };
        let cancelled = false;
        const addSignalProperty = (object) => {
          Object.defineProperty(object, "signal", {
            enumerable: true,
            get: () => {
              if (context.signal.aborted) {
                cancelled = true;
              } else {
                context.signal.addEventListener("abort", () => {
                  cancelled = true;
                });
              }
              return context.signal;
            }
          });
        };
        const queryFn = context.options.queryFn && context.options.queryFn !== skipToken ? context.options.queryFn : () => {
          return Promise.reject(
            new Error(`Missing queryFn: '${context.options.queryHash}'`)
          );
        };
        const fetchPage = async (data, param, previous) => {
          if (cancelled) {
            return Promise.reject();
          }
          if (param == null && data.pages.length) {
            return Promise.resolve(data);
          }
          const queryFnContext = {
            queryKey: context.queryKey,
            pageParam: param,
            direction: previous ? "backward" : "forward",
            meta: context.options.meta
          };
          addSignalProperty(queryFnContext);
          const page = await queryFn(
            queryFnContext
          );
          const { maxPages } = context.options;
          const addTo = previous ? addToStart : addToEnd;
          return {
            pages: addTo(data.pages, page, maxPages),
            pageParams: addTo(data.pageParams, param, maxPages)
          };
        };
        let result;
        if (direction && oldPages.length) {
          const previous = direction === "backward";
          const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
          const oldData = {
            pages: oldPages,
            pageParams: oldPageParams
          };
          const param = pageParamFn(options, oldData);
          result = await fetchPage(oldData, param, previous);
        } else {
          result = await fetchPage(
            empty,
            oldPageParams[0] ?? options.initialPageParam
          );
          const remainingPages = pages ?? oldPages.length;
          for (let i = 1; i < remainingPages; i++) {
            const param = getNextPageParam(options, result);
            result = await fetchPage(result, param);
          }
        }
        return result;
      };
      if (context.options.persister) {
        context.fetchFn = () => {
          var _a2, _b2;
          return (_b2 = (_a2 = context.options).persister) == null ? void 0 : _b2.call(
            _a2,
            fetchFn,
            {
              queryKey: context.queryKey,
              meta: context.options.meta,
              signal: context.signal
            },
            query
          );
        };
      } else {
        context.fetchFn = fetchFn;
      }
    }
  };
}
function getNextPageParam(options, { pages, pageParams }) {
  const lastIndex = pages.length - 1;
  return options.getNextPageParam(
    pages[lastIndex],
    pages,
    pageParams[lastIndex],
    pageParams
  );
}
function getPreviousPageParam(options, { pages, pageParams }) {
  var _a2;
  return (_a2 = options.getPreviousPageParam) == null ? void 0 : _a2.call(
    options,
    pages[0],
    pages,
    pageParams[0],
    pageParams
  );
}
function hasNextPage(options, data) {
  if (!data)
    return false;
  return getNextPageParam(options, data) != null;
}
function hasPreviousPage(options, data) {
  if (!data || !options.getPreviousPageParam)
    return false;
  return getPreviousPageParam(options, data) != null;
}
var QueryClient = (_h = class {
  constructor(config = {}) {
    __privateAdd(this, _queryCache, void 0);
    __privateAdd(this, _mutationCache2, void 0);
    __privateAdd(this, _defaultOptions3, void 0);
    __privateAdd(this, _queryDefaults, void 0);
    __privateAdd(this, _mutationDefaults, void 0);
    __privateAdd(this, _mountCount, void 0);
    __privateAdd(this, _unsubscribeFocus, void 0);
    __privateAdd(this, _unsubscribeOnline, void 0);
    __privateSet(this, _queryCache, config.queryCache || new QueryCache());
    __privateSet(this, _mutationCache2, config.mutationCache || new MutationCache());
    __privateSet(this, _defaultOptions3, config.defaultOptions || {});
    __privateSet(this, _queryDefaults, /* @__PURE__ */ new Map());
    __privateSet(this, _mutationDefaults, /* @__PURE__ */ new Map());
    __privateSet(this, _mountCount, 0);
  }
  mount() {
    __privateWrapper(this, _mountCount)._++;
    if (__privateGet(this, _mountCount) !== 1)
      return;
    __privateSet(this, _unsubscribeFocus, focusManager.subscribe(async (focused) => {
      if (focused) {
        await this.resumePausedMutations();
        __privateGet(this, _queryCache).onFocus();
      }
    }));
    __privateSet(this, _unsubscribeOnline, onlineManager.subscribe(async (online) => {
      if (online) {
        await this.resumePausedMutations();
        __privateGet(this, _queryCache).onOnline();
      }
    }));
  }
  unmount() {
    var _a2, _b2;
    __privateWrapper(this, _mountCount)._--;
    if (__privateGet(this, _mountCount) !== 0)
      return;
    (_a2 = __privateGet(this, _unsubscribeFocus)) == null ? void 0 : _a2.call(this);
    __privateSet(this, _unsubscribeFocus, void 0);
    (_b2 = __privateGet(this, _unsubscribeOnline)) == null ? void 0 : _b2.call(this);
    __privateSet(this, _unsubscribeOnline, void 0);
  }
  isFetching(filters) {
    return __privateGet(this, _queryCache).findAll({ ...filters, fetchStatus: "fetching" }).length;
  }
  isMutating(filters) {
    return __privateGet(this, _mutationCache2).findAll({ ...filters, status: "pending" }).length;
  }
  getQueryData(queryKey) {
    var _a2;
    const options = this.defaultQueryOptions({ queryKey });
    return (_a2 = __privateGet(this, _queryCache).get(options.queryHash)) == null ? void 0 : _a2.state.data;
  }
  ensureQueryData(options) {
    const cachedData = this.getQueryData(options.queryKey);
    if (cachedData === void 0)
      return this.fetchQuery(options);
    else {
      const defaultedOptions = this.defaultQueryOptions(options);
      const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
      if (options.revalidateIfStale && query.isStaleByTime(defaultedOptions.staleTime)) {
        void this.prefetchQuery(defaultedOptions);
      }
      return Promise.resolve(cachedData);
    }
  }
  getQueriesData(filters) {
    return __privateGet(this, _queryCache).findAll(filters).map(({ queryKey, state }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }
  setQueryData(queryKey, updater, options) {
    const defaultedOptions = this.defaultQueryOptions({ queryKey });
    const query = __privateGet(this, _queryCache).get(
      defaultedOptions.queryHash
    );
    const prevData = query == null ? void 0 : query.state.data;
    const data = functionalUpdate(updater, prevData);
    if (data === void 0) {
      return void 0;
    }
    return __privateGet(this, _queryCache).build(this, defaultedOptions).setData(data, { ...options, manual: true });
  }
  setQueriesData(filters, updater, options) {
    return notifyManager.batch(
      () => __privateGet(this, _queryCache).findAll(filters).map(({ queryKey }) => [
        queryKey,
        this.setQueryData(queryKey, updater, options)
      ])
    );
  }
  getQueryState(queryKey) {
    var _a2;
    const options = this.defaultQueryOptions({ queryKey });
    return (_a2 = __privateGet(this, _queryCache).get(options.queryHash)) == null ? void 0 : _a2.state;
  }
  removeQueries(filters) {
    const queryCache = __privateGet(this, _queryCache);
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query);
      });
    });
  }
  resetQueries(filters, options) {
    const queryCache = __privateGet(this, _queryCache);
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
  cancelQueries(filters = {}, cancelOptions = {}) {
    const defaultedCancelOptions = { revert: true, ...cancelOptions };
    const promises = notifyManager.batch(
      () => __privateGet(this, _queryCache).findAll(filters).map((query) => query.cancel(defaultedCancelOptions))
    );
    return Promise.all(promises).then(noop$2).catch(noop$2);
  }
  invalidateQueries(filters = {}, options = {}) {
    return notifyManager.batch(() => {
      __privateGet(this, _queryCache).findAll(filters).forEach((query) => {
        query.invalidate();
      });
      if (filters.refetchType === "none") {
        return Promise.resolve();
      }
      const refetchFilters = {
        ...filters,
        type: filters.refetchType ?? filters.type ?? "active"
      };
      return this.refetchQueries(refetchFilters, options);
    });
  }
  refetchQueries(filters = {}, options) {
    const fetchOptions = {
      ...options,
      cancelRefetch: (options == null ? void 0 : options.cancelRefetch) ?? true
    };
    const promises = notifyManager.batch(
      () => __privateGet(this, _queryCache).findAll(filters).filter((query) => !query.isDisabled()).map((query) => {
        let promise = query.fetch(void 0, fetchOptions);
        if (!fetchOptions.throwOnError) {
          promise = promise.catch(noop$2);
        }
        return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
      })
    );
    return Promise.all(promises).then(noop$2);
  }
  fetchQuery(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    if (defaultedOptions.retry === void 0) {
      defaultedOptions.retry = false;
    }
    const query = __privateGet(this, _queryCache).build(this, defaultedOptions);
    return query.isStaleByTime(defaultedOptions.staleTime) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }
  prefetchQuery(options) {
    return this.fetchQuery(options).then(noop$2).catch(noop$2);
  }
  fetchInfiniteQuery(options) {
    options.behavior = infiniteQueryBehavior(options.pages);
    return this.fetchQuery(options);
  }
  prefetchInfiniteQuery(options) {
    return this.fetchInfiniteQuery(options).then(noop$2).catch(noop$2);
  }
  resumePausedMutations() {
    if (onlineManager.isOnline()) {
      return __privateGet(this, _mutationCache2).resumePausedMutations();
    }
    return Promise.resolve();
  }
  getQueryCache() {
    return __privateGet(this, _queryCache);
  }
  getMutationCache() {
    return __privateGet(this, _mutationCache2);
  }
  getDefaultOptions() {
    return __privateGet(this, _defaultOptions3);
  }
  setDefaultOptions(options) {
    __privateSet(this, _defaultOptions3, options);
  }
  setQueryDefaults(queryKey, options) {
    __privateGet(this, _queryDefaults).set(hashKey(queryKey), {
      queryKey,
      defaultOptions: options
    });
  }
  getQueryDefaults(queryKey) {
    const defaults2 = [...__privateGet(this, _queryDefaults).values()];
    let result = {};
    defaults2.forEach((queryDefault) => {
      if (partialMatchKey(queryKey, queryDefault.queryKey)) {
        result = { ...result, ...queryDefault.defaultOptions };
      }
    });
    return result;
  }
  setMutationDefaults(mutationKey, options) {
    __privateGet(this, _mutationDefaults).set(hashKey(mutationKey), {
      mutationKey,
      defaultOptions: options
    });
  }
  getMutationDefaults(mutationKey) {
    const defaults2 = [...__privateGet(this, _mutationDefaults).values()];
    let result = {};
    defaults2.forEach((queryDefault) => {
      if (partialMatchKey(mutationKey, queryDefault.mutationKey)) {
        result = { ...result, ...queryDefault.defaultOptions };
      }
    });
    return result;
  }
  defaultQueryOptions(options) {
    if (options._defaulted) {
      return options;
    }
    const defaultedOptions = {
      ...__privateGet(this, _defaultOptions3).queries,
      ...this.getQueryDefaults(options.queryKey),
      ...options,
      _defaulted: true
    };
    if (!defaultedOptions.queryHash) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(
        defaultedOptions.queryKey,
        defaultedOptions
      );
    }
    if (defaultedOptions.refetchOnReconnect === void 0) {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
    }
    if (defaultedOptions.throwOnError === void 0) {
      defaultedOptions.throwOnError = !!defaultedOptions.suspense;
    }
    if (!defaultedOptions.networkMode && defaultedOptions.persister) {
      defaultedOptions.networkMode = "offlineFirst";
    }
    if (defaultedOptions.enabled !== true && defaultedOptions.queryFn === skipToken) {
      defaultedOptions.enabled = false;
    }
    return defaultedOptions;
  }
  defaultMutationOptions(options) {
    if (options == null ? void 0 : options._defaulted) {
      return options;
    }
    return {
      ...__privateGet(this, _defaultOptions3).mutations,
      ...(options == null ? void 0 : options.mutationKey) && this.getMutationDefaults(options.mutationKey),
      ...options,
      _defaulted: true
    };
  }
  clear() {
    __privateGet(this, _queryCache).clear();
    __privateGet(this, _mutationCache2).clear();
  }
}, _queryCache = new WeakMap(), _mutationCache2 = new WeakMap(), _defaultOptions3 = new WeakMap(), _queryDefaults = new WeakMap(), _mutationDefaults = new WeakMap(), _mountCount = new WeakMap(), _unsubscribeFocus = new WeakMap(), _unsubscribeOnline = new WeakMap(), _h);
var QueryObserver = (_i = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _executeFetch);
    __privateAdd(this, _updateStaleTimeout);
    __privateAdd(this, _computeRefetchInterval);
    __privateAdd(this, _updateRefetchInterval);
    __privateAdd(this, _updateTimers);
    __privateAdd(this, _clearStaleTimeout);
    __privateAdd(this, _clearRefetchInterval);
    __privateAdd(this, _updateQuery);
    __privateAdd(this, _notify);
    __privateAdd(this, _client, void 0);
    __privateAdd(this, _currentQuery, void 0);
    __privateAdd(this, _currentQueryInitialState, void 0);
    __privateAdd(this, _currentResult, void 0);
    __privateAdd(this, _currentResultState, void 0);
    __privateAdd(this, _currentResultOptions, void 0);
    __privateAdd(this, _selectError, void 0);
    __privateAdd(this, _selectFn, void 0);
    __privateAdd(this, _selectResult, void 0);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData, void 0);
    __privateAdd(this, _staleTimeoutId, void 0);
    __privateAdd(this, _refetchIntervalId, void 0);
    __privateAdd(this, _currentRefetchInterval, void 0);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _executeFetch, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _updateTimers, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _clearStaleTimeout, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _clearRefetchInterval, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options, notifyOptions) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean") {
      throw new Error("Expected enabled to be a boolean");
    }
    __privateMethod(this, _updateQuery, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _executeFetch, executeFetch_fn).call(this);
    }
    this.updateResult(notifyOptions);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || this.options.enabled !== prevOptions.enabled || this.options.staleTime !== prevOptions.staleTime)) {
      __privateMethod(this, _updateStaleTimeout, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _computeRefetchInterval, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || this.options.enabled !== prevOptions.enabled || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _updateRefetchInterval, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    const trackedResult = {};
    Object.keys(result).forEach((key) => {
      Object.defineProperty(trackedResult, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          this.trackProp(key);
          onPropTracked == null ? void 0 : onPropTracked(key);
          return result[key];
        }
      });
    });
    return trackedResult;
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    query.isFetchingOptimistic = true;
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _executeFetch, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    if (options.select && newState.data !== void 0) {
      if (prevResult && newState.data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(newState.data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    } else {
      data = newState.data;
    }
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
        if (options.select && placeholderData !== void 0) {
          try {
            placeholderData = options.select(placeholderData);
            __privateSet(this, _selectError, null);
          } catch (selectError) {
            __privateSet(this, _selectError, selectError);
          }
        }
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError2 = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError: isError2,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: newState.dataUpdateCount > 0 || newState.errorUpdateCount > 0,
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError2 && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError2 && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch
    };
    return result;
  }
  updateResult(notifyOptions) {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const defaultNotifyOptions = {};
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    if ((notifyOptions == null ? void 0 : notifyOptions.listeners) !== false && shouldNotifyListeners()) {
      defaultNotifyOptions.listeners = true;
    }
    __privateMethod(this, _notify, notify_fn).call(this, { ...defaultNotifyOptions, ...notifyOptions });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _updateTimers, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _executeFetch = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _updateQuery, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop$2);
  }
  return promise;
}, _updateStaleTimeout = new WeakSet(), updateStaleTimeout_fn = function() {
  __privateMethod(this, _clearStaleTimeout, clearStaleTimeout_fn).call(this);
  if (isServer || __privateGet(this, _currentResult).isStale || !isValidTimeout(this.options.staleTime)) {
    return;
  }
  const time = timeUntilStale(
    __privateGet(this, _currentResult).dataUpdatedAt,
    this.options.staleTime
  );
  const timeout = time + 1;
  __privateSet(this, _staleTimeoutId, setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout));
}, _computeRefetchInterval = new WeakSet(), computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, _updateRefetchInterval = new WeakSet(), updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _clearRefetchInterval, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (isServer || this.options.enabled === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _executeFetch, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, _updateTimers = new WeakSet(), updateTimers_fn = function() {
  __privateMethod(this, _updateStaleTimeout, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _updateRefetchInterval, updateRefetchInterval_fn).call(this, __privateMethod(this, _computeRefetchInterval, computeRefetchInterval_fn).call(this));
}, _clearStaleTimeout = new WeakSet(), clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, _clearRefetchInterval = new WeakSet(), clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, _updateQuery = new WeakSet(), updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, _notify = new WeakSet(), notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _i);
function shouldLoadOnMount(query, options) {
  return options.enabled !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (options.enabled !== false) {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || prevOptions.enabled === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return options.enabled !== false && query.isStaleByTime(options.staleTime);
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var InfiniteQueryObserver = class extends QueryObserver {
  constructor(client, options) {
    super(client, options);
  }
  bindMethods() {
    super.bindMethods();
    this.fetchNextPage = this.fetchNextPage.bind(this);
    this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
  }
  setOptions(options, notifyOptions) {
    super.setOptions(
      {
        ...options,
        behavior: infiniteQueryBehavior()
      },
      notifyOptions
    );
  }
  getOptimisticResult(options) {
    options.behavior = infiniteQueryBehavior();
    return super.getOptimisticResult(options);
  }
  fetchNextPage(options) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: { direction: "forward" }
      }
    });
  }
  fetchPreviousPage(options) {
    return this.fetch({
      ...options,
      meta: {
        fetchMore: { direction: "backward" }
      }
    });
  }
  createResult(query, options) {
    var _a2, _b2, _c2, _d2;
    const { state } = query;
    const result = super.createResult(query, options);
    const { isFetching, isRefetching } = result;
    const isFetchingNextPage = isFetching && ((_b2 = (_a2 = state.fetchMeta) == null ? void 0 : _a2.fetchMore) == null ? void 0 : _b2.direction) === "forward";
    const isFetchingPreviousPage = isFetching && ((_d2 = (_c2 = state.fetchMeta) == null ? void 0 : _c2.fetchMore) == null ? void 0 : _d2.direction) === "backward";
    return {
      ...result,
      fetchNextPage: this.fetchNextPage,
      fetchPreviousPage: this.fetchPreviousPage,
      hasNextPage: hasNextPage(options, state.data),
      hasPreviousPage: hasPreviousPage(options, state.data),
      isFetchingNextPage,
      isFetchingPreviousPage,
      isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
    };
  }
};
var MutationObserver = (_j = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _updateResult);
    __privateAdd(this, _notify2);
    __privateAdd(this, _client2, void 0);
    __privateAdd(this, _currentResult2, void 0);
    __privateAdd(this, _currentMutation, void 0);
    __privateAdd(this, _mutateOptions, void 0);
    __privateSet(this, _client2, client);
    this.setOptions(options);
    this.bindMethods();
    __privateMethod(this, _updateResult, updateResult_fn).call(this);
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    var _a2;
    const prevOptions = this.options;
    this.options = __privateGet(this, _client2).defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client2).getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: __privateGet(this, _currentMutation),
        observer: this
      });
    }
    if ((prevOptions == null ? void 0 : prevOptions.mutationKey) && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state.status) === "pending") {
      __privateGet(this, _currentMutation).setOptions(this.options);
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    __privateMethod(this, _updateResult, updateResult_fn).call(this);
    __privateMethod(this, _notify2, notify_fn2).call(this, action);
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult2);
  }
  reset() {
    var _a2;
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, void 0);
    __privateMethod(this, _updateResult, updateResult_fn).call(this);
    __privateMethod(this, _notify2, notify_fn2).call(this);
  }
  mutate(variables, options) {
    var _a2;
    __privateSet(this, _mutateOptions, options);
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, __privateGet(this, _client2).getMutationCache().build(__privateGet(this, _client2), this.options));
    __privateGet(this, _currentMutation).addObserver(this);
    return __privateGet(this, _currentMutation).execute(variables);
  }
}, _client2 = new WeakMap(), _currentResult2 = new WeakMap(), _currentMutation = new WeakMap(), _mutateOptions = new WeakMap(), _updateResult = new WeakSet(), updateResult_fn = function() {
  var _a2;
  const state = ((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state) ?? getDefaultState();
  __privateSet(this, _currentResult2, {
    ...state,
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    mutate: this.mutate,
    reset: this.reset
  });
}, _notify2 = new WeakSet(), notify_fn2 = function(action) {
  notifyManager.batch(() => {
    var _a2, _b2, _c2, _d2, _e3, _f2, _g2, _h2;
    if (__privateGet(this, _mutateOptions) && this.hasListeners()) {
      const variables = __privateGet(this, _currentResult2).variables;
      const context = __privateGet(this, _currentResult2).context;
      if ((action == null ? void 0 : action.type) === "success") {
        (_b2 = (_a2 = __privateGet(this, _mutateOptions)).onSuccess) == null ? void 0 : _b2.call(_a2, action.data, variables, context);
        (_d2 = (_c2 = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _d2.call(_c2, action.data, null, variables, context);
      } else if ((action == null ? void 0 : action.type) === "error") {
        (_f2 = (_e3 = __privateGet(this, _mutateOptions)).onError) == null ? void 0 : _f2.call(_e3, action.error, variables, context);
        (_h2 = (_g2 = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _h2.call(
          _g2,
          void 0,
          action.error,
          variables,
          context
        );
      }
    }
    this.listeners.forEach((listener) => {
      listener(__privateGet(this, _currentResult2));
    });
  });
}, _j);
var QueryClientContext = reactExports.createContext(
  void 0
);
var useQueryClient = (queryClient) => {
  const client = reactExports.useContext(QueryClientContext);
  if (queryClient) {
    return queryClient;
  }
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }
  return client;
};
var QueryClientProvider = ({
  client,
  children
}) => {
  reactExports.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientContext.Provider, { value: client, children });
};
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
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
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
function shouldThrowError(throwError, params) {
  if (typeof throwError === "function") {
    return throwError(...params);
  }
  return !!throwError;
}
function noop$1() {
}
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary) => {
  if (options.suspense || options.throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && shouldThrowError(throwOnError, [result.error, query]);
};
var ensureStaleTime = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    if (typeof defaultedOptions.staleTime !== "number") {
      defaultedOptions.staleTime = 1e3;
    }
  }
};
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  const client = useQueryClient(queryClient);
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedOptions = client.defaultQueryOptions(options);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureStaleTime(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary);
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = isRestoring ? () => void 0 : observer.subscribe(notifyManager.batchCalls(onStoreChange));
        observer.updateResult();
        return unsubscribe;
      },
      [observer, isRestoring]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions, { listeners: false });
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query: client.getQueryCache().get(defaultedOptions.queryHash)
  })) {
    throw result.error;
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver, queryClient);
}
function useMutation(options, queryClient) {
  const client = useQueryClient(queryClient);
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop$1);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
function useInfiniteQuery(options, queryClient) {
  return useBaseQuery(
    options,
    InfiniteQueryObserver,
    queryClient
  );
}
const global = globalThis || void 0 || self;
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
  } catch (e) {
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
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
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
  var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
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
  if (iteratee) {
    values = arrayMap(values, baseUnary(iteratee));
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
      var value = array[index], computed = iteratee == null ? value : iteratee(value);
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
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
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
  } catch (e) {
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
const baseSetToString$1 = baseSetToString;
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
var setToString = shortOut(baseSetToString$1);
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
  return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), void 0, comparator) : [];
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
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), void 0, comparator);
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
  for (var j2 = 0; j2 < b.length; j2 += 1) {
    arr[j2 + a.length] = b[j2];
  }
  return arr;
};
var slicy = function slicy2(arrLike, offset) {
  var arr = [];
  for (var i = offset || 0, j2 = 0; i < arrLike.length; i += 1, j2 += 1) {
    arr[j2] = arrLike[i];
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
  } catch (e) {
  }
};
var $gOPD$1 = Object.getOwnPropertyDescriptor;
if ($gOPD$1) {
  try {
    $gOPD$1({}, "");
  } catch (e) {
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
  } catch (e) {
    var errorProto = getProto(getProto(e));
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
  if (hasRequiredEsDefineProperty)
    return esDefineProperty;
  hasRequiredEsDefineProperty = 1;
  var GetIntrinsic3 = getIntrinsic;
  var $defineProperty2 = GetIntrinsic3("%Object.defineProperty%", true) || false;
  if ($defineProperty2) {
    try {
      $defineProperty2({}, "a", { value: 1 });
    } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
const path = {};
const __viteBrowserExternal = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: path
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
var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O2) {
  return O2.__proto__;
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
    var xs2 = arrObjKeys(obj, inspect2);
    if (indent && !singleLineValues(xs2)) {
      return "[" + indentedJoin(xs2, indent) + "]";
    }
    return "[ " + $join.call(xs2, ", ") + " ]";
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
  if (obj === commonjsGlobal) {
    return "{ [object globalThis] }";
  }
  if (!isDate(obj) && !isRegExp$1(obj)) {
    var ys2 = arrObjKeys(obj, inspect2);
    var isPlainObject2 = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
    var protoTag = obj instanceof Object ? "" : "null prototype";
    var stringTag2 = !isPlainObject2 && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
    var constructorTag = isPlainObject2 || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
    var tag = constructorTag + (stringTag2 || protoTag ? "[" + $join.call($concat.call([], stringTag2 || [], protoTag || []), ": ") + "] " : "");
    if (ys2.length === 0) {
      return tag + "{}";
    }
    if (indent) {
      return tag + "{" + indentedJoin(ys2, indent) + "}";
    }
    return tag + "{ " + $join.call(ys2, ", ") + " }";
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
  } catch (e) {
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
  } catch (e) {
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
  var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
  if (m) {
    return m[1];
  }
  return null;
}
function indexOf(xs2, x) {
  if (xs2.indexOf) {
    return xs2.indexOf(x);
  }
  for (var i = 0, l = xs2.length; i < l; i++) {
    if (xs2[i] === x) {
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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
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
    } catch (m) {
      return true;
    }
    return x instanceof Set;
  } catch (e) {
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
  } catch (e) {
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
  var n = c.charCodeAt(0);
  var x = {
    8: "b",
    9: "t",
    10: "n",
    12: "f",
    13: "r"
  }[n];
  if (x) {
    return "\\" + x;
  }
  return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
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
function singleLineValues(xs2) {
  for (var i = 0; i < xs2.length; i++) {
    if (indexOf(xs2[i], "\n") >= 0) {
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
function indentedJoin(xs2, indent) {
  if (xs2.length === 0) {
    return "";
  }
  var lineJoiner = "\n" + indent.prev + indent.base;
  return lineJoiner + $join.call(xs2, "," + lineJoiner) + "\n" + indent.prev;
}
function arrObjKeys(obj, inspect2) {
  var isArr = isArray$3(obj);
  var xs2 = [];
  if (isArr) {
    xs2.length = obj.length;
    for (var i = 0; i < obj.length; i++) {
      xs2[i] = has$3(obj, i) ? inspect2(obj[i], obj) : "";
    }
  }
  var syms = typeof gOPS === "function" ? gOPS(obj) : [];
  var symMap;
  if (hasShammedSymbols) {
    symMap = {};
    for (var k = 0; k < syms.length; k++) {
      symMap["$" + syms[k]] = syms[k];
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
      xs2.push(inspect2(key, obj) + ": " + inspect2(obj[key], obj));
    } else {
      xs2.push(key + ": " + inspect2(obj[key], obj));
    }
  }
  if (typeof gOPS === "function") {
    for (var j2 = 0; j2 < syms.length; j2++) {
      if (isEnumerable.call(obj, syms[j2])) {
        xs2.push("[" + inspect2(syms[j2]) + "]: " + inspect2(obj[syms[j2]], obj));
      }
    }
  }
  return xs2;
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
      for (var j2 = 0; j2 < obj.length; ++j2) {
        if (typeof obj[j2] !== "undefined") {
          compacted.push(obj[j2]);
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
  } catch (e) {
    return strWithoutPlus;
  }
};
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
  for (var i = 0; i < string.length; ++i) {
    var c = string.charCodeAt(i);
    if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats$2.RFC1738 && (c === 40 || c === 41)) {
      out += string.charAt(i);
      continue;
    }
    if (c < 128) {
      out = out + hexTable[c];
      continue;
    }
    if (c < 2048) {
      out = out + (hexTable[192 | c >> 6] + hexTable[128 | c & 63]);
      continue;
    }
    if (c < 55296 || c >= 57344) {
      out = out + (hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63]);
      continue;
    }
    i += 1;
    c = 65536 + ((c & 1023) << 10 | string.charCodeAt(i) & 1023);
    out += hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
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
    for (var j2 = 0; j2 < keys2.length; ++j2) {
      var key = keys2[j2];
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
  for (var j2 = 0; j2 < objKeys.length; ++j2) {
    var key = objKeys[j2];
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
  decodeDotInKeys: true,
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
  var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
  var parts = cleanStr.split(options.delimiter, limit);
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
      obj = options.allowEmptyArrays && leaf === "" ? [] : [].concat(leaf);
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
const ts = /* @__PURE__ */ getDefaultExportFromCjs(lib);
function warnOnce(condition, ...rest) {
}
var warnOnce_1 = warnOnce;
const Ru = /* @__PURE__ */ getDefaultExportFromCjs(warnOnce_1);
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
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
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
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
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
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
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
        if (rule[0].test(word))
          return replace2(word, rule);
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
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
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
const Go = /* @__PURE__ */ getDefaultExportFromCjs(pluralizeExports);
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
var COMPARE_PARTIAL_FLAG$5 = 1, COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : void 0;
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
const Uint8Array$2 = Uint8Array$1;
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
var COMPARE_PARTIAL_FLAG$4 = 1, COMPARE_UNORDERED_FLAG$2 = 2;
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
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$2(object), new Uint8Array$2(other))) {
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
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
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
const getSymbols$1 = getSymbols;
function stubFalse() {
  return false;
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer2 = moduleExports$1 ? root.Buffer : void 0;
var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
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
  } catch (e) {
  }
}();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray$4(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer2(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$3.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
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
  return baseGetAllKeys(object, keys, getSymbols$1);
}
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
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
const getTag$1 = getTag;
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$4(object), othIsArr = isArray$4(other), objTag = objIsArr ? arrayTag : getTag$1(object), othTag = othIsArr ? arrayTag : getTag$1(other);
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
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
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
  !function(e, t) {
    module2.exports = t();
  }(commonjsGlobal, function s() {
    var f = "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== f ? f : {};
    var n = !f.document && !!f.postMessage, o2 = f.IS_PAPA_WORKER || false, a = {}, u = 0, b = { parse: function(e, t) {
      var r2 = (t = t || {}).dynamicTyping || false;
      J2(r2) && (t.dynamicTypingFunction = r2, r2 = {});
      if (t.dynamicTyping = r2, t.transform = !!J2(t.transform) && t.transform, t.worker && b.WORKERS_SUPPORTED) {
        var i = function() {
          if (!b.WORKERS_SUPPORTED)
            return false;
          var e2 = (r3 = f.URL || f.webkitURL || null, i2 = s.toString(), b.BLOB_URL || (b.BLOB_URL = r3.createObjectURL(new Blob(["var global = (function() { if (typeof self !== 'undefined') { return self; } if (typeof window !== 'undefined') { return window; } if (typeof global !== 'undefined') { return global; } return {}; })(); global.IS_PAPA_WORKER=true; ", "(", i2, ")();"], { type: "text/javascript" })))), t2 = new f.Worker(e2);
          var r3, i2;
          return t2.onmessage = _, t2.id = u++, a[t2.id] = t2;
        }();
        return i.userStep = t.step, i.userChunk = t.chunk, i.userComplete = t.complete, i.userError = t.error, t.step = J2(t.step), t.chunk = J2(t.chunk), t.complete = J2(t.complete), t.error = J2(t.error), delete t.worker, void i.postMessage({ input: e, config: t, workerId: i.id });
      }
      var n2 = null;
      b.NODE_STREAM_INPUT, "string" == typeof e ? (e = function(e2) {
        if (65279 === e2.charCodeAt(0))
          return e2.slice(1);
        return e2;
      }(e), n2 = t.download ? new l(t) : new p(t)) : true === e.readable && J2(e.read) && J2(e.on) ? n2 = new g(t) : (f.File && e instanceof File || e instanceof Object) && (n2 = new c(t));
      return n2.stream(e);
    }, unparse: function(e, t) {
      var n2 = false, _2 = true, m2 = ",", y2 = "\r\n", s2 = '"', a2 = s2 + s2, r2 = false, i = null, o3 = false;
      !function() {
        if ("object" != typeof t)
          return;
        "string" != typeof t.delimiter || b.BAD_DELIMITERS.filter(function(e2) {
          return -1 !== t.delimiter.indexOf(e2);
        }).length || (m2 = t.delimiter);
        ("boolean" == typeof t.quotes || "function" == typeof t.quotes || Array.isArray(t.quotes)) && (n2 = t.quotes);
        "boolean" != typeof t.skipEmptyLines && "string" != typeof t.skipEmptyLines || (r2 = t.skipEmptyLines);
        "string" == typeof t.newline && (y2 = t.newline);
        "string" == typeof t.quoteChar && (s2 = t.quoteChar);
        "boolean" == typeof t.header && (_2 = t.header);
        if (Array.isArray(t.columns)) {
          if (0 === t.columns.length)
            throw new Error("Option columns is empty");
          i = t.columns;
        }
        void 0 !== t.escapeChar && (a2 = t.escapeChar + s2);
        ("boolean" == typeof t.escapeFormulae || t.escapeFormulae instanceof RegExp) && (o3 = t.escapeFormulae instanceof RegExp ? t.escapeFormulae : /^[=+\-@\t\r].*$/);
      }();
      var u2 = new RegExp(Q(s2), "g");
      "string" == typeof e && (e = JSON.parse(e));
      if (Array.isArray(e)) {
        if (!e.length || Array.isArray(e[0]))
          return h2(null, e, r2);
        if ("object" == typeof e[0])
          return h2(i || Object.keys(e[0]), e, r2);
      } else if ("object" == typeof e)
        return "string" == typeof e.data && (e.data = JSON.parse(e.data)), Array.isArray(e.data) && (e.fields || (e.fields = e.meta && e.meta.fields || i), e.fields || (e.fields = Array.isArray(e.data[0]) ? e.fields : "object" == typeof e.data[0] ? Object.keys(e.data[0]) : []), Array.isArray(e.data[0]) || "object" == typeof e.data[0] || (e.data = [e.data])), h2(e.fields || [], e.data || [], r2);
      throw new Error("Unable to serialize unrecognized input");
      function h2(e2, t2, r3) {
        var i2 = "";
        "string" == typeof e2 && (e2 = JSON.parse(e2)), "string" == typeof t2 && (t2 = JSON.parse(t2));
        var n3 = Array.isArray(e2) && 0 < e2.length, s3 = !Array.isArray(t2[0]);
        if (n3 && _2) {
          for (var a3 = 0; a3 < e2.length; a3++)
            0 < a3 && (i2 += m2), i2 += v2(e2[a3], a3);
          0 < t2.length && (i2 += y2);
        }
        for (var o4 = 0; o4 < t2.length; o4++) {
          var u3 = n3 ? e2.length : t2[o4].length, h3 = false, f2 = n3 ? 0 === Object.keys(t2[o4]).length : 0 === t2[o4].length;
          if (r3 && !n3 && (h3 = "greedy" === r3 ? "" === t2[o4].join("").trim() : 1 === t2[o4].length && 0 === t2[o4][0].length), "greedy" === r3 && n3) {
            for (var d2 = [], l2 = 0; l2 < u3; l2++) {
              var c2 = s3 ? e2[l2] : l2;
              d2.push(t2[o4][c2]);
            }
            h3 = "" === d2.join("").trim();
          }
          if (!h3) {
            for (var p2 = 0; p2 < u3; p2++) {
              0 < p2 && !f2 && (i2 += m2);
              var g2 = n3 && s3 ? e2[p2] : p2;
              i2 += v2(t2[o4][g2], p2);
            }
            o4 < t2.length - 1 && (!r3 || 0 < u3 && !f2) && (i2 += y2);
          }
        }
        return i2;
      }
      function v2(e2, t2) {
        if (null == e2)
          return "";
        if (e2.constructor === Date)
          return JSON.stringify(e2).slice(1, 25);
        var r3 = false;
        o3 && "string" == typeof e2 && o3.test(e2) && (e2 = "'" + e2, r3 = true);
        var i2 = e2.toString().replace(u2, a2);
        return (r3 = r3 || true === n2 || "function" == typeof n2 && n2(e2, t2) || Array.isArray(n2) && n2[t2] || function(e3, t3) {
          for (var r4 = 0; r4 < t3.length; r4++)
            if (-1 < e3.indexOf(t3[r4]))
              return true;
          return false;
        }(i2, b.BAD_DELIMITERS) || -1 < i2.indexOf(m2) || " " === i2.charAt(0) || " " === i2.charAt(i2.length - 1)) ? s2 + i2 + s2 : i2;
      }
    } };
    if (b.RECORD_SEP = String.fromCharCode(30), b.UNIT_SEP = String.fromCharCode(31), b.BYTE_ORDER_MARK = "\uFEFF", b.BAD_DELIMITERS = ["\r", "\n", '"', b.BYTE_ORDER_MARK], b.WORKERS_SUPPORTED = !n && !!f.Worker, b.NODE_STREAM_INPUT = 1, b.LocalChunkSize = 10485760, b.RemoteChunkSize = 5242880, b.DefaultDelimiter = ",", b.Parser = E, b.ParserHandle = r, b.NetworkStreamer = l, b.FileStreamer = c, b.StringStreamer = p, b.ReadableStreamStreamer = g, f.jQuery) {
      var d = f.jQuery;
      d.fn.parse = function(o3) {
        var r2 = o3.config || {}, u2 = [];
        return this.each(function(e2) {
          if (!("INPUT" === d(this).prop("tagName").toUpperCase() && "file" === d(this).attr("type").toLowerCase() && f.FileReader) || !this.files || 0 === this.files.length)
            return true;
          for (var t = 0; t < this.files.length; t++)
            u2.push({ file: this.files[t], inputElem: this, instanceConfig: d.extend({}, r2) });
        }), e(), this;
        function e() {
          if (0 !== u2.length) {
            var e2, t, r3, i, n2 = u2[0];
            if (J2(o3.before)) {
              var s2 = o3.before(n2.file, n2.inputElem);
              if ("object" == typeof s2) {
                if ("abort" === s2.action)
                  return e2 = "AbortError", t = n2.file, r3 = n2.inputElem, i = s2.reason, void (J2(o3.error) && o3.error({ name: e2 }, t, r3, i));
                if ("skip" === s2.action)
                  return void h2();
                "object" == typeof s2.config && (n2.instanceConfig = d.extend(n2.instanceConfig, s2.config));
              } else if ("skip" === s2)
                return void h2();
            }
            var a2 = n2.instanceConfig.complete;
            n2.instanceConfig.complete = function(e3) {
              J2(a2) && a2(e3, n2.file, n2.inputElem), h2();
            }, b.parse(n2.file, n2.instanceConfig);
          } else
            J2(o3.complete) && o3.complete();
        }
        function h2() {
          u2.splice(0, 1), e();
        }
      };
    }
    function h(e) {
      this._handle = null, this._finished = false, this._completed = false, this._halted = false, this._input = null, this._baseIndex = 0, this._partialLine = "", this._rowCount = 0, this._start = 0, this._nextChunk = null, this.isFirstChunk = true, this._completeResults = { data: [], errors: [], meta: {} }, (function(e2) {
        var t = w(e2);
        t.chunkSize = parseInt(t.chunkSize), e2.step || e2.chunk || (t.chunkSize = null);
        this._handle = new r(t), (this._handle.streamer = this)._config = t;
      }).call(this, e), this.parseChunk = function(e2, t) {
        if (this.isFirstChunk && J2(this._config.beforeFirstChunk)) {
          var r2 = this._config.beforeFirstChunk(e2);
          void 0 !== r2 && (e2 = r2);
        }
        this.isFirstChunk = false, this._halted = false;
        var i = this._partialLine + e2;
        this._partialLine = "";
        var n2 = this._handle.parse(i, this._baseIndex, !this._finished);
        if (!this._handle.paused() && !this._handle.aborted()) {
          var s2 = n2.meta.cursor;
          this._finished || (this._partialLine = i.substring(s2 - this._baseIndex), this._baseIndex = s2), n2 && n2.data && (this._rowCount += n2.data.length);
          var a2 = this._finished || this._config.preview && this._rowCount >= this._config.preview;
          if (o2)
            f.postMessage({ results: n2, workerId: b.WORKER_ID, finished: a2 });
          else if (J2(this._config.chunk) && !t) {
            if (this._config.chunk(n2, this._handle), this._handle.paused() || this._handle.aborted())
              return void (this._halted = true);
            n2 = void 0, this._completeResults = void 0;
          }
          return this._config.step || this._config.chunk || (this._completeResults.data = this._completeResults.data.concat(n2.data), this._completeResults.errors = this._completeResults.errors.concat(n2.errors), this._completeResults.meta = n2.meta), this._completed || !a2 || !J2(this._config.complete) || n2 && n2.meta.aborted || (this._config.complete(this._completeResults, this._input), this._completed = true), a2 || n2 && n2.meta.paused || this._nextChunk(), n2;
        }
        this._halted = true;
      }, this._sendError = function(e2) {
        J2(this._config.error) ? this._config.error(e2) : o2 && this._config.error && f.postMessage({ workerId: b.WORKER_ID, error: e2, finished: false });
      };
    }
    function l(e) {
      var i;
      (e = e || {}).chunkSize || (e.chunkSize = b.RemoteChunkSize), h.call(this, e), this._nextChunk = n ? function() {
        this._readChunk(), this._chunkLoaded();
      } : function() {
        this._readChunk();
      }, this.stream = function(e2) {
        this._input = e2, this._nextChunk();
      }, this._readChunk = function() {
        if (this._finished)
          this._chunkLoaded();
        else {
          if (i = new XMLHttpRequest(), this._config.withCredentials && (i.withCredentials = this._config.withCredentials), n || (i.onload = v(this._chunkLoaded, this), i.onerror = v(this._chunkError, this)), i.open(this._config.downloadRequestBody ? "POST" : "GET", this._input, !n), this._config.downloadRequestHeaders) {
            var e2 = this._config.downloadRequestHeaders;
            for (var t in e2)
              i.setRequestHeader(t, e2[t]);
          }
          if (this._config.chunkSize) {
            var r2 = this._start + this._config.chunkSize - 1;
            i.setRequestHeader("Range", "bytes=" + this._start + "-" + r2);
          }
          try {
            i.send(this._config.downloadRequestBody);
          } catch (e3) {
            this._chunkError(e3.message);
          }
          n && 0 === i.status && this._chunkError();
        }
      }, this._chunkLoaded = function() {
        4 === i.readyState && (i.status < 200 || 400 <= i.status ? this._chunkError() : (this._start += this._config.chunkSize ? this._config.chunkSize : i.responseText.length, this._finished = !this._config.chunkSize || this._start >= function(e2) {
          var t = e2.getResponseHeader("Content-Range");
          if (null === t)
            return -1;
          return parseInt(t.substring(t.lastIndexOf("/") + 1));
        }(i), this.parseChunk(i.responseText)));
      }, this._chunkError = function(e2) {
        var t = i.statusText || e2;
        this._sendError(new Error(t));
      };
    }
    function c(e) {
      var i, n2;
      (e = e || {}).chunkSize || (e.chunkSize = b.LocalChunkSize), h.call(this, e);
      var s2 = "undefined" != typeof FileReader;
      this.stream = function(e2) {
        this._input = e2, n2 = e2.slice || e2.webkitSlice || e2.mozSlice, s2 ? ((i = new FileReader()).onload = v(this._chunkLoaded, this), i.onerror = v(this._chunkError, this)) : i = new FileReaderSync(), this._nextChunk();
      }, this._nextChunk = function() {
        this._finished || this._config.preview && !(this._rowCount < this._config.preview) || this._readChunk();
      }, this._readChunk = function() {
        var e2 = this._input;
        if (this._config.chunkSize) {
          var t = Math.min(this._start + this._config.chunkSize, this._input.size);
          e2 = n2.call(e2, this._start, t);
        }
        var r2 = i.readAsText(e2, this._config.encoding);
        s2 || this._chunkLoaded({ target: { result: r2 } });
      }, this._chunkLoaded = function(e2) {
        this._start += this._config.chunkSize, this._finished = !this._config.chunkSize || this._start >= this._input.size, this.parseChunk(e2.target.result);
      }, this._chunkError = function() {
        this._sendError(i.error);
      };
    }
    function p(e) {
      var r2;
      h.call(this, e = e || {}), this.stream = function(e2) {
        return r2 = e2, this._nextChunk();
      }, this._nextChunk = function() {
        if (!this._finished) {
          var e2, t = this._config.chunkSize;
          return t ? (e2 = r2.substring(0, t), r2 = r2.substring(t)) : (e2 = r2, r2 = ""), this._finished = !r2, this.parseChunk(e2);
        }
      };
    }
    function g(e) {
      h.call(this, e = e || {});
      var t = [], r2 = true, i = false;
      this.pause = function() {
        h.prototype.pause.apply(this, arguments), this._input.pause();
      }, this.resume = function() {
        h.prototype.resume.apply(this, arguments), this._input.resume();
      }, this.stream = function(e2) {
        this._input = e2, this._input.on("data", this._streamData), this._input.on("end", this._streamEnd), this._input.on("error", this._streamError);
      }, this._checkIsFinished = function() {
        i && 1 === t.length && (this._finished = true);
      }, this._nextChunk = function() {
        this._checkIsFinished(), t.length ? this.parseChunk(t.shift()) : r2 = true;
      }, this._streamData = v(function(e2) {
        try {
          t.push("string" == typeof e2 ? e2 : e2.toString(this._config.encoding)), r2 && (r2 = false, this._checkIsFinished(), this.parseChunk(t.shift()));
        } catch (e3) {
          this._streamError(e3);
        }
      }, this), this._streamError = v(function(e2) {
        this._streamCleanUp(), this._sendError(e2);
      }, this), this._streamEnd = v(function() {
        this._streamCleanUp(), i = true, this._streamData("");
      }, this), this._streamCleanUp = v(function() {
        this._input.removeListener("data", this._streamData), this._input.removeListener("end", this._streamEnd), this._input.removeListener("error", this._streamError);
      }, this);
    }
    function r(m2) {
      var a2, o3, u2, i = Math.pow(2, 53), n2 = -i, s2 = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/, h2 = /^((\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)))$/, t = this, r2 = 0, f2 = 0, d2 = false, e = false, l2 = [], c2 = { data: [], errors: [], meta: {} };
      if (J2(m2.step)) {
        var p2 = m2.step;
        m2.step = function(e2) {
          if (c2 = e2, _2())
            g2();
          else {
            if (g2(), 0 === c2.data.length)
              return;
            r2 += e2.data.length, m2.preview && r2 > m2.preview ? o3.abort() : (c2.data = c2.data[0], p2(c2, t));
          }
        };
      }
      function y2(e2) {
        return "greedy" === m2.skipEmptyLines ? "" === e2.join("").trim() : 1 === e2.length && 0 === e2[0].length;
      }
      function g2() {
        return c2 && u2 && (k("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to '" + b.DefaultDelimiter + "'"), u2 = false), m2.skipEmptyLines && (c2.data = c2.data.filter(function(e2) {
          return !y2(e2);
        })), _2() && function() {
          if (!c2)
            return;
          function e2(e3, t3) {
            J2(m2.transformHeader) && (e3 = m2.transformHeader(e3, t3)), l2.push(e3);
          }
          if (Array.isArray(c2.data[0])) {
            for (var t2 = 0; _2() && t2 < c2.data.length; t2++)
              c2.data[t2].forEach(e2);
            c2.data.splice(0, 1);
          } else
            c2.data.forEach(e2);
        }(), function() {
          if (!c2 || !m2.header && !m2.dynamicTyping && !m2.transform)
            return c2;
          function e2(e3, t3) {
            var r3, i2 = m2.header ? {} : [];
            for (r3 = 0; r3 < e3.length; r3++) {
              var n3 = r3, s3 = e3[r3];
              m2.header && (n3 = r3 >= l2.length ? "__parsed_extra" : l2[r3]), m2.transform && (s3 = m2.transform(s3, n3)), s3 = v2(n3, s3), "__parsed_extra" === n3 ? (i2[n3] = i2[n3] || [], i2[n3].push(s3)) : i2[n3] = s3;
            }
            return m2.header && (r3 > l2.length ? k("FieldMismatch", "TooManyFields", "Too many fields: expected " + l2.length + " fields but parsed " + r3, f2 + t3) : r3 < l2.length && k("FieldMismatch", "TooFewFields", "Too few fields: expected " + l2.length + " fields but parsed " + r3, f2 + t3)), i2;
          }
          var t2 = 1;
          !c2.data.length || Array.isArray(c2.data[0]) ? (c2.data = c2.data.map(e2), t2 = c2.data.length) : c2.data = e2(c2.data, 0);
          m2.header && c2.meta && (c2.meta.fields = l2);
          return f2 += t2, c2;
        }();
      }
      function _2() {
        return m2.header && 0 === l2.length;
      }
      function v2(e2, t2) {
        return r3 = e2, m2.dynamicTypingFunction && void 0 === m2.dynamicTyping[r3] && (m2.dynamicTyping[r3] = m2.dynamicTypingFunction(r3)), true === (m2.dynamicTyping[r3] || m2.dynamicTyping) ? "true" === t2 || "TRUE" === t2 || "false" !== t2 && "FALSE" !== t2 && (function(e3) {
          if (s2.test(e3)) {
            var t3 = parseFloat(e3);
            if (n2 < t3 && t3 < i)
              return true;
          }
          return false;
        }(t2) ? parseFloat(t2) : h2.test(t2) ? new Date(t2) : "" === t2 ? null : t2) : t2;
        var r3;
      }
      function k(e2, t2, r3, i2) {
        var n3 = { type: e2, code: t2, message: r3 };
        void 0 !== i2 && (n3.row = i2), c2.errors.push(n3);
      }
      this.parse = function(e2, t2, r3) {
        var i2 = m2.quoteChar || '"';
        if (m2.newline || (m2.newline = function(e3, t3) {
          e3 = e3.substring(0, 1048576);
          var r4 = new RegExp(Q(t3) + "([^]*?)" + Q(t3), "gm"), i3 = (e3 = e3.replace(r4, "")).split("\r"), n4 = e3.split("\n"), s4 = 1 < n4.length && n4[0].length < i3[0].length;
          if (1 === i3.length || s4)
            return "\n";
          for (var a3 = 0, o4 = 0; o4 < i3.length; o4++)
            "\n" === i3[o4][0] && a3++;
          return a3 >= i3.length / 2 ? "\r\n" : "\r";
        }(e2, i2)), u2 = false, m2.delimiter)
          J2(m2.delimiter) && (m2.delimiter = m2.delimiter(e2), c2.meta.delimiter = m2.delimiter);
        else {
          var n3 = function(e3, t3, r4, i3, n4) {
            var s4, a3, o4, u3;
            n4 = n4 || [",", "	", "|", ";", b.RECORD_SEP, b.UNIT_SEP];
            for (var h3 = 0; h3 < n4.length; h3++) {
              var f3 = n4[h3], d3 = 0, l3 = 0, c3 = 0;
              o4 = void 0;
              for (var p3 = new E({ comments: i3, delimiter: f3, newline: t3, preview: 10 }).parse(e3), g3 = 0; g3 < p3.data.length; g3++)
                if (r4 && y2(p3.data[g3]))
                  c3++;
                else {
                  var _3 = p3.data[g3].length;
                  l3 += _3, void 0 !== o4 ? 0 < _3 && (d3 += Math.abs(_3 - o4), o4 = _3) : o4 = _3;
                }
              0 < p3.data.length && (l3 /= p3.data.length - c3), (void 0 === a3 || d3 <= a3) && (void 0 === u3 || u3 < l3) && 1.99 < l3 && (a3 = d3, s4 = f3, u3 = l3);
            }
            return { successful: !!(m2.delimiter = s4), bestDelimiter: s4 };
          }(e2, m2.newline, m2.skipEmptyLines, m2.comments, m2.delimitersToGuess);
          n3.successful ? m2.delimiter = n3.bestDelimiter : (u2 = true, m2.delimiter = b.DefaultDelimiter), c2.meta.delimiter = m2.delimiter;
        }
        var s3 = w(m2);
        return m2.preview && m2.header && s3.preview++, a2 = e2, o3 = new E(s3), c2 = o3.parse(a2, t2, r3), g2(), d2 ? { meta: { paused: true } } : c2 || { meta: { paused: false } };
      }, this.paused = function() {
        return d2;
      }, this.pause = function() {
        d2 = true, o3.abort(), a2 = J2(m2.chunk) ? "" : a2.substring(o3.getCharIndex());
      }, this.resume = function() {
        t.streamer._halted ? (d2 = false, t.streamer.parseChunk(a2, true)) : setTimeout(t.resume, 3);
      }, this.aborted = function() {
        return e;
      }, this.abort = function() {
        e = true, o3.abort(), c2.meta.aborted = true, J2(m2.complete) && m2.complete(c2), a2 = "";
      };
    }
    function Q(e) {
      return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function E(j2) {
      var z2, M = (j2 = j2 || {}).delimiter, P2 = j2.newline, U = j2.comments, q2 = j2.step, N = j2.preview, B = j2.fastMode, K = z2 = void 0 === j2.quoteChar || null === j2.quoteChar ? '"' : j2.quoteChar;
      if (void 0 !== j2.escapeChar && (K = j2.escapeChar), ("string" != typeof M || -1 < b.BAD_DELIMITERS.indexOf(M)) && (M = ","), U === M)
        throw new Error("Comment character same as delimiter");
      true === U ? U = "#" : ("string" != typeof U || -1 < b.BAD_DELIMITERS.indexOf(U)) && (U = false), "\n" !== P2 && "\r" !== P2 && "\r\n" !== P2 && (P2 = "\n");
      var W = 0, H2 = false;
      this.parse = function(i, t, r2) {
        if ("string" != typeof i)
          throw new Error("Input must be a string");
        var n2 = i.length, e = M.length, s2 = P2.length, a2 = U.length, o3 = J2(q2), u2 = [], h2 = [], f2 = [], d2 = W = 0;
        if (!i)
          return L();
        if (j2.header && !t) {
          var l2 = i.split(P2)[0].split(M), c2 = [], p2 = {}, g2 = false;
          for (var _2 in l2) {
            var m2 = l2[_2];
            J2(j2.transformHeader) && (m2 = j2.transformHeader(m2, _2));
            var y2 = m2, v2 = p2[m2] || 0;
            for (0 < v2 && (g2 = true, y2 = m2 + "_" + v2), p2[m2] = v2 + 1; c2.includes(y2); )
              y2 = y2 + "_" + v2;
            c2.push(y2);
          }
          if (g2) {
            var k = i.split(P2);
            k[0] = c2.join(M), i = k.join(P2);
          }
        }
        if (B || false !== B && -1 === i.indexOf(z2)) {
          for (var b2 = i.split(P2), E2 = 0; E2 < b2.length; E2++) {
            if (f2 = b2[E2], W += f2.length, E2 !== b2.length - 1)
              W += P2.length;
            else if (r2)
              return L();
            if (!U || f2.substring(0, a2) !== U) {
              if (o3) {
                if (u2 = [], I(f2.split(M)), F2(), H2)
                  return L();
              } else
                I(f2.split(M));
              if (N && N <= E2)
                return u2 = u2.slice(0, N), L(true);
            }
          }
          return L();
        }
        for (var w2 = i.indexOf(M, W), R = i.indexOf(P2, W), C = new RegExp(Q(K) + Q(z2), "g"), S = i.indexOf(z2, W); ; )
          if (i[W] !== z2)
            if (U && 0 === f2.length && i.substring(W, W + a2) === U) {
              if (-1 === R)
                return L();
              W = R + s2, R = i.indexOf(P2, W), w2 = i.indexOf(M, W);
            } else if (-1 !== w2 && (w2 < R || -1 === R))
              f2.push(i.substring(W, w2)), W = w2 + e, w2 = i.indexOf(M, W);
            else {
              if (-1 === R)
                break;
              if (f2.push(i.substring(W, R)), D(R + s2), o3 && (F2(), H2))
                return L();
              if (N && u2.length >= N)
                return L(true);
            }
          else
            for (S = W, W++; ; ) {
              if (-1 === (S = i.indexOf(z2, S + 1)))
                return r2 || h2.push({ type: "Quotes", code: "MissingQuotes", message: "Quoted field unterminated", row: u2.length, index: W }), T();
              if (S === n2 - 1)
                return T(i.substring(W, S).replace(C, z2));
              if (z2 !== K || i[S + 1] !== K) {
                if (z2 === K || 0 === S || i[S - 1] !== K) {
                  -1 !== w2 && w2 < S + 1 && (w2 = i.indexOf(M, S + 1)), -1 !== R && R < S + 1 && (R = i.indexOf(P2, S + 1));
                  var O2 = A(-1 === R ? w2 : Math.min(w2, R));
                  if (i.substr(S + 1 + O2, e) === M) {
                    f2.push(i.substring(W, S).replace(C, z2)), i[W = S + 1 + O2 + e] !== z2 && (S = i.indexOf(z2, W)), w2 = i.indexOf(M, W), R = i.indexOf(P2, W);
                    break;
                  }
                  var x = A(R);
                  if (i.substring(S + 1 + x, S + 1 + x + s2) === P2) {
                    if (f2.push(i.substring(W, S).replace(C, z2)), D(S + 1 + x + s2), w2 = i.indexOf(M, W), S = i.indexOf(z2, W), o3 && (F2(), H2))
                      return L();
                    if (N && u2.length >= N)
                      return L(true);
                    break;
                  }
                  h2.push({ type: "Quotes", code: "InvalidQuotes", message: "Trailing quote on quoted field is malformed", row: u2.length, index: W }), S++;
                }
              } else
                S++;
            }
        return T();
        function I(e2) {
          u2.push(e2), d2 = W;
        }
        function A(e2) {
          var t2 = 0;
          if (-1 !== e2) {
            var r3 = i.substring(S + 1, e2);
            r3 && "" === r3.trim() && (t2 = r3.length);
          }
          return t2;
        }
        function T(e2) {
          return r2 || (void 0 === e2 && (e2 = i.substring(W)), f2.push(e2), W = n2, I(f2), o3 && F2()), L();
        }
        function D(e2) {
          W = e2, I(f2), f2 = [], R = i.indexOf(P2, W);
        }
        function L(e2) {
          return { data: u2, errors: h2, meta: { delimiter: M, linebreak: P2, aborted: H2, truncated: !!e2, cursor: d2 + (t || 0) } };
        }
        function F2() {
          q2(L()), u2 = [], h2 = [];
        }
      }, this.abort = function() {
        H2 = true;
      }, this.getCharIndex = function() {
        return W;
      };
    }
    function _(e) {
      var t = e.data, r2 = a[t.workerId], i = false;
      if (t.error)
        r2.userError(t.error, t.file);
      else if (t.results && t.results.data) {
        var n2 = { abort: function() {
          i = true, m(t.workerId, { data: [], errors: [], meta: { aborted: true } });
        }, pause: y, resume: y };
        if (J2(r2.userStep)) {
          for (var s2 = 0; s2 < t.results.data.length && (r2.userStep({ data: t.results.data[s2], errors: t.results.errors, meta: t.results.meta }, n2), !i); s2++)
            ;
          delete t.results;
        } else
          J2(r2.userChunk) && (r2.userChunk(t.results, n2, t.file), delete t.results);
      }
      t.finished && !i && m(t.workerId, t.results);
    }
    function m(e, t) {
      var r2 = a[e];
      J2(r2.userComplete) && r2.userComplete(t), r2.terminate(), delete a[e];
    }
    function y() {
      throw new Error("Not implemented.");
    }
    function w(e) {
      if ("object" != typeof e || null === e)
        return e;
      var t = Array.isArray(e) ? [] : {};
      for (var r2 in e)
        t[r2] = w(e[r2]);
      return t;
    }
    function v(e, t) {
      return function() {
        e.apply(t, arguments);
      };
    }
    function J2(e) {
      return "function" == typeof e;
    }
    return o2 && (f.onmessage = function(e) {
      var t = e.data;
      void 0 === b.WORKER_ID && t && (b.WORKER_ID = t.workerId);
      if ("string" == typeof t.input)
        f.postMessage({ workerId: b.WORKER_ID, results: b.parse(t.input, t.config), finished: true });
      else if (f.File && t.input instanceof File || t.input instanceof Object) {
        var r2 = b.parse(t.input, t.config);
        r2 && f.postMessage({ workerId: b.WORKER_ID, results: r2, finished: true });
      }
    }), (l.prototype = Object.create(h.prototype)).constructor = l, (c.prototype = Object.create(h.prototype)).constructor = c, (p.prototype = Object.create(p.prototype)).constructor = p, (g.prototype = Object.create(h.prototype)).constructor = g, b;
  });
})(papaparse_min);
var papaparse_minExports = papaparse_min.exports;
const tu = /* @__PURE__ */ getDefaultExportFromCjs(papaparse_minExports);
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
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type2 = typeof index;
  if (type2 == "number" ? isArrayLike(object) && isIndex(index, object.length) : type2 == "string" && index in object) {
    return eq(object[index], value);
  }
  return false;
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
  if (guard ? isIterateeCall(array, size, guard) : size === void 0) {
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
function baseGet(object, path2) {
  path2 = castPath(path2, object);
  var index = 0, length = path2.length;
  while (object != null && index < length) {
    object = object[toKey(path2[index++])];
  }
  return index && index == length ? object : void 0;
}
function get(object, path2, defaultValue) {
  var result = object == null ? void 0 : baseGet(object, path2);
  return result === void 0 ? defaultValue : result;
}
var COMPARE_PARTIAL_FLAG$1 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
function isStrictComparable(value) {
  return value === value && !isObject(value);
}
function getMatchData(object) {
  var result = keys(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
  };
}
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
function hasPath(object, path2, hasFunc) {
  path2 = castPath(path2, object);
  var index = -1, length = path2.length, result = false;
  while (++index < length) {
    var key = toKey(path2[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray$4(object) || isArguments(object));
}
function hasIn(object, path2) {
  return object != null && hasPath(object, path2, baseHasIn);
}
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty(path2, srcValue) {
  if (isKey(path2) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path2), srcValue);
  }
  return function(object) {
    var objValue = get(object, path2);
    return objValue === void 0 && objValue === srcValue ? hasIn(object, path2) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
function basePropertyDeep(path2) {
  return function(object) {
    return baseGet(object, path2);
  };
}
function property(path2) {
  return isKey(path2) ? baseProperty(toKey(path2)) : basePropertyDeep(path2);
}
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == "object") {
    return isArray$4(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}
function uniqBy(array, iteratee) {
  return array && array.length ? baseUniq(array, baseIteratee(iteratee)) : [];
}
var Ks = Object.defineProperty;
var o = (e, t) => Ks(e, "name", { value: t, configurable: true });
var Eo = React.createContext({}), Mo = o(({ children: e, isProvided: t, ...r }) => {
  let { replace: n } = ce(), s = o(async (d) => {
    var u;
    try {
      return await ((u = r.login) == null ? void 0 : u.call(r, d));
    } catch (p) {
      return Promise.reject(p);
    }
  }, "loginFunc"), a = o(async (d) => {
    var u;
    try {
      return await ((u = r.register) == null ? void 0 : u.call(r, d));
    } catch (p) {
      return Promise.reject(p);
    }
  }, "registerFunc"), i = o(async (d) => {
    var u;
    try {
      return await ((u = r.logout) == null ? void 0 : u.call(r, d));
    } catch (p) {
      return Promise.reject(p);
    }
  }, "logoutFunc"), c = o(async (d) => {
    var u;
    try {
      return await ((u = r.checkAuth) == null ? void 0 : u.call(r, d)), Promise.resolve();
    } catch (p) {
      return p != null && p.redirectPath && n(p.redirectPath), Promise.reject(p);
    }
  }, "checkAuthFunc");
  return React.createElement(Eo.Provider, { value: { ...r, login: s, logout: i, checkAuth: c, register: a, isProvided: t } }, e);
}, "LegacyAuthContextProvider"), wo = React.createContext({}), Io = o(({ children: e, isProvided: t, ...r }) => {
  let n = o(async (u) => {
    var p;
    try {
      return await ((p = r.login) == null ? void 0 : p.call(r, u));
    } catch (l) {
      return console.warn("Unhandled Error in login: refine always expects a resolved promise.", l), Promise.reject(l);
    }
  }, "handleLogin"), s = o(async (u) => {
    var p;
    try {
      return await ((p = r.register) == null ? void 0 : p.call(r, u));
    } catch (l) {
      return console.warn("Unhandled Error in register: refine always expects a resolved promise.", l), Promise.reject(l);
    }
  }, "handleRegister"), a = o(async (u) => {
    var p;
    try {
      return await ((p = r.logout) == null ? void 0 : p.call(r, u));
    } catch (l) {
      return console.warn("Unhandled Error in logout: refine always expects a resolved promise.", l), Promise.reject(l);
    }
  }, "handleLogout"), i = o(async (u) => {
    var p;
    try {
      let l = await ((p = r.check) == null ? void 0 : p.call(r, u));
      return Promise.resolve(l);
    } catch (l) {
      return console.warn("Unhandled Error in check: refine always expects a resolved promise.", l), Promise.reject(l);
    }
  }, "handleCheck"), c = o(async (u) => {
    var p;
    try {
      let l = await ((p = r.forgotPassword) == null ? void 0 : p.call(r, u));
      return Promise.resolve(l);
    } catch (l) {
      return console.warn("Unhandled Error in forgotPassword: refine always expects a resolved promise.", l), Promise.reject(l);
    }
  }, "handleForgotPassword"), d = o(async (u) => {
    var p;
    try {
      let l = await ((p = r.updatePassword) == null ? void 0 : p.call(r, u));
      return Promise.resolve(l);
    } catch (l) {
      return console.warn("Unhandled Error in updatePassword: refine always expects a resolved promise.", l), Promise.reject(l);
    }
  }, "handleUpdatePassword");
  return React.createElement(wo.Provider, { value: { ...r, login: n, logout: a, check: i, register: s, forgotPassword: c, updatePassword: d, isProvided: t } }, e);
}, "AuthBindingsContextProvider"), ue = o(() => React.useContext(Eo), "useLegacyAuthContext"), fe = o(() => React.useContext(wo), "useAuthBindingsContext");
var Mt = o((e) => e / 1e3, "userFriendlySecond");
var Ht = o((e, t = (r) => r) => {
  let [r, ...n] = e;
  return n.map((s) => fromPairs(zip(r, s))).map((s, a, i) => t.call(void 0, s, a, i));
}, "importCSVMapper");
var $t = o((e = "", t) => {
  let r = wt(e);
  return t === "singular" ? Go.singular(r) : Go.plural(r);
}, "userFriendlyResourceName");
o((e = {}) => e != null && e.id ? { ...e, id: decodeURIComponent(e.id) } : e, "handleUseParams");
function Ze(e, t) {
  return e.findIndex((r, n) => n <= e.length - t.length && t.every((s, a) => e[n + a] === s));
}
o(Ze, "arrayFindIndex");
function $s(e) {
  if (e[0] === "data") {
    let t = e.slice(1);
    if (t[2] === "many")
      t[2] = "getMany";
    else if (t[2] === "infinite")
      t[2] = "list";
    else if (t[2] === "one")
      t[2] = "detail";
    else if (t[1] === "custom") {
      let r = { ...t[2] };
      return delete r.method, delete r.url, [t[0], t[1], t[2].method, t[2].url, r];
    }
    return t;
  }
  if (e[0] === "audit" && e[2] === "list")
    return ["logList", e[1], e[3]];
  if (e[0] === "access" && e.length === 4)
    return ["useCan", { resource: e[1], action: e[2], ...e[3] }];
  if (e[0] === "auth") {
    if (Ze(e, ["auth", "login"]) !== -1)
      return ["useLogin"];
    if (Ze(e, ["auth", "logout"]) !== -1)
      return ["useLogout"];
    if (Ze(e, ["auth", "identity"]) !== -1)
      return ["getUserIdentity"];
    if (Ze(e, ["auth", "register"]) !== -1)
      return ["useRegister"];
    if (Ze(e, ["auth", "forgotPassword"]) !== -1)
      return ["useForgotPassword"];
    if (Ze(e, ["auth", "check"]) !== -1)
      return ["useAuthenticated", e[2]];
    if (Ze(e, ["auth", "onError"]) !== -1)
      return ["useCheckError"];
    if (Ze(e, ["auth", "permissions"]) !== -1)
      return ["usePermissions"];
    if (Ze(e, ["auth", "updatePassword"]) !== -1)
      return ["useUpdatePassword"];
  }
  return e;
}
o($s, "convertToLegacy");
var Ue = class {
  constructor(t = []) {
    this.segments = [];
    this.segments = t;
  }
  key() {
    return this.segments;
  }
  legacy() {
    return $s(this.segments);
  }
  get(t) {
    return t ? this.legacy() : this.segments;
  }
};
o(Ue, "BaseKeyBuilder");
var $e = class extends Ue {
  params(t) {
    return new Ue([...this.segments, t]);
  }
};
o($e, "ParamsKeyBuilder");
var Wt = class extends Ue {
  id(t) {
    return new $e([...this.segments, t ? String(t) : void 0]);
  }
};
o(Wt, "DataIdRequiringKeyBuilder");
var Ot = class extends Ue {
  ids(...t) {
    return new $e([...this.segments, ...t.length ? [t.map((r) => String(r))] : []]);
  }
};
o(Ot, "DataIdsRequiringKeyBuilder");
var zt = class extends Ue {
  action(t) {
    if (t === "one")
      return new Wt([...this.segments, t]);
    if (t === "many")
      return new Ot([...this.segments, t]);
    if (["list", "infinite"].includes(t))
      return new $e([...this.segments, t]);
    throw new Error("Invalid action type");
  }
};
o(zt, "DataResourceKeyBuilder");
var _t = class extends Ue {
  resource(t) {
    return new zt([...this.segments, t]);
  }
  mutation(t) {
    return new $e([...t === "custom" ? this.segments : [this.segments[0]], t]);
  }
};
o(_t, "DataKeyBuilder");
var jt = class extends Ue {
  action(t) {
    return new $e([...this.segments, t]);
  }
};
o(jt, "AuthKeyBuilder");
var Xt = class extends Ue {
  action(t) {
    return new $e([...this.segments, t]);
  }
};
o(Xt, "AccessResourceKeyBuilder");
var Zt = class extends Ue {
  resource(t) {
    return new Xt([...this.segments, t]);
  }
};
o(Zt, "AccessKeyBuilder");
var Yt = class extends Ue {
  action(t) {
    return new $e([...this.segments, t]);
  }
};
o(Yt, "AuditActionKeyBuilder");
var Jt = class extends Ue {
  resource(t) {
    return new Yt([...this.segments, t]);
  }
  action(t) {
    return new $e([...this.segments, t]);
  }
};
o(Jt, "AuditKeyBuilder");
var Tt = class extends Ue {
  data(t) {
    return new _t(["data", t || "default"]);
  }
  auth() {
    return new jt(["auth"]);
  }
  access() {
    return new Zt(["access"]);
  }
  audit() {
    return new Jt(["audit"]);
  }
};
o(Tt, "KeyBuilder");
var We = o(() => new Tt([]), "keys");
var F = o((...e) => e.find((t) => typeof t < "u"), "pickNotDeprecated");
o((e, t, r, n) => {
  let s = t || "default", a = { all: [s], resourceAll: [s, e || ""], list: (i) => [...a.resourceAll, "list", { ...i, ...F(r, n) || {} }], many: (i) => [...a.resourceAll, "getMany", i == null ? void 0 : i.map(String), { ...F(r, n) || {} }].filter((c) => c !== void 0), detail: (i) => [...a.resourceAll, "detail", i == null ? void 0 : i.toString(), { ...F(r, n) || {} }], logList: (i) => ["logList", e, i, n].filter((c) => c !== void 0) };
  return a;
}, "queryKeys");
var Ye = o((e) => (t, r, n, s) => {
  let a = r || "default";
  return { all: We().data(a).get(e), resourceAll: We().data(r).resource(t ?? "").get(e), list: (c) => We().data(r).resource(t ?? "").action("list").params({ ...c, ...F(n, s) || {} }).get(e), many: (c) => We().data(r).resource(t ?? "").action("many").ids(...c ?? []).params({ ...F(n, s) || {} }).get(e), detail: (c) => We().data(r).resource(t ?? "").action("one").id(c ?? "").params({ ...F(n, s) || {} }).get(e), logList: (c) => [...We().audit().resource(t).action("list").params(c).get(e), s].filter((d) => d !== void 0) };
}, "queryKeysReplacement");
var Sr = o((e, t) => !e || !t ? false : !!e.find((r) => r === t), "hasPermission");
var xt = o((e) => e.startsWith(":"), "isParameter");
var ze = o((e) => e.split("/").filter((r) => r !== ""), "splitToSegments");
var ko = o((e, t) => {
  let r = ze(e), n = ze(t);
  return r.length === n.length;
}, "isSegmentCountsSame");
var be = o((e) => e.replace(/^\/|\/$/g, ""), "removeLeadingTrailingSlashes");
var Qo = o((e, t) => {
  let r = be(e), n = be(t);
  if (!ko(r, n))
    return false;
  let s = ze(r);
  return ze(n).every((i, c) => xt(i) || i === s[c]);
}, "checkBySegments");
var Vo = o((e, t, r) => {
  let n = be(r || ""), s = `${n}${n ? "/" : ""}${e}`;
  return t === "list" ? s = `${s}` : t === "create" ? s = `${s}/create` : t === "edit" ? s = `${s}/edit/:id` : t === "show" ? s = `${s}/show/:id` : t === "clone" && (s = `${s}/clone/:id`), `/${s.replace(/^\//, "")}`;
}, "getDefaultActionPath");
var Fe = o((e, t) => {
  var s, a;
  let r = F((s = e.meta) == null ? void 0 : s.parent, (a = e.options) == null ? void 0 : a.parent, e.parentName);
  return r ? t.find((i) => (i.identifier ?? i.name) === r) ?? { name: r } : void 0;
}, "getParentResource");
var It = o((e, t, r) => {
  let n = [], s = Fe(e, t);
  for (; s; )
    n.push(s), s = Fe(s, t);
  if (n.length !== 0)
    return `/${n.reverse().map((a) => {
      var c;
      let i = r ? ((c = a.options) == null ? void 0 : c.route) ?? a.name : a.name;
      return be(i);
    }).join("/")}`;
}, "getParentPrefixForResource");
var he = o((e, t, r) => {
  let n = [], s = ["list", "show", "edit", "create", "clone"], a = It(e, t, r);
  return s.forEach((i) => {
    var u, p;
    let c = r && i === "clone" ? e.create : e[i], d;
    typeof c == "function" || r ? d = Vo(r ? ((u = e.meta) == null ? void 0 : u.route) ?? ((p = e.options) == null ? void 0 : p.route) ?? e.name : e.name, i, r ? a : void 0) : typeof c == "string" ? d = c : typeof c == "object" && (d = c.path), d && n.push({ action: i, resource: e, route: `/${d.replace(/^\//, "")}` });
  }), n;
}, "getActionRoutesFromResource");
var Bo = o((e) => {
  var s;
  if (e.length === 0)
    return;
  if (e.length === 1)
    return e[0];
  let t = e.map((a) => ({ ...a, splitted: ze(be(a.route)) })), r = ((s = t[0]) == null ? void 0 : s.splitted.length) ?? 0, n = [...t];
  for (let a = 0; a < r; a++) {
    let i = n.filter((c) => !xt(c.splitted[a]));
    if (i.length !== 0) {
      if (i.length === 1) {
        n = i;
        break;
      }
      n = i;
    }
  }
  return n[0];
}, "pickMatchedRoute");
var No = o((e, t) => {
  let n = t.flatMap((a) => he(a, t)).filter((a) => Qo(e, a.route)), s = Bo(n);
  return { found: !!s, resource: s == null ? void 0 : s.resource, action: s == null ? void 0 : s.action, matchedRoute: s == null ? void 0 : s.route };
}, "matchResourceFromRoute");
var qt = o((e, t) => {
  var s;
  let r, n = It(e, t, true);
  if (n) {
    let a = F(e.meta, e.options);
    r = `${n}/${(a == null ? void 0 : a.route) ?? e.name}`;
  } else
    r = ((s = e.options) == null ? void 0 : s.route) ?? e.name;
  return `/${r.replace(/^\//, "")}`;
}, "routeGenerator");
o((e) => {
  var i;
  let t = [], r = {}, n = {}, s, a;
  for (let c = 0; c < e.length; c++) {
    s = e[c];
    let d = s.route ?? ((i = F(s == null ? void 0 : s.meta, s.options)) == null ? void 0 : i.route) ?? "";
    r[d] = s, r[d].children = [], n[s.name] = s, n[s.name].children = [];
  }
  for (let c in r)
    Object.hasOwn(r, c) && (a = r[c], a.parentName && n[a.parentName] ? n[a.parentName].children.push(a) : t.push(a));
  return t;
}, "createTreeView");
var wt = o((e) => (e = e.replace(/([a-z]{1})([A-Z]{1})/g, "$1-$2"), e = e.replace(/([A-Z]{1})([A-Z]{1})([a-z]{1})/g, "$1-$2$3"), e = e.toLowerCase().replace(/[_-]+/g, " ").replace(/\s{2,}/g, " ").trim(), e = e.charAt(0).toUpperCase() + e.slice(1), e), "humanizeString");
var Fr = o(({ children: e }) => React.createElement("div", null, e), "DefaultLayout");
var Ee = { mutationMode: "pessimistic", syncWithLocation: false, undoableTimeout: 5e3, warnWhenUnsavedChanges: false, liveMode: "off", redirect: { afterCreate: "list", afterClone: "list", afterEdit: "list" }, overtime: { interval: 1e3 }, textTransformers: { humanize: wt, plural: Go.plural, singular: Go.singular }, disableServerSideValidation: false }, ve = React.createContext({ hasDashboard: false, mutationMode: "pessimistic", warnWhenUnsavedChanges: false, syncWithLocation: false, undoableTimeout: 5e3, Title: void 0, Sider: void 0, Header: void 0, Footer: void 0, Layout: Fr, OffLayoutArea: void 0, liveMode: "off", onLiveEvent: void 0, options: Ee }), $o = o(({ hasDashboard: e, mutationMode: t, warnWhenUnsavedChanges: r, syncWithLocation: n, undoableTimeout: s, children: a, DashboardPage: i, Title: c, Layout: d = Fr, Header: u, Sider: p, Footer: l, OffLayoutArea: y, LoginPage: f = Ar, catchAll: T, liveMode: U = "off", onLiveEvent: D, options: g }) => React.createElement(ve.Provider, { value: { __initialized: true, hasDashboard: e, mutationMode: t, warnWhenUnsavedChanges: r, syncWithLocation: n, Title: c, undoableTimeout: s, Layout: d, Header: u, Sider: p, Footer: l, OffLayoutArea: y, DashboardPage: i, LoginPage: f, catchAll: T, liveMode: U, onLiveEvent: D, options: g } }, a), "RefineContextProvider");
var kr = o(({ options: e, disableTelemetry: t, liveMode: r, mutationMode: n, reactQueryClientConfig: s, reactQueryDevtoolConfig: a, syncWithLocation: i, undoableTimeout: c, warnWhenUnsavedChanges: d } = {}) => {
  var y, f, T, U, D, g, R, w;
  let u = { breadcrumb: e == null ? void 0 : e.breadcrumb, mutationMode: (e == null ? void 0 : e.mutationMode) ?? n ?? Ee.mutationMode, undoableTimeout: (e == null ? void 0 : e.undoableTimeout) ?? c ?? Ee.undoableTimeout, syncWithLocation: (e == null ? void 0 : e.syncWithLocation) ?? i ?? Ee.syncWithLocation, warnWhenUnsavedChanges: (e == null ? void 0 : e.warnWhenUnsavedChanges) ?? d ?? Ee.warnWhenUnsavedChanges, liveMode: (e == null ? void 0 : e.liveMode) ?? r ?? Ee.liveMode, redirect: { afterCreate: ((y = e == null ? void 0 : e.redirect) == null ? void 0 : y.afterCreate) ?? Ee.redirect.afterCreate, afterClone: ((f = e == null ? void 0 : e.redirect) == null ? void 0 : f.afterClone) ?? Ee.redirect.afterClone, afterEdit: ((T = e == null ? void 0 : e.redirect) == null ? void 0 : T.afterEdit) ?? Ee.redirect.afterEdit }, overtime: (e == null ? void 0 : e.overtime) ?? Ee.overtime, textTransformers: { humanize: ((U = e == null ? void 0 : e.textTransformers) == null ? void 0 : U.humanize) ?? Ee.textTransformers.humanize, plural: ((D = e == null ? void 0 : e.textTransformers) == null ? void 0 : D.plural) ?? Ee.textTransformers.plural, singular: ((g = e == null ? void 0 : e.textTransformers) == null ? void 0 : g.singular) ?? Ee.textTransformers.singular }, disableServerSideValidation: (e == null ? void 0 : e.disableServerSideValidation) ?? Ee.disableServerSideValidation, projectId: e == null ? void 0 : e.projectId, useNewQueryKeys: e == null ? void 0 : e.useNewQueryKeys }, p = (e == null ? void 0 : e.disableTelemetry) ?? t ?? false, l = { clientConfig: ((R = e == null ? void 0 : e.reactQuery) == null ? void 0 : R.clientConfig) ?? s ?? {}, devtoolConfig: ((w = e == null ? void 0 : e.reactQuery) == null ? void 0 : w.devtoolConfig) ?? a ?? {} };
  return { optionsWithDefaults: u, disableTelemetryWithDefault: p, reactQueryWithDefaults: l };
}, "handleRefineOptions");
var Qr = o(({ redirectFromProps: e, action: t, redirectOptions: r }) => {
  if (e || e === false)
    return e;
  switch (t) {
    case "clone":
      return r.afterClone;
    case "create":
      return r.afterCreate;
    case "edit":
      return r.afterEdit;
    default:
      return false;
  }
}, "redirectPage");
var er = o(async (e, t, r) => {
  let n = [];
  for (let [s, a] of e.entries())
    try {
      let i = await a();
      n.push(t(i, s));
    } catch (i) {
      n.push(r(i, s));
    }
  return n;
}, "sequentialPromises");
var ye = o((e, t = [], r = false) => {
  if (!e)
    return;
  if (r) {
    let s = t.find((i) => be(i.route ?? "") === be(e));
    return s || t.find((i) => i.name === e);
  }
  let n = t.find((s) => s.identifier === e);
  return n || (n = t.find((s) => s.name === e)), n;
}, "pickResource");
var j = o((e, t, r) => {
  if (t)
    return t;
  let n = ye(e, r), s = F(n == null ? void 0 : n.meta, n == null ? void 0 : n.options);
  return s != null && s.dataProviderName ? s.dataProviderName : "default";
}, "pickDataProvider");
var Je = o(async (e) => ({ data: (await Promise.all(e)).map((t) => t.data) }), "handleMultiple");
var tr = o((e) => {
  let { pagination: t, cursor: r } = e;
  if (r != null && r.next)
    return r.next;
  let n = (t == null ? void 0 : t.current) || 1, s = (t == null ? void 0 : t.pageSize) || 10, a = Math.ceil((e.total || 0) / s);
  return n < a ? Number(n) + 1 : void 0;
}, "getNextPageParam"), rr = o((e) => {
  let { pagination: t, cursor: r } = e;
  if (r != null && r.prev)
    return r.prev;
  let n = (t == null ? void 0 : t.current) || 1;
  return n === 1 ? void 0 : n - 1;
}, "getPreviousPageParam");
var or = o((e) => {
  let t = [];
  return e.forEach((r) => {
    var n, s;
    t.push({ ...r, label: ((n = r.meta) == null ? void 0 : n.label) ?? ((s = r.options) == null ? void 0 : s.label), route: qt(r, e), canCreate: !!r.create, canEdit: !!r.edit, canShow: !!r.show, canDelete: r.canDelete });
  }), t;
}, "legacyResourceTransform");
var Wo = o((e) => ze(be(e)).flatMap((r) => xt(r) ? [r.slice(1)] : []), "pickRouteParams");
var Oo = o((e, t = {}) => e.reduce((r, n) => {
  let s = t[n];
  return typeof s < "u" && (r[n] = s), r;
}, {}), "prepareRouteParams");
var Me = o((e, t = {}, r = {}, n = {}) => {
  let s = Wo(e), a = Oo(s, { ...t, ...typeof (r == null ? void 0 : r.id) < "u" ? { id: r.id } : {}, ...typeof (r == null ? void 0 : r.action) < "u" ? { action: r.action } : {}, ...typeof (r == null ? void 0 : r.resource) < "u" ? { resource: r.resource } : {}, ...r == null ? void 0 : r.params, ...n });
  return e.replace(/:([^\/]+)/g, (i, c) => {
    let d = a[c];
    return typeof d < "u" ? `${d}` : i;
  });
}, "composeRoute");
var J = o(() => {
  let e = ue(), t = fe();
  return t.isProvided ? { isLegacy: false, ...t } : e.isProvided ? { isLegacy: true, ...e, check: e.checkAuth, onError: e.checkError, getIdentity: e.getUserIdentity } : null;
}, "useActiveAuthProvider");
var St = o(({ hasPagination: e, pagination: t, configPagination: r } = {}) => {
  let n = e === false ? "off" : "server", s = (t == null ? void 0 : t.mode) ?? n, a = F(t == null ? void 0 : t.current, r == null ? void 0 : r.current) ?? 1, i = F(t == null ? void 0 : t.pageSize, r == null ? void 0 : r.pageSize) ?? 10;
  return { current: a, pageSize: i, mode: s };
}, "handlePaginationParams");
var nr = o((e) => {
  let [t, r] = reactExports.useState(false);
  return reactExports.useEffect(() => {
    let n = window.matchMedia(e);
    n.matches !== t && r(n.matches);
    let s = o(() => r(n.matches), "listener");
    return window.addEventListener("resize", s), () => window.removeEventListener("resize", s);
  }, [t, e]), t;
}, "useMediaQuery");
var sr = o((e, t, r, n) => {
  let s = n ? e(t, n, r) : e(t, r), a = r ?? t;
  return s === t || typeof s > "u" ? a : s;
}, "safeTranslate");
function zo(e, t, r, n, s) {
  var y;
  let a = { create: "Create new ", clone: `#${n ?? ""} Clone `, edit: `#${n ?? ""} Edit `, show: `#${n ?? ""} Show `, list: "" }, i = (t == null ? void 0 : t.identifier) ?? (t == null ? void 0 : t.name), c = (t == null ? void 0 : t.label) ?? ((y = t == null ? void 0 : t.meta) == null ? void 0 : y.label) ?? $t(i, r === "list" ? "plural" : "singular"), d = s ?? c, u = sr(e, "documentTitle.default", "refine"), p = sr(e, "documentTitle.suffix", " | refine"), l = u;
  return r && i && (l = sr(e, `documentTitle.${i}.${r}`, `${a[r] ?? ""}${d}${p}`, { id: n })), l;
}
o(zo, "generateDefaultDocumentTitle");
var Ae = o((e, t) => {
  let { mutationMode: r, undoableTimeout: n } = reactExports.useContext(ve);
  return { mutationMode: e ?? r, undoableTimeout: t ?? n };
}, "useMutationMode");
var Vr = React.createContext({}), jo = o(({ children: e }) => {
  let [t, r] = reactExports.useState(false);
  return React.createElement(Vr.Provider, { value: { warnWhen: t, setWarnWhen: r } }, e);
}, "UnsavedWarnContextProvider");
var dt = o(() => {
  let { warnWhenUnsavedChanges: e } = reactExports.useContext(ve), { warnWhen: t, setWarnWhen: r } = reactExports.useContext(Vr);
  return { warnWhenUnsavedChanges: e, warnWhen: !!t, setWarnWhen: r ?? (() => {
  }) };
}, "useWarnAboutChange");
var Br = o(() => {
  let { syncWithLocation: e } = reactExports.useContext(ve);
  return { syncWithLocation: e };
}, "useSyncWithLocation");
o(() => {
  let { Title: e } = reactExports.useContext(ve);
  return e;
}, "useTitle");
var se = o(() => {
  let { Footer: e, Header: t, Layout: r, OffLayoutArea: n, Sider: s, Title: a, hasDashboard: i, mutationMode: c, syncWithLocation: d, undoableTimeout: u, warnWhenUnsavedChanges: p, DashboardPage: l, LoginPage: y, catchAll: f, options: T, __initialized: U } = reactExports.useContext(ve);
  return { __initialized: U, Footer: e, Header: t, Layout: r, OffLayoutArea: n, Sider: s, Title: a, hasDashboard: i, mutationMode: c, syncWithLocation: d, undoableTimeout: u, warnWhenUnsavedChanges: p, DashboardPage: l, LoginPage: y, catchAll: f, options: T };
}, "useRefineContext");
var nt = o(() => {
  let { options: { textTransformers: e } } = se();
  return o((r = "", n) => {
    let s = e.humanize(r);
    return n === "singular" ? e.singular(s) : e.plural(s);
  }, "getFriendlyName");
}, "useUserFriendlyName");
var Zo = o((e) => typeof e == "object" && e !== null, "isNested"), qs = o((e) => Array.isArray(e), "isArray"), ar = o((e, t = "") => Zo(e) ? Object.keys(e).reduce((r, n) => {
  let s = t.length ? `${t}.` : "";
  return Zo(e[n]) && Object.keys(e[n]).length && (qs(e[n]) && e[n].length ? e[n].forEach((a, i) => {
    Object.assign(r, ar(a, `${s + n}.${i}`));
  }) : Object.assign(r, ar(e[n], s + n))), r[s + n] = e[n], r;
}, {}) : { [t]: e }, "flattenObjectKeys");
o((e) => e.split(".").map((t) => Number.isNaN(Number(t)) ? t : Number(t)), "propertyPathToArray");
var Nr = o((e, t, r) => {
  if (typeof window > "u")
    return;
  let n = new Blob([t], { type: r }), s = document.createElement("a");
  s.setAttribute("visibility", "hidden"), s.download = e;
  let a = URL.createObjectURL(n);
  s.href = a, document.body.appendChild(s), s.click(), document.body.removeChild(s), setTimeout(() => {
    URL.revokeObjectURL(a);
  });
}, "downloadInBrowser");
var ir = o((e) => {
  setTimeout(e, 0);
}, "deferExecution");
var Kr = o((e, t = 1e3, r) => {
  let n = [], s = o(() => {
    n.forEach((c) => {
      var d;
      return (d = c.reject) == null ? void 0 : d.call(c, r);
    }), n = [];
  }, "cancelPrevious"), a = debounce((...c) => {
    let { resolve: d, reject: u } = n.pop() || {};
    Promise.resolve(e(...c)).then(d).catch(u);
  }, t), i = o((...c) => new Promise((d, u) => {
    s(), n.push({ resolve: d, reject: u }), a(...c);
  }), "runner");
  return i.flush = () => a.flush(), i.cancel = () => {
    a.cancel(), s();
  }, i;
}, "asyncDebounce");
var ur = o((e) => {
  let { current: t, pageSize: r, sorter: n, sorters: s, filters: a } = ts.parse(e.substring(1));
  return { parsedCurrent: t && Number(t), parsedPageSize: r && Number(r), parsedSorter: F(s, n) ?? [], parsedFilters: a ?? [] };
}, "parseTableParams");
o((e) => {
  let t = ts.stringify(e);
  return ur(`/${t}`);
}, "parseTableParamsFromQuery");
var cr = o((e) => {
  let t = { skipNulls: true, arrayFormat: "indices", encode: false }, { pagination: r, sorter: n, sorters: s, filters: a, ...i } = e;
  return ts.stringify({ ...i, ...r || {}, sorters: F(s, n), filters: a }, t);
}, "stringifyTableParams"), en = o((e, t) => e.operator !== "and" && e.operator !== "or" && t.operator !== "and" && t.operator !== "or" ? ("field" in e ? e.field : void 0) === ("field" in t ? t.field : void 0) && e.operator === t.operator : ("key" in e ? e.key : void 0) === ("key" in t ? t.key : void 0) && e.operator === t.operator, "compareFilters"), tn = o((e, t) => e.field === t.field, "compareSorters"), Pt = o((e, t, r = []) => (t.filter((s) => (s.operator === "or" || s.operator === "and") && !s.key).length > 1 && Ru(true, `[conditionalFilters]: You have created multiple Conditional Filters at the top level, this requires the key parameter. 
For more information, see https://refine.dev/docs/advanced-tutorials/data-provider/handling-filters/#top-level-multiple-conditional-filters-usage`), unionWith(e, t, r, en).filter((s) => s.value !== void 0 && s.value !== null && (s.operator !== "or" || s.operator === "or" && s.value.length !== 0) && (s.operator !== "and" || s.operator === "and" && s.value.length !== 0))), "unionFilters"), dr = o((e, t) => unionWith(e, t, tn).filter((r) => r.order !== void 0 && r.order !== null), "unionSorters"), pr = o((e, t) => [...differenceWith(t, e, en), ...e], "setInitialFilters"), lr = o((e, t) => [...differenceWith(t, e, tn), ...e], "setInitialSorters");
o((e, t) => {
  if (!t)
    return;
  let r = t.find((n) => n.field === e);
  if (r)
    return r.order;
}, "getDefaultSortOrder");
o((e, t, r = "eq") => {
  let n = t == null ? void 0 : t.find((s) => {
    if (s.operator !== "or" && s.operator !== "and" && "field" in s) {
      let { operator: a, field: i } = s;
      return i === e && a === r;
    }
  });
  if (n)
    return n.value || [];
}, "getDefaultFilter");
o((e) => new Promise((t, r) => {
  let n = new FileReader(), s = o(() => {
    n.result && (n.removeEventListener("load", s, false), t(n.result));
  }, "resultHandler");
  n.addEventListener("load", s, false), n.readAsDataURL(e.originFileObj), n.onerror = (a) => (n.removeEventListener("load", s, false), r(a));
}), "file2Base64");
var O = o(() => {
  let { options: { useNewQueryKeys: e } } = se();
  return { keys: We, preferLegacyKeys: !e };
}, "useKeys");
function aa({ v3LegacyAuthProviderCompatible: e = false, options: t, params: r } = {}) {
  let { getPermissions: n } = ue(), { getPermissions: s } = fe(), { keys: a, preferLegacyKeys: i } = O(), c = useQuery({ queryKey: a().auth().action("permissions").get(i), queryFn: s ? () => s(r) : () => Promise.resolve(void 0), enabled: !e && !!s, ...e ? {} : t, meta: { ...e ? {} : t == null ? void 0 : t.meta, ...P() } }), d = useQuery({ queryKey: [...a().auth().action("permissions").get(i), "v3LegacyAuthProviderCompatible"], queryFn: n ? () => n(r) : () => Promise.resolve(void 0), enabled: e && !!n, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? d : c;
}
o(aa, "usePermissions");
function Hr({ v3LegacyAuthProviderCompatible: e = false, queryOptions: t } = {}) {
  let { getUserIdentity: r } = ue(), { getIdentity: n } = fe(), { keys: s, preferLegacyKeys: a } = O(), i = useQuery({ queryKey: s().auth().action("identity").get(a), queryFn: n ?? (() => Promise.resolve({})), enabled: !e && !!n, retry: false, ...e === true ? {} : t, meta: { ...e === true ? {} : t == null ? void 0 : t.meta, ...P() } }), c = useQuery({ queryKey: [...s().auth().action("identity").get(a), "v3LegacyAuthProviderCompatible"], queryFn: r ?? (() => Promise.resolve({})), enabled: e && !!r, retry: false, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? c : i;
}
o(Hr, "useGetIdentity");
var Rt = o(() => {
  let e = useQueryClient(), { keys: t, preferLegacyKeys: r } = O();
  return o(async () => {
    await Promise.all(["check", "identity", "permissions"].map((s) => e.invalidateQueries(t().auth().action(s).get(r))));
  }, "invalidate");
}, "useInvalidateAuthStore");
function mr({ v3LegacyAuthProviderCompatible: e, mutationOptions: t } = {}) {
  let r = Rt(), n = Z(), s = ge(), { push: a } = ce(), { open: i, close: c } = we(), { logout: d } = ue(), { logout: u } = fe(), { keys: p, preferLegacyKeys: l } = O(), y = useMutation({ mutationKey: p().auth().action("logout").get(l), mutationFn: u, onSuccess: async (T, U) => {
    let { success: D, error: g, redirectTo: R, successNotification: w } = T, { redirectPath: I } = U ?? {}, P2 = I ?? R;
    D && (c == null || c("useLogout-error"), w && (i == null || i(ua(w)))), (g || !D) && (i == null || i($r(g))), P2 !== false && (n === "legacy" ? a(P2 ?? "/login") : P2 && s({ to: P2 })), await r();
  }, onError: (T) => {
    i == null || i($r(T));
  }, ...e === true ? {} : t, meta: { ...e === true ? {} : t == null ? void 0 : t.meta, ...P() } }), f = useMutation({ mutationKey: [...p().auth().action("logout").get(l), "v3LegacyAuthProviderCompatible"], mutationFn: d, onSuccess: async (T, U) => {
    let D = (U == null ? void 0 : U.redirectPath) ?? T;
    if (D !== false) {
      if (D) {
        n === "legacy" ? a(D) : s({ to: D });
        return;
      }
      n === "legacy" ? a("/login") : s({ to: "/login" }), await r();
    }
  }, onError: (T) => {
    i == null || i($r(T));
  }, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? f : y;
}
o(mr, "useLogout");
var $r = o((e) => ({ key: "useLogout-error", type: "error", message: (e == null ? void 0 : e.name) || "Logout Error", description: (e == null ? void 0 : e.message) || "Something went wrong during logout" }), "buildNotification"), ua = o((e) => ({ message: e.message, description: e.description, key: "logout-success", type: "success" }), "buildSuccessNotification");
function Ft({ v3LegacyAuthProviderCompatible: e, mutationOptions: t } = {}) {
  let r = Rt(), n = Z(), s = ge(), { replace: a } = ce(), i = ae(), { useLocation: c } = re(), { search: d } = c(), { close: u, open: p } = we(), { login: l } = ue(), { login: y } = fe(), { keys: f, preferLegacyKeys: T } = O(), U = React.useMemo(() => {
    var R;
    return n === "legacy" ? ts.parse(d, { ignoreQueryPrefix: true }).to : (R = i.params) == null ? void 0 : R.to;
  }, [n, i.params, d]), D = useMutation({ mutationKey: f().auth().action("login").get(T), mutationFn: y, onSuccess: async ({ success: R, redirectTo: w, error: I, successNotification: P2 }) => {
    R && (u == null || u("login-error"), P2 && (p == null || p(pa(P2)))), (I || !R) && (p == null || p(Wr(I))), U && R ? n === "legacy" ? a(U) : s({ to: U, type: "replace" }) : w ? n === "legacy" ? a(w) : s({ to: w, type: "replace" }) : n === "legacy" && a("/"), await r();
  }, onError: (R) => {
    p == null || p(Wr(R));
  }, ...e === true ? {} : t, meta: { ...e === true ? {} : t == null ? void 0 : t.meta, ...P() } }), g = useMutation({ mutationKey: [...f().auth().action("login").get(T), "v3LegacyAuthProviderCompatible"], mutationFn: l, onSuccess: async (R) => {
    U && a(U), R !== false && !U && (typeof R == "string" ? n === "legacy" ? a(R) : s({ to: R, type: "replace" }) : n === "legacy" ? a("/") : s({ to: "/", type: "replace" })), await r(), u == null || u("login-error");
  }, onError: (R) => {
    p == null || p(Wr(R));
  }, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? g : D;
}
o(Ft, "useLogin");
var Wr = o((e) => ({ message: (e == null ? void 0 : e.name) || "Login Error", description: (e == null ? void 0 : e.message) || "Invalid credentials", key: "login-error", type: "error" }), "buildNotification"), pa = o((e) => ({ message: e.message, description: e.description, key: "login-success", type: "success" }), "buildSuccessNotification");
function zr({ v3LegacyAuthProviderCompatible: e, mutationOptions: t } = {}) {
  let r = Rt(), n = Z(), s = ge(), { replace: a } = ce(), { register: i } = ue(), { register: c } = fe(), { close: d, open: u } = we(), { keys: p, preferLegacyKeys: l } = O(), y = useMutation({ mutationKey: p().auth().action("register").get(l), mutationFn: c, onSuccess: async ({ success: T, redirectTo: U, error: D, successNotification: g }) => {
    T && (d == null || d("register-error"), g && (u == null || u(la(g)))), (D || !T) && (u == null || u(Or(D))), U ? n === "legacy" ? a(U) : s({ to: U, type: "replace" }) : n === "legacy" && a("/"), await r();
  }, onError: (T) => {
    u == null || u(Or(T));
  }, ...e === true ? {} : t, meta: { ...e === true ? {} : t == null ? void 0 : t.meta, ...P() } }), f = useMutation({ mutationKey: [...p().auth().action("register").get(l), "v3LegacyAuthProviderCompatible"], mutationFn: i, onSuccess: async (T) => {
    T !== false && (T ? n === "legacy" ? a(T) : s({ to: T, type: "replace" }) : n === "legacy" ? a("/") : s({ to: "/", type: "replace" }), await r(), d == null || d("register-error"));
  }, onError: (T) => {
    u == null || u(Or(T));
  }, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? f : y;
}
o(zr, "useRegister");
var Or = o((e) => ({ message: (e == null ? void 0 : e.name) || "Register Error", description: (e == null ? void 0 : e.message) || "Error while registering", key: "register-error", type: "error" }), "buildNotification"), la = o((e) => ({ message: e.message, description: e.description, key: "register-success", type: "success" }), "buildSuccessNotification");
function jr({ v3LegacyAuthProviderCompatible: e, mutationOptions: t } = {}) {
  let r = Z(), n = ge(), { replace: s } = ce(), { forgotPassword: a } = ue(), { forgotPassword: i } = fe(), { close: c, open: d } = we(), { keys: u, preferLegacyKeys: p } = O(), l = useMutation({ mutationKey: u().auth().action("forgotPassword").get(p), mutationFn: i, onSuccess: ({ success: f, redirectTo: T, error: U, successNotification: D }) => {
    f && (c == null || c("forgot-password-error"), D && (d == null || d(ma(D)))), (U || !f) && (d == null || d(_r(U))), T && (r === "legacy" ? s(T) : n({ to: T, type: "replace" }));
  }, onError: (f) => {
    d == null || d(_r(f));
  }, ...e === true ? {} : t, meta: { ...e === true ? {} : t == null ? void 0 : t.meta, ...P() } }), y = useMutation({ mutationKey: [...u().auth().action("forgotPassword").get(p), "v3LegacyAuthProviderCompatible"], mutationFn: a, onSuccess: (f) => {
    f !== false && f && (r === "legacy" ? s(f) : n({ to: f, type: "replace" })), c == null || c("forgot-password-error");
  }, onError: (f) => {
    d == null || d(_r(f));
  }, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? y : l;
}
o(jr, "useForgotPassword");
var _r = o((e) => ({ message: (e == null ? void 0 : e.name) || "Forgot Password Error", description: (e == null ? void 0 : e.message) || "Error while resetting password", key: "forgot-password-error", type: "error" }), "buildNotification"), ma = o((e) => ({ message: e.message, description: e.description, key: "forgot-password-success", type: "success" }), "buildSuccessNotification");
function Zr({ v3LegacyAuthProviderCompatible: e, mutationOptions: t } = {}) {
  let r = Z(), n = ge(), { replace: s } = ce(), { updatePassword: a } = ue(), { updatePassword: i } = fe(), { close: c, open: d } = we(), { keys: u, preferLegacyKeys: p } = O(), l = ae(), { useLocation: y } = re(), { search: f } = y(), T = React.useMemo(() => r === "legacy" ? ts.parse(f, { ignoreQueryPrefix: true }) ?? {} : l.params ?? {}, [f, l, r]), U = useMutation({ mutationKey: u().auth().action("updatePassword").get(p), mutationFn: async (g) => i == null ? void 0 : i({ ...T, ...g }), onSuccess: ({ success: g, redirectTo: R, error: w, successNotification: I }) => {
    g && (c == null || c("update-password-error"), I && (d == null || d(ga(I)))), (w || !g) && (d == null || d(Xr(w))), R && (r === "legacy" ? s(R) : n({ to: R, type: "replace" }));
  }, onError: (g) => {
    d == null || d(Xr(g));
  }, ...e === true ? {} : t, meta: { ...e === true ? {} : t == null ? void 0 : t.meta, ...P() } }), D = useMutation({ mutationKey: [...u().auth().action("updatePassword").get(p), "v3LegacyAuthProviderCompatible"], mutationFn: async (g) => a == null ? void 0 : a({ ...T, ...g }), onSuccess: (g) => {
    g !== false && g && (r === "legacy" ? s(g) : n({ to: g, type: "replace" })), c == null || c("update-password-error");
  }, onError: (g) => {
    d == null || d(Xr(g));
  }, ...e ? t : {}, meta: { ...e ? t == null ? void 0 : t.meta : {}, ...P() } });
  return e ? D : U;
}
o(Zr, "useUpdatePassword");
var Xr = o((e) => ({ message: (e == null ? void 0 : e.name) || "Update Password Error", description: (e == null ? void 0 : e.message) || "Error while updating password", key: "update-password-error", type: "error" }), "buildNotification"), ga = o((e) => ({ message: e.message, description: e.description, key: "update-password-success", type: "success" }), "buildSuccessNotification");
function fr({ v3LegacyAuthProviderCompatible: e = false, params: t } = {}) {
  let { checkAuth: r } = ue(), { check: n } = fe(), { keys: s, preferLegacyKeys: a } = O(), i = useQuery({ queryKey: s().auth().action("check").params(t).get(a), queryFn: async () => await (n == null ? void 0 : n(t)) ?? {}, retry: false, enabled: !e, meta: { ...P() } }), c = useQuery({ queryKey: [...s().auth().action("check").params(t).get(a), "v3LegacyAuthProviderCompatible"], queryFn: async () => await (r == null ? void 0 : r(t)) ?? {}, retry: false, enabled: e, meta: { ...P() } });
  return e ? c : i;
}
o(fr, "useIsAuthenticated");
function de({ v3LegacyAuthProviderCompatible: e = false } = {}) {
  let t = Z(), r = ge(), { replace: n } = ce(), { checkError: s } = ue(), { onError: a } = fe(), { keys: i, preferLegacyKeys: c } = O(), { mutate: d } = mr({ v3LegacyAuthProviderCompatible: !!e }), { mutate: u } = mr({ v3LegacyAuthProviderCompatible: !!e }), p = useMutation({ mutationKey: i().auth().action("onError").get(c), mutationFn: a, onSuccess: ({ logout: y, redirectTo: f }) => {
    if (y) {
      u({ redirectPath: f });
      return;
    }
    if (f) {
      t === "legacy" ? n(f) : r({ to: f, type: "replace" });
      return;
    }
  }, meta: { ...P() } }), l = useMutation({ mutationKey: [...i().auth().action("onError").get(c), "v3LegacyAuthProviderCompatible"], mutationFn: s, onError: (y) => {
    d({ redirectPath: y });
  }, meta: { ...P() } });
  return e ? l : p;
}
o(de, "useOnError");
var Yr = o(() => {
  let { isProvided: e } = ue(), { isProvided: t } = fe();
  return !!(t || e);
}, "useIsExistAuthentication");
var ee = o(({ isLoading: e, interval: t, onInterval: r }) => {
  let [n, s] = reactExports.useState(void 0), { options: a } = se(), { overtime: i } = a, c = t ?? i.interval, d = r ?? (i == null ? void 0 : i.onInterval);
  return reactExports.useEffect(() => {
    let u;
    return e && (u = setInterval(() => {
      s((p) => p === void 0 ? c : p + c);
    }, c)), () => {
      clearInterval(u), s(void 0);
    };
  }, [e, c]), reactExports.useEffect(() => {
    d && n && d(n);
  }, [n]), { elapsedTime: n };
}, "useLoadingOvertime");
var At = o(({ resource: e, config: t, filters: r, hasPagination: n, pagination: s, sorters: a, queryOptions: i, successNotification: c, errorNotification: d, meta: u, metaData: p, liveMode: l, onLiveEvent: y, liveParams: f, dataProviderName: T, overtimeOptions: U } = {}) => {
  let { resources: D, resource: g, identifier: R } = z(e), w = ne(), I = H(), P$1 = J(), { mutate: x } = de({ v3LegacyAuthProviderCompatible: !!(P$1 != null && P$1.isLegacy) }), m = pe(), v = q(), { keys: b, preferLegacyKeys: C } = O(), E = j(R, T, D), h = F(u, p), L = F(r, t == null ? void 0 : t.filters), A = F(a, t == null ? void 0 : t.sort), M = F(n, t == null ? void 0 : t.hasPagination), Q = St({ pagination: s, configPagination: t == null ? void 0 : t.pagination, hasPagination: M }), S = Q.mode === "server", G = v({ resource: g, meta: h }), $ = { meta: G, metaData: G, filters: L, hasPagination: S, pagination: Q, sorters: A, config: { ...t, sort: A } }, K = (i == null ? void 0 : i.enabled) === void 0 || (i == null ? void 0 : i.enabled) === true, { getList: X } = w(E);
  st({ resource: R, types: ["*"], params: { meta: G, metaData: G, pagination: Q, hasPagination: S, sort: A, sorters: A, filters: L, subscriptionType: "useList", ...f }, channel: `resources/${g == null ? void 0 : g.name}`, enabled: K, liveMode: l, onLiveEvent: y, dataProviderName: E, meta: { ...u, dataProviderName: T } });
  let N = useQuery({ queryKey: b().data(E).resource(R ?? "").action("list").params({ ...h || {}, filters: L, hasPagination: S, ...S && { pagination: Q }, ...a && { sorters: a }, ...(t == null ? void 0 : t.sort) && { sort: t == null ? void 0 : t.sort } }).get(C), queryFn: ({ queryKey: V, pageParam: B, signal: _ }) => X({ resource: (g == null ? void 0 : g.name) ?? "", pagination: Q, hasPagination: S, filters: L, sort: A, sorters: A, meta: { ...G, queryContext: { queryKey: V, pageParam: B, signal: _ } }, metaData: { ...G, queryContext: { queryKey: V, pageParam: B, signal: _ } } }), ...i, enabled: typeof (i == null ? void 0 : i.enabled) < "u" ? i == null ? void 0 : i.enabled : !!(g != null && g.name), select: (V) => {
    var De;
    let B = V, { current: _, mode: te, pageSize: ie } = Q;
    return te === "client" && (B = { ...B, data: B.data.slice((_ - 1) * ie, _ * ie), total: B.total }), i != null && i.select ? (De = i == null ? void 0 : i.select) == null ? void 0 : De.call(i, B) : B;
  }, onSuccess: (V) => {
    var _;
    (_ = i == null ? void 0 : i.onSuccess) == null || _.call(i, V);
    let B = typeof c == "function" ? c(V, $, R) : c;
    m(B);
  }, onError: (V) => {
    var _;
    x(V), (_ = i == null ? void 0 : i.onError) == null || _.call(i, V);
    let B = typeof d == "function" ? d(V, $, R) : d;
    m(B, { key: `${R}-useList-notification`, message: I("notifications.error", { statusCode: V.statusCode }, `Error (status code: ${V.statusCode})`), description: V.message, type: "error" });
  }, meta: { ...i == null ? void 0 : i.meta, ...P() } }), { elapsedTime: W } = ee({ isLoading: N.isFetching, interval: U == null ? void 0 : U.interval, onInterval: U == null ? void 0 : U.onInterval });
  return { ...N, overtime: { elapsedTime: W } };
}, "useList");
var kt = o(({ resource: e, id: t, queryOptions: r, successNotification: n, errorNotification: s, meta: a, metaData: i, liveMode: c, onLiveEvent: d, liveParams: u, dataProviderName: p, overtimeOptions: l }) => {
  let { resources: y, resource: f, identifier: T } = z(e), U = ne(), D = H(), g = J(), { mutate: R } = de({ v3LegacyAuthProviderCompatible: !!(g != null && g.isLegacy) }), w = pe(), I = q(), { keys: P$1, preferLegacyKeys: x } = O(), m = F(a, i), v = j(T, p, y), { getOne: b } = U(v), C = I({ resource: f, meta: m });
  st({ resource: T, types: ["*"], channel: `resources/${f == null ? void 0 : f.name}`, params: { ids: t ? [t] : [], id: t, meta: C, metaData: C, subscriptionType: "useOne", ...u }, enabled: typeof (r == null ? void 0 : r.enabled) < "u" ? r == null ? void 0 : r.enabled : typeof (f == null ? void 0 : f.name) < "u" && typeof t < "u", liveMode: c, onLiveEvent: d, dataProviderName: v, meta: { ...a, dataProviderName: p } });
  let E = useQuery({ queryKey: P$1().data(v).resource(T ?? "").action("one").id(t ?? "").params({ ...m || {} }).get(x), queryFn: ({ queryKey: L, pageParam: A, signal: M }) => b({ resource: (f == null ? void 0 : f.name) ?? "", id: t, meta: { ...C, queryContext: { queryKey: L, pageParam: A, signal: M } }, metaData: { ...C, queryContext: { queryKey: L, pageParam: A, signal: M } } }), ...r, enabled: typeof (r == null ? void 0 : r.enabled) < "u" ? r == null ? void 0 : r.enabled : typeof t < "u", onSuccess: (L) => {
    var M;
    (M = r == null ? void 0 : r.onSuccess) == null || M.call(r, L);
    let A = typeof n == "function" ? n(L, { id: t, ...C }, T) : n;
    w(A);
  }, onError: (L) => {
    var M;
    R(L), (M = r == null ? void 0 : r.onError) == null || M.call(r, L);
    let A = typeof s == "function" ? s(L, { id: t, ...C }, T) : s;
    w(A, { key: `${t}-${T}-getOne-notification`, message: D("notifications.error", { statusCode: L.statusCode }, `Error (status code: ${L.statusCode})`), description: L.message, type: "error" });
  }, meta: { ...r == null ? void 0 : r.meta, ...P() } }), { elapsedTime: h } = ee({ isLoading: E.isFetching, interval: l == null ? void 0 : l.interval, onInterval: l == null ? void 0 : l.onInterval });
  return { ...E, overtime: { elapsedTime: h } };
}, "useOne");
var Jr = o(({ resource: e, ids: t, queryOptions: r, successNotification: n, errorNotification: s, meta: a, metaData: i, liveMode: c, onLiveEvent: d, liveParams: u, dataProviderName: p, overtimeOptions: l }) => {
  let { resources: y, resource: f, identifier: T } = z(e), U = ne(), D = H(), g = J(), { mutate: R } = de({ v3LegacyAuthProviderCompatible: !!(g != null && g.isLegacy) }), w = pe(), I = q(), { keys: P$1, preferLegacyKeys: x } = O(), m = F(a, i), v = j(T, p, y), b = (r == null ? void 0 : r.enabled) === void 0 || (r == null ? void 0 : r.enabled) === true, { getMany: C, getOne: E } = U(v), h = I({ resource: f, meta: m });
  st({ resource: T, types: ["*"], params: { ids: t, meta: h, metaData: h, subscriptionType: "useMany", ...u }, channel: `resources/${f.name}`, enabled: b, liveMode: c, onLiveEvent: d, dataProviderName: v, meta: { ...a, dataProviderName: p } });
  let L = useQuery({ queryKey: P$1().data(v).resource(T).action("many").ids(...t).params({ ...m || {} }).get(x), queryFn: ({ queryKey: M, pageParam: Q, signal: S }) => C ? C({ resource: f == null ? void 0 : f.name, ids: t, meta: { ...h, queryContext: { queryKey: M, pageParam: Q, signal: S } }, metaData: { ...h, queryContext: { queryKey: M, pageParam: Q, signal: S } } }) : Je(t.map((G) => E({ resource: f == null ? void 0 : f.name, id: G, meta: { ...h, queryContext: { queryKey: M, pageParam: Q, signal: S } }, metaData: { ...h, queryContext: { queryKey: M, pageParam: Q, signal: S } } }))), ...r, onSuccess: (M) => {
    var S;
    (S = r == null ? void 0 : r.onSuccess) == null || S.call(r, M);
    let Q = typeof n == "function" ? n(M, t, T) : n;
    w(Q);
  }, onError: (M) => {
    var S;
    R(M), (S = r == null ? void 0 : r.onError) == null || S.call(r, M);
    let Q = typeof s == "function" ? s(M, t, T) : s;
    w(Q, { key: `${t[0]}-${T}-getMany-notification`, message: D("notifications.error", { statusCode: M.statusCode }, `Error (status code: ${M.statusCode})`), description: M.message, type: "error" });
  }, meta: { ...r == null ? void 0 : r.meta, ...P() } }), { elapsedTime: A } = ee({ isLoading: L.isFetching, interval: l == null ? void 0 : l.interval, onInterval: l == null ? void 0 : l.onInterval });
  return { ...L, overtime: { elapsedTime: A } };
}, "useMany");
var qr = o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let { resources: r, select: n } = z(), s = useQueryClient(), a = ne(), { mutationMode: i, undoableTimeout: c } = Ae(), d = H(), u = J(), { mutate: p } = de({ v3LegacyAuthProviderCompatible: !!(u != null && u.isLegacy) }), l = Ve(), { log: y } = Be(), { notificationDispatch: f } = _e(), T = pe(), U = Ce(), D = q(), { options: { textTransformers: g } } = se(), { keys: R, preferLegacyKeys: w } = O(), I = useMutation({ mutationFn: ({ id: x, values: m, resource: v, mutationMode: b, undoableTimeout: C, onCancel: E, meta: h, metaData: L, dataProviderName: A }) => {
    let { resource: M, identifier: Q } = n(v), S = D({ resource: M, meta: F(h, L) }), G = b ?? i, $ = C ?? c;
    return G !== "undoable" ? a(j(Q, A, r)).update({ resource: M.name, id: x, variables: m, meta: S, metaData: S }) : new Promise((X, N) => {
      let W = o(() => {
        a(j(Q, A, r)).update({ resource: M.name, id: x, variables: m, meta: S, metaData: S }).then((B) => X(B)).catch((B) => N(B));
      }, "doMutation"), V = o(() => {
        N({ message: "mutationCancelled" });
      }, "cancelMutation");
      E && E(V), f({ type: "ADD", payload: { id: x, resource: Q, cancelMutation: V, doMutation: W, seconds: $, isSilent: !!E } });
    });
  }, onMutate: async ({ resource: x, id: m, mutationMode: v, values: b, dataProviderName: C, meta: E, metaData: h, optimisticUpdateMap: L = { list: true, many: true, detail: true } }) => {
    let { identifier: A } = n(x), { gqlMutation: M, gqlQuery: Q, ...S } = F(E, h) ?? {}, G = Ye(w)(A, j(A, C, r), S), $ = R().data(j(A, C, r)).resource(A), K = s.getQueriesData($.get(w)), X = v ?? i;
    return await s.cancelQueries($.get(w), void 0, { silent: true }), X !== "pessimistic" && (L.list && s.setQueriesData($.action("list").params(S ?? {}).get(w), (N) => {
      if (typeof L.list == "function")
        return L.list(N, b, m);
      if (!N)
        return null;
      let W = N.data.map((V) => {
        var B;
        return ((B = V.id) == null ? void 0 : B.toString()) === (m == null ? void 0 : m.toString()) ? { id: m, ...V, ...b } : V;
      });
      return { ...N, data: W };
    }), L.many && s.setQueriesData($.action("many").get(w), (N) => {
      if (typeof L.many == "function")
        return L.many(N, b, m);
      if (!N)
        return null;
      let W = N.data.map((V) => {
        var B;
        return ((B = V.id) == null ? void 0 : B.toString()) === (m == null ? void 0 : m.toString()) && (V = { id: m, ...V, ...b }), V;
      });
      return { ...N, data: W };
    }), L.detail && s.setQueriesData($.action("one").id(m).params(S ?? {}).get(w), (N) => typeof L.detail == "function" ? L.detail(N, b, m) : N ? { ...N, data: { ...N.data, ...b } } : null)), { previousQueries: K, queryKey: G };
  }, onSettled: (x, m, { id: v, resource: b, dataProviderName: C, invalidates: E = ["list", "many", "detail"] }) => {
    let { identifier: h } = n(b);
    U({ resource: h, dataProviderName: j(h, C, r), invalidates: E, id: v }), f({ type: "REMOVE", payload: { id: v, resource: h } });
  }, onSuccess: (x, { id: m, resource: v, successNotification: b, dataProviderName: C, values: E, meta: h, metaData: L }, A) => {
    var _;
    let { resource: M, identifier: Q } = n(v), S = g.singular(Q), G = j(Q, C, r), $ = D({ resource: M, meta: F(h, L) }), K = typeof b == "function" ? b(x, { id: m, values: E }, Q) : b;
    T(K, { key: `${m}-${Q}-notification`, description: d("notifications.success", "Successful"), message: d("notifications.editSuccess", { resource: d(`${Q}.${Q}`, S) }, `Successfully updated ${S}`), type: "success" }), l == null || l({ channel: `resources/${M.name}`, type: "updated", payload: { ids: (_ = x.data) != null && _.id ? [x.data.id] : void 0 }, date: /* @__PURE__ */ new Date(), meta: { ...$, dataProviderName: G } });
    let X;
    if (A) {
      let te = s.getQueryData(A.queryKey.detail(m));
      X = Object.keys(E || {}).reduce((ie, De) => {
        var Y;
        return ie[De] = (Y = te == null ? void 0 : te.data) == null ? void 0 : Y[De], ie;
      }, {});
    }
    let { fields: N, operation: W, variables: V, ...B } = $ || {};
    y == null || y.mutate({ action: "update", resource: M.name, data: E, previousData: X, meta: { id: m, dataProviderName: G, ...B } });
  }, onError: (x, { id: m, resource: v, errorNotification: b, values: C }, E) => {
    let { identifier: h } = n(v);
    if (E)
      for (let L of E.previousQueries)
        s.setQueryData(L[0], L[1]);
    if (x.message !== "mutationCancelled") {
      p == null || p(x);
      let L = g.singular(h), A = typeof b == "function" ? b(x, { id: m, values: C }, h) : b;
      T(A, { key: `${m}-${h}-notification`, message: d("notifications.editError", { resource: d(`${h}.${h}`, L), statusCode: x.statusCode }, `Error when updating ${L} (status code: ${x.statusCode})`), description: x.message, type: "error" });
    }
  }, mutationKey: R().data().mutation("update").get(w), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: P$1 } = ee({ isLoading: I.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...I, overtime: { elapsedTime: P$1 } };
}, "useUpdate");
var Qt = o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let r = J(), { mutate: n } = de({ v3LegacyAuthProviderCompatible: !!(r != null && r.isLegacy) }), s = ne(), a = Ce(), { resources: i, select: c } = z(), d = H(), u = Ve(), { log: p } = Be(), l = pe(), y = q(), { options: { textTransformers: f } } = se(), { keys: T, preferLegacyKeys: U } = O(), D = useMutation({ mutationFn: ({ resource: R, values: w, meta: I, metaData: P2, dataProviderName: x }) => {
    let { resource: m, identifier: v } = c(R), b = y({ resource: m, meta: F(I, P2) });
    return s(j(v, x, i)).create({ resource: m.name, variables: w, meta: b, metaData: b });
  }, onSuccess: (R, { resource: w, successNotification: I, dataProviderName: P2, invalidates: x = ["list", "many"], values: m, meta: v, metaData: b }) => {
    var K, X;
    let { resource: C, identifier: E } = c(w), h = f.singular(E), L = j(E, P2, i), A = y({ resource: C, meta: F(v, b) }), M = typeof I == "function" ? I(R, m, E) : I;
    l(M, { key: `create-${E}-notification`, message: d("notifications.createSuccess", { resource: d(`${E}.${E}`, h) }, `Successfully created ${h}`), description: d("notifications.success", "Success"), type: "success" }), a({ resource: E, dataProviderName: L, invalidates: x }), u == null || u({ channel: `resources/${C.name}`, type: "created", payload: { ids: (K = R == null ? void 0 : R.data) != null && K.id ? [R.data.id] : void 0 }, date: /* @__PURE__ */ new Date(), meta: { ...A, dataProviderName: L } });
    let { fields: Q, operation: S, variables: G, ...$ } = A || {};
    p == null || p.mutate({ action: "create", resource: C.name, data: m, meta: { dataProviderName: L, id: ((X = R == null ? void 0 : R.data) == null ? void 0 : X.id) ?? void 0, ...$ } });
  }, onError: (R, { resource: w, errorNotification: I, values: P2 }) => {
    n(R);
    let { identifier: x } = c(w), m = f.singular(x), v = typeof I == "function" ? I(R, P2, x) : I;
    l(v, { key: `create-${x}-notification`, description: R.message, message: d("notifications.createError", { resource: d(`${x}.${x}`, m), statusCode: R.statusCode }, `There was an error creating ${m} (status code: ${R.statusCode})`), type: "error" });
  }, mutationKey: T().data().mutation("create").get(U), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: g } = ee({ isLoading: D.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...D, overtime: { elapsedTime: g } };
}, "useCreate");
var eo = o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let r = J(), { mutate: n } = de({ v3LegacyAuthProviderCompatible: !!(r != null && r.isLegacy) }), s = ne(), { resources: a, select: i } = z(), c = useQueryClient(), { mutationMode: d, undoableTimeout: u } = Ae(), { notificationDispatch: p } = _e(), l = H(), y = Ve(), { log: f } = Be(), T = pe(), U = Ce(), D = q(), { options: { textTransformers: g } } = se(), { keys: R, preferLegacyKeys: w } = O(), I = useMutation({ mutationFn: ({ id: x, mutationMode: m, undoableTimeout: v, resource: b, onCancel: C, meta: E, metaData: h, dataProviderName: L, values: A }) => {
    let { resource: M, identifier: Q } = i(b), S = D({ resource: M, meta: F(E, h) }), G = m ?? d, $ = v ?? u;
    return G !== "undoable" ? s(j(Q, L, a)).deleteOne({ resource: M.name, id: x, meta: S, metaData: S, variables: A }) : new Promise((X, N) => {
      let W = o(() => {
        s(j(Q, L, a)).deleteOne({ resource: M.name, id: x, meta: S, metaData: S, variables: A }).then((B) => X(B)).catch((B) => N(B));
      }, "doMutation"), V = o(() => {
        N({ message: "mutationCancelled" });
      }, "cancelMutation");
      C && C(V), p({ type: "ADD", payload: { id: x, resource: Q, cancelMutation: V, doMutation: W, seconds: $, isSilent: !!C } });
    });
  }, onMutate: async ({ id: x, resource: m, mutationMode: v, dataProviderName: b, meta: C, metaData: E }) => {
    let { identifier: h } = i(m), { gqlMutation: L, gqlQuery: A, ...M } = F(C, E) ?? {}, Q = Ye(w)(h, j(h, b, a), M), S = R().data(j(h, b, a)).resource(h), G = v ?? d;
    await c.cancelQueries(S.get(w), void 0, { silent: true });
    let $ = c.getQueriesData(S.get(w));
    return G !== "pessimistic" && (c.setQueriesData(S.action("list").params(M ?? {}).get(w), (K) => K ? { data: K.data.filter((N) => {
      var W;
      return ((W = N.id) == null ? void 0 : W.toString()) !== x.toString();
    }), total: K.total - 1 } : null), c.setQueriesData(S.action("many").get(w), (K) => {
      if (!K)
        return null;
      let X = K.data.filter((N) => {
        var W;
        return ((W = N.id) == null ? void 0 : W.toString()) !== (x == null ? void 0 : x.toString());
      });
      return { ...K, data: X };
    })), { previousQueries: $, queryKey: Q };
  }, onSettled: (x, m, { id: v, resource: b, dataProviderName: C, invalidates: E = ["list", "many"] }) => {
    let { identifier: h } = i(b);
    U({ resource: h, dataProviderName: j(h, C, a), invalidates: E }), p({ type: "REMOVE", payload: { id: v, resource: h } });
  }, onSuccess: (x, { id: m, resource: v, successNotification: b, dataProviderName: C, meta: E, metaData: h }, L) => {
    let { resource: A, identifier: M } = i(v), Q = g.singular(M), S = j(M, C, a), G = D({ resource: A, meta: F(E, h) });
    c.removeQueries(L == null ? void 0 : L.queryKey.detail(m));
    let $ = typeof b == "function" ? b(x, m, M) : b;
    T($, { key: `${m}-${M}-notification`, description: l("notifications.success", "Success"), message: l("notifications.deleteSuccess", { resource: l(`${M}.${M}`, Q) }, `Successfully deleted a ${Q}`), type: "success" }), y == null || y({ channel: `resources/${A.name}`, type: "deleted", payload: { ids: [m] }, date: /* @__PURE__ */ new Date(), meta: { ...G, dataProviderName: S } });
    let { fields: K, operation: X, variables: N, ...W } = G || {};
    f == null || f.mutate({ action: "delete", resource: A.name, meta: { id: m, dataProviderName: S, ...W } }), c.removeQueries(L == null ? void 0 : L.queryKey.detail(m));
  }, onError: (x, { id: m, resource: v, errorNotification: b }, C) => {
    let { identifier: E } = i(v);
    if (C)
      for (let h of C.previousQueries)
        c.setQueryData(h[0], h[1]);
    if (x.message !== "mutationCancelled") {
      n(x);
      let h = g.singular(E), L = typeof b == "function" ? b(x, m, E) : b;
      T(L, { key: `${m}-${E}-notification`, message: l("notifications.deleteError", { resource: h, statusCode: x.statusCode }, `Error (status code: ${x.statusCode})`), description: x.message, type: "error" });
    }
  }, mutationKey: R().data().mutation("delete").get(w), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: P$1 } = ee({ isLoading: I.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...I, overtime: { elapsedTime: P$1 } };
}, "useDelete");
var to = o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let r = ne(), { resources: n, select: s } = z(), a = H(), i = Ve(), c = pe(), d = Ce(), { log: u } = Be(), p = q(), { options: { textTransformers: l } } = se(), { keys: y, preferLegacyKeys: f } = O(), T = useMutation({ mutationFn: ({ resource: D, values: g, meta: R, metaData: w, dataProviderName: I }) => {
    let { resource: P2, identifier: x } = s(D), m = p({ resource: P2, meta: F(R, w) }), v = r(j(x, I, n));
    return v.createMany ? v.createMany({ resource: P2.name, variables: g, meta: m, metaData: m }) : Je(g.map((b) => v.create({ resource: P2.name, variables: b, meta: m, metaData: m })));
  }, onSuccess: (D, { resource: g, successNotification: R, dataProviderName: w, invalidates: I = ["list", "many"], values: P2, meta: x, metaData: m }) => {
    let { resource: v, identifier: b } = s(g), C = l.plural(b), E = j(b, w, n), h = p({ resource: v, meta: F(x, m) }), L = typeof R == "function" ? R(D, P2, b) : R;
    c(L, { key: `createMany-${b}-notification`, message: a("notifications.createSuccess", { resource: a(`${b}.${b}`, b) }, `Successfully created ${C}`), description: a("notifications.success", "Success"), type: "success" }), d({ resource: b, dataProviderName: E, invalidates: I });
    let A = D == null ? void 0 : D.data.filter(($) => ($ == null ? void 0 : $.id) !== void 0).map(($) => $.id);
    i == null || i({ channel: `resources/${v.name}`, type: "created", payload: { ids: A }, date: /* @__PURE__ */ new Date(), meta: { ...h, dataProviderName: E } });
    let { fields: M, operation: Q, variables: S, ...G } = h || {};
    u == null || u.mutate({ action: "createMany", resource: v.name, data: P2, meta: { dataProviderName: E, ids: A, ...G } });
  }, onError: (D, { resource: g, errorNotification: R, values: w }) => {
    let { identifier: I } = s(g), P2 = typeof R == "function" ? R(D, w, I) : R;
    c(P2, { key: `createMany-${I}-notification`, description: D.message, message: a("notifications.createError", { resource: a(`${I}.${I}`, I), statusCode: D.statusCode }, `There was an error creating ${I} (status code: ${D.statusCode}`), type: "error" });
  }, mutationKey: y().data().mutation("createMany").get(f), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: U } = ee({ isLoading: T.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...T, overtime: { elapsedTime: U } };
}, "useCreateMany");
o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let { resources: r, select: n } = z(), s = useQueryClient(), a = ne(), i = H(), { mutationMode: c, undoableTimeout: d } = Ae(), u = J(), { mutate: p } = de({ v3LegacyAuthProviderCompatible: !!(u != null && u.isLegacy) }), { notificationDispatch: l } = _e(), y = Ve(), f = pe(), T = Ce(), { log: U } = Be(), D = q(), { options: { textTransformers: g } } = se(), { keys: R, preferLegacyKeys: w } = O(), I = useMutation({ mutationFn: ({ ids: x, values: m, resource: v, onCancel: b, mutationMode: C, undoableTimeout: E, meta: h, metaData: L, dataProviderName: A }) => {
    let { resource: M, identifier: Q } = n(v), S = D({ resource: M, meta: F(h, L) }), G = C ?? c, $ = E ?? d, K = a(j(Q, A, r)), X = o(() => K.updateMany ? K.updateMany({ resource: M.name, ids: x, variables: m, meta: S, metaData: S }) : Je(x.map((W) => K.update({ resource: M.name, id: W, variables: m, meta: S, metaData: S }))), "mutationFn");
    return G !== "undoable" ? X() : new Promise((W, V) => {
      let B = o(() => {
        X().then((te) => W(te)).catch((te) => V(te));
      }, "doMutation"), _ = o(() => {
        V({ message: "mutationCancelled" });
      }, "cancelMutation");
      b && b(_), l({ type: "ADD", payload: { id: x, resource: Q, cancelMutation: _, doMutation: B, seconds: $, isSilent: !!b } });
    });
  }, onMutate: async ({ resource: x, ids: m, values: v, mutationMode: b, dataProviderName: C, meta: E, metaData: h, optimisticUpdateMap: L = { list: true, many: true, detail: true } }) => {
    let { identifier: A } = n(x), { gqlMutation: M, gqlQuery: Q, ...S } = F(E, h) ?? {}, G = Ye(w)(A, j(A, C, r), S), $ = R().data(j(A, C, r)).resource(A), K = b ?? c;
    await s.cancelQueries($.get(w), void 0, { silent: true });
    let X = s.getQueriesData($.get(w));
    if (K !== "pessimistic" && (L.list && s.setQueriesData($.action("list").params(S ?? {}).get(w), (N) => {
      if (typeof L.list == "function")
        return L.list(N, v, m);
      if (!N)
        return null;
      let W = N.data.map((V) => V.id !== void 0 && m.filter((B) => B !== void 0).map(String).includes(V.id.toString()) ? { ...V, ...v } : V);
      return { ...N, data: W };
    }), L.many && s.setQueriesData($.action("many").get(w), (N) => {
      if (typeof L.many == "function")
        return L.many(N, v, m);
      if (!N)
        return null;
      let W = N.data.map((V) => V.id !== void 0 && m.filter((B) => B !== void 0).map(String).includes(V.id.toString()) ? { ...V, ...v } : V);
      return { ...N, data: W };
    }), L.detail))
      for (let N of m)
        s.setQueriesData($.action("one").id(N).params(S ?? {}).get(w), (W) => {
          if (typeof L.detail == "function")
            return L.detail(W, v, N);
          if (!W)
            return null;
          let V = { ...W.data, ...v };
          return { ...W, data: V };
        });
    return { previousQueries: X, queryKey: G };
  }, onSettled: (x, m, { ids: v, resource: b, dataProviderName: C }) => {
    let { identifier: E } = n(b);
    T({ resource: E, invalidates: ["list", "many"], dataProviderName: j(E, C, r) }), v.forEach((h) => T({ resource: E, invalidates: ["detail"], dataProviderName: j(E, C, r), id: h })), l({ type: "REMOVE", payload: { id: v, resource: E } });
  }, onSuccess: (x, { ids: m, resource: v, meta: b, metaData: C, dataProviderName: E, successNotification: h, values: L }, A) => {
    let { resource: M, identifier: Q } = n(v), S = g.singular(Q), G = j(Q, E, r), $ = D({ resource: M, meta: F(b, C) }), K = typeof h == "function" ? h(x, { ids: m, values: L }, Q) : h;
    f(K, { key: `${m}-${Q}-notification`, description: i("notifications.success", "Successful"), message: i("notifications.editSuccess", { resource: i(`${Q}.${Q}`, Q) }, `Successfully updated ${S}`), type: "success" }), y == null || y({ channel: `resources/${M.name}`, type: "updated", payload: { ids: m.map(String) }, date: /* @__PURE__ */ new Date(), meta: { ...$, dataProviderName: G } });
    let X = [];
    A && m.forEach((_) => {
      let te = s.getQueryData(A.queryKey.detail(_));
      X.push(Object.keys(L || {}).reduce((ie, De) => {
        var Y;
        return ie[De] = (Y = te == null ? void 0 : te.data) == null ? void 0 : Y[De], ie;
      }, {}));
    });
    let { fields: N, operation: W, variables: V, ...B } = $ || {};
    U == null || U.mutate({ action: "updateMany", resource: M.name, data: L, previousData: X, meta: { ids: m, dataProviderName: G, ...B } });
  }, onError: (x, { ids: m, resource: v, errorNotification: b, values: C }, E) => {
    let { identifier: h } = n(v);
    if (E)
      for (let L of E.previousQueries)
        s.setQueryData(L[0], L[1]);
    if (x.message !== "mutationCancelled") {
      p == null || p(x);
      let L = g.singular(h), A = typeof b == "function" ? b(x, { ids: m, values: C }, h) : b;
      f(A, { key: `${m}-${h}-updateMany-error-notification`, message: i("notifications.editError", { resource: L, statusCode: x.statusCode }, `Error when updating ${L} (status code: ${x.statusCode})`), description: x.message, type: "error" });
    }
  }, mutationKey: R().data().mutation("updateMany").get(w), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: P$1 } = ee({ isLoading: I.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...I, overtime: { elapsedTime: P$1 } };
}, "useUpdateMany");
o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let r = J(), { mutate: n } = de({ v3LegacyAuthProviderCompatible: !!(r != null && r.isLegacy) }), { mutationMode: s, undoableTimeout: a } = Ae(), i = ne(), { notificationDispatch: c } = _e(), d = H(), u = Ve(), p = pe(), l = Ce(), { log: y } = Be(), { resources: f, select: T } = z(), U = useQueryClient(), D = q(), { options: { textTransformers: g } } = se(), { keys: R, preferLegacyKeys: w } = O(), I = useMutation({ mutationFn: ({ resource: x, ids: m, mutationMode: v, undoableTimeout: b, onCancel: C, meta: E, metaData: h, dataProviderName: L, values: A }) => {
    let { resource: M, identifier: Q } = T(x), S = D({ resource: M, meta: F(E, h) }), G = v ?? s, $ = b ?? a, K = i(j(Q, L, f)), X = o(() => K.deleteMany ? K.deleteMany({ resource: M.name, ids: m, meta: S, metaData: S, variables: A }) : Je(m.map((W) => K.deleteOne({ resource: M.name, id: W, meta: S, metaData: S, variables: A }))), "mutationFn");
    return G !== "undoable" ? X() : new Promise((W, V) => {
      let B = o(() => {
        X().then((te) => W(te)).catch((te) => V(te));
      }, "doMutation"), _ = o(() => {
        V({ message: "mutationCancelled" });
      }, "cancelMutation");
      C && C(_), c({ type: "ADD", payload: { id: m, resource: Q, cancelMutation: _, doMutation: B, seconds: $, isSilent: !!C } });
    });
  }, onMutate: async ({ ids: x, resource: m, mutationMode: v, dataProviderName: b, meta: C, metaData: E }) => {
    let { identifier: h } = T(m), { gqlMutation: L, gqlQuery: A, ...M } = F(C, E) ?? {}, Q = Ye(w)(h, j(h, b, f), M), S = R().data(j(h, b, f)).resource(h), G = v ?? s;
    await U.cancelQueries(S.get(w), void 0, { silent: true });
    let $ = U.getQueriesData(S.get(w));
    if (G !== "pessimistic") {
      U.setQueriesData(S.action("list").params(M ?? {}).get(w), (K) => K ? { data: K.data.filter((N) => N.id && !x.map(String).includes(N.id.toString())), total: K.total - 1 } : null), U.setQueriesData(S.action("many").get(w), (K) => {
        if (!K)
          return null;
        let X = K.data.filter((N) => N.id ? !x.map(String).includes(N.id.toString()) : false);
        return { ...K, data: X };
      });
      for (let K of x)
        U.setQueriesData(S.action("one").id(K).params(M).get(w), (X) => !X || X.data.id === K ? null : { ...X });
    }
    return { previousQueries: $, queryKey: Q };
  }, onSettled: (x, m, { resource: v, ids: b, dataProviderName: C, invalidates: E = ["list", "many"] }) => {
    let { identifier: h } = T(v);
    l({ resource: h, dataProviderName: j(h, C, f), invalidates: E }), c({ type: "REMOVE", payload: { id: b, resource: h } });
  }, onSuccess: (x, { ids: m, resource: v, meta: b, metaData: C, dataProviderName: E, successNotification: h }, L) => {
    let { resource: A, identifier: M } = T(v), Q = j(M, E, f), S = D({ resource: A, meta: F(b, C) });
    m.forEach((W) => U.removeQueries(L == null ? void 0 : L.queryKey.detail(W)));
    let G = typeof h == "function" ? h(x, m, M) : h;
    p(G, { key: `${m}-${M}-notification`, description: d("notifications.success", "Success"), message: d("notifications.deleteSuccess", { resource: d(`${M}.${M}`, M) }, `Successfully deleted ${M}`), type: "success" }), u == null || u({ channel: `resources/${A.name}`, type: "deleted", payload: { ids: m }, date: /* @__PURE__ */ new Date(), meta: { ...S, dataProviderName: Q } });
    let { fields: $, operation: K, variables: X, ...N } = S || {};
    y == null || y.mutate({ action: "deleteMany", resource: A.name, meta: { ids: m, dataProviderName: Q, ...N } }), m.forEach((W) => U.removeQueries(L == null ? void 0 : L.queryKey.detail(W)));
  }, onError: (x, { ids: m, resource: v, errorNotification: b }, C) => {
    let { identifier: E } = T(v);
    if (C)
      for (let h of C.previousQueries)
        U.setQueryData(h[0], h[1]);
    if (x.message !== "mutationCancelled") {
      n(x);
      let h = g.singular(E), L = typeof b == "function" ? b(x, m, E) : b;
      p(L, { key: `${m}-${E}-notification`, message: d("notifications.deleteError", { resource: h, statusCode: x.statusCode }, `Error (status code: ${x.statusCode})`), description: x.message, type: "error" });
    }
  }, mutationKey: R().data().mutation("deleteMany").get(w), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: P$1 } = ee({ isLoading: I.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...I, overtime: { elapsedTime: P$1 } };
}, "useDeleteMany");
o((e) => {
  var s;
  let t = ne(), { resource: r } = z(), { getApiUrl: n } = t(e ?? ((s = F(r == null ? void 0 : r.meta, r == null ? void 0 : r.options)) == null ? void 0 : s.dataProviderName));
  return n();
}, "useApiUrl");
o(({ url: e, method: t, config: r, queryOptions: n, successNotification: s, errorNotification: a, meta: i, metaData: c, dataProviderName: d, overtimeOptions: u }) => {
  let p = ne(), l = J(), { mutate: y } = de({ v3LegacyAuthProviderCompatible: !!(l != null && l.isLegacy) }), f = H(), T = pe(), U = q(), { keys: D, preferLegacyKeys: g } = O(), R = F(i, c), { custom: w } = p(d), I = U({ meta: R });
  if (w) {
    let P$1 = useQuery({ queryKey: D().data(d).mutation("custom").params({ method: t, url: e, ...r, ...R || {} }).get(g), queryFn: ({ queryKey: m, pageParam: v, signal: b }) => w({ url: e, method: t, ...r, meta: { ...I, queryContext: { queryKey: m, pageParam: v, signal: b } }, metaData: { ...I, queryContext: { queryKey: m, pageParam: v, signal: b } } }), ...n, onSuccess: (m) => {
      var b;
      (b = n == null ? void 0 : n.onSuccess) == null || b.call(n, m);
      let v = typeof s == "function" ? s(m, { ...r, ...I }) : s;
      T(v);
    }, onError: (m) => {
      var b;
      y(m), (b = n == null ? void 0 : n.onError) == null || b.call(n, m);
      let v = typeof a == "function" ? a(m, { ...r, ...I }) : a;
      T(v, { key: `${t}-notification`, message: f("notifications.error", { statusCode: m.statusCode }, `Error (status code: ${m.statusCode})`), description: m.message, type: "error" });
    }, meta: { ...n == null ? void 0 : n.meta, ...P() } }), { elapsedTime: x } = ee({ isLoading: P$1.isFetching, interval: u == null ? void 0 : u.interval, onInterval: u == null ? void 0 : u.onInterval });
    return { ...P$1, overtime: { elapsedTime: x } };
  }
  throw Error("Not implemented custom on data provider.");
}, "useCustom");
o(({ mutationOptions: e, overtimeOptions: t } = {}) => {
  let r = J(), { mutate: n } = de({ v3LegacyAuthProviderCompatible: !!(r != null && r.isLegacy) }), s = pe(), a = ne(), i = H(), c = q(), { keys: d, preferLegacyKeys: u } = O(), p = useMutation(({ url: y, method: f, values: T, meta: U, metaData: D, dataProviderName: g, config: R }) => {
    let w = c({ meta: F(U, D) }), { custom: I } = a(g);
    if (I)
      return I({ url: y, method: f, payload: T, meta: w, metaData: w, headers: { ...R == null ? void 0 : R.headers } });
    throw Error("Not implemented custom on data provider.");
  }, { onSuccess: (y, { successNotification: f, config: T, meta: U, metaData: D }) => {
    let g = typeof f == "function" ? f(y, { ...T, ...F(U, D) || {} }) : f;
    s(g);
  }, onError: (y, { errorNotification: f, method: T, config: U, meta: D, metaData: g }) => {
    n(y);
    let R = typeof f == "function" ? f(y, { ...U, ...F(D, g) || {} }) : f;
    s(R, { key: `${T}-notification`, message: i("notifications.error", { statusCode: y.statusCode }, `Error (status code: ${y.statusCode})`), description: y.message, type: "error" });
  }, mutationKey: d().data().mutation("customMutation").get(u), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), { elapsedTime: l } = ee({ isLoading: p.isLoading, interval: t == null ? void 0 : t.interval, onInterval: t == null ? void 0 : t.onInterval });
  return { ...p, overtime: { elapsedTime: l } };
}, "useCustomMutation");
var bn = { default: {} }, Vt = React.createContext(bn), vn = o(({ children: e, dataProvider: t }) => {
  let r = bn;
  return t && (!("default" in t) && ("getList" in t || "getOne" in t) ? r = { default: t } : r = t), React.createElement(Vt.Provider, { value: r }, e);
}, "DataContextProvider");
var ne = o(() => {
  let e = reactExports.useContext(Vt);
  return reactExports.useCallback((r) => {
    if (r) {
      let n = e == null ? void 0 : e[r];
      if (!n)
        throw new Error(`"${r}" Data provider not found`);
      if (n && !(e != null && e.default))
        throw new Error("If you have multiple data providers, you must provide default data provider property");
      return e[r];
    }
    if (e.default)
      return e.default;
    throw new Error('There is no "default" data provider. Please pass dataProviderName.');
  }, [e]);
}, "useDataProvider");
o(({ resource: e, config: t, filters: r, hasPagination: n, pagination: s, sorters: a, queryOptions: i, successNotification: c, errorNotification: d, meta: u, metaData: p, liveMode: l, onLiveEvent: y, liveParams: f, dataProviderName: T, overtimeOptions: U }) => {
  let { resources: D, resource: g, identifier: R } = z(e), w = ne(), I = H(), P$1 = J(), { mutate: x } = de({ v3LegacyAuthProviderCompatible: !!(P$1 != null && P$1.isLegacy) }), m = pe(), v = q(), { keys: b, preferLegacyKeys: C } = O(), E = j(R, T, D), h = F(u, p), L = F(r, t == null ? void 0 : t.filters), A = F(a, t == null ? void 0 : t.sort), M = F(n, t == null ? void 0 : t.hasPagination), Q = St({ pagination: s, configPagination: t == null ? void 0 : t.pagination, hasPagination: M }), S = Q.mode === "server", G = { meta: h, metaData: h, filters: L, hasPagination: S, pagination: Q, sorters: A, config: { ...t, sort: A } }, $ = (i == null ? void 0 : i.enabled) === void 0 || (i == null ? void 0 : i.enabled) === true, K = v({ resource: g, meta: h }), { getList: X } = w(E);
  st({ resource: R, types: ["*"], params: { meta: K, metaData: K, pagination: Q, hasPagination: S, sort: A, sorters: A, filters: L, subscriptionType: "useList", ...f }, channel: `resources/${g.name}`, enabled: $, liveMode: l, onLiveEvent: y, dataProviderName: E, meta: { ...K, dataProviderName: T } });
  let N = useInfiniteQuery({ queryKey: b().data(E).resource(R).action("infinite").params({ ...h || {}, filters: L, hasPagination: S, ...S && { pagination: Q }, ...a && { sorters: a }, ...(t == null ? void 0 : t.sort) && { sort: t == null ? void 0 : t.sort } }).get(C), queryFn: ({ queryKey: V, pageParam: B, signal: _ }) => {
    let te = { ...Q, current: B };
    return X({ resource: g.name, pagination: te, hasPagination: S, filters: L, sort: A, sorters: A, meta: { ...K, queryContext: { queryKey: V, pageParam: B, signal: _ } }, metaData: { ...K, queryContext: { queryKey: V, pageParam: B, signal: _ } } }).then(({ data: ie, total: De, ...Y }) => ({ data: ie, total: De, pagination: te, ...Y }));
  }, getNextPageParam: (V) => tr(V), getPreviousPageParam: (V) => rr(V), ...i, onSuccess: (V) => {
    var _;
    (_ = i == null ? void 0 : i.onSuccess) == null || _.call(i, V);
    let B = typeof c == "function" ? c(V, G, R) : c;
    m(B);
  }, onError: (V) => {
    var _;
    x(V), (_ = i == null ? void 0 : i.onError) == null || _.call(i, V);
    let B = typeof d == "function" ? d(V, G, R) : d;
    m(B, { key: `${R}-useInfiniteList-notification`, message: I("notifications.error", { statusCode: V.statusCode }, `Error (status code: ${V.statusCode})`), description: V.message, type: "error" });
  }, meta: { ...i == null ? void 0 : i.meta, ...P() } }), { elapsedTime: W } = ee({ isLoading: N.isFetching, interval: U == null ? void 0 : U.interval, onInterval: U == null ? void 0 : U.onInterval });
  return { ...N, overtime: { elapsedTime: W } };
}, "useInfiniteList");
var qe = React.createContext({}), Ln = o(({ liveProvider: e, children: t }) => React.createElement(qe.Provider, { value: { liveProvider: e } }, t), "LiveContextProvider");
var Ce = o(() => {
  let { resources: e } = z(), t = useQueryClient(), { keys: r, preferLegacyKeys: n } = O();
  return reactExports.useCallback(async ({ resource: a, dataProviderName: i, invalidates: c, id: d, invalidationFilters: u = { type: "all", refetchType: "active" }, invalidationOptions: p = { cancelRefetch: false } }) => {
    if (c === false)
      return;
    let l = j(a, i, e), y = r().data(l).resource(a ?? "");
    await Promise.all(c.map((f) => {
      switch (f) {
        case "all":
          return t.invalidateQueries(r().data(l).get(n), u, p);
        case "list":
          return t.invalidateQueries(y.action("list").get(n), u, p);
        case "many":
          return t.invalidateQueries(y.action("many").get(n), u, p);
        case "resourceAll":
          return t.invalidateQueries(y.get(n), u, p);
        case "detail":
          return t.invalidateQueries(y.action("one").id(d || "").get(n), u, p);
        default:
          return;
      }
    }));
  }, []);
}, "useInvalidate");
var Un = o((e) => {
  let t = reactExports.useRef(e);
  return isEqual(t.current, e) || (t.current = e), t.current;
}, "useMemoized");
var yr = o((e, t) => {
  let r = Un(t);
  return reactExports.useMemo(e, r);
}, "useDeepMemo");
var at = React.createContext({ resources: [] }), Mn = o(({ resources: e, children: t }) => {
  let r = yr(() => or(e ?? []), [e]);
  return React.createElement(at.Provider, { value: { resources: r } }, t);
}, "ResourceContextProvider");
var In = React.createContext("new"), Sn = In.Provider, Z = o(() => React.useContext(In), "useRouterType");
var Fn = {}, et = reactExports.createContext(Fn), An = o(({ children: e, router: t }) => React.createElement(et.Provider, { value: t ?? Fn }, e), "RouterContextProvider");
var ro = o(() => {
  let e = reactExports.useContext(et);
  return React.useMemo(() => (e == null ? void 0 : e.parse) ?? (() => () => ({})), [e == null ? void 0 : e.parse])();
}, "useParse");
var ae = o(() => {
  let e = ro();
  return React.useMemo(() => e(), [e]);
}, "useParsed");
function z(e) {
  let { resources: t } = reactExports.useContext(at), r = Z(), n = ae(), s = { resourceName: e && typeof e != "string" ? e.resourceName : e, resourceNameOrRouteName: e && typeof e != "string" ? e.resourceNameOrRouteName : e, recordItemId: e && typeof e != "string" ? e.recordItemId : void 0 }, a = o((l, y = true) => {
    let T = ye(l, t, r === "legacy");
    if (T)
      return { resource: T, identifier: T.identifier ?? T.name };
    if (y) {
      let U = { name: l, identifier: l }, D = U.identifier ?? U.name;
      return { resource: U, identifier: D };
    }
  }, "select"), i = kn(), { useParams: c } = re(), d = c();
  if (r === "legacy") {
    let l = s.resourceNameOrRouteName ? s.resourceNameOrRouteName : d.resource, y = l ? i(l) : void 0, f = (s == null ? void 0 : s.recordItemId) ?? d.id, T = d.action, U = (s == null ? void 0 : s.resourceName) ?? (y == null ? void 0 : y.name), D = (y == null ? void 0 : y.identifier) ?? (y == null ? void 0 : y.name);
    return { resources: t, resource: y, resourceName: U, id: f, action: T, select: a, identifier: D };
  }
  let u, p = typeof e == "string" ? e : s == null ? void 0 : s.resourceNameOrRouteName;
  if (p) {
    let l = ye(p, t);
    l ? u = l : u = { name: p };
  } else
    n != null && n.resource && (u = n.resource);
  return { resources: t, resource: u, resourceName: u == null ? void 0 : u.name, id: n.id, action: n.action, select: a, identifier: (u == null ? void 0 : u.identifier) ?? (u == null ? void 0 : u.name) };
}
o(z, "useResource");
var kn = o(() => {
  let { resources: e } = reactExports.useContext(at);
  return reactExports.useCallback((r) => {
    let n = ye(r, e, true);
    return n || { name: r, route: r };
  }, [e]);
}, "useResourceWithRoute");
var st = o(({ resource: e, params: t, channel: r, types: n, enabled: s = true, liveMode: a, onLiveEvent: i, dataProviderName: c, meta: d }) => {
  var g;
  let { resource: u, identifier: p } = z(e), { liveProvider: l } = reactExports.useContext(qe), { liveMode: y, onLiveEvent: f } = reactExports.useContext(ve), T = a ?? y, U = Ce(), D = c ?? (d == null ? void 0 : d.dataProviderName) ?? ((g = u == null ? void 0 : u.meta) == null ? void 0 : g.dataProviderName);
  reactExports.useEffect(() => {
    let R, w = o((I) => {
      T === "auto" && U({ resource: p, dataProviderName: D, invalidates: ["resourceAll"], invalidationFilters: { type: "active", refetchType: "active" }, invalidationOptions: { cancelRefetch: false } }), i == null || i(I), f == null || f(I);
    }, "callback");
    return T && T !== "off" && s && (R = l == null ? void 0 : l.subscribe({ channel: r, params: { resource: u == null ? void 0 : u.name, ...t }, types: n, callback: w, dataProviderName: D, meta: { ...d, dataProviderName: D } })), () => {
      R && (l == null || l.unsubscribe(R));
    };
  }, [s]);
}, "useResourceSubscription");
var Vn = o((e) => {
  let { liveMode: t } = reactExports.useContext(ve);
  return e ?? t;
}, "useLiveMode");
o(({ params: e, channel: t, types: r = ["*"], enabled: n = true, onLiveEvent: s, dataProviderName: a = "default", meta: i }) => {
  let { liveProvider: c } = reactExports.useContext(qe);
  reactExports.useEffect(() => {
    let d;
    return n && (d = c == null ? void 0 : c.subscribe({ channel: t, params: e, types: r, callback: s, dataProviderName: a, meta: { ...i, dataProviderName: a } })), () => {
      d && (c == null || c.unsubscribe(d));
    };
  }, [n]);
}, "useSubscription");
var Ve = o(() => {
  let { liveProvider: e } = reactExports.useContext(qe);
  return e == null ? void 0 : e.publish;
}, "usePublish");
var no = reactExports.createContext({ notifications: [], notificationDispatch: () => false }), Ci = [], bi = o((e, t) => {
  switch (t.type) {
    case "ADD":
      return [...e.filter((n) => !(isEqual(n.id, t.payload.id) && n.resource === t.payload.resource)), { ...t.payload, isRunning: true }];
    case "REMOVE":
      return e.filter((r) => !(isEqual(r.id, t.payload.id) && r.resource === t.payload.resource));
    case "DECREASE_NOTIFICATION_SECOND":
      return e.map((r) => isEqual(r.id, t.payload.id) && r.resource === t.payload.resource ? { ...r, seconds: t.payload.seconds - 1e3 } : r);
    default:
      return e;
  }
}, "undoableQueueReducer"), Nn = o(({ children: e }) => {
  let [t, r] = reactExports.useReducer(bi, Ci), n = { notifications: t, notificationDispatch: r };
  return React.createElement(no.Provider, { value: n }, e, typeof window < "u" ? t.map((s) => React.createElement(Kn, { key: `${s.id}-${s.resource}-queue`, notification: s })) : null);
}, "UndoableQueueContextProvider");
var _e = o(() => {
  let { notifications: e, notificationDispatch: t } = reactExports.useContext(no);
  return { notifications: e, notificationDispatch: t };
}, "useCancelNotification");
var Bt = reactExports.createContext({}), Gn = o(({ open: e, close: t, children: r }) => React.createElement(Bt.Provider, { value: { open: e, close: t } }, r), "NotificationContextProvider");
var we = o(() => {
  let { open: e, close: t } = reactExports.useContext(Bt);
  return { open: e, close: t };
}, "useNotification");
var pe = o(() => {
  let { open: e } = we();
  return reactExports.useCallback((r, n) => {
    r !== false && (r ? e == null || e(r) : n && (e == null || e(n)));
  }, []);
}, "useHandleNotification");
var ke = React.createContext({}), $n = o(({ children: e, i18nProvider: t }) => React.createElement(ke.Provider, { value: { i18nProvider: t } }, e), "I18nContextProvider");
var so = o(() => {
  let { i18nProvider: e } = reactExports.useContext(ke);
  return reactExports.useCallback((t) => e == null ? void 0 : e.changeLocale(t), []);
}, "useSetLocale");
var H = o(() => {
  let { i18nProvider: e } = reactExports.useContext(ke);
  return reactExports.useMemo(() => {
    function r(n, s, a) {
      return (e == null ? void 0 : e.translate(n, s, a)) ?? a ?? (typeof s == "string" && typeof a > "u" ? s : n);
    }
    return o(r, "translate"), r;
  }, [e]);
}, "useTranslate");
var ao = o(() => {
  let { i18nProvider: e } = reactExports.useContext(ke);
  return reactExports.useCallback(() => e == null ? void 0 : e.getLocale(), []);
}, "useGetLocale");
o(() => {
  let e = H(), t = so(), r = ao();
  return { translate: e, changeLocale: t, getLocale: r };
}, "useTranslation");
o(({ resourceName: e, resource: t, sorter: r, sorters: n, filters: s, maxItemCount: a, pageSize: i = 20, mapData: c = o((U) => U, "mapData"), exportOptions: d, unparseConfig: u, meta: p, metaData: l, dataProviderName: y, onError: f, download: T } = {}) => {
  let [U, D] = reactExports.useState(false), g = ne(), R = q(), { resource: w, resources: I, identifier: P2 } = z(F(t, e)), m = `${nt()(P2, "plural")}-${(/* @__PURE__ */ new Date()).toLocaleString()}`, { getList: v } = g(j(P2, y, I)), b = R({ resource: w, meta: F(p, l) });
  return { isLoading: U, triggerExport: o(async () => {
    D(true);
    let E = [], h = 1, L = true;
    for (; L; )
      try {
        let { data: S, total: G } = await v({ resource: (w == null ? void 0 : w.name) ?? "", filters: s, sort: F(n, r), sorters: F(n, r), pagination: { current: h, pageSize: i, mode: "server" }, meta: b, metaData: b });
        h++, E.push(...S), a && E.length >= a && (E = E.slice(0, a), L = false), G === E.length && (L = false);
      } catch (S) {
        D(false), L = false, f == null || f(S);
        return;
      }
    let A = typeof u < "u" && u !== null;
    Ru(A && typeof d < "u" && d !== null, `[useExport]: resource: "${P2}" 

Both \`unparseConfig\` and \`exportOptions\` are set, \`unparseConfig\` will take precedence`);
    let M = { filename: m, useKeysAsHeaders: true, useBom: true, title: "My Generated Report", quoteStrings: '"', ...d };
    Ru((d == null ? void 0 : d.decimalSeparator) !== void 0, `[useExport]: resource: "${P2}" 

Use of \`decimalSeparator\` no longer supported, please use \`mapData\` instead.

See https://refine.dev/docs/api-reference/core/hooks/import-export/useExport/`), A ? u = { quotes: true, ...u } : u = { columns: M.useKeysAsHeaders ? void 0 : M.headers, delimiter: M.fieldSeparator, header: M.showLabels || M.useKeysAsHeaders, quoteChar: M.quoteStrings, quotes: true };
    let Q = tu.unparse(E.map(c), u);
    if (M.showTitle && (Q = `${M.title}\r

${Q}`), typeof window < "u" && Q.length > 0 && (T ?? true)) {
      let S = M.useTextFile ? ".txt" : ".csv", G = `text/${M.useTextFile ? "plain" : "csv"};charset=utf8;`, $ = `${(M.filename ?? "download").replace(/ /g, "_")}${S}`;
      Nr($, `${M != null && M.useBom ? "\uFEFF" : ""}${Q}`, G);
    }
    return D(false), Q;
  }, "triggerExport") };
}, "useExport");
o((e = {}) => {
  var K, X, N, W, V;
  let t = q(), r = Ce(), { redirect: n } = ht(), { mutationMode: s } = Ae(), { setWarnWhen: a } = dt(), i = zn(), c = F(e.meta, e.metaData), d = e.mutationMode ?? s, { id: u, setId: p, resource: l, identifier: y, formAction: f } = Ne({ resource: e.resource, id: e.id, action: e.action }), [T, U] = React.useState(false), D = f === "edit", g = f === "clone", R = f === "create", w = t({ resource: l, meta: c }), I = (D || g) && !!e.resource, P2 = typeof e.id < "u", x = ((K = e.queryOptions) == null ? void 0 : K.enabled) === false;
  Ru(I && !P2 && !x, Hi(f, y, u));
  let m = Qr({ redirectFromProps: e.redirect, action: f, redirectOptions: n }), v = o((B = D ? "list" : "edit", _ = u, te = {}) => {
    i({ redirect: B, resource: l, id: _, meta: { ...c, ...te } });
  }, "redirect"), b = kt({ resource: y, id: u, queryOptions: { enabled: !R && u !== void 0, ...e.queryOptions }, liveMode: e.liveMode, onLiveEvent: e.onLiveEvent, liveParams: e.liveParams, meta: { ...w, ...e.queryMeta }, dataProviderName: e.dataProviderName }), C = Qt({ mutationOptions: e.createMutationOptions }), E = qr({ mutationOptions: e.updateMutationOptions }), h = D ? E : C, A = h.isLoading || b.isFetching, { elapsedTime: M } = ee({ isLoading: A, interval: (X = e.overtimeOptions) == null ? void 0 : X.interval, onInterval: (N = e.overtimeOptions) == null ? void 0 : N.onInterval });
  React.useEffect(() => () => {
    var B;
    (B = e.autoSave) != null && B.invalidateOnUnmount && T && y && typeof u < "u" && r({ id: u, invalidates: e.invalidates || ["list", "many", "detail"], dataProviderName: e.dataProviderName, resource: y });
  }, [(W = e.autoSave) == null ? void 0 : W.invalidateOnUnmount, T]);
  let Q = o(async (B, { isAutosave: _ = false } = {}) => {
    let te = d === "pessimistic";
    a(false);
    let ie = o((Y) => v(m, Y), "onSuccessRedirect");
    return new Promise((Y, Pe) => {
      if (!l)
        return Pe(Bi);
      if (g && !u)
        return Pe(Ni);
      if (!B)
        return Pe(Ki);
      if (_ && !D)
        return Pe(Gi);
      !te && !_ && (ir(() => ie()), Y());
      let ft = { values: B, resource: y ?? l.name, meta: { ...w, ...e.mutationMeta }, metaData: { ...w, ...e.mutationMeta }, dataProviderName: e.dataProviderName, invalidates: _ ? [] : e.invalidates, successNotification: _ ? false : e.successNotification, errorNotification: _ ? false : e.errorNotification, ...D ? { id: u ?? "", mutationMode: d, undoableTimeout: e.undoableTimeout, optimisticUpdateMap: e.optimisticUpdateMap } : {} }, { mutateAsync: yt } = D ? E : C;
      yt(ft, { onSuccess: e.onMutationSuccess ? (Se, Xe, it) => {
        var ot;
        (ot = e.onMutationSuccess) == null || ot.call(e, Se, B, it, _);
      } : void 0, onError: e.onMutationError ? (Se, Xe, it) => {
        var ot;
        (ot = e.onMutationError) == null || ot.call(e, Se, B, it, _);
      } : void 0 }).then((Se) => {
        te && !_ && ir(() => {
          var Xe;
          return ie((Xe = Se == null ? void 0 : Se.data) == null ? void 0 : Xe.id);
        }), _ && U(true), Y(Se);
      }).catch(Pe);
    });
  }, "onFinish"), S = Kr((B) => Q(B, { isAutosave: true }), ((V = e.autoSave) == null ? void 0 : V.debounce) || 1e3, "Cancelled by debounce"), G = { elapsedTime: M }, $ = { status: E.status, data: E.data, error: E.error };
  return { onFinish: Q, onFinishAutoSave: S, formLoading: A, mutationResult: h, queryResult: b, autoSaveProps: $, id: u, setId: p, redirect: v, overtime: G };
}, "useForm");
var Bi = new Error("[useForm]: `resource` is not defined or not matched but is required"), Ni = new Error("[useForm]: `id` is not defined but is required in edit and clone actions"), Ki = new Error("[useForm]: `values` is not provided but is required"), Gi = new Error("[useForm]: `autoSave` is only allowed in edit action"), Hi = o((e, t, r) => `[useForm]: action: "${e}", resource: "${t}", id: ${r}

If you don't use the \`setId\` method to set the \`id\`, you should pass the \`id\` prop to \`useForm\`. Otherwise, \`useForm\` will not be able to infer the \`id\` from the current URL with custom resource provided.

See https://refine.dev/docs/data/hooks/use-form/#id-`, "idWarningMessage");
var zn = o(() => {
  let { show: e, edit: t, list: r, create: n } = ce();
  return reactExports.useCallback(({ redirect: a, resource: i, id: c, meta: d = {} }) => {
    if (a && i)
      return i.show && a === "show" && c ? e(i, c, void 0, d) : i.edit && a === "edit" && c ? t(i, c, void 0, d) : i.create && a === "create" ? n(i, void 0, d) : r(i, "push", d);
  }, []);
}, "useRedirectionAfterSubmission");
var io = o(() => {
  let e = reactExports.useContext(et);
  return React.useMemo(() => (e == null ? void 0 : e.back) ?? (() => () => {
  }), [e == null ? void 0 : e.back])();
}, "useBack");
var pt = o(() => {
  let e = Z(), { resource: t, resources: r } = z(), n = ae();
  return React.useCallback(({ resource: a, action: i, meta: c }) => {
    var y;
    let d = a || t;
    if (!d)
      return;
    let p = (y = he(d, r, e === "legacy").find((f) => f.action === i)) == null ? void 0 : y.route;
    return p ? Me(p, d == null ? void 0 : d.meta, n, c) : void 0;
  }, [r, t, n]);
}, "useGetToPath");
var ge = o(() => {
  let e = reactExports.useContext(et), { select: t } = z(), r = pt(), s = React.useMemo(() => (e == null ? void 0 : e.go) ?? (() => () => {
  }), [e == null ? void 0 : e.go])();
  return reactExports.useCallback((i) => {
    if (typeof i.to != "object")
      return s({ ...i, to: i.to });
    let { resource: c } = t(i.to.resource);
    Zi(i.to, c);
    let d = r({ resource: c, action: i.to.action, meta: { id: i.to.id, ...i.to.meta } });
    return s({ ...i, to: d });
  }, [t, s]);
}, "useGo"), Zi = o((e, t) => {
  if (!(e != null && e.action) || !(e != null && e.resource))
    throw new Error('[useGo]: "action" or "resource" is required.');
  if (["edit", "show", "clone"].includes(e == null ? void 0 : e.action) && !e.id)
    throw new Error(`[useGo]: [action: ${e.action}] requires an "id" for resource [resource: ${e.resource}]`);
  if (!t[e.action])
    throw new Error(`[useGo]: [action: ${e.action}] is not defined for [resource: ${e.resource}]`);
}, "handleResourceErrors");
var ce = o(() => {
  let { resources: e } = z(), t = Z(), { useHistory: r } = re(), n = r(), s = ae(), a = ge(), i = io(), c = o((P2, x = "push") => {
    t === "legacy" ? n[x](P2) : a({ to: P2, type: x });
  }, "handleUrl"), d = o((P2, x = {}) => {
    var b;
    if (t === "legacy") {
      let C = typeof P2 == "string" ? ye(P2, e, true) ?? { name: P2, route: P2 } : P2, E = he(C, e, true).find((h) => h.action === "create");
      return E ? Me(E.route, C == null ? void 0 : C.meta, s, x) : "";
    }
    let m = typeof P2 == "string" ? ye(P2, e) ?? { name: P2 } : P2, v = (b = he(m, e).find((C) => C.action === "create")) == null ? void 0 : b.route;
    return v ? a({ to: Me(v, m == null ? void 0 : m.meta, s, x), type: "path" }) : "";
  }, "createUrl"), u = o((P2, x, m = {}) => {
    var E;
    let v = encodeURIComponent(x);
    if (t === "legacy") {
      let h = typeof P2 == "string" ? ye(P2, e, true) ?? { name: P2, route: P2 } : P2, L = he(h, e, true).find((A) => A.action === "edit");
      return L ? Me(L.route, h == null ? void 0 : h.meta, s, { ...m, id: v }) : "";
    }
    let b = typeof P2 == "string" ? ye(P2, e) ?? { name: P2 } : P2, C = (E = he(b, e).find((h) => h.action === "edit")) == null ? void 0 : E.route;
    return C ? a({ to: Me(C, b == null ? void 0 : b.meta, s, { ...m, id: v }), type: "path" }) : "";
  }, "editUrl"), p = o((P2, x, m = {}) => {
    var E;
    let v = encodeURIComponent(x);
    if (t === "legacy") {
      let h = typeof P2 == "string" ? ye(P2, e, true) ?? { name: P2, route: P2 } : P2, L = he(h, e, true).find((A) => A.action === "clone");
      return L ? Me(L.route, h == null ? void 0 : h.meta, s, { ...m, id: v }) : "";
    }
    let b = typeof P2 == "string" ? ye(P2, e) ?? { name: P2 } : P2, C = (E = he(b, e).find((h) => h.action === "clone")) == null ? void 0 : E.route;
    return C ? a({ to: Me(C, b == null ? void 0 : b.meta, s, { ...m, id: v }), type: "path" }) : "";
  }, "cloneUrl"), l = o((P2, x, m = {}) => {
    var E;
    let v = encodeURIComponent(x);
    if (t === "legacy") {
      let h = typeof P2 == "string" ? ye(P2, e, true) ?? { name: P2, route: P2 } : P2, L = he(h, e, true).find((A) => A.action === "show");
      return L ? Me(L.route, h == null ? void 0 : h.meta, s, { ...m, id: v }) : "";
    }
    let b = typeof P2 == "string" ? ye(P2, e) ?? { name: P2 } : P2, C = (E = he(b, e).find((h) => h.action === "show")) == null ? void 0 : E.route;
    return C ? a({ to: Me(C, b == null ? void 0 : b.meta, s, { ...m, id: v }), type: "path" }) : "";
  }, "showUrl"), y = o((P2, x = {}) => {
    var b;
    if (t === "legacy") {
      let C = typeof P2 == "string" ? ye(P2, e, true) ?? { name: P2, route: P2 } : P2, E = he(C, e, true).find((h) => h.action === "list");
      return E ? Me(E.route, C == null ? void 0 : C.meta, s, x) : "";
    }
    let m = typeof P2 == "string" ? ye(P2, e) ?? { name: P2 } : P2, v = (b = he(m, e).find((C) => C.action === "list")) == null ? void 0 : b.route;
    return v ? a({ to: Me(v, m == null ? void 0 : m.meta, s, x), type: "path" }) : "";
  }, "listUrl");
  return { create: o((P2, x = "push", m = {}) => {
    c(d(P2, m), x);
  }, "create"), createUrl: d, edit: o((P2, x, m = "push", v = {}) => {
    c(u(P2, x, v), m);
  }, "edit"), editUrl: u, clone: o((P2, x, m = "push", v = {}) => {
    c(p(P2, x, v), m);
  }, "clone"), cloneUrl: p, show: o((P2, x, m = "push", v = {}) => {
    c(l(P2, x, v), m);
  }, "show"), showUrl: l, list: o((P2, x = "push", m = {}) => {
    c(y(P2, m), x);
  }, "list"), listUrl: y, push: o((P2, ...x) => {
    t === "legacy" ? n.push(P2, ...x) : a({ to: P2, type: "push" });
  }, "push"), replace: o((P2, ...x) => {
    t === "legacy" ? n.replace(P2, ...x) : a({ to: P2, type: "replace" });
  }, "replace"), goBack: o(() => {
    t === "legacy" ? n.goBack() : i();
  }, "goBack") };
}, "useNavigation");
o(({ resource: e, id: t, meta: r, metaData: n, queryOptions: s, overtimeOptions: a, ...i } = {}) => {
  let { resource: c, identifier: d, id: u, setId: p } = Ne({ id: t, resource: e }), y = q()({ resource: c, meta: F(r, n) });
  Ru(!!e && !u, Ji(d, u));
  let f = kt({ resource: d, id: u ?? "", queryOptions: { enabled: u !== void 0, ...s }, meta: y, metaData: y, ...i }), { elapsedTime: T } = ee({ isLoading: f.isFetching, interval: a == null ? void 0 : a.interval, onInterval: a == null ? void 0 : a.onInterval });
  return { queryResult: f, showId: u, setShowId: p, overtime: { elapsedTime: T } };
}, "useShow");
var Ji = o((e, t) => `[useShow]: resource: "${e}", id: ${t} 

If you don't use the \`setShowId\` method to set the \`showId\`, you should pass the \`id\` prop to \`useShow\`. Otherwise, \`useShow\` will not be able to infer the \`id\` from the current URL. 

See https://refine.dev/docs/data/hooks/use-show/#resource`, "idWarningMessage");
o(({ resourceName: e, resource: t, mapData: r = o((p) => p, "mapData"), paparseOptions: n, batchSize: s = Number.MAX_SAFE_INTEGER, onFinish: a, meta: i, metaData: c, onProgress: d, dataProviderName: u } = {}) => {
  let [p, l] = reactExports.useState(0), [y, f] = reactExports.useState(0), [T, U] = reactExports.useState(false), { resource: D, identifier: g } = z(t ?? e), R = q(), w = to(), I = Qt(), P2 = R({ resource: D, meta: F(i, c) }), x;
  s === 1 ? x = I : x = w;
  let m = o(() => {
    f(0), l(0), U(false);
  }, "handleCleanup"), v = o((C) => {
    let E = { succeeded: C.filter((h) => h.type === "success"), errored: C.filter((h) => h.type === "error") };
    a == null || a(E), U(false);
  }, "handleFinish");
  reactExports.useEffect(() => {
    d == null || d({ totalAmount: y, processedAmount: p });
  }, [y, p]);
  let b = o(({ file: C }) => (m(), new Promise((E) => {
    U(true), tu.parse(C, { complete: async ({ data: h }) => {
      let L = Ht(h, r);
      if (f(L.length), s === 1) {
        let A = L.map((Q) => o(async () => ({ response: await I.mutateAsync({ resource: g ?? "", values: Q, successNotification: false, errorNotification: false, dataProviderName: u, meta: P2, metaData: P2 }), value: Q }), "fn")), M = await er(A, ({ response: Q, value: S }) => (l((G) => G + 1), { response: [Q.data], type: "success", request: [S] }), (Q, S) => ({ response: [Q], type: "error", request: [L[S]] }));
        E(M);
      } else {
        let A = chunk(L, s), M = A.map((S) => o(async () => ({ response: await w.mutateAsync({ resource: g ?? "", values: S, successNotification: false, errorNotification: false, dataProviderName: u, meta: P2, metaData: P2 }), value: S, currentBatchLength: S.length }), "fn")), Q = await er(M, ({ response: S, currentBatchLength: G, value: $ }) => (l((K) => K + G), { response: S.data, type: "success", request: $ }), (S, G) => ({ response: [S], type: "error", request: A[G] }));
        E(Q);
      }
    }, ...n });
  }).then((E) => (v(E), E))), "handleChange");
  return { inputProps: { type: "file", accept: ".csv", onChange: (C) => {
    C.target.files && C.target.files.length > 0 && b({ file: C.target.files[0] });
  } }, mutationResult: x, isLoading: T, handleChange: b };
}, "useImport");
o(({ defaultVisible: e = false } = {}) => {
  let [t, r] = reactExports.useState(e), n = reactExports.useCallback(() => r(true), [t]), s = reactExports.useCallback(() => r(false), [t]);
  return { visible: t, show: n, close: s };
}, "useModal");
o(({ resource: e, action: t, meta: r, legacy: n }) => pt()({ resource: e, action: t, meta: r, legacy: n }), "useToPath");
var tt = o(() => {
  let e = reactExports.useContext(et);
  return e != null && e.Link ? e.Link : o(({ to: r, ...n }) => React.createElement("a", { href: r, ...n }), "FallbackLink");
}, "useLink");
var rt = { useHistory: () => false, useLocation: () => false, useParams: () => ({}), Prompt: () => null, Link: () => null }, Nt = React.createContext(rt), Xn = o(({ children: e, useHistory: t, useLocation: r, useParams: n, Prompt: s, Link: a, routes: i }) => React.createElement(Nt.Provider, { value: { useHistory: t ?? rt.useHistory, useLocation: r ?? rt.useLocation, useParams: n ?? rt.useParams, Prompt: s ?? rt.Prompt, Link: a ?? rt.Link, routes: i ?? rt.routes } }, e), "LegacyRouterContextProvider");
var re = o(() => {
  let e = reactExports.useContext(Nt), { useHistory: t, useLocation: r, useParams: n, Prompt: s, Link: a, routes: i } = e ?? rt;
  return { useHistory: t, useLocation: r, useParams: n, Prompt: s, Link: a, routes: i };
}, "useRouterContext");
var je = React.createContext({ options: { buttons: { enableAccessControl: true, hideIfUnauthorized: false } } }), Yn = o(({ can: e, children: t, options: r }) => React.createElement(je.Provider, { value: { can: e, options: r ? { ...r, buttons: { enableAccessControl: true, hideIfUnauthorized: false, ...r.buttons } } : { buttons: { enableAccessControl: true, hideIfUnauthorized: false }, queryOptions: void 0 } } }, t), "AccessControlContextProvider");
var Ct = o((e) => {
  if (!e)
    return;
  let { icon: t, list: r, edit: n, create: s, show: a, clone: i, children: c, meta: d, options: u, ...p } = e, { icon: l, ...y } = d ?? {}, { icon: f, ...T } = u ?? {};
  return { ...p, ...d ? { meta: y } : {}, ...u ? { options: T } : {} };
}, "sanitizeResource");
var gr = o(({ action: e, resource: t, params: r, queryOptions: n }) => {
  let { can: s, options: a } = reactExports.useContext(je), { keys: i, preferLegacyKeys: c } = O(), { queryOptions: d } = a || {}, u = { ...d, ...n }, { resource: p, ...l } = r ?? {}, y = Ct(p), f = useQuery({ queryKey: i().access().resource(t).action(e).params({ params: { ...l, resource: y }, enabled: u == null ? void 0 : u.enabled }).get(c), queryFn: () => (s == null ? void 0 : s({ action: e, resource: t, params: { ...l, resource: y } })) ?? Promise.resolve({ can: true }), enabled: typeof s < "u", ...u, meta: { ...u == null ? void 0 : u.meta, ...P() }, retry: false });
  return typeof s > "u" ? { data: { can: true } } : f;
}, "useCan");
o(() => {
  let { can: e } = React.useContext(je);
  return { can: React.useMemo(() => e ? o(async ({ params: n, ...s }) => {
    let a = n != null && n.resource ? Ct(n.resource) : void 0;
    return e({ ...s, ...n ? { params: { ...n, resource: a } } : {} });
  }, "canWithSanitizedResource") : void 0, [e]) };
}, "useCanWithoutCache");
o((e) => {
  let [t, r] = reactExports.useState([]), [n, s] = reactExports.useState([]), [a, i] = reactExports.useState([]), { resource: c, sort: d, sorters: u, filters: p = [], optionLabel: l = "title", optionValue: y = "id", searchField: f = typeof l == "string" ? l : "title", debounce: T = 300, successNotification: U, errorNotification: D, defaultValueQueryOptions: g, queryOptions: R, fetchSize: w, pagination: I, hasPagination: P2 = false, liveMode: x, defaultValue: m = [], onLiveEvent: v, onSearch: b, liveParams: C, meta: E, metaData: h, dataProviderName: L, overtimeOptions: A } = e, M = reactExports.useCallback((Y) => typeof l == "string" ? get(Y, l) : l(Y), [l]), Q = reactExports.useCallback((Y) => typeof y == "string" ? get(Y, y) : y(Y), [y]), { resource: S, identifier: G } = z(c), K = q()({ resource: S, meta: F(E, h) }), X = Array.isArray(m) ? m : [m], N = reactExports.useCallback((Y) => {
    i(Y.data.map((Pe) => ({ label: M(Pe), value: Q(Pe) })));
  }, [l, y]), W = g ?? R, V = Jr({ resource: G, ids: X, queryOptions: { ...W, enabled: X.length > 0 && ((W == null ? void 0 : W.enabled) ?? true), onSuccess: (Y) => {
    var Pe;
    N(Y), (Pe = W == null ? void 0 : W.onSuccess) == null || Pe.call(W, Y);
  } }, meta: K, metaData: K, liveMode: "off", dataProviderName: L }), B = reactExports.useCallback((Y) => {
    s(Y.data.map((Pe) => ({ label: M(Pe), value: Q(Pe) })));
  }, [l, y]), _ = At({ resource: G, sorters: F(u, d), filters: p.concat(t), pagination: { current: I == null ? void 0 : I.current, pageSize: (I == null ? void 0 : I.pageSize) ?? w, mode: I == null ? void 0 : I.mode }, hasPagination: P2, queryOptions: { ...R, onSuccess: (Y) => {
    var Pe;
    B(Y), (Pe = R == null ? void 0 : R.onSuccess) == null || Pe.call(R, Y);
  } }, successNotification: U, errorNotification: D, meta: K, metaData: K, liveMode: x, liveParams: C, onLiveEvent: v, dataProviderName: L }), te = o((Y) => {
    if (b) {
      r(b(Y));
      return;
    }
    if (!Y) {
      r([]);
      return;
    }
    r([{ field: f, operator: "contains", value: Y }]);
  }, "onSearch"), { elapsedTime: ie } = ee({ isLoading: _.isFetching || V.isFetching, interval: A == null ? void 0 : A.interval, onInterval: A == null ? void 0 : A.onInterval }), De = reactExports.useMemo(() => uniqBy([...n, ...a], "value"), [n, a]);
  return { queryResult: _, defaultValueQueryResult: V, options: De, onSearch: debounce(te, T), overtime: { elapsedTime: ie } };
}, "useSelect");
var rs = [], os = [];
function sb({ initialCurrent: e, initialPageSize: t, hasPagination: r = true, pagination: n, initialSorter: s, permanentSorter: a = os, defaultSetFilterBehavior: i, initialFilter: c, permanentFilter: d = rs, filters: u, sorters: p, syncWithLocation: l, resource: y, successNotification: f, errorNotification: T, queryOptions: U, liveMode: D, onLiveEvent: g, liveParams: R, meta: w, metaData: I, dataProviderName: P2, overtimeOptions: x } = {}) {
  var Co, bo, vo, Do, Lo;
  let { syncWithLocation: m } = Br(), v = l ?? m, b = Vn(D), C = Z(), { useLocation: E } = re(), { search: h, pathname: L } = E(), A = q(), M = ae(), Q = ((u == null ? void 0 : u.mode) || "server") === "server", S = ((p == null ? void 0 : p.mode) || "server") === "server", G = r === false ? "off" : "server", $ = ((n == null ? void 0 : n.mode) ?? G) !== "off", K = F(n == null ? void 0 : n.current, e), X = F(n == null ? void 0 : n.pageSize, t), N = F(w, I), { parsedCurrent: W, parsedPageSize: V, parsedSorter: B, parsedFilters: _ } = ur(h ?? "?"), te = F(u == null ? void 0 : u.initial, c), ie = F(u == null ? void 0 : u.permanent, d) ?? rs, De = F(p == null ? void 0 : p.initial, s), Y = F(p == null ? void 0 : p.permanent, a) ?? os, Pe = F(u == null ? void 0 : u.defaultBehavior, i) ?? "merge", ft, yt, Se, Xe;
  v ? (ft = ((Co = M == null ? void 0 : M.params) == null ? void 0 : Co.current) || W || K || 1, yt = ((bo = M == null ? void 0 : M.params) == null ? void 0 : bo.pageSize) || V || X || 10, Se = ((vo = M == null ? void 0 : M.params) == null ? void 0 : vo.sorters) || (B.length ? B : De), Xe = ((Do = M == null ? void 0 : M.params) == null ? void 0 : Do.filters) || (_.length ? _ : te)) : (ft = K || 1, yt = X || 10, Se = De, Xe = te);
  let { replace: it } = ce(), ot = ge(), { resource: Ss, identifier: Ur } = z(y), go = A({ resource: Ss, meta: N });
  React.useEffect(() => {
    Ru(typeof Ur > "u", "useTable: `resource` is not defined.");
  }, [Ur]);
  let [ut, To] = reactExports.useState(lr(Y, Se ?? [])), [Ut, Gt] = reactExports.useState(pr(ie, Xe ?? [])), [Et, xo] = reactExports.useState(ft), [ct, Po] = reactExports.useState(yt), Ro = o(() => {
    if (C === "new") {
      let { sorters: Uo, filters: cc, pageSize: dc, current: pc, ...Ns } = (M == null ? void 0 : M.params) ?? {};
      return Ns;
    }
    let { sorter: Re, filters: He, pageSize: Mr, current: wr, ...Ir } = ts.parse(h, { ignoreQueryPrefix: true });
    return Ir;
  }, "getCurrentQueryParams"), Fs = o(({ pagination: { current: Re, pageSize: He }, sorter: Mr, filters: wr }) => {
    if (C === "new")
      return ot({ type: "path", options: { keepHash: true, keepQuery: true }, query: { ...$ ? { current: Re, pageSize: He } : {}, sorters: Mr, filters: wr, ...Ro() } }) ?? "";
    let Ir = ts.parse(h == null ? void 0 : h.substring(1)), Uo = cr({ pagination: { pageSize: He, current: Re }, sorters: ut ?? Mr, filters: wr, ...Ir });
    return `${L ?? ""}?${Uo ?? ""}`;
  }, "createLinkForSyncWithLocation");
  reactExports.useEffect(() => {
    h === "" && (xo(ft), Po(yt), To(lr(Y, Se ?? [])), Gt(pr(ie, Xe ?? [])));
  }, [h]), reactExports.useEffect(() => {
    if (v) {
      let Re = Ro();
      if (C === "new")
        ot({ type: "replace", options: { keepQuery: true }, query: { ...$ ? { pageSize: ct, current: Et } : {}, sorters: differenceWith(ut, Y, isEqual), filters: differenceWith(Ut, ie, isEqual) } });
      else {
        let He = cr({ ...$ ? { pagination: { pageSize: ct, current: Et } } : {}, sorters: differenceWith(ut, Y, isEqual), filters: differenceWith(Ut, ie, isEqual), ...Re });
        return it == null ? void 0 : it(`${L}?${He}`, void 0, { shallow: true });
      }
    }
  }, [v, Et, ct, ut, Ut]);
  let Er = At({ resource: Ur, hasPagination: r, pagination: { current: Et, pageSize: ct, mode: n == null ? void 0 : n.mode }, filters: Q ? Pt(ie, Ut) : void 0, sorters: S ? dr(Y, ut) : void 0, queryOptions: U, successNotification: f, errorNotification: T, meta: go, metaData: go, liveMode: b, liveParams: R, onLiveEvent: g, dataProviderName: P2 }), As = o((Re) => {
    Gt((He) => Pt(ie, Re, He));
  }, "setFiltersAsMerge"), ks = o((Re) => {
    Gt(Pt(ie, Re));
  }, "setFiltersAsReplace"), Qs = o((Re) => {
    Gt((He) => Pt(ie, Re(He)));
  }, "setFiltersWithSetter"), Vs = o((Re, He = Pe) => {
    typeof Re == "function" ? Qs(Re) : He === "replace" ? ks(Re) : As(Re);
  }, "setFiltersFn"), ho = o((Re) => {
    To(() => dr(Y, Re));
  }, "setSortWithUnion"), { elapsedTime: Bs } = ee({ isLoading: Er.isFetching, interval: x == null ? void 0 : x.interval, onInterval: x == null ? void 0 : x.onInterval });
  return { tableQueryResult: Er, sorters: ut, setSorters: ho, sorter: ut, setSorter: ho, filters: Ut, setFilters: Vs, current: Et, setCurrent: xo, pageSize: ct, setPageSize: Po, pageCount: ct ? Math.ceil((((Lo = Er.data) == null ? void 0 : Lo.total) ?? 0) / ct) : 1, createLinkForSyncWithLocation: Fs, overtime: { elapsedTime: Bs } };
}
o(sb, "useTable");
var lt = React.createContext({}), ss = o(({ create: e, get: t, update: r, children: n }) => React.createElement(lt.Provider, { value: { create: e, get: t, update: r } }, n), "AuditLogContextProvider");
var Be = o(({ logMutationOptions: e, renameMutationOptions: t } = {}) => {
  let r = useQueryClient(), n = reactExports.useContext(lt), { keys: s, preferLegacyKeys: a } = O(), i = J(), { resources: c } = reactExports.useContext(at), { data: d, refetch: u, isLoading: p } = Hr({ v3LegacyAuthProviderCompatible: !!(i != null && i.isLegacy), queryOptions: { enabled: !!(n != null && n.create) } }), l = useMutation(async (f) => {
    var g, R, w, I, P2;
    let T = ye(f.resource, c), U = F((g = T == null ? void 0 : T.meta) == null ? void 0 : g.audit, (R = T == null ? void 0 : T.options) == null ? void 0 : R.audit, (I = (w = T == null ? void 0 : T.options) == null ? void 0 : w.auditLog) == null ? void 0 : I.permissions);
    if (U && !Sr(U, f.action))
      return;
    let D;
    return p && (n != null && n.create) && (D = await u()), await ((P2 = n.create) == null ? void 0 : P2.call(n, { ...f, author: d ?? (D == null ? void 0 : D.data) }));
  }, { mutationKey: s().audit().action("log").get(), ...e, meta: { ...e == null ? void 0 : e.meta, ...P() } }), y = useMutation(async (f) => {
    var T;
    return await ((T = n.update) == null ? void 0 : T.call(n, f));
  }, { onSuccess: (f) => {
    f != null && f.resource && r.invalidateQueries(s().audit().resource((f == null ? void 0 : f.resource) ?? "").action("list").get(a));
  }, mutationKey: s().audit().action("rename").get(), ...t, meta: { ...t == null ? void 0 : t.meta, ...P() } });
  return { log: l, rename: y };
}, "useLog");
o(({ resource: e, action: t, meta: r, author: n, metaData: s, queryOptions: a }) => {
  let { get: i } = reactExports.useContext(lt), { keys: c, preferLegacyKeys: d } = O();
  return useQuery({ queryKey: c().audit().resource(e).action("list").params(r).get(d), queryFn: () => (i == null ? void 0 : i({ resource: e, action: t, author: n, meta: r, metaData: s })) ?? Promise.resolve([]), enabled: typeof i < "u", ...a, retry: false, meta: { ...a == null ? void 0 : a.meta, ...P() } });
}, "useLogList");
o(({ meta: e = {} } = {}) => {
  let t = Z(), { i18nProvider: r } = reactExports.useContext(ke), n = ae(), s = H(), { resources: a, resource: i, action: c } = z(), { options: { textTransformers: d } } = se(), u = [];
  if (!(i != null && i.name))
    return { breadcrumbs: u };
  let p = o((l) => {
    var f, T, U, D, g, R;
    let y = typeof l == "string" ? ye(l, a, t === "legacy") ?? { name: l } : l;
    if (y) {
      let w = F((f = y == null ? void 0 : y.meta) == null ? void 0 : f.parent, y == null ? void 0 : y.parentName);
      w && p(w);
      let I = he(y, a, t === "legacy").find((m) => m.action === "list"), P2 = (T = I == null ? void 0 : I.resource) != null && T.list ? I == null ? void 0 : I.route : void 0, x = P2 ? t === "legacy" ? P2 : Me(P2, y == null ? void 0 : y.meta, n, e) : void 0;
      u.push({ label: F((U = y.meta) == null ? void 0 : U.label, (D = y.options) == null ? void 0 : D.label) ?? s(`${y.name}.${y.name}`, d.humanize(y.name)), href: x, icon: F((g = y.meta) == null ? void 0 : g.icon, (R = y.options) == null ? void 0 : R.icon, y.icon) });
    }
  }, "addBreadcrumb");
  if (p(i), c && c !== "list") {
    let l = `actions.${c}`, y = s(l);
    typeof r < "u" && y === l ? (Ru(true, `[useBreadcrumb]: Breadcrumb missing translate key for the "${c}" action. Please add "actions.${c}" key to your translation file.
For more information, see https://refine.dev/docs/api-reference/core/hooks/useBreadcrumb/#i18n-support`), u.push({ label: s(`buttons.${c}`, d.humanize(c)) })) : u.push({ label: s(l, d.humanize(c)) });
  }
  return { breadcrumbs: u };
}, "useBreadcrumb");
var bt = o((e, t, r = false) => {
  let n = [], s = Fe(e, t);
  for (; s; )
    n.push(s), s = Fe(s, t);
  return n.reverse(), `/${[...n, e].map((i) => be((r ? i.route : void 0) ?? i.identifier ?? i.name)).join("/").replace(/^\//, "")}`;
}, "createResourceKey");
var cs = o((e, t = false) => {
  let r = { item: { name: "__root__" }, children: {} };
  e.forEach((s) => {
    let a = [], i = Fe(s, e);
    for (; i; )
      a.push(i), i = Fe(i, e);
    a.reverse();
    let c = r;
    a.forEach((u) => {
      let p = (t ? u.route : void 0) ?? u.identifier ?? u.name;
      c.children[p] || (c.children[p] = { item: u, children: {} }), c = c.children[p];
    });
    let d = (t ? s.route : void 0) ?? s.identifier ?? s.name;
    c.children[d] || (c.children[d] = { item: s, children: {} });
  });
  let n = o((s) => {
    let a = [];
    return Object.keys(s.children).forEach((i) => {
      let c = bt(s.children[i].item, e, t), d = { ...s.children[i].item, key: c, children: n(s.children[i]) };
      a.push(d);
    }), a;
  }, "flatten");
  return n(r);
}, "createTree");
var ds = o((e) => e.split("?")[0].split("#")[0].replace(/(.+)(\/$)/, "$1"), "getCleanPath");
o(({ meta: e, hideOnMissingParameter: t } = { hideOnMissingParameter: true }) => {
  let r = H(), n = pt(), s = Z(), { resource: a, resources: i } = z(), { pathname: c } = ae(), { useLocation: d } = re(), { pathname: u } = d(), p = nt(), y = `/${((s === "legacy" ? ds(u) : c ? ds(c) : void 0) ?? "").replace(/^\//, "")}`, f = a ? bt(a, i, s === "legacy") : y ?? "", T = React.useMemo(() => {
    if (!a)
      return [];
    let g = Fe(a, i), R = [bt(a, i)];
    for (; g; )
      R.push(bt(g, i)), g = Fe(g, i);
    return R;
  }, []), U = React.useCallback((g) => {
    var w, I, P2, x, m, v;
    if ((((w = g == null ? void 0 : g.meta) == null ? void 0 : w.hide) ?? ((I = g == null ? void 0 : g.options) == null ? void 0 : I.hide)) || !(g != null && g.list) && g.children.length === 0)
      return;
    let R = g.list ? n({ resource: g, action: "list", legacy: s === "legacy", meta: e }) : void 0;
    if (!(t && R && R.match(/(\/|^):(.+?)(\/|$){1}/)))
      return { ...g, route: R, icon: F((P2 = g.meta) == null ? void 0 : P2.icon, (x = g.options) == null ? void 0 : x.icon, g.icon), label: F((m = g == null ? void 0 : g.meta) == null ? void 0 : m.label, (v = g == null ? void 0 : g.options) == null ? void 0 : v.label) ?? r(`${g.name}.${g.name}`, p(g.name, "plural")) };
  }, [s, e, n, r, t]), D = React.useMemo(() => {
    let g = cs(i, s === "legacy"), R = o((w) => w.flatMap((I) => {
      let P2 = R(I.children), x = U({ ...I, children: P2 });
      return x ? [x] : [];
    }), "prepare");
    return R(g);
  }, [i, s, U]);
  return { defaultOpenKeys: T, selectedKey: f, menuItems: D };
}, "useMenu");
var q = o(() => {
  let { params: e } = ae();
  return o(({ resource: r, meta: n } = {}) => {
    let { meta: s } = Ct(r) ?? { meta: {} }, { filters: a, sorters: i, current: c, pageSize: d, ...u } = e ?? {};
    return { ...s, ...u, ...n };
  }, "getMetaFn");
}, "useMeta");
var ht = o(() => {
  let { options: e } = React.useContext(ve);
  return e;
}, "useRefineOptions");
var ps = o((e) => {
  let t = Z(), { useParams: r } = re(), n = ae(), s = r(), a = t === "legacy" ? s.id : n.id;
  return e ?? a;
}, "useId");
var ls = o((e) => {
  let t = Z(), { useParams: r } = re(), n = ae(), s = r(), a = t === "legacy" ? s.action : n.action;
  return e ?? a;
}, "useAction");
function Ne(e) {
  let { select: t, identifier: r } = z(), n = (e == null ? void 0 : e.resource) ?? r, { identifier: s = void 0, resource: a = void 0 } = n ? t(n, true) : {}, i = r === s, c = ps(), d = ls(e == null ? void 0 : e.action), u = React.useMemo(() => i ? (e == null ? void 0 : e.id) ?? c : e == null ? void 0 : e.id, [i, e == null ? void 0 : e.id, c]), [p, l] = React.useState(u);
  React.useEffect(() => l(u), [u]);
  let y = React.useMemo(() => !i && !(e != null && e.action) ? "create" : d === "edit" || d === "clone" ? d : "create", [d, i, e == null ? void 0 : e.action]);
  return { id: p, setId: l, resource: a, action: d, identifier: s, formAction: y };
}
o(Ne, "useResourceParams");
function Cr({ type: e }) {
  let t = H(), { textTransformers: { humanize: r } } = ht(), n = `buttons.${e}`, s = r(e);
  return { label: t(n, s) };
}
o(Cr, "useActionableButton");
var br = o((e) => {
  var u, p, l;
  let t = H(), r = React.useContext(je), n = ((u = e.accessControl) == null ? void 0 : u.enabled) ?? r.options.buttons.enableAccessControl, s = ((p = e.accessControl) == null ? void 0 : p.hideIfUnauthorized) ?? r.options.buttons.hideIfUnauthorized, { data: a } = gr({ resource: (l = e.resource) == null ? void 0 : l.name, action: e.action === "clone" ? "create" : e.action, params: { id: e.id, resource: e.resource }, queryOptions: { enabled: n } }), i = React.useMemo(() => a != null && a.can ? "" : a != null && a.reason ? a.reason : t("buttons.notAccessTitle", "You don't have permission to access"), [a == null ? void 0 : a.can, a == null ? void 0 : a.reason, t]), c = n && s && !(a != null && a.can), d = (a == null ? void 0 : a.can) === false;
  return { title: i, hidden: c, disabled: d, canAccess: a };
}, "useButtonCanAccess");
function vt(e) {
  var R;
  let t = ce(), r = Z(), n = tt(), { Link: s } = re(), a = H(), i = nt(), { textTransformers: { humanize: c } } = ht(), { id: d, resource: u, identifier: p } = Ne({ resource: e.resource, id: e.action === "create" ? void 0 : e.id }), { canAccess: l, title: y, hidden: f, disabled: T } = br({ action: e.action, accessControl: e.accessControl, id: d, resource: u }), U = r === "legacy" ? s : n, D = React.useMemo(() => {
    if (!u)
      return "";
    switch (e.action) {
      case "create":
      case "list":
        return t[`${e.action}Url`](u, e.meta);
      default:
        return d ? t[`${e.action}Url`](u, d, e.meta) : "";
    }
  }, [u, d, e.meta, t[`${e.action}Url`]]), g = e.action === "list" ? a(`${p ?? e.resource}.titles.list`, i(((R = u == null ? void 0 : u.meta) == null ? void 0 : R.label) ?? (u == null ? void 0 : u.label) ?? p ?? e.resource, "plural")) : a(`buttons.${e.action}`, c(e.action));
  return { to: D, label: g, title: y, disabled: T, hidden: f, canAccess: l, LinkComponent: U };
}
o(vt, "useNavigationButton");
function vu(e) {
  let t = H(), { mutate: r, isLoading: n, variables: s } = eo(), { setWarnWhen: a } = dt(), { mutationMode: i } = Ae(e.mutationMode), { id: c, resource: d, identifier: u } = Ne({ resource: e.resource, id: e.id }), { title: p, disabled: l, hidden: y, canAccess: f } = br({ action: "delete", accessControl: e.accessControl, id: c, resource: d }), T = t("buttons.delete", "Delete"), U = t("buttons.delete", "Delete"), D = t("buttons.confirm", "Are you sure?"), g = t("buttons.cancel", "Cancel"), R = c === (s == null ? void 0 : s.id) && n;
  return { label: T, title: p, hidden: y, disabled: l, canAccess: f, loading: R, confirmOkLabel: U, cancelLabel: g, confirmTitle: D, onConfirm: o(() => {
    c && u && (a(false), r({ id: c, resource: u, mutationMode: i, successNotification: e.successNotification, errorNotification: e.errorNotification, meta: e.meta, metaData: e.meta, dataProviderName: e.dataProviderName, invalidates: e.invalidates }, { onSuccess: e.onSuccess }));
  }, "onConfirm") };
}
o(vu, "useDeleteButton");
function Lu(e) {
  let t = H(), { keys: r, preferLegacyKeys: n } = O(), s = useQueryClient(), a = Ce(), { identifier: i, id: c } = Ne({ resource: e.resource, id: e.id }), { resources: d } = z(), u = !!s.isFetching({ queryKey: r().data(j(i, e.dataProviderName, d)).resource(i).action("one").get(n) }), p = o(() => {
    a({ id: c, invalidates: ["detail"], dataProviderName: e.dataProviderName, resource: i });
  }, "onClick"), l = t("buttons.refresh", "Refresh");
  return { onClick: p, label: l, loading: u };
}
o(Lu, "useRefreshButton");
o((e) => vt({ ...e, action: "show" }), "useShowButton");
o((e) => vt({ ...e, action: "edit" }), "useEditButton");
o((e) => vt({ ...e, action: "clone" }), "useCloneButton");
o((e) => vt({ ...e, action: "create" }), "useCreateButton");
o((e) => vt({ ...e, action: "list" }), "useListButton");
o(() => Cr({ type: "save" }), "useSaveButton");
o(() => Cr({ type: "export" }), "useExportButton");
o(() => Cr({ type: "import" }), "useImportButton");
o(() => {
  let [e, t] = reactExports.useState(), r = H(), { push: n } = ce(), s = ge(), a = Z(), { resource: i, action: c } = z();
  return reactExports.useEffect(() => {
    i && c && t(r("pages.error.info", { action: c, resource: i.name }, `You may have forgotten to add the "${c}" component to "${i.name}" resource.`));
  }, [i, c]), React.createElement(React.Fragment, null, React.createElement("h1", null, r("pages.error.404", void 0, "Sorry, the page you visited does not exist.")), e && React.createElement("p", null, e), React.createElement("button", { onClick: () => {
    a === "legacy" ? n("/") : s({ to: "/" });
  } }, r("pages.error.backHome", void 0, "Back Home")));
}, "ErrorComponent");
var Ar = o(() => {
  let [e, t] = reactExports.useState(""), [r, n] = reactExports.useState(""), s = H(), a = J(), { mutate: i } = Ft({ v3LegacyAuthProviderCompatible: !!(a != null && a.isLegacy) });
  return React.createElement(React.Fragment, null, React.createElement("h1", null, s("pages.login.title", "Sign in your account")), React.createElement("form", { onSubmit: (c) => {
    c.preventDefault(), i({ username: e, password: r });
  } }, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, s("pages.login.username", void 0, "username"), ":"), React.createElement("td", null, React.createElement("input", { type: "text", size: 20, autoCorrect: "off", spellCheck: false, autoCapitalize: "off", autoFocus: true, required: true, value: e, onChange: (c) => t(c.target.value) }))), React.createElement("tr", null, React.createElement("td", null, s("pages.login.password", void 0, "password"), ":"), React.createElement("td", null, React.createElement("input", { type: "password", required: true, size: 20, value: r, onChange: (c) => n(c.target.value) }))))), React.createElement("br", null), React.createElement("input", { type: "submit", value: "login" })));
}, "LoginPage");
var ys = o(({ providers: e, registerLink: t, forgotPasswordLink: r, rememberMe: n, contentProps: s, wrapperProps: a, renderContent: i, formProps: c, title: d = void 0, hideForm: u }) => {
  let p = Z(), l = tt(), { Link: y } = re(), f = p === "legacy" ? y : l, [T, U] = reactExports.useState(""), [D, g] = reactExports.useState(""), [R, w] = reactExports.useState(false), I = H(), P2 = J(), { mutate: x } = Ft({ v3LegacyAuthProviderCompatible: !!(P2 != null && P2.isLegacy) }), m = o((C, E) => React.createElement(f, { to: C }, E), "renderLink"), v = o(() => e ? e.map((C) => React.createElement("div", { key: C.name, style: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" } }, React.createElement("button", { onClick: () => x({ providerName: C.name }), style: { display: "flex", alignItems: "center" } }, C == null ? void 0 : C.icon, C.label ?? React.createElement("label", null, C.label)))) : null, "renderProviders"), b = React.createElement("div", { ...s }, React.createElement("h1", { style: { textAlign: "center" } }, I("pages.login.title", "Sign in to your account")), v(), !u && React.createElement(React.Fragment, null, React.createElement("hr", null), React.createElement("form", { onSubmit: (C) => {
    C.preventDefault(), x({ email: T, password: D, remember: R });
  }, ...c }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "email-input" }, I("pages.login.fields.email", "Email")), React.createElement("input", { id: "email-input", name: "email", type: "text", size: 20, autoCorrect: "off", spellCheck: false, autoCapitalize: "off", required: true, value: T, onChange: (C) => U(C.target.value) }), React.createElement("label", { htmlFor: "password-input" }, I("pages.login.fields.password", "Password")), React.createElement("input", { id: "password-input", type: "password", name: "password", required: true, size: 20, value: D, onChange: (C) => g(C.target.value) }), n ?? React.createElement(React.Fragment, null, React.createElement("label", { htmlFor: "remember-me-input" }, I("pages.login.buttons.rememberMe", "Remember me"), React.createElement("input", { id: "remember-me-input", name: "remember", type: "checkbox", size: 20, checked: R, value: R.toString(), onChange: () => {
    w(!R);
  } }))), React.createElement("br", null), r ?? m("/forgot-password", I("pages.login.buttons.forgotPassword", "Forgot password?")), React.createElement("input", { type: "submit", value: I("pages.login.signin", "Sign in") }), t ?? React.createElement("span", null, I("pages.login.buttons.noAccount", "Don’t have an account?"), " ", m("/register", I("pages.login.register", "Sign up")))))), t !== false && u && React.createElement("div", { style: { textAlign: "center" } }, I("pages.login.buttons.noAccount", "Don’t have an account?"), " ", m("/register", I("pages.login.register", "Sign up"))));
  return React.createElement("div", { ...a }, i ? i(b, d) : b);
}, "LoginPage");
var Ts = o(({ providers: e, loginLink: t, wrapperProps: r, contentProps: n, renderContent: s, formProps: a, title: i = void 0, hideForm: c }) => {
  let d = Z(), u = tt(), { Link: p } = re(), l = d === "legacy" ? p : u, [y, f] = reactExports.useState(""), [T, U] = reactExports.useState(""), D = H(), g = J(), { mutate: R, isLoading: w } = zr({ v3LegacyAuthProviderCompatible: !!(g != null && g.isLegacy) }), I = o((m, v) => React.createElement(l, { to: m }, v), "renderLink"), P2 = o(() => e ? e.map((m) => React.createElement("div", { key: m.name, style: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" } }, React.createElement("button", { onClick: () => R({ providerName: m.name }), style: { display: "flex", alignItems: "center" } }, m == null ? void 0 : m.icon, m.label ?? React.createElement("label", null, m.label)))) : null, "renderProviders"), x = React.createElement("div", { ...n }, React.createElement("h1", { style: { textAlign: "center" } }, D("pages.register.title", "Sign up for your account")), P2(), !c && React.createElement(React.Fragment, null, React.createElement("hr", null), React.createElement("form", { onSubmit: (m) => {
    m.preventDefault(), R({ email: y, password: T });
  }, ...a }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "email-input" }, D("pages.register.fields.email", "Email")), React.createElement("input", { id: "email-input", name: "email", type: "email", size: 20, autoCorrect: "off", spellCheck: false, autoCapitalize: "off", required: true, value: y, onChange: (m) => f(m.target.value) }), React.createElement("label", { htmlFor: "password-input" }, D("pages.register.fields.password", "Password")), React.createElement("input", { id: "password-input", name: "password", type: "password", required: true, size: 20, value: T, onChange: (m) => U(m.target.value) }), React.createElement("input", { type: "submit", value: D("pages.register.buttons.submit", "Sign up"), disabled: w }), t ?? React.createElement(React.Fragment, null, React.createElement("span", null, D("pages.login.buttons.haveAccount", "Have an account?"), " ", I("/login", D("pages.login.signin", "Sign in"))))))), t !== false && c && React.createElement("div", { style: { textAlign: "center" } }, D("pages.login.buttons.haveAccount", "Have an account?"), " ", I("/login", D("pages.login.signin", "Sign in"))));
  return React.createElement("div", { ...r }, s ? s(x, i) : x);
}, "RegisterPage");
var xs = o(({ loginLink: e, wrapperProps: t, contentProps: r, renderContent: n, formProps: s, title: a = void 0 }) => {
  let i = H(), c = Z(), d = tt(), { Link: u } = re(), p = c === "legacy" ? u : d, [l, y] = reactExports.useState(""), { mutate: f, isLoading: T } = jr(), U = o((g, R) => React.createElement(p, { to: g }, R), "renderLink"), D = React.createElement("div", { ...r }, React.createElement("h1", { style: { textAlign: "center" } }, i("pages.forgotPassword.title", "Forgot your password?")), React.createElement("hr", null), React.createElement("form", { onSubmit: (g) => {
    g.preventDefault(), f({ email: l });
  }, ...s }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "email-input" }, i("pages.forgotPassword.fields.email", "Email")), React.createElement("input", { id: "email-input", name: "email", type: "mail", autoCorrect: "off", spellCheck: false, autoCapitalize: "off", required: true, value: l, onChange: (g) => y(g.target.value) }), React.createElement("input", { type: "submit", disabled: T, value: i("pages.forgotPassword.buttons.submit", "Send reset instructions") }), React.createElement("br", null), e ?? React.createElement("span", null, i("pages.register.buttons.haveAccount", "Have an account? "), " ", U("/login", i("pages.login.signin", "Sign in"))))));
  return React.createElement("div", { ...t }, n ? n(D, a) : D);
}, "ForgotPasswordPage");
var Rs = o(({ wrapperProps: e, contentProps: t, renderContent: r, formProps: n, title: s = void 0 }) => {
  let a = H(), i = J(), { mutate: c, isLoading: d } = Zr({ v3LegacyAuthProviderCompatible: !!(i != null && i.isLegacy) }), [u, p] = reactExports.useState(""), [l, y] = reactExports.useState(""), f = React.createElement("div", { ...t }, React.createElement("h1", { style: { textAlign: "center" } }, a("pages.updatePassword.title", "Update Password")), React.createElement("hr", null), React.createElement("form", { onSubmit: (T) => {
    T.preventDefault(), c({ password: u, confirmPassword: l });
  }, ...n }, React.createElement("div", { style: { display: "flex", flexDirection: "column", padding: 25 } }, React.createElement("label", { htmlFor: "password-input" }, a("pages.updatePassword.fields.password", "New Password")), React.createElement("input", { id: "password-input", name: "password", type: "password", required: true, size: 20, value: u, onChange: (T) => p(T.target.value) }), React.createElement("label", { htmlFor: "confirm-password-input" }, a("pages.updatePassword.fields.confirmPassword", "Confirm New Password")), React.createElement("input", { id: "confirm-password-input", name: "confirmPassword", type: "password", required: true, size: 20, value: l, onChange: (T) => y(T.target.value) }), React.createElement("input", { type: "submit", disabled: d, value: a("pages.updatePassword.buttons.submit", "Update") }))));
  return React.createElement("div", { ...e }, r ? r(f, s) : f);
}, "UpdatePasswordPage");
o((e) => {
  let { type: t } = e;
  return React.createElement(React.Fragment, null, o(() => {
    switch (t) {
      case "register":
        return React.createElement(Ts, { ...e });
      case "forgotPassword":
        return React.createElement(xs, { ...e });
      case "updatePassword":
        return React.createElement(Rs, { ...e });
      default:
        return React.createElement(ys, { ...e });
    }
  }, "renderView")());
}, "AuthPage");
var mo = o(() => React.createElement(React.Fragment, null, React.createElement("h1", null, "Welcome on board"), React.createElement("p", null, "Your configuration is completed."), React.createElement("p", null, "Now you can get started by adding your resources to the", " ", React.createElement("code", null, "`resources`"), " property of ", React.createElement("code", null, "`<Refine>`")), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement("a", { href: "https://refine.dev", target: "_blank", rel: "noreferrer" }, React.createElement("button", null, "Documentation")), React.createElement("a", { href: "https://refine.dev/examples", target: "_blank", rel: "noreferrer" }, React.createElement("button", null, "Examples")), React.createElement("a", { href: "https://discord.gg/refine", target: "_blank", rel: "noreferrer" }, React.createElement("button", null, "Community")))), "ReadyPage");
var Fu = [{ title: "Documentation", description: "Learn about the technical details of using Refine in your projects.", link: "https://refine.dev/docs", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/book.svg" }, { title: "Tutorial", description: "Learn how to use Refine by building a fully-functioning CRUD app, from scratch to full launch.", link: "https://refine.dev/tutorial", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/hat.svg" }, { title: "Templates", description: "Explore a range of pre-built templates, perfect everything from admin panels to dashboards and CRMs.", link: "https://refine.dev/templates", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/application.svg" }, { title: "Community", description: "Join our Discord community and keep up with the latest news.", link: "https://discord.gg/refine", iconUrl: "https://refine.ams3.cdn.digitaloceanspaces.com/welcome-page/discord.svg" }], hs = o(() => {
  let e = nr("(max-width: 1010px)"), t = nr("(max-width: 650px)"), r = o(() => t ? "1, 280px" : e ? "2, 280px" : "4, 1fr", "getGridTemplateColumns"), n = o(() => t ? "32px" : e ? "40px" : "48px", "getHeaderFontSize"), s = o(() => t ? "16px" : e ? "20px" : "24px", "getSubHeaderFontSize");
  return React.createElement("div", { style: { position: "fixed", zIndex: 10, inset: 0, overflow: "auto", width: "100dvw", height: "100dvh" } }, React.createElement("div", { style: { overflow: "hidden", position: "relative", backgroundSize: "cover", backgroundRepeat: "no-repeat", background: t ? "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(88.89% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(88.89% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30" : e ? "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(66.67% 50% at 50% 100%, rgba(38, 217, 127, 0.10) 0%, rgba(38, 217, 127, 0.00) 100%), radial-gradient(66.67% 50% at 50% 0%, rgba(71, 235, 235, 0.15) 0%, rgba(71, 235, 235, 0.00) 100%), #1D1E30" : "url(https://refine.ams3.cdn.digitaloceanspaces.com/website/static/assets/landing-noise.webp), radial-gradient(35.56% 50% at 50% 100%, rgba(38, 217, 127, 0.12) 0%, rgba(38, 217, 127, 0) 100%), radial-gradient(35.56% 50% at 50% 0%, rgba(71, 235, 235, 0.18) 0%, rgba(71, 235, 235, 0) 100%), #1D1E30", minHeight: "100%", minWidth: "100%", fontFamily: "Arial", color: "#FFFFFF" } }, React.createElement("div", { style: { zIndex: 2, position: "absolute", width: t ? "400px" : "800px", height: "552px", opacity: "0.5", background: "url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/welcome-page-hexagon.png)", backgroundRepeat: "no-repeat", backgroundSize: "contain", top: "0", left: "50%", transform: "translateX(-50%)" } }), React.createElement("div", { style: { height: t ? "40px" : "80px" } }), React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, React.createElement("div", { style: { backgroundRepeat: "no-repeat", backgroundSize: t ? "112px 58px" : "224px 116px", backgroundImage: "url(https://refine.ams3.cdn.digitaloceanspaces.com/assets/refine-logo.svg)", width: t ? 112 : 224, height: t ? 58 : 116 } })), React.createElement("div", { style: { height: t ? "120px" : e ? "200px" : "30vh", minHeight: t ? "120px" : "200px" } }), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" } }, React.createElement("h1", { style: { fontSize: n(), fontWeight: 700, margin: "0px" } }, "Welcome Aboard!"), React.createElement("h4", { style: { fontSize: s(), fontWeight: 400, margin: "0px" } }, "Your configuration is completed.")), React.createElement("div", { style: { height: "64px" } }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${r()})`, justifyContent: "center", gap: "48px", paddingRight: "16px", paddingLeft: "16px", paddingBottom: "32px", maxWidth: "976px", margin: "auto" } }, Fu.map((a) => React.createElement(Au, { key: `welcome-page-${a.title}`, card: a })))));
}, "ConfigSuccessPage"), Au = o(({ card: e }) => {
  let { title: t, description: r, iconUrl: n, link: s } = e, [a, i] = reactExports.useState(false);
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center" } }, React.createElement("a", { onPointerEnter: () => i(true), onPointerLeave: () => i(false), style: { display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" }, href: s }, React.createElement("div", { style: { width: "16px", height: "16px", backgroundPosition: "center", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundImage: `url(${n})` } }), React.createElement("span", { style: { fontSize: "16px", fontWeight: 700, marginLeft: "13px", marginRight: "14px" } }, t), React.createElement("svg", { style: { transition: "transform 0.5s ease-in-out, opacity 0.2s ease-in-out", ...a && { transform: "translateX(4px)", opacity: 1 } }, width: "12", height: "8", fill: "none", opacity: "0.5", xmlns: "http://www.w3.org/2000/svg" }, React.createElement("path", { d: "M7.293.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L8.586 5H1a1 1 0 0 1 0-2h7.586L7.293 1.707a1 1 0 0 1 0-1.414Z", fill: "#fff" })))), React.createElement("span", { style: { fontSize: "12px", opacity: 0.5, lineHeight: "16px" } }, r));
}, "Card");
var Cs = o(() => React.createElement("div", { style: { position: "fixed", zIndex: 11, inset: 0, overflow: "auto", width: "100dvw", height: "100dvh" } }, React.createElement("div", { style: { width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "24px", background: "#14141FBF", backdropFilter: "blur(3px)" } }, React.createElement("div", { style: { maxWidth: "640px", width: "100%", background: "#1D1E30", borderRadius: "16px", border: "1px solid #303450", boxShadow: "0px 0px 120px -24px #000000" } }, React.createElement("div", { style: { padding: "16px 20px", borderBottom: "1px solid #303450", display: "flex", alignItems: "center", gap: "8px", position: "relative" } }, React.createElement(Qu, { style: { position: "absolute", left: 0, top: 0 } }), React.createElement("div", { style: { lineHeight: "24px", fontSize: "16px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "16px" } }, React.createElement(Vu, null), React.createElement("span", { style: { fontWeight: 400 } }, "Configuration Error"))), React.createElement("div", { style: { padding: "20px", color: "#A3ADC2", lineHeight: "20px", fontSize: "14px", display: "flex", flexDirection: "column", gap: "20px" } }, React.createElement("p", { style: { margin: 0, padding: 0, lineHeight: "28px", fontSize: "16px" } }, React.createElement("code", { style: { display: "inline-block", background: "#30345080", padding: "0 4px", lineHeight: "24px", fontSize: "16px", borderRadius: "4px", color: "#FFFFFF" } }, "<Refine />"), " ", "is not initialized. Please make sure you have it mounted in your app and placed your components inside it."), React.createElement("div", null, React.createElement(ku, null)))))), "ConfigErrorPage"), ku = o(() => React.createElement("pre", { style: { display: "block", overflowX: "auto", borderRadius: "8px", fontSize: "14px", lineHeight: "24px", backgroundColor: "#14141F", color: "#E5ECF2", padding: "16px", margin: "0", maxHeight: "400px", overflow: "auto" } }, React.createElement("span", { style: { color: "#FF7B72" } }, "import"), " ", "{", " Refine, WelcomePage", " ", "}", " ", React.createElement("span", { style: { color: "#FF7B72" } }, "from"), " ", React.createElement("span", { style: { color: "#A5D6FF" } }, '"@refinedev/core"'), ";", `
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
`, "}"), "ExampleImplementation"), Qu = o((e) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 204, height: 56, viewBox: "0 0 204 56", fill: "none", ...e }, React.createElement("path", { fill: "url(#welcome-page-error-gradient-a)", d: "M12 0H0v12L12 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-b)", d: "M28 0h-8L0 20v8L28 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-c)", d: "M36 0h8L0 44v-8L36 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-d)", d: "M60 0h-8L0 52v4h4L60 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-e)", d: "M68 0h8L20 56h-8L68 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-f)", d: "M92 0h-8L28 56h8L92 0Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-g)", d: "M100 0h8L52 56h-8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-h)", d: "M124 0h-8L60 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-i)", d: "M140 0h-8L76 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-j)", d: "M132 0h8L84 56h-8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-k)", d: "M156 0h-8L92 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-l)", d: "M164 0h8l-56 56h-8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-m)", d: "M188 0h-8l-56 56h8l56-56Z" }), React.createElement("path", { fill: "url(#welcome-page-error-gradient-n)", d: "M204 0h-8l-56 56h8l56-56Z" }), React.createElement("defs", null, React.createElement("radialGradient", { id: "welcome-page-error-gradient-a", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-b", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-c", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-d", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-e", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-f", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-g", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-h", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-i", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-j", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-k", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-l", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-m", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })), React.createElement("radialGradient", { id: "welcome-page-error-gradient-n", cx: 0, cy: 0, r: 1, gradientTransform: "scale(124)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#FF4C4D", stopOpacity: 0.1 }), React.createElement("stop", { offset: 1, stopColor: "#FF4C4D", stopOpacity: 0 })))), "ErrorGradient"), Vu = o((e) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", ...e }, React.createElement("path", { fill: "#FF4C4D", fillRule: "evenodd", d: "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z", clipRule: "evenodd" }), React.createElement("path", { fill: "#fff", fillRule: "evenodd", d: "M7 8a1 1 0 1 0 2 0V5a1 1 0 1 0-2 0v3Zm0 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z", clipRule: "evenodd" })), "ErrorIcon");
o(() => {
  let { __initialized: e } = se();
  return React.createElement(React.Fragment, null, React.createElement(hs, null), !e && React.createElement(Cs, null));
}, "WelcomePage");
var Nu = "4.49.0", bs = o(() => {
  var R;
  let e = Yr(), t = reactExports.useContext(lt), { liveProvider: r } = reactExports.useContext(qe), n = reactExports.useContext(Nt), s = reactExports.useContext(Vt), { i18nProvider: a } = reactExports.useContext(ke), i = reactExports.useContext(Bt), c = reactExports.useContext(je), { resources: d } = z(), u = se(), p = !!t.create || !!t.get || !!t.update, l = !!(r != null && r.publish) || !!(r != null && r.subscribe) || !!(r != null && r.unsubscribe), y = !!n.useHistory || !!n.Link || !!n.Prompt || !!n.useLocation || !!n.useParams, f = !!s, T = !!(a != null && a.changeLocale) || !!(a != null && a.getLocale) || !!(a != null && a.translate), U = !!i.close || !!i.open, D = !!c.can, g = (R = u == null ? void 0 : u.options) == null ? void 0 : R.projectId;
  return { providers: { auth: e, auditLog: p, live: l, router: y, data: f, i18n: T, notification: U, accessControl: D }, version: Nu, resourceCount: d.length, projectId: g };
}, "useTelemetryData");
var Ku = o((e) => {
  try {
    let t = JSON.stringify(e || {});
    return typeof btoa < "u" ? btoa(t) : Buffer$1.from(t).toString("base64");
  } catch {
    return;
  }
}, "encode"), Gu = o((e) => {
  let t = new Image();
  t.src = e;
}, "throughImage"), Hu = o((e) => {
  fetch(e);
}, "throughFetch"), $u = o((e) => {
  typeof Image < "u" ? Gu(e) : typeof fetch < "u" && Hu(e);
}, "transport"), Ds = o(() => {
  let e = bs(), t = React.useRef(false);
  return React.useEffect(() => {
    if (t.current)
      return;
    let r = Ku(e);
    r && ($u(`https://telemetry.refine.dev/telemetry?payload=${r}`), t.current = true);
  }, []), null;
}, "Telemetry");
var Ls = o((e) => {
  let t = ["go", "parse", "back", "Link"], r = Object.keys(e).filter((s) => !t.includes(s));
  return r.length > 0 ? (console.warn(`Unsupported properties are found in \`routerProvider\` prop. You provided \`${r.join(", ")}\`. Supported properties are \`${t.join(", ")}\`. You may wanted to use \`legacyRouterProvider\` prop instead.`), true) : false;
}, "checkRouterPropMisuse");
var Es = o((e) => {
  let t = React.useRef(false);
  React.useEffect(() => {
    t.current === false && e && Ls(e) && (t.current = true);
  }, [e]);
}, "useRouterMisuseWarning");
var zu = o(({ legacyAuthProvider: e, authProvider: t, dataProvider: r, legacyRouterProvider: n, routerProvider: s, notificationProvider: a, accessControlProvider: i, auditLogProvider: c, resources: d, DashboardPage: u, ReadyPage: p, LoginPage: l, catchAll: y, children: f, liveProvider: T, i18nProvider: U, Title: D, Layout: g, Sider: R, Header: w, Footer: I, OffLayoutArea: P2, onLiveEvent: x, options: m }) => {
  let { optionsWithDefaults: v, disableTelemetryWithDefault: b, reactQueryWithDefaults: C } = kr({ options: m }), E = yr(() => {
    var M;
    return C.clientConfig instanceof QueryClient ? C.clientConfig : new QueryClient({ ...C.clientConfig, defaultOptions: { ...C.clientConfig.defaultOptions, queries: { refetchOnWindowFocus: false, keepPreviousData: true, ...(M = C.clientConfig.defaultOptions) == null ? void 0 : M.queries } } });
  }, [C.clientConfig]);
  let L = React.useMemo(() => typeof a == "function" ? a : () => a, [a])();
  if (Es(s), n && !s && (d ?? []).length === 0)
    return p ? React.createElement(p, null) : React.createElement(mo, null);
  let { RouterComponent: A = React.Fragment } = s ? {} : n ?? {};
  return React.createElement(QueryClientProvider, { client: E }, React.createElement(Gn, { ...L }, React.createElement(Mo, { ...e ?? {}, isProvided: !!e }, React.createElement(Io, { ...t ?? {}, isProvided: !!t }, React.createElement(vn, { dataProvider: r }, React.createElement(Ln, { liveProvider: T }, React.createElement(Sn, { value: n && !s ? "legacy" : "new" }, React.createElement(An, { router: s }, React.createElement(Xn, { ...n }, React.createElement(Mn, { resources: d ?? [] }, React.createElement($n, { i18nProvider: U }, React.createElement(Yn, { ...i ?? {} }, React.createElement(ss, { ...c ?? {} }, React.createElement(Nn, null, React.createElement($o, { mutationMode: v.mutationMode, warnWhenUnsavedChanges: v.warnWhenUnsavedChanges, syncWithLocation: v.syncWithLocation, Title: D, undoableTimeout: v.undoableTimeout, catchAll: y, DashboardPage: u, LoginPage: l, Layout: g, Sider: R, Footer: I, Header: w, OffLayoutArea: P2, hasDashboard: !!u, liveMode: v.liveMode, onLiveEvent: x, options: v }, React.createElement(jo, null, React.createElement(A, null, f, !b && React.createElement(Ds, null), React.createElement(fo, null))))))))))))))))));
}, "Refine");
var Kn = o(({ notification: e }) => {
  let t = H(), { notificationDispatch: r } = _e(), { open: n } = we(), [s, a] = reactExports.useState(), i = o(() => {
    if (e.isRunning === true && (e.seconds === 0 && e.doMutation(), e.isSilent || n == null || n({ key: `${e.id}-${e.resource}-notification`, type: "progress", message: t("notifications.undoable", { seconds: Mt(e.seconds) }, `You have ${Mt(e.seconds)} seconds to undo`), cancelMutation: e.cancelMutation, undoableTimeout: Mt(e.seconds) }), e.seconds > 0)) {
      s && clearTimeout(s);
      let c = setTimeout(() => {
        r({ type: "DECREASE_NOTIFICATION_SECOND", payload: { id: e.id, seconds: e.seconds, resource: e.resource } });
      }, 1e3);
      a(c);
    }
  }, "cancelNotification");
  return reactExports.useEffect(() => {
    i();
  }, [e]), null;
}, "UndoableQueue");
o(({ children: e, Layout: t, Sider: r, Header: n, Title: s, Footer: a, OffLayoutArea: i }) => {
  let { Layout: c, Footer: d, Header: u, Sider: p, Title: l, OffLayoutArea: y } = se();
  return React.createElement(t ?? c, { Sider: r ?? p, Header: n ?? u, Footer: a ?? d, Title: s ?? l, OffLayoutArea: i ?? y }, e, React.createElement(Yu, null));
}, "LayoutWrapper");
var Yu = o(() => {
  let { Prompt: e } = re(), t = H(), { warnWhen: r, setWarnWhen: n } = dt(), s = o((a) => (a.preventDefault(), a.returnValue = t("warnWhenUnsavedChanges", "Are you sure you want to leave? You have unsaved changes."), a.returnValue), "warnWhenListener");
  return reactExports.useEffect(() => (r && window.addEventListener("beforeunload", s), window.removeEventListener("beforeunload", s)), [r]), React.createElement(e, { when: r, message: t("warnWhenUnsavedChanges", "Are you sure you want to leave? You have unsaved changes."), setWarnWhen: n });
}, "UnsavedPrompt");
function Ju({ redirectOnFail: e = true, appendCurrentPathToQuery: t = true, children: r, fallback: n, loading: s }) {
  var P2;
  let a = J(), i = Z(), c = !!(a != null && a.isProvided), d = !!(a != null && a.isLegacy), u = i === "legacy", p = ae(), l = ge(), { useLocation: y } = re(), f = y(), { isFetching: T, isSuccess: U, data: { authenticated: D, redirectTo: g } = {} } = fr({ v3LegacyAuthProviderCompatible: d }), R = c ? d ? U : D : true;
  if (!c)
    return React.createElement(React.Fragment, null, r ?? null);
  if (T)
    return React.createElement(React.Fragment, null, s ?? null);
  if (R)
    return React.createElement(React.Fragment, null, r ?? null);
  if (typeof n < "u")
    return React.createElement(React.Fragment, null, n ?? null);
  let w = d ? typeof e == "string" ? e : "/login" : typeof e == "string" ? e : g, I = `${u ? f == null ? void 0 : f.pathname : p.pathname}`.replace(/(\?.*|#.*)$/, "");
  if (w) {
    if (u) {
      let x = t ? `?to=${encodeURIComponent(I)}` : "";
      return React.createElement(ec, { to: `${w}${x}` });
    }
    return React.createElement(qu, { config: { to: w, query: t ? { to: (P2 = p.params) != null && P2.to ? p.params.to : l({ to: I, options: { keepQuery: true }, type: "path" }) } : void 0, type: "replace" } });
  }
  return null;
}
o(Ju, "Authenticated");
var qu = o(({ config: e }) => {
  let t = ge();
  return React.useEffect(() => {
    t(e);
  }, [t, e]), null;
}, "Redirect"), ec = o(({ to: e }) => {
  let { replace: t } = ce();
  return React.useEffect(() => {
    t(e);
  }, [t, e]), null;
}, "RedirectLegacy");
var fo = o(() => {
  let { useLocation: e } = re(), { checkAuth: t } = ue(), r = e();
  return reactExports.useEffect(() => {
    t == null || t().catch(() => false);
  }, [r == null ? void 0 : r.pathname]), null;
}, "RouteChangeHandler");
o(({ resource: e, action: t, params: r, fallback: n, onUnauthorized: s, children: a, queryOptions: i, ...c }) => {
  let { id: d, resource: u, action: p = "" } = Ne({ resource: e, id: r == null ? void 0 : r.id }), l = t ?? p, y = r ?? { id: d, resource: u }, { data: f } = gr({ resource: u == null ? void 0 : u.name, action: l, params: y, queryOptions: i });
  return reactExports.useEffect(() => {
    s && (f == null ? void 0 : f.can) === false && s({ resource: u == null ? void 0 : u.name, action: l, reason: f == null ? void 0 : f.reason, params: y });
  }, [f == null ? void 0 : f.can]), f != null && f.can ? React.isValidElement(a) ? React.cloneElement(a, c) : React.createElement(React.Fragment, null, a) : (f == null ? void 0 : f.can) === false ? React.createElement(React.Fragment, null, n ?? null) : null;
}, "CanAccess");
var ws = [`
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
var sc = "If you find Refine useful, you can contribute to its growth by giving it a star on GitHub";
o(() => (reactExports.useEffect(() => {
  let e = document.createElement("style");
  document.head.appendChild(e), ws.forEach((t) => {
    var r;
    return (r = e.sheet) == null ? void 0 : r.insertRule(t, e.sheet.cssRules.length);
  });
}, []), React.createElement("div", { className: "banner bg-top-announcement", style: { width: "100%", height: "48px" } }, React.createElement("div", { style: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", paddingLeft: "200px", width: "100%", maxWidth: "100vw", height: "100%", borderBottom: "1px solid #47ebeb26" } }, React.createElement("div", { className: "top-announcement-mask", style: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", borderBottom: "1px solid #47ebeb26" } }, React.createElement("div", { style: { position: "relative", width: "960px", height: "100%", display: "flex", justifyContent: "space-between", margin: "0 auto" } }, React.createElement("div", { style: { width: "calc(50% - 300px)", height: "100%", position: "relative" } }, React.createElement(Dr, { style: { animationDelay: "1.5s", position: "absolute", top: "2px", right: "220px" }, id: "1" }), React.createElement(Dr, { style: { animationDelay: "1s", position: "absolute", top: "8px", right: "100px", transform: "rotate(180deg)" }, id: "2" }), React.createElement(Is, { style: { position: "absolute", right: "10px" }, id: "3" })), React.createElement("div", { style: { width: "calc(50% - 300px)", height: "100%", position: "relative" } }, React.createElement(Dr, { style: { animationDelay: "2s", position: "absolute", top: "6px", right: "180px", transform: "rotate(180deg)" }, id: "4" }), React.createElement(Dr, { style: { animationDelay: "0.5s", transitionDelay: "1.3s", position: "absolute", top: "2px", right: "40px" }, id: "5" }), React.createElement(Is, { style: { position: "absolute", right: "-70px" }, id: "6" })))), React.createElement(ic, { text: sc })))), "GitHubBanner");
var ic = o(({ text: e }) => React.createElement("a", { className: "gh-link", href: "https://s.refine.dev/github-support", target: "_blank", rel: "noreferrer", style: { position: "absolute", height: "100%", padding: "0 60px", display: "flex", flexWrap: "nowrap", whiteSpace: "nowrap", justifyContent: "center", alignItems: "center", backgroundImage: "linear-gradient(90deg, rgba(31, 63, 72, 0.00) 0%, #1F3F48 10%, #1F3F48 90%, rgba(31, 63, 72, 0.00) 100%)" } }, React.createElement("div", { style: { color: "#fff", display: "flex", flexDirection: "row", gap: "8px" } }, React.createElement("span", { style: { display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" } }, "⭐️"), React.createElement("span", { className: "text", style: { fontSize: "16px", lineHeight: "24px" } }, e), React.createElement("span", { style: { display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" } }, "⭐️"))), "Text"), Dr = o(({ style: e, ...t }) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 80, height: 40, fill: "none", style: { opacity: 1, animation: "top-announcement-glow 1s ease-in-out infinite alternate", ...e } }, React.createElement("circle", { cx: 40, r: 40, fill: `url(#${t.id}-a)`, fillOpacity: 0.5 }), React.createElement("defs", null, React.createElement("radialGradient", { id: `${t.id}-a`, cx: 0, cy: 0, r: 1, gradientTransform: "matrix(0 40 -40 0 40 0)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#47EBEB" }), React.createElement("stop", { offset: 1, stopColor: "#47EBEB", stopOpacity: 0 })))), "GlowSmall"), Is = o(({ style: e, ...t }) => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: 120, height: 48, fill: "none", ...t, style: { opacity: 1, animation: "top-announcement-glow 1s ease-in-out infinite alternate", ...e } }, React.createElement("circle", { cx: 60, cy: 24, r: 60, fill: `url(#${t.id}-a)`, fillOpacity: 0.5 }), React.createElement("defs", null, React.createElement("radialGradient", { id: `${t.id}-a`, cx: 0, cy: 0, r: 1, gradientTransform: "matrix(0 60 -60 0 60 24)", gradientUnits: "userSpaceOnUse" }, React.createElement("stop", { stopColor: "#47EBEB" }), React.createElement("stop", { offset: 1, stopColor: "#47EBEB", stopOpacity: 0 })))), "GlowBig");
o(({ status: e, elements: { success: t = React.createElement(Lr, { key: "autoSave.success", defaultMessage: "saved" }), error: r = React.createElement(Lr, { key: "autoSave.error", defaultMessage: "auto save failure" }), loading: n = React.createElement(Lr, { key: "autoSave.loading", defaultMessage: "saving..." }), idle: s = React.createElement(Lr, { key: "autoSave.idle", defaultMessage: "waiting for changes" }) } = {} }) => {
  switch (e) {
    case "success":
      return React.createElement(React.Fragment, null, t);
    case "error":
      return React.createElement(React.Fragment, null, r);
    case "loading":
      return React.createElement(React.Fragment, null, n);
    default:
      return React.createElement(React.Fragment, null, s);
  }
}, "AutoSaveIndicator");
var Lr = o(({ key: e, defaultMessage: t }) => {
  let r = H();
  return React.createElement("span", null, r(e, t));
}, "Message");
export {
  Buffer$1 as B,
  Ce as C,
  Ft as F,
  Hr as H,
  Ju as J,
  No as N,
  QueryClient as Q,
  Zr as Z,
  at as a,
  QueryClientProvider as b,
  useMutation as c,
  ae as d,
  zr as e,
  fr as f,
  ge as g,
  useQueryClient as h,
  global as i,
  Buffer$1$1 as j,
  lib as l,
  mr as m,
  path as p,
  qr as q,
  sb as s,
  useQuery as u,
  we as w,
  zu as z
};
