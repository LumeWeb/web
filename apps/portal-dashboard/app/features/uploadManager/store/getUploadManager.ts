import { dashboardStore } from "@/stores/app";

export default function getUploadManager() {
  return dashboardStore.getState().uploader;
}
