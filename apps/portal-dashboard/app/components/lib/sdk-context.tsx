import React from "react";
import {Sdk} from "@lumeweb/portal-sdk";

export const SdkContext = React.createContext<
    Partial<Sdk>
>({});

export const SdkContextProvider: React.FC< {sdk: Sdk, children: React.ReactNode}> = ({sdk, children}) => {
    return (
        <SdkContext.Provider value={sdk}>
            {children}
        </SdkContext.Provider>
    );
};

export function useSdk(): Partial<Sdk>{
    return React.useContext(SdkContext);
}
