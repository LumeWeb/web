// @ts-nocheck

import type {
  DataProvider,
  HttpError,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { Sdk } from "@lumeweb/portal-sdk";

type AccountParams = {
  email?: string;
  password?: string;
};

type AccountData = AccountParams;

export const createAccountProvider = (sdk: Sdk): DataProvider => {
  return {
    getList: () => {
      console.log("Not implemented");
      return Promise.resolve({
        data: [],
      });
    },
    getOne: () => {
      console.log("Not implemented");
      return Promise.resolve({
        data: {},
      });
    },
    // @ts-ignore
    async update<TVariables extends AccountParams = AccountParams>(
      params: UpdateParams<AccountParams>,
    ): Promise<UpdateResponse<AccountData>> {
      if (params.variables.email && params.variables.password) {
        const ret = await sdk
          ?.account()
          .updateEmail(params.variables.email, params.variables.password);

        if (ret) {
          if (ret instanceof Error) {
            return Promise.reject(ret satisfies HttpError);
          }
        } else {
          return Promise.reject();
        }

        return {
          data: {
            email: params.variables.email,
          },
        };
      }

      // Return an empty response if params.variables is undefined
      return {
        data: {} as AccountParams,
      };
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
  };
};
