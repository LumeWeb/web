import { registerFormComponent } from "@lumeweb/portal-framework-ui";
import { FormFieldType } from "@lumeweb/portal-framework-ui";
import { UppyUploaderFormComponent } from "./UppyUploaderFormComponent";

export function registerUppyUploader() {
  registerFormComponent(FormFieldType.CUSTOM, UppyUploaderFormComponent);
}
