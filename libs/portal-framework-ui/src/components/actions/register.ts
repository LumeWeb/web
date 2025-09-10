import { registerButtonActionItem } from "./items/ButtonActionItem";
import { registerCancelActionItem } from "./items/CancelActionItem";
import { registerCustomActionItem } from "./items/CustomActionItem";
import { registerLinkActionItem } from "./items/LinkActionItem";
import { registerSubmitActionItem } from "./items/SubmitActionItem";
import { registerRetryActionItem } from "./items/RetryActionItem";

export function registerAllActionItems() {
  registerButtonActionItem();
  registerSubmitActionItem();
  registerCancelActionItem();
  registerCustomActionItem();
  registerLinkActionItem();
  registerRetryActionItem();
}
