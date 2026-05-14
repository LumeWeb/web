import { registerEmailInput } from "@/components/form/fields";

import { registerCheckbox } from "./fields/Checkbox";
import { registerDatePicker } from "./fields/DatePicker";
import { registerFileInput } from "./fields/FileInput";
import { registerInput } from "./fields/Input";
import { registerRadioGroup } from "./fields/RadioGroup";
import { registerRichText } from "./fields/RichText";
import { registerSelect } from "./fields/Select";
import { registerSlider } from "./fields/Slider";
import { registerSwitch } from "./fields/Switch";
import { registerTextarea } from "./fields/Textarea";

export function registerAllFormComponents() {
  registerCheckbox();
  registerDatePicker();
  registerFileInput();
  registerEmailInput();
  registerInput();
  registerRadioGroup();
  registerSelect();
  registerSlider();
  registerSwitch();
  registerTextarea();
  registerRichText();
}
