import type {DataProvider, UpdateParams, UpdateResponse, HttpError} from "@refinedev/core";
import {SdkProvider} from "~/data/sdk-provider.js";

type AccountParams = {
    email?: string;
    password?: string;
}

type AccountData = AccountParams;

export const accountProvider: SdkProvider = {
    getList: () => {
        throw Error("Not Implemented")
    },
    getOne: () => {
        throw Error("Not Implemented")
    },
    // @ts-ignore
    async update<TVariables extends AccountParams = AccountParams>(
        params: UpdateParams<AccountParams>,
    ): Promise<UpdateResponse<AccountData>> {
        if (params.variables.email && params.variables.password) {
            const ret = accountProvider.sdk?.account().updateEmail(params.variables.email, params.variables.password);

            if (ret) {
                if (ret instanceof Error) {
                    return Promise.reject(ret)
                }
            } else {
                return Promise.reject();
            }

            return {
                data:
                    {
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
        throw Error("Not Implemented")
    },
    deleteOne: () => {
        throw Error("Not Implemented")
    },
    getApiUrl: () => "",
}
