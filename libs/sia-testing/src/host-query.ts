/** Converts configured host URLs into SDK wire records and applies supported host queries. */
import type { ModelHost } from "./model/index.js";

export function hostQueryResponse(hosts: ModelHost[], params: URLSearchParams) {
  const pageValue = (name: string, fallback: number) => {
    const value = params.get(name);
    if (value === null) return fallback;
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
      throw new Error(`invalid host ${name}`);
    return Number(value);
  };
  const offset = pageValue("offset", 0);
  const limit = pageValue("limit", 100);
  if (limit < 1 || limit > 500) throw new Error("invalid host limit");
  const locationValue = params.get("location");
  let location: undefined | { latitude: number; longitude: number };
  if (locationValue) {
    const parts =
      locationValue.startsWith("(") && locationValue.endsWith(")")
        ? locationValue
            .slice(1, -1)
            .split(",")
            .map((part) => part.trim())
        : [];
    const latitude = Number(parts[0]),
      longitude = Number(parts[1]);
    const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
    if (
      parts.length !== 2 ||
      !parts.every((part) => decimal.test(part)) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    )
      throw new Error("invalid host location");
    location = { latitude, longitude };
  }
  const protocol = params.get("protocol");
  if (protocol && protocol !== "quic" && protocol !== "siamux")
    throw new Error("invalid host protocol");
  const records = hosts.map((host) => {
    const latitude = host.latitude ?? 0,
      longitude = host.longitude ?? 0;
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    )
      throw new Error("invalid configured host coordinates");
    return {
      addresses: host.addresses.map((value) => {
        const url = new URL(value);
        const protocol = url.protocol.replace(/:$/, "");
        if (
          !["quic", "siamux"].includes(protocol) ||
          !url.host ||
          url.username ||
          url.password ||
          (url.pathname && url.pathname !== "/") ||
          url.search ||
          url.hash
        )
          throw new Error("invalid configured host address");
        return { address: url.host, protocol };
      }),
      countryCode: host.countryCode ?? "",
      goodForUpload: host.goodForUpload ?? false,
      latitude,
      longitude,
      publicKey: host.publicKey,
    };
  });
  const selected = records.filter(
    (host) =>
      !protocol ||
      host.addresses.some((address) => address.protocol === protocol),
  );
  if (location) {
    const { latitude, longitude } = location;
    // Indexd orders PostgreSQL points, so longitude does not wrap at the date line.
    const distanceScore = (host: { latitude: number; longitude: number }) =>
      Math.hypot(host.latitude - latitude, host.longitude - longitude);
    selected.sort((a, b) => distanceScore(a) - distanceScore(b));
  }
  return selected.slice(offset, offset + limit);
}
