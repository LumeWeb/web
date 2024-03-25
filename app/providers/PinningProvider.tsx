import { useInvalidate } from "@refinedev/core";
import {
  type QueryClient,
  type UseQueryResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import { PinningProcess, type PinningStatus } from "~/data/pinning";

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
export const PinningProvider = ({ children }: React.PropsWithChildren) => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  const queryResult = useQuery({
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

  useEffect(() => {
    if (
      queryResult.isSuccess &&
      queryResult.fetchStatus === "idle" &&
      queryResult.isFetched
    ) {
      const hasCompletedItems = queryResult.data.items.some(item => item.status === 'completed');
      if (hasCompletedItems) {
        invalidate({ resource: "files", invalidates: ["list"] });
      }
    }
  }, [
    queryResult.fetchStatus,
    queryResult.isSuccess,
    queryResult.isFetched,
    invalidate,
    queryResult.data,
  ]);

  return (
    <PinningContext.Provider value={{ query: queryResult, queryClient }}>
      {children}
    </PinningContext.Provider>
  );
};
