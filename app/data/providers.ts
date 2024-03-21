import type {AuthProvider} from "@refinedev/core";
import {fileProvider} from "~/data/file-provider.js";
import {Sdk} from "@lumeweb/portal-sdk";
import {accountProvider} from "~/data/account-provider.js";
import type {SdkProvider} from "~/data/sdk-provider.js";
import {createPortalAuthProvider} from "~/data/auth-provider.js";
import { pinningProvider } from "./pinning-provider";

interface DataProviders {
    default: SdkProvider;
    auth: AuthProvider;
    [key: string]: SdkProvider | AuthProvider;
}

let providers: DataProviders;

export function getProviders(sdk: Sdk) {
    if (providers) {
        return providers;
    }

    accountProvider.sdk = sdk;
    fileProvider.sdk = sdk;
    providers = {
        default: accountProvider,
        auth: createPortalAuthProvider(sdk),
        files: fileProvider,
        pinning: pinningProvider
    };

    return providers;
}
