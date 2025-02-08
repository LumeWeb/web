import { registerCancelActionItem } from "./items/CancelActionItem";
import { registerCustomActionItem } from "./items/CustomActionItem";
import { registerLinkActionItem } from "./items/LinkActionItem";
import { registerSubmitActionItem } from "./items/SubmitActionItem";

export function registerAllActionItems() {
  registerSubmitActionItem();
  registerCancelActionItem();
  registerCustomActionItem();
  registerLinkActionItem();
}
