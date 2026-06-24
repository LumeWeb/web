import { Sdk } from "@lumeweb/portal-sdk";
import { RefineProps } from "@refinedev/core";

import { Framework } from "../api/framework";
import { NamespacedId } from "./namespace";

export interface BaseCapability<
  TType extends string = string,
  TID extends NamespacedId = NamespacedId,
> {
  /**
   * Array of capability IDs that must be initialized before this one
   */
  dependencies?: NamespacedId[];
  destroy(framework: Framework): Promise<void>;

  readonly id: TID;
  initialize(framework: Framework): Promise<void>;
  readonly status: CapabilityStatus;
  readonly type: TType;
}

export type CapabilityStatus = "active" | "error" | "inactive";

export interface RefineConfigCapability
  extends BaseCapability<string> {
  getConfig(existing?: Partial<RefineProps>): Partial<RefineProps>;
}

export interface SdkCapability extends BaseCapability<string> {
  getSdk(): Sdk;
}
