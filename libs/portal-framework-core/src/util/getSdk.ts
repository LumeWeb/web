import type { Sdk } from "@lumeweb/portal-sdk";

import { Framework } from "../api/framework";
import { SdkCapability } from "../types/capabilities";

export async function getSdk(framework: Framework): Promise<Sdk> {
  // Initialize auth provider
  const sdkCaps =
    await framework.getCapabilitiesByType<SdkCapability>("core:sdk");

  if (!sdkCaps?.length) {
    throw new Error("SDK not found");
  }

  const sdk = sdkCaps.pop()!;

  return sdk.getSdk();
}
