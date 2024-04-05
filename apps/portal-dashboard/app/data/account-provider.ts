import type {DataProvider, UpdateParams, UpdateResponse, HttpError} from "@refinedev/core";
import {SdkProvider} from "~/data/sdk-provider.js";

type AccountParams = {
    email?: string;
    password?: string;
}

type AccountData = AccountParams;

export const accountProvider: SdkProvider = {
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
            const ret = await accountProvider.sdk?.account().updateEmail(params.variables.email, params.variables.password);

            if (ret) {
                if (ret instanceof Error) {
                    return Promise.reject(ret satisfies HttpError)
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
}
