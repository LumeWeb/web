import { describe, expect, it } from "vitest";
import type {
  ErrorLike,
  MediaBufferState,
  MediaErrorState,
  MediaPlaybackState,
  MediaTimeState,
} from "@videojs/media";
import {
  emptyPlaybackFacts,
  normalizePlaybackFacts,
  normalizePlaybackFactsBuffer,
  normalizePlaybackFactsError,
  normalizePlaybackFactsPhase,
  normalizePlaybackFactsTime,
} from "./PlaybackFactsBridge";

/**
 * Node unit tests for the pure Video.js v10 playback-facts normalizer(s). The
 * input shapes are exactly the four selector states the bridge reads from the
 * player store (`selectPlayback`, `selectTime`, `selectBuffer`, `selectError`
 * from `@videojs/core/dom`), each of which yields `undefined` when the player
 * store was built without that feature. The normalizer turns those
 * possibly-undefined generic playback facts into one stable typed display-facts
 * snapshot whose fields are ALWAYS defined — so an overlay/status consumer
 * never branches on `undefined`, and an absent feature stays a distinct,
 * explicit fact. The React `PlaybackFactsBridge` component itself is not
 * exercised here (it needs a `<Player>` host); only the pure normalizers are
 * pinned, exactly as the Sia status bridge spec limits itself to its
 * normalizers.
 */

/** A media element actively playing: not paused, started, not waiting. */
const PLAYBACK_PLAYING: MediaPlaybackState = {
  ended: false,
  pause: () => undefined,
  paused: false,
  play: () => Promise.resolve(),
  started: true,
  togglePaused: () => false,
  waiting: false,
};

/** A media element paused after having started (e.g. first-frame pause). */
const PLAYBACK_PAUSED: MediaPlaybackState = {
  ended: false,
  pause: () => undefined,
  paused: true,
  play: () => Promise.resolve(),
  started: true,
  togglePaused: () => false,
  waiting: false,
};

/** A media element stalled waiting for data to resume playback. */
const PLAYBACK_WAITING: MediaPlaybackState = {
  ended: false,
  pause: () => undefined,
  paused: false,
  play: () => Promise.resolve(),
  started: true,
  togglePaused: () => false,
  waiting: true,
};

/** An element mid-seek with a known timeline and playhead. */
const TIME_SEEKING: MediaTimeState = {
  currentTime: 12.5,
  duration: 120,
  seek: () => Promise.resolve(12.5),
  seeking: true,
};

/** An element with buffered and seekable ranges. */
const BUFFER_BUFFERED: MediaBufferState = {
  buffered: [
    [0, 24],
    [80, 100],
  ],
  seekable: [[0, 120]],
};

/** The vetted `ErrorLike` a present media error carries. */
const ERROR_VALUE: ErrorLike = {
  code: 4,
  message: "MEDIA_ERR_SRC_NOT_SUPPORTED",
};

/** A media element with an active error set. */
const ERROR_PRESENT: MediaErrorState = {
  dismissError: () => undefined,
  error: ERROR_VALUE,
};

describe("emptyPlaybackFacts", () => {
  it("is fully inert: every display fact defined and no feature available", () => {
    const facts = emptyPlaybackFacts();
    expect(facts).toEqual({
      buffer: {
        available: false,
        buffered: [],
        bufferedAvailable: false,
        seekable: [],
        seekableAvailable: false,
      },
      error: { available: false, code: null, message: null, present: false },
      playback: {
        available: false,
        ended: false,
        paused: true,
        started: false,
        waiting: false,
      },
      time: { available: false, currentTime: 0, duration: 0, seeking: false },
    });
  });
});

describe("normalizePlaybackFacts", () => {
  it("treats every undefined selector state as the inert baseline", () => {
    const facts = normalizePlaybackFacts({
      buffer: undefined,
      error: undefined,
      playback: undefined,
      time: undefined,
    });
    expect(facts).toEqual(emptyPlaybackFacts());
  });

  it("is stable: identical inputs always normalize to equal snapshots", () => {
    const inputs = {
      buffer: BUFFER_BUFFERED,
      error: ERROR_PRESENT,
      playback: PLAYBACK_PLAYING,
      time: TIME_SEEKING,
    };
    expect(normalizePlaybackFacts(inputs)).toEqual(
      normalizePlaybackFacts(inputs),
    );
  });

  it("composes each normalized selector slice", () => {
    const facts = normalizePlaybackFacts({
      buffer: BUFFER_BUFFERED,
      error: ERROR_PRESENT,
      playback: PLAYBACK_PLAYING,
      time: TIME_SEEKING,
    });
    expect(facts.buffer).toEqual({
      available: true,
      buffered: [
        [0, 24],
        [80, 100],
      ],
      bufferedAvailable: true,
      seekable: [[0, 120]],
      seekableAvailable: true,
    });
    expect(facts.error).toEqual({
      available: true,
      code: 4,
      message: "MEDIA_ERR_SRC_NOT_SUPPORTED",
      present: true,
    });
    expect(facts.playback).toEqual({
      available: true,
      ended: false,
      paused: false,
      started: true,
      waiting: false,
    });
    expect(facts.time).toEqual({
      available: true,
      currentTime: 12.5,
      duration: 120,
      seeking: true,
    });
  });

  it("never leaks undefined into the snapshot shape", () => {
    const facts = emptyPlaybackFacts();
    const json = JSON.stringify(facts);
    expect(json).not.toContain("undefined");
    expect(facts.buffer.bufferedAvailable).not.toBeUndefined();
    expect(facts.buffer.seekableAvailable).not.toBeUndefined();
    expect(facts.error.code).not.toBeUndefined();
    expect(facts.error.message).not.toBeUndefined();
    expect(facts.error.present).not.toBeUndefined();
    expect(facts.playback.ended).not.toBeUndefined();
    expect(facts.playback.paused).not.toBeUndefined();
    expect(facts.playback.started).not.toBeUndefined();
    expect(facts.playback.waiting).not.toBeUndefined();
    expect(facts.time.currentTime).not.toBeUndefined();
    expect(facts.time.duration).not.toBeUndefined();
    expect(facts.time.seeking).not.toBeUndefined();
  });
});

describe("normalizePlaybackFactsPhase", () => {
  it("maps a playing element to defined phase facts", () => {
    expect(normalizePlaybackFactsPhase(PLAYBACK_PLAYING)).toEqual({
      available: true,
      ended: false,
      paused: false,
      started: true,
      waiting: false,
    });
  });

  it("keeps started when the element is paused after the first frame", () => {
    expect(normalizePlaybackFactsPhase(PLAYBACK_PAUSED)).toMatchObject({
      paused: true,
      started: true,
    });
  });

  it("keeps waiting and playing together when stalled", () => {
    expect(normalizePlaybackFactsPhase(PLAYBACK_WAITING)).toMatchObject({
      paused: false,
      started: true,
      waiting: true,
    });
  });

  it("reports an ended element", () => {
    expect(
      normalizePlaybackFactsPhase({ ...PLAYBACK_PLAYING, ended: true }),
    ).toMatchObject({ ended: true });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizePlaybackFactsPhase(undefined)).toEqual({
      available: false,
      ended: false,
      paused: true,
      started: false,
      waiting: false,
    });
  });
});

describe("normalizePlaybackFactsTime", () => {
  it("maps currentTime, duration, and seeking", () => {
    expect(normalizePlaybackFactsTime(TIME_SEEKING)).toEqual({
      available: true,
      currentTime: 12.5,
      duration: 120,
      seeking: true,
    });
  });

  it("normalizes non-finite, negative, and unknown times to a deterministic 0", () => {
    expect(
      normalizePlaybackFactsTime({
        currentTime: Number.NaN,
        duration: Number.POSITIVE_INFINITY,
        seek: () => Promise.resolve(0),
        seeking: false,
      }),
    ).toEqual({ available: true, currentTime: 0, duration: 0, seeking: false });
    expect(
      normalizePlaybackFactsTime({
        currentTime: -3,
        duration: 0,
        seek: () => Promise.resolve(0),
        seeking: false,
      }),
    ).toEqual({ available: true, currentTime: 0, duration: 0, seeking: false });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizePlaybackFactsTime(undefined)).toEqual({
      available: false,
      currentTime: 0,
      duration: 0,
      seeking: false,
    });
  });
});

describe("normalizePlaybackFactsBuffer", () => {
  it("passes ranges through and derives their availability", () => {
    expect(normalizePlaybackFactsBuffer(BUFFER_BUFFERED)).toEqual({
      available: true,
      buffered: [
        [0, 24],
        [80, 100],
      ],
      bufferedAvailable: true,
      seekable: [[0, 120]],
      seekableAvailable: true,
    });
  });

  it("reports no availability when no range is present", () => {
    expect(
      normalizePlaybackFactsBuffer({ buffered: [], seekable: [] }),
    ).toEqual({
      available: true,
      buffered: [],
      bufferedAvailable: false,
      seekable: [],
      seekableAvailable: false,
    });
  });

  it("drops malformed ranges deterministically", () => {
    expect(
      normalizePlaybackFactsBuffer({
        buffered: [
          [2, 1],
          [Number.NaN, 5],
          [0, 10],
        ],
        seekable: [
          [-1, 5],
          [0, 120],
        ],
      }),
    ).toEqual({
      available: true,
      buffered: [[0, 10]],
      bufferedAvailable: true,
      seekable: [[0, 120]],
      seekableAvailable: true,
    });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizePlaybackFactsBuffer(undefined)).toEqual({
      available: false,
      buffered: [],
      bufferedAvailable: false,
      seekable: [],
      seekableAvailable: false,
    });
  });
});

describe("normalizePlaybackFactsError", () => {
  it("maps a present media error to defined facts", () => {
    expect(normalizePlaybackFactsError(ERROR_PRESENT)).toEqual({
      available: true,
      code: 4,
      message: "MEDIA_ERR_SRC_NOT_SUPPORTED",
      present: true,
    });
  });

  it("normalizes a null error to absent with null details", () => {
    expect(
      normalizePlaybackFactsError({
        dismissError: () => undefined,
        error: null,
      }),
    ).toEqual({ available: true, code: null, message: null, present: false });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizePlaybackFactsError(undefined)).toEqual({
      available: false,
      code: null,
      message: null,
      present: false,
    });
  });
});
