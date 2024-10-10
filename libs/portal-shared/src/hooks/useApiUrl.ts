import { useApiUrl as useApiUrlBase } from "@refinedev/core";

export default function useApiUrl() {
  return useApiUrlBase().replace(/\/+$/, "");
}
