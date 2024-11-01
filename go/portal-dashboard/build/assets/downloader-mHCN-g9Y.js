import { c as config, e as errors } from "./root-Dge4DoZS.js";
import "./jsx-runtime-IZdvEyt_.js";
import "./useTheme-BSj4wmKW.js";
import "./usePortalUrl-CIV3_GNQ.js";
import "./index-BpxO7BrF.js";
import "./index-bnQotRZh.js";
import "./index-DzjV6XGT.js";
import "./button-CxRLgqWQ.js";
import "./Combination-px7rCmli.js";
import "./react-icons.esm-BJVio-o0.js";
import "./index-DKrFfig3.js";
import "./index-gIJO3bJT.js";
import "./index-wx_5TVOY.js";
import "./index-C6Wr53b0.js";
import "./icons-DXepPAEW.js";
import "./usePluginMeta-gNjNoX3n.js";
import "./usePortalMeta-B1ITfk6e.js";
import "./index-DQUpljiz.js";
import "./index-C-G3KncW.js";
import "./useActiveService-DRP-EN0d.js";
import "./useSdk-Bpz5OkDI.js";
import "./check-BawgaJVu.js";
import "./copy-QDpUxfzu.js";
import "./index-BOOu2P05.js";
import "./index-v7sdPLyF.js";
import "./components-XyVy0HiW.js";
import "./index-CVd92JJe.js";
import "./skeleton-Cez4AWj1.js";
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
