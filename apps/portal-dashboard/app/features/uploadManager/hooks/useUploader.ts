import { useDashboardStore } from "@/stores/app";

export default function useUploader() {
  return useDashboardStore((state) => state.uploader);
}
