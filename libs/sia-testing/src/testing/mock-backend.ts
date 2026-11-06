/** Node supplies a fresh owner for each run without changing portable construction or session authority. */
import type { IndexdModel } from "../model/index.js";
import type { PayloadNetwork } from "../sdk/index.js";
import type { PayloadLimits, RunPayloadOwner } from "../sdk/payload-store.js";

export interface MockPayloadBackend {
  network: PayloadNetwork;
  owner: RunPayloadOwner;
}
export interface MockPayloadFactory {
  create(model: IndexdModel): Promise<MockPayloadBackend>;
  readonly limits: PayloadLimits;
}
