import { WidgetArea } from "@lumeweb/portal-framework-core";

export default function AccountProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Security</h1>
          <p className="text-gray-400 mt-1">
            Manage your account security and authentication settings
          </p>
        </div>
      </div>
      <WidgetArea widgetAreaId={"core:dashboard:security"}></WidgetArea>
    </div>
  );
}
