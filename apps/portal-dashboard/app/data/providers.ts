import type {AuthProvider} from "@refinedev/core";
import {fileProvider} from "~/data/file-provider.js";
import {Sdk} from "@lumeweb/portal-sdk";
import {accountProvider} from "~/data/account-provider.js";
import type {SdkProvider} from "~/data/sdk-provider.js";
import {createPortalAuthProvider} from "~/data/auth-provider.js";

export interface DataProviders {
    default: SdkProvider;
    auth: AuthProvider;
    [key: string]: SdkProvider | AuthProvider;
}

export function getProviders(sdk: Sdk) {
    accountProvider.sdk = sdk;
    fileProvider.sdk = sdk;

    return  {
        default: accountProvider,
        auth: createPortalAuthProvider(sdk),
        files: fileProvider,
    };
}
