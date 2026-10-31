import { owner, signedUrl } from "../fixtures/auth.js";
/** Checks host wire records and query validation at the shared dispatcher boundary. */
import { expect, it } from 'vitest';
import { createIndexdModel } from '../../src/model/index.js';
import { createIndexdDispatcher } from '../../src/dispatcher.js';

function setup() {
  const model = createIndexdModel({ hosts: [
    { addresses: ['quic://127.0.0.1:9101'], countryCode: 'DE', goodForUpload: true, latitude: 52, longitude: 13, publicKey: 'first' },
    { addresses: ['siamux://127.0.0.1:9102'], countryCode: 'US', goodForUpload: false, publicKey: 'second' },
    { addresses: ['siamux://127.0.0.1:9103', 'quic://127.0.0.1:9104'], countryCode: 'DE', goodForUpload: true, publicKey: 'third' },
  ] });
  model.createAccount({ publicKey: owner });
  const dispatch = createIndexdDispatcher(model);
  return (query = '') => dispatch(new Request(signedUrl(`/hosts?${query}`)));
}

it('projects configured URLs into SDK network-address records', async () => {
  const call = setup();
  expect(await (await call('limit=1')).json()).toEqual([
    { addresses: [{ address: '127.0.0.1:9101', protocol: 'quic' }], countryCode: 'DE', goodForUpload: true, latitude: 52, longitude: 13, publicKey: 'first' },
  ]);
});

it('filters before applying offset and limit', async () => {
  const call = setup();
  expect(await (await call('country=DE&protocol=quic&offset=1&limit=1')).json()).toEqual([
    { addresses: [{ address: '127.0.0.1:9103', protocol: 'siamux' }, { address: '127.0.0.1:9104', protocol: 'quic' }], countryCode: 'DE', goodForUpload: true, latitude: 0, longitude: 0, publicKey: 'third' },
  ]);
});

it('retains legacy countryCode and upload-status filters', async () => {
  const call = setup();
  const result: unknown = await (await call('countryCode=US&goodForUpload=false')).json();
  expect(result).toMatchObject([{ goodForUpload: false, publicKey: 'second' }]);
});

it('returns an empty exhausted page', async () => {
  expect(await (await setup()('offset=3&limit=1')).json()).toEqual([]);
});

it('defaults host pages to the service limit of 100 records', async () => {
  const model = createIndexdModel({ hosts: Array.from({ length: 101 }, (_, index) => ({ addresses: [], publicKey: `host-${index}` })) });
  model.createAccount({ publicKey: owner });
  const dispatch = createIndexdDispatcher(model);
  const response = await dispatch(new Request(signedUrl('/hosts')));
  const body: unknown = await response.json();
  expect(body).toHaveLength(100);
});

it('supplies missing wire fields without inventing upload readiness', async () => {
  const model = createIndexdModel({ hosts: [{ addresses: [], publicKey: 'unknown' }] });
  model.createAccount({ publicKey: owner });
  const response = await createIndexdDispatcher(model)(new Request(signedUrl('/hosts')));
  expect(await response.json()).toEqual([{ addresses: [], countryCode: '', goodForUpload: false, latitude: 0, longitude: 0, publicKey: 'unknown' }]);
});

it('preserves IPv6 host ports in protocol records', async () => {
  const model = createIndexdModel({ hosts: [{ addresses: ['quic://[::1]:9101'], publicKey: 'ipv6' }] });
  model.createAccount({ publicKey: owner });
  const response = await createIndexdDispatcher(model)(new Request(signedUrl('/hosts')));
  expect(await response.json()).toMatchObject([{ addresses: [{ address: '[::1]:9101', protocol: 'quic' }] }]);
});

for (const scenario of [
  { hosts: [{ latitude: 0, longitude: 20, publicKey: 'far' }, { latitude: 0, longitude: 1, publicKey: 'near' }, { latitude: 0, longitude: 5, publicKey: 'middle' }], location: '(0,0)', name: 'equator distances before paging', page: '&offset=1&limit=2', want: ['middle', 'far'] },
  { hosts: [{ latitude: 0, longitude: 170, publicKey: 'same-side' }, { latitude: 0, longitude: -179, publicKey: 'across-line' }], location: '(0,179)', name: 'point distance without date-line wrapping', page: '', want: ['same-side', 'across-line'] },
  { hosts: [{ latitude: 80, longitude: 0, publicKey: 'latitude-near' }, { latitude: 89, longitude: 90, publicKey: 'longitude-far' }], location: '(89,0)', name: 'point distance without polar longitude compression', page: '', want: ['latitude-near', 'longitude-far'] },
  { hosts: [{ latitude: 60, longitude: 5, publicKey: 'axis' }, { latitude: 63, longitude: 3, publicKey: 'diagonal' }], location: '(60,0)', name: 'both coordinate deltas', page: '', want: ['diagonal', 'axis'] },
  { hosts: [{ latitude: 8, longitude: 1, publicKey: 'latitude-far' }, { latitude: 0, longitude: 2, publicKey: 'longitude-near' }], location: '(0,0)', name: 'latitude even when longitude is closer', page: '', want: ['longitude-near', 'latitude-far'] },
  { hosts: [{ latitude: 0, longitude: -1, publicKey: 'right' }, { latitude: 0, longitude: 1, publicKey: 'left' }], location: '(0,0)', name: 'configured order for equal distances', page: '', want: ['right', 'left'] },
]) {
  it(`orders hosts by ${scenario.name}`, async () => {
    const model = createIndexdModel({ hosts: scenario.hosts.map(host => ({ ...host, addresses: [] })) });
    model.createAccount({ publicKey: owner });
    const response = await createIndexdDispatcher(model)(new Request(signedUrl(`/hosts?location=${encodeURIComponent(scenario.location)}${scenario.page}`)));
    expect(response.status).toBe(200);
    const body: unknown = await response.json();
    expect(body).toHaveLength(scenario.want.length);
    scenario.want.forEach((publicKey, index) => { expect(body).toHaveProperty(`${index}.publicKey`, publicKey); });
  });
}

for (const coordinates of [
  { latitude: 91, longitude: 0 },
  { latitude: 0, longitude: 181 },
  { latitude: Number.NaN, longitude: 0 },
  { latitude: 0, longitude: Number.POSITIVE_INFINITY },
]) {
  it(`rejects invalid configured coordinates ${coordinates.latitude},${coordinates.longitude}`, async () => {
    const model = createIndexdModel({ hosts: [{ ...coordinates, addresses: [], publicKey: 'invalid-coordinates' }] });
    model.createAccount({ publicKey: owner });
    const response = await createIndexdDispatcher(model)(new Request(signedUrl('/hosts?location=(0,0)')));
    expect(response.status).toBe(400);
  });
}

for (const address of ['http://127.0.0.1:9101', 'quic://user:secret@127.0.0.1:9101', 'quic://127.0.0.1:9101/private', 'quic://127.0.0.1:9101?query=1', 'quic://127.0.0.1:9101#fragment', 'not-a-url']) {
  it(`rejects a configured host address outside the wire format: ${address}`, async () => {
    const model = createIndexdModel({ hosts: [{ addresses: [address], publicKey: 'invalid' }] });
    model.createAccount({ publicKey: owner });
    const response = await createIndexdDispatcher(model)(new Request(signedUrl('/hosts')));
    expect(response.status).toBe(400);
  });
}

for (const query of ['limit=0', 'limit=501', 'limit=-1', 'limit=1.5', 'limit=wrong', 'offset=-1', 'offset=1.5', 'offset=wrong', 'protocol=http', 'location=wrong', 'location=(91,0)', 'location=(-91,0)', 'location=(0,181)', 'location=(0,-181)', 'location=(NaN,0)', 'location=(Infinity,0)', 'location=(0,0,0)', 'location=(0,)']) {
  it(`rejects the unsupported or invalid host query ${query}`, async () => {
    expect((await setup()(query)).status).toBe(400);
  });
}
