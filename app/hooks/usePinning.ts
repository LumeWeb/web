import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { PinningProcess } from "~/data/pinning";
import { PinningContext } from "~/providers/PinningProvider";

// TODO: Adapt to real API

export const usePinning = () => {
  const context = useContext(PinningContext);

  const { mutate } = useMutation({
    mutationKey: ["pin-progress"],
    mutationFn: async (variables: { cid: string, type: "pin" | "unpin" }) => {
      const { cid, type } = variables;
      switch (type) {
        case "pin": {
          const response = await PinningProcess.pin(cid);

          if (!response.success) {
            open?.({
              type: "destructive",
              message: "Erorr pinning " + cid,
              description: response.message,
            });
          }
          break;
        }
        case "unpin": {
          const response = await PinningProcess.unpin(cid);

          if (!response.success) {
            open?.({
              type: "destructive",
              message: "Erorr removing " + cid,
              description: response.message,
            });
          }
          
          break;
        }
      }

      context.queryClient.invalidateQueries({ queryKey: ["pin-progress"] })
    }
  });

  return {
    ...context.query,
    mutate
  };
};
