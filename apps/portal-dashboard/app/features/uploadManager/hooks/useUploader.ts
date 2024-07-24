import { useAppStore } from "~/stores/app.js";

export default function useUploader() {
  return useAppStore((state) => state.uploader);
}
