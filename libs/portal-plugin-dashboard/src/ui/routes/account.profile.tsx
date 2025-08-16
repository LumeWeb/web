import { WidgetArea } from "@lumeweb/portal-framework-core";
import { PageHeader } from "@lumeweb/portal-framework-ui";

export default function AccountProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile & Settings"
        description="Manage your account information and preferences"
      />
      <WidgetArea widgetAreaId={"core:dashboard:profile"}></WidgetArea>
    </div>
  );
}
