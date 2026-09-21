/**
 * `LoadPipeline` seam: the composition-root call that turns one load's
 * `ByteSource` into a typed verdict through the single media-library pipeline.
 * Discovery and conversion share one `Input`, so the metadata bytes are
 * downloaded once and a ready result carries runnable playback over that same
 * input.
 *
 * The seam is generic: it imports no Sia SDK and no MSE internals. Load
 * generation and cancellation are the coordinator's concern when it drives
 * `run`; this module only forwards the facts it needs.
 */

import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import {
  inspectMediaLibrary,
  type MediaLoadResult,
} from '../media/library-load.ts';
import type { ByteSource } from '../transport/byte-source.ts';

/** The seam the coordinator depends on for one load verdict. */
export interface LoadPipeline {
  run(request: LoadRequest): Promise<LoadResult>;
}

/** Constructor bag for {@link createLoadPipeline}. */
export interface LoadPipelineDeps {
  /** Browser capability snapshot for the MSE/codec checks. */
  readonly capabilities: PlaybackCapabilities;
  /**
   * Optional media-library entry point for package-owned tests; production
   * resolves to `inspectMediaLibrary`.
   */
  readonly inspect?: typeof inspectMediaLibrary;
}

/** Everything the pipeline needs to decide one load. */
export interface LoadRequest {
  /** Load-generation counter forwarded to every ByteSource read. */
  readonly loadGeneration: number;
  /** Load-level abort signal forwarded to every ByteSource read. */
  readonly signal: AbortSignal;
  /** The transport the whole object is readable through. */
  readonly source: ByteSource;
}

/** Typed verdict for one load: ready, unsupported, or cancelled. */
export type LoadResult = MediaLoadResult;

/** Builds the load-pipeline seam over the media-library pipeline. */
export function createLoadPipeline(deps: LoadPipelineDeps): LoadPipeline {
  const { capabilities, inspect = inspectMediaLibrary } = deps;
  return {
    async run(request: LoadRequest): Promise<LoadResult> {
      return inspect(request.source, {
        capabilities,
        loadGeneration: request.loadGeneration,
        signal: request.signal,
      });
    },
  };
}
