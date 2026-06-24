import {
  createNamespacedId,
  GridWidgetArea,
} from "@lumeweb/portal-framework-core";
import { PageHeader } from "@lumeweb/portal-framework-ui";

const DASHBOARD_SECURITY_AREA = createNamespacedId("dashboard", "security");

export default function AccountSecurity() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="Manage your account security and authentication settings"
        title="Security"
      />
      <GridWidgetArea id={DASHBOARD_SECURITY_AREA} />
    </div>
  );
}
