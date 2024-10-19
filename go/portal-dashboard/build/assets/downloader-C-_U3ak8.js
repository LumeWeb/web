import { c as config, e as errors } from "./root-Fvj2O9SE.js";
import "./jsx-runtime-IZdvEyt_.js";
import "./index-DU1IfKY5.js";
import "./index-DiXcXsr5.js";
import "./index-BquAYmyk.js";
import "./button-CzfLTIHt.js";
import "./index-C-2rzX6a.js";
import "./index-BTwtRxOU.js";
import "./Combination-BC6FEbU4.js";
import "./useSdk-Bk9IxULM.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./index-BpxO7BrF.js";
import "./index-O1NGHMyc.js";
import "./components-DMYkXxdw.js";
import "./index-CfDxhBvB.js";
import "./index-7xjrsmwg.js";
import "./useTheme-Wun3lQOi.js";
import "./index-CXs_k2So.js";
import "./index-B2actZrY.js";
import "./icons-DfV8n6Ey.js";
import "./popover-Dc2H5Ola.js";
import "./usePluginMeta-BNkMCdOH.js";
import "./usePortalMeta-BrKLDHxF.js";
import "./useActiveService-BbjXW4qB.js";
import "./check-DZlwGSeQ.js";
import "./copy-Doo_mHf9.js";
import "./index-Dv9Lz1jY.js";
import "./skeleton-DwNK_yGs.js";
const {
  WritableStream,
  TransformStream,
  DOMException,
  Blob
} = config;
const { GONE } = errors;
const isOldSafari = /constructor/i.test(window.HTMLElement);
class FileHandle {
  constructor(name = "unkown") {
    this.name = name;
    this.kind = "file";
  }
  async getFile() {
    throw new DOMException(...GONE);
  }
  async isSameEntry(other) {
    return this === other;
  }
  /**
   * @param {object} [options={}]
   */
  async createWritable(options = {}) {
    var _a;
    const sw = await ((_a = navigator.serviceWorker) == null ? void 0 : _a.getRegistration());
    const link = document.createElement("a");
    const ts = new TransformStream();
    const sink = ts.writable;
    link.download = this.name;
    if (isOldSafari || !sw) {
      let chunks = [];
      ts.readable.pipeTo(new WritableStream({
        write(chunk) {
          chunks.push(new Blob([chunk]));
        },
        close() {
          const blob = new Blob(chunks, { type: "application/octet-stream; charset=utf-8" });
          chunks = [];
          link.href = URL.createObjectURL(blob);
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 1e4);
        }
      }));
    } else {
      const { writable, readablePort } = new RemoteWritableStream(WritableStream);
      const fileName = encodeURIComponent(this.name).replace(/['()]/g, escape).replace(/\*/g, "%2A");
      const headers = {
        "content-disposition": "attachment; filename*=UTF-8''" + fileName,
        "content-type": "application/octet-stream; charset=utf-8",
        ...options.size ? { "content-length": options.size } : {}
      };
      const keepAlive = setTimeout(() => sw.active.postMessage(0), 1e4);
      ts.readable.pipeThrough(new TransformStream({
        transform(chunk, ctrl) {
          if (chunk instanceof Uint8Array) return ctrl.enqueue(chunk);
          const reader = new Response(chunk).body.getReader();
          const pump = (_) => reader.read().then((e) => e.done ? 0 : pump(ctrl.enqueue(e.value)));
          return pump();
        }
      })).pipeTo(writable).finally(() => {
        clearInterval(keepAlive);
      });
      sw.active.postMessage({
        url: sw.scope + fileName,
        headers,
        readablePort
      }, [readablePort]);
      const iframe = document.createElement("iframe");
      iframe.hidden = true;
      iframe.src = sw.scope + fileName;
      document.body.appendChild(iframe);
    }
    return sink.getWriter();
  }
}
const WRITE = 0;
const PULL = 0;
const ERROR = 1;
const ABORT = 1;
const CLOSE = 2;
class MessagePortSink {
  /** @param {MessagePort} port */
  constructor(port) {
    port.onmessage = (event) => this._onMessage(event.data);
    this._port = port;
    this._resetReady();
  }
  start(controller) {
    this._controller = controller;
    return this._readyPromise;
  }
  write(chunk) {
    const message = { type: WRITE, chunk };
    this._port.postMessage(message, [chunk.buffer]);
    this._resetReady();
    return this._readyPromise;
  }
  close() {
    this._port.postMessage({ type: CLOSE });
    this._port.close();
  }
  abort(reason) {
    this._port.postMessage({ type: ABORT, reason });
    this._port.close();
  }
  _onMessage(message) {
    if (message.type === PULL) this._resolveReady();
    if (message.type === ERROR) this._onError(message.reason);
  }
  _onError(reason) {
    this._controller.error(reason);
    this._rejectReady(reason);
    this._port.close();
  }
  _resetReady() {
    this._readyPromise = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
    this._readyPending = true;
  }
  _resolveReady() {
    this._readyResolve();
    this._readyPending = false;
  }
  _rejectReady(reason) {
    if (!this._readyPending) this._resetReady();
    this._readyPromise.catch(() => {
    });
    this._readyReject(reason);
    this._readyPending = false;
  }
}
class RemoteWritableStream {
  constructor(WritableStream2) {
    const channel = new MessageChannel();
    this.readablePort = channel.port1;
    this.writable = new WritableStream2(
      new MessagePortSink(channel.port2)
    );
  }
}
export {
  FileHandle
};
