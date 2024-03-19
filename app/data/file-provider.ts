import type { DataProvider } from "@refinedev/core";
import { SdkProvider } from "~/data/sdk-provider.js";

export const fileProvider = {
  getList: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: [],
      total: 0,
    });
  },
  getOne: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {
        id: 1
      },
    });
  },
  update: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {},
    });
  },
  create: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {},
    });
  },
  deleteOne: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {},
    });
  },
  getApiUrl: () => "",
} satisfies SdkProvider;
