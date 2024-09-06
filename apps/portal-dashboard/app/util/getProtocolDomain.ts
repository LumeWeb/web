import fetchPortalMeta from "@/util/fetchPortalMeta";
import getPortalUrl from "@/stores/getPortalUrl.js";

export default async function getProtocolDomain(proto: string) {
  const meta = await fetchPortalMeta(getPortalUrl());

  return `${proto}.${meta.domain}`;
}
