import { GridWidgetArea } from "@lumeweb/portal-framework-core";
import { PageHeader } from "@lumeweb/portal-framework-ui";

export default function AccountProfile() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your account security and authentication settings"
        title="Security"
      />
      <GridWidgetArea id={"dashboard:security"} />
    </div>
  );
}
