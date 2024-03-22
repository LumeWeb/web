import {
  QueryClient,
  UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { PinningProcess, PinningStatus } from "~/data/pinning";

export interface IPinningData {
  cid: string;
  progress: number;
}

export interface IPinningContextType {
  query: UseQueryResult<
    {
      items: PinningStatus[];
      lastUpdated: number;
    },
    Error
  >;
  queryClient: QueryClient;
}

export const PinningContext = createContext<IPinningContextType>(
  {} as IPinningContextType,
);

export const usePinningContext = () => useContext(PinningContext);

const usePinProgressQuery = () =>
  useQuery({
    queryKey: ["pin-progress"],
    refetchInterval: (query) => {
      if (!query.state.data || !query.state.data.items.length) {
        return false;
      }

      return 1000;
    },
    refetchIntervalInBackground: true,
    queryFn: () => {
      const response = PinningProcess.pollAllProgress();
      const result = response.next();

      return {
        items: result.value || [],
        lastUpdated: Date.now(),
      };
    },
  });

export const PinningProvider = ({ children }: React.PropsWithChildren) => {
  const queryClient = useQueryClient();
  const queryResult = usePinProgressQuery();

  return (
    <PinningContext.Provider value={{ query: queryResult, queryClient }}>
      {children}
    </PinningContext.Provider>
  );
};
