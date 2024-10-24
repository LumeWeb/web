import type { AuthProvider } from "@refinedev/core";
import { fileProvider } from "@/dataProviders/file-provider.js";
import { Sdk } from "@lumeweb/portal-sdk";
import { accountProvider } from "portal-shared/dataProviders/accountProvider";
import type { SdkProvider } from "@/dataProviders/sdk-provider.js";
import { createPortalAuthProvider } from "portal-shared/dataProviders/authProvider";

export interface DataProviders {
  default: SdkProvider;
  auth: AuthProvider;
  [key: string]: SdkProvider | AuthProvider;
}

export function getProviders(sdk: Sdk) {
  accountProvider.sdk = sdk;
  fileProvider.sdk = sdk;

  return {
    default: accountProvider,
    auth: createPortalAuthProvider(sdk),
    files: fileProvider,
  };
}
