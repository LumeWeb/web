import { SdkProvider } from "~/data/sdk-provider.js";
import { PinningProcess } from "./pinning";

export const pinningProvider = {
  getList: () => {
    console.log("Not implemented");
    return {
      data: [],
      total: 0,
    };
  },
  getOne: () => {
    console.log("Not implemented");
    return Promise.resolve({
      data: {
        id: 1,
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
  custom: () => {

    const pinCid = async (cid: string) => {
      return await PinningProcess.pin(cid);
    }

    const unpinCid = async (cid: string) => {
      console.log("Not Implemented");
    }

    const checkCid = async (cid: string) => {
      console.log("Not Implemented");
    }

    const checkCidProgress = (cid: string) => {
      const progressGenerator = PinningProcess.pollProgress(cid);

      return progressGenerator.next();
    }

    return {
      pinCid,
      unpinCid,
      checkCid,
      checkCidProgress
    }
  },
} satisfies SdkProvider;
