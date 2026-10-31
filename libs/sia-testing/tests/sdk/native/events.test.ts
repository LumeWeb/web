/** Checks event cursors with the installed native SDK and owned HTTP server. */
import { expect, it } from 'vitest';
import { withSdk } from './control.js';

it.each([['11', '22', '33'], ['33', '11', '22']])('advances equal-timestamp pages seeded as %s %s %s without replay', async (...ids) => {
  await withSdk(async (sdk, queries, model, account) => {
    for (const value of ids) {
      const id = value.repeat(32);
      model.seedObject(account, { id });
      model.deleteObject(account, id);
    }
    const first = await sdk.objectEvents(null, 1);
    expect(first.map(event => event.id)).toEqual(['1111111111111111111111111111111111111111111111111111111111111111']);
    const second = await sdk.objectEvents({ after: first[0]!.updatedAt, id: first[0]!.id }, 1);
    expect(second.map(event => event.id)).toEqual(['2222222222222222222222222222222222222222222222222222222222222222']);
    const third = await sdk.objectEvents({ after: second[0]!.updatedAt, id: second[0]!.id }, 1);
    expect(third.map(event => event.id)).toEqual(['3333333333333333333333333333333333333333333333333333333333333333']);
    expect(await sdk.objectEvents({ after: third[0]!.updatedAt, id: third[0]!.id }, 1)).toEqual([]);
    expect(queries).toContainEqual({ after: '2026-01-01T00:00:00+00:00', key: '11'.repeat(32), limit: '1' });
  });
});
