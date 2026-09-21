/**
 * The `Clock` seam: the injected time surface StreamController / LoadPipeline
 * use for throughput estimates, stall watchdogs, and eviction windows.
 * `Clock` is injectable so those decisions are deterministic in tests
 * (`clock?: Clock` in the coordinator bag).
 *
 * `wallClock()` is the production default (monotonic `performance.now()` plus
 * a media-playhead provider); `ManualClock` is the deterministic test double
 * whose time only advances when the test says so.
 */

import { describe, expect, it } from 'vitest';
import { ManualClock, wallClock } from '../session/clock.ts';

describe('Clock contract', () => {
  it('wallClock reports monotonic wall time and a nullable media playhead', () => {
    const clock = wallClock(() => 12.5);
    const a = clock.now();
    const b = clock.now();
    expect(b).toBeGreaterThanOrEqual(a);
    expect(clock.mediaTime()).toBe(12.5);
  });

  it('wallClock without a playhead provider reports null mediaTime', () => {
    expect(wallClock().mediaTime()).toBeNull();
  });

  it('ManualClock advances deterministically and holds an explicit mediaTime', () => {
    const clock = new ManualClock();
    expect(clock.now()).toBe(0);
    clock.advance(250);
    expect(clock.now()).toBe(250);
    clock.setMediaTime(9.25);
    expect(clock.mediaTime()).toBe(9.25);
    clock.setNow(1000);
    expect(clock.now()).toBe(1000);
    clock.setMediaTime(null);
    expect(clock.mediaTime()).toBeNull();
  });
});
