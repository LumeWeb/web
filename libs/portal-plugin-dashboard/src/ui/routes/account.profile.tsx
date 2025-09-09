import { GridWidgetArea } from "@lumeweb/portal-framework-core";
import { PageHeader } from "@lumeweb/portal-framework-ui";

export default function AccountProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your account information and preferences"
        title="Profile & Settings"
      />
      <GridWidgetArea id={"core:dashboard:profile"} />
    </div>
  );
}
