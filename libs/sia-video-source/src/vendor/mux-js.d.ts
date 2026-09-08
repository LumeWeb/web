/**
 * Minimal vendor typings filling gaps in the ambient lib set this library
 * builds against.
 *
 * - mux.js ships no declarations, so its `mp4.Transmuxer` slice (the remux
 *   pipeline) is declared here.
 * - The `MediaSource.handle` transferable (`MediaSourceHandle`) is present in
 *   some target libs and absent in others; the augmentation keeps both happy.
 */

declare module 'mux.js' {
  export interface Mp4Namespace {
    [tool: string]: unknown;
    Transmuxer: new (options?: TransmuxerOptions) => Mp4Transmuxer;
  }

  // mux.js is CommonJS; strict ESM consumers cannot use its named exports, so
  // the worker imports the default interop object instead.
  const mux: { [tool: string]: unknown; mp4: Mp4Namespace; };
  export default mux;

  export interface Mp4Transmuxer {
    flush(): void;
    off(event: string, listener: (event?: unknown) => void): void;
    on(event: string, listener: (event?: unknown) => void): void;
    push(chunk: Uint8Array): void;
    reset(): void;
    setBaseMediaDecodeTime(baseMediaDecodeTime: number): void;
  }

  export interface TransmuxerData {
    data?: Uint8Array;
    initSegment?: Uint8Array;
    type?: string;
  }

  export interface TransmuxerOptions {
    [option: string]: unknown;
    baseMediaDecodeTime?: number;
    keepOriginalTimestamps?: boolean;
    remux?: boolean;
  }

  export const mp4: Mp4Namespace;
}

declare global {
  interface MediaSource {
    readonly canConstructInDedicatedWorker: boolean;
    /** Transferable worker-MSE handle (bonus API beyond the base spec). */
    readonly handle: MediaSourceHandle;
  }
}
