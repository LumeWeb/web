import type { DataProvider } from "@refinedev/core";
import {SdkProvider} from "~/data/sdk-provider.js";

export const accountProvider: SdkProvider = {
  getList: () => { throw Error("Not Implemented") },
  getOne: () => { throw Error("Not Implemented") },
  update: () => { throw Error("Not Implemented") },
  create: () => { throw Error("Not Implemented") },
  deleteOne: () => { throw Error("Not Implemented") },
  getApiUrl: () => "",
}
