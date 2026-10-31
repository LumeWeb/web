/** Fixed coordinates distinguish PostgreSQL point ordering from spherical distance. */
export const hostDistanceCases = [
  { coordinates: [{ latitude: 0, longitude: 170 }, { latitude: 0, longitude: -179 }], location: { latitude: 0, longitude: 179 }, name: 'date-line longitude', order: [0, 1] },
  { coordinates: [{ latitude: 80, longitude: 0 }, { latitude: 89, longitude: 90 }], location: { latitude: 89, longitude: 0 }, name: 'polar longitude', order: [0, 1] },
  { coordinates: [{ latitude: 60, longitude: 5 }, { latitude: 63, longitude: 3 }], location: { latitude: 60, longitude: 0 }, name: 'diagonal coordinate deltas', order: [1, 0] },
] as const;
