import type { DataProvider } from "@refinedev/core";

export const defaultProvider: DataProvider = {
  getList: () => { throw Error("Not Implemented") },
  getOne: () => { throw Error("Not Implemented") },
  update: () => { throw Error("Not Implemented") },
  create: () => { throw Error("Not Implemented") },
  deleteOne: () => { throw Error("Not Implemented") },
  getApiUrl: () => "",
}