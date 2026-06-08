import { usePinsCount } from "@lumeweb/portal-plugin-ipfs";

interface UseHasPinsReturn {
  hasPins: boolean;
  isBusy: boolean;
  hasError: boolean;
}

export function useHasPins(enabled = true): UseHasPinsReturn {
  const { hasPins, isBusy, hasError } = usePinsCount(enabled);

  return {
    hasPins,
    isBusy,
    hasError,
  };
}
