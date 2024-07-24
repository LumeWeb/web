import BaseService from "~/services/base.js";
import { useAppStore } from "~/stores/app.js";

export default function getServices(): BaseService[] {
  return useAppStore((state) => state.getServices)();
}
