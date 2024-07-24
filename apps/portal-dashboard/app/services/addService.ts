import BaseService from "~/services/base";
import { useAppStore } from "~/stores/app";

export default function addService(svc: BaseService) {
  useAppStore((state) => state.addService)(svc);
}
