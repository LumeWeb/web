import { e as errors } from "./root-mQvuLft0.js";
import "./jsx-runtime-CzXAEjbZ.js";
import "./useTheme-DYUrJKc_.js";
import "./usePortalUrl-CWejBXEP.js";
import "./index-BpxO7BrF.js";
import "./index-DpbAjMft.js";
import "./button-jedbwRXf.js";
import "./index-CxTzuwWC.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./component-Da1x9Q9K.js";
import "./index-CJ8FhmRo.js";
import "./index-DdpwiKzx.js";
import "./index-COopH7IU.js";
import "./index-DO2s7-z0.js";
import "./icons-3kvdaKde.js";
import "./usePluginMeta-DuNGe9eG.js";
import "./usePortalMeta-iFy40cTW.js";
import "./index-DpjZXSnv.js";
import "./index-xFQL_PNe.js";
import "./useActiveService-DhHuWKGG.js";
import "./useSdk-hjgK5j7F.js";
import "./check-Cgx-PNK3.js";
import "./createLucideIcon-DFCINFSp.js";
import "./copy-BTdE7U-g.js";
import "./index-BOOu2P05.js";
import "./index-5ukv8M2q.js";
import "./components-D8mYRm61.js";
import "./index-QWRrEtKK.js";
import "./skeleton-DaJxHvFz.js";
const { DISALLOWED } = errors;
class Sink {
  /**
   * @param {FileWriter} writer
   * @param {FileEntry} fileEntry
   */
  constructor(writer, fileEntry) {
    this.writer = writer;
    this.fileEntry = fileEntry;
  }
  /**
   * @param {BlobPart | Object} chunk
   */
  async write(chunk) {
    if (typeof chunk === "object") {
      if (chunk.type === "write") {
        if (Number.isInteger(chunk.position) && chunk.position >= 0) {
          this.writer.seek(chunk.position);
          if (this.writer.position !== chunk.position) {
            await new Promise((resolve, reject) => {
              this.writer.onwriteend = resolve;
              this.writer.onerror = reject;
              this.writer.truncate(chunk.position);
            });
            this.writer.seek(chunk.position);
          }
        }
        if (!("data" in chunk)) {
          throw new DOMException("Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. write requires a data argument", "SyntaxError");
        }
        chunk = chunk.data;
      } else if (chunk.type === "seek") {
        if (Number.isInteger(chunk.position) && chunk.position >= 0) {
          this.writer.seek(chunk.position);
          if (this.writer.position !== chunk.position) {
            throw new DOMException("seeking position failed", "InvalidStateError");
          }
          return;
        } else {
          throw new DOMException("Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. seek requires a position argument", "SyntaxError");
        }
      } else if (chunk.type === "truncate") {
        return new Promise((resolve) => {
          if (Number.isInteger(chunk.size) && chunk.size >= 0) {
            this.writer.onwriteend = (evt) => resolve();
            this.writer.truncate(chunk.size);
          } else {
            throw new DOMException("Failed to execute 'write' on 'UnderlyingSinkBase': Invalid params passed. truncate requires a size argument", "SyntaxError");
          }
        });
      }
    }
    await new Promise((resolve, reject) => {
      this.writer.onwriteend = resolve;
      this.writer.onerror = reject;
      this.writer.write(new Blob([chunk]));
    });
  }
  close() {
    return new Promise(this.fileEntry.file.bind(this.fileEntry));
  }
}
class FileHandle {
  /** @param {FileEntry} file */
  constructor(file, writable = true) {
    this.file = file;
    this.kind = "file";
    this.writable = writable;
    this.readable = true;
  }
  get name() {
    return this.file.name;
  }
  /**
   * @param {{ file: { toURL: () => string; }; }} other
   */
  isSameEntry(other) {
    return this.file.toURL() === other.file.toURL();
  }
  /** @return {Promise<File>} */
  getFile() {
    return new Promise(this.file.file.bind(this.file));
  }
  /** @return {Promise<Sink>} */
  createWritable(opts) {
    if (!this.writable) throw new DOMException(...DISALLOWED);
    return new Promise(
      (resolve, reject) => this.file.createWriter((fileWriter) => {
        if (opts.keepExistingData === false) {
          fileWriter.onwriteend = (evt) => resolve(new Sink(fileWriter, this.file));
          fileWriter.truncate(0);
        } else {
          resolve(new Sink(fileWriter, this.file));
        }
      }, reject)
    );
  }
}
class FolderHandle {
  /** @param {DirectoryEntry} dir */
  constructor(dir, writable = true) {
    this.dir = dir;
    this.writable = writable;
    this.readable = true;
    this.kind = "directory";
    this.name = dir.name;
  }
  /** @param {FolderHandle} other */
  isSameEntry(other) {
    return this.dir.fullPath === other.dir.fullPath;
  }
  /** @returns {AsyncGenerator<[string, FileHandle | FolderHandle]>} */
  async *entries() {
    const reader = this.dir.createReader();
    const entries = await new Promise(reader.readEntries.bind(reader));
    for (const x of entries) {
      yield [x.name, x.isFile ? new FileHandle(x, this.writable) : new FolderHandle(x, this.writable)];
    }
  }
  /**
   * @param {string} name
   * @param {{ create: boolean; }} opts
   * @returns {Promise<FolderHandle>}
   */
  getDirectoryHandle(name, opts) {
    return new Promise((resolve, reject) => {
      this.dir.getDirectory(name, opts, (dir) => {
        resolve(new FolderHandle(dir));
      }, reject);
    });
  }
  /**
   * @param {string} name
   * @param {{ create: boolean; }} opts
   * @returns {Promise<FileHandle>}
   */
  getFileHandle(name, opts) {
    return new Promise(
      (resolve, reject) => this.dir.getFile(name, opts, (file) => resolve(new FileHandle(file)), reject)
    );
  }
  /**
   * @param {string} name
   * @param {{ recursive: boolean; }} opts
   */
  async removeEntry(name, opts) {
    const entry = await this.getDirectoryHandle(name, { create: false }).catch(
      (err) => err.name === "TypeMismatchError" ? this.getFileHandle(name, { create: false }) : err
    );
    if (entry instanceof Error) throw entry;
    return new Promise((resolve, reject) => {
      if (entry instanceof FolderHandle) {
        opts.recursive ? entry.dir.removeRecursively(() => resolve(), reject) : entry.dir.remove(() => resolve(), reject);
      } else if (entry.file) {
        entry.file.remove(() => resolve(), reject);
      }
    });
  }
}
const sandbox = (opts = {}) => new Promise(
  (resolve, reject) => window.webkitRequestFileSystem(
    opts._persistent,
    0,
    (e) => resolve(new FolderHandle(e.root)),
    reject
  )
);
export {
  FileHandle,
  FolderHandle,
  sandbox as default
};
