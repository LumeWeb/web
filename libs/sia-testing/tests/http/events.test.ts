/** Checks timestamp and key ordering without changing model event history. */
import { expect, it } from 'vitest';
import { createIndexdModel } from '../../src/model/index.js';
import { createIndexdDispatcher } from '../../src/dispatcher.js';
import { owner, signedUrl } from '../fixtures/auth.js';

it('orders event pages by timestamp then key and accepts equivalent cursor time zones', async () => {
  let stamp = '2026-01-02T00:00:00Z';
  const model = createIndexdModel({ now: () => new Date(stamp) });
  model.createAccount({ publicKey: owner });
  for (const [id, time] of [['b', '2026-01-02T00:00:00Z'], ['c', '2026-01-01T00:00:00Z'], ['a', '2026-01-02T00:00:00Z']]) {
    stamp = time!;
    model.seedObject(owner, { id: id! }); model.deleteObject(owner, id!);
  }
  const dispatch = createIndexdDispatcher(model);
  const page = async (query: string) => {
    const response = await dispatch(new Request(signedUrl(`/objects?${query}`)));
    expect(response.status).toBe(200);
    return (await response.json() as { key: string }[]).map(event => event.key);
  };
  expect(await page('limit=2')).toEqual(['c', 'a']);
  expect(await page('after=2026-01-01T19%3A00%3A00-05%3A00&key=a&limit=1')).toEqual(['b']);
  expect(await page('after=2026-01-02T00%3A00%3A00Z&key=b&limit=1')).toEqual([]);
  expect(await page('after=2026-01-01T00%3A00%3A00Z&key=z&limit=2')).toEqual(['a', 'b']);
});
