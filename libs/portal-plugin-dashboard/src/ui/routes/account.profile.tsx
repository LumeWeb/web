import { WidgetArea } from "@lumeweb/portal-framework-core";
import { PageHeader } from "@lumeweb/portal-framework-ui";

export default function AccountProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your account information and preferences"
        title="Profile & Settings"
      />
      <WidgetArea id={"core:dashboard:profile"}></WidgetArea>
    </div>
  );
}
