import { useCustom, useNotification } from "@refinedev/core";
import { usePinningContext } from "~/providers/PinningProvider";

export const usePinning = () => {
  const { open } = useNotification();
  const { data: cidList, setData } = usePinningContext();

  const { data } = useCustom({
    // useCustom requires URL and METHOD params
    url: "",
    method: "get",
    dataProviderName: "pinning",
  });

  const onPin = async (cid: string) => {
    if (!data?.pinCid) return;

    const response = await data?.pinCid(cid);

    if (response.success) {
      setData((prev) => [...prev, { cid, progress: 0 }]);
    } else {
      open?.({
        type: "destrunctive",
        message: "Erorr pinning " + cid,
        description: response.message,
      });
    }
  };

  const getProgress = (cid: string) => {
    if (!data?.checkCidProgress) return;

    const response = data?.checkCidProgress(cid);

    if (!response.done) {
      setData((prev) =>
        prev.map((cidInfo) => {
          const newData = cidInfo;

          if (cidInfo.cid === cid) {
            newData.progress = response.value.progress;

            return newData;
          }
          return cidInfo;
        }),
      );
    }
  };

  const onRemoveCidFromList = (cid: string) => {
    setData((prev) => prev.filter((item) => item.cid !== cid));
  };

  return {
    cidList,
    onPin,
    getProgress,
    onRemoveCidFromList,
  };
};
