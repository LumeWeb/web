export interface HostInfo {
  addresses: string[];
  countryCode: string;
  goodForUpload: boolean;
  latitude: number;
  longitude: number;
  publicKey: string;
}

export function createHostInfo(overrides: Partial<HostInfo> = {}): HostInfo {
  const addresses = [
    ...(overrides.addresses ?? ["quic://host.example.test:443"]),
  ];
  return {
    countryCode: "US",
    goodForUpload: true,
    latitude: 0,
    longitude: 0,
    publicKey:
      "ed25519:d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
    ...overrides,
    addresses,
  };
}
