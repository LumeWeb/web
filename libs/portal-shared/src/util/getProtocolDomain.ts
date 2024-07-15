import fetchPortalMeta from "@/util/fetchPortalMeta";
import getPortalUrl from "@/store/getPortalUrl";

export default async function getProtocolDomain(proto: string) {
  const meta = await fetchPortalMeta(getPortalUrl());

  return `${proto}.${meta.domain}`;
}
