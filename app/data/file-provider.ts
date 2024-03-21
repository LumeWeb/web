import type { DataProvider } from "@refinedev/core";
import { SdkProvider } from "~/data/sdk-provider.js";

export const fileProvider = {
  getList: () => {
    console.log("Not implemented");
    return {
      data: [
        {
          name: "whirly-final-draft.psd",
          cid: "0xB45165ED3CD437B",
          size: "1.89 MB",
          createdOn: " 03/02/2024 at 13:29 PM",
        },
        {
          name: "whirly-final-draft.psd",
          cid: "0xB45165ED3CD437B",
          size: "1.89 MB",
          createdOn: " 03/02/2024 at 13:29 PM",
        },
      ],
      total: 2
    }
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
