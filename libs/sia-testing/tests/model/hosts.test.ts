/** Checks configured host filtering and ownership of returned model records. */
import { describe, expect, it } from 'vitest';
import { createIndexdModel, type HostFilter } from '../../src/model/index.js';

function setup() {
  const model = createIndexdModel({ hosts: [
    { addresses: ['127.0.0.1:9101'], countryCode: 'DE', goodForUpload: true, publicKey: 'de-ready' },
    { addresses: ['127.0.0.1:9102'], countryCode: 'DE', goodForUpload: false, publicKey: 'de-unavailable' },
    { addresses: ['127.0.0.1:9103'], countryCode: 'US', goodForUpload: true, publicKey: 'us-ready' },
    { addresses: ['127.0.0.1:9104'], publicKey: 'unknown-status' },
  ] });
  const account = model.createAccount({ publicKey: 'host-query-account' });
  return { account, model };
}

describe('model host queries', () => {
  it('returns every configured host without a filter', () => {
    const { account, model } = setup();
    expect(model.hosts(account.id).map(host => host.publicKey)).toEqual(['de-ready', 'de-unavailable', 'us-ready', 'unknown-status']);
  });

  const cases: { filter: HostFilter; name: string; want: string[] }[] = [
    { filter: { countryCode: 'DE' }, name: 'country', want: ['de-ready', 'de-unavailable'] },
    { filter: { goodForUpload: true }, name: 'upload-ready hosts', want: ['de-ready', 'us-ready'] },
    { filter: { goodForUpload: false }, name: 'unavailable hosts without treating missing status as false', want: ['de-unavailable'] },
    { filter: { publicKey: 'us-ready' }, name: 'public key', want: ['us-ready'] },
    { filter: { publicKey: 'missing' }, name: 'absent public key', want: [] },
    { filter: { countryCode: 'GB' }, name: 'absent country', want: [] },
  ];
  it.each(cases)('filters by $name', ({ filter, want }) => {
    const { account, model } = setup();
    expect(model.hosts(account.id, filter).map(host => host.publicKey)).toEqual(want);
  });

  it('requires every supplied filter to match', () => {
    const { account, model } = setup();
    expect(model.hosts(account.id, { countryCode: 'DE', goodForUpload: true, publicKey: 'de-ready' }).map(host => host.publicKey)).toEqual(['de-ready']);
  });

  it('returns no host when its key conflicts with the country filter', () => {
    const { account, model } = setup();
    expect(model.hosts(account.id, { countryCode: 'DE', publicKey: 'us-ready' })).toEqual([]);
  });

  it('keeps returned records and addresses separate from configured hosts', () => {
    const { account, model } = setup();
    const returned = model.hosts(account.id, { publicKey: 'de-ready' })[0];
    if (!returned) throw new Error('Configured host was not returned');
    returned.addresses[0] = 'changed';
    returned.addresses.push('extra');
    returned.countryCode = 'US';
    returned.goodForUpload = false;
    returned.publicKey = 'changed';
    expect(model.hosts(account.id, { publicKey: 'de-ready' })).toEqual([
      { addresses: ['127.0.0.1:9101'], countryCode: 'DE', goodForUpload: true, publicKey: 'de-ready' },
    ]);
  });

  it('rejects a host query from an unregistered account', () => {
    const { model } = setup();
    expect(() => model.hosts('unregistered', { countryCode: 'DE' })).toThrow(/unknown account/);
  });
});
