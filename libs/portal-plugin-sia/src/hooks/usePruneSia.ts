import { useCustomMutation } from "@refinedev/core";
import { DATA_PROVIDER_NAME } from "../capabilities/refineConfig";

export function usePruneSia() {
  const { mutate, isLoading } = useCustomMutation();

  const prune = (options?: Parameters<typeof mutate>[1]) => {
    mutate(
      {
        url: "/prune",
        method: "post",
        values: {},
        dataProviderName: DATA_PROVIDER_NAME,
      },
      options,
    );
  };

  return { mutate: prune, isLoading };
}
