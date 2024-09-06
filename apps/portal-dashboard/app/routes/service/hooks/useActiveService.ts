import { useParsed } from "@refinedev/core";
import { getServiceById } from "@/services/index.js";

export function useActiveService() {
  const params = useParsed<{ id: string }>();

  return getServiceById(
    params?.resource?.meta?.parent || (params.id as string),
  );
}
