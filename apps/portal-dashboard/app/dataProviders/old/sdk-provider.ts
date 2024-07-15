import {DataProvider} from "@refinedev/core";
import {Sdk} from "@lumeweb/portal-sdk";

export interface SdkProvider extends DataProvider {
    sdk?: Sdk;
}
