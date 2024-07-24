import { appStore } from "~/stores/app";

export default function getUploadManager() {
  return appStore.getState().uploader;
}
