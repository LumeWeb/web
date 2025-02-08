import { Sdk } from "@lumeweb/portal-sdk";
import { RefineProps } from "@refinedev/core";

import { Framework } from "../api/framework";

export type CapabilityStatus = "active" | "error" | "inactive";

export interface BaseCapability<
  TType extends string = string,
  TID extends string = string,
> {
  /**
   * Array of capability IDs that must be initialized before this one
   */
  dependencies?: string[];
  destroy(framework: Framework): Promise<void>;

  readonly id: TID;
  initialize(framework: Framework): Promise<void>;
  readonly status: CapabilityStatus;
  readonly type: TType;
}

export interface RefineConfigCapability
  extends BaseCapability<"core:refine-config"> {
  getConfig(existing?: Partial<RefineProps>): Partial<RefineProps>;
}

export interface SdkCapability extends BaseCapability<"core:sdk"> {
  getSdk(): Sdk;
}
