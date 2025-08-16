import { WidgetArea } from "@lumeweb/portal-framework-core";
import { PageHeader } from "@lumeweb/portal-framework-ui";

export default function AccountProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Manage your account security and authentication settings"
      />
      <WidgetArea widgetAreaId={"core:dashboard:security"}></WidgetArea>
    </div>
  );
}
