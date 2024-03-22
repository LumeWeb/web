import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PinningProcess } from "~/data/pinning";

// TODO: Adapt to real API

export const usePinMutation = () => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async ({ cid  }) => {
      const response = await PinningProcess.pin(cid);

      if (!response.success) {
        open?.({
          type: "destructive",
          message: "Erorr pinning " + cid,
          description: response.message,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["pin-progress"] })
    }
  });

  return { mutate }
}

export const useUnpinMutation = () => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async ({ cid }) => {
      const response = await PinningProcess.unpin(cid);

      if (!response.success) {
        open?.({
          type: "destructive",
          message: "Erorr pinning " + cid,
          description: response.message,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["pin-progress"] })
    }
  });

  return { mutate }
}

export const usePinning = () => {
  const { data } = useQuery({
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
        lastUpdated: Date.now()
      };
    },
  })

  return {
    data
  };
};
