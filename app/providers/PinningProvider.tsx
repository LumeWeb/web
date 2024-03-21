import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";

export interface IPinningData {
    cid: string;
    progress: number
}

export interface IPinningContextType {
    data: IPinningData[],
    setData: Dispatch<SetStateAction<IPinningData[]>>
}

export const PinningContext = createContext<IPinningContextType>({} as IPinningContextType);

export const usePinningContext = () => useContext(PinningContext);

export const PinningProvider = ({ children }: React.PropsWithChildren) => {
    const [data, setData] = useState<IPinningData[]>([]);

    return (
        <PinningContext.Provider value={{ data, setData }}>
            {children}
        </PinningContext.Provider>
    )
}