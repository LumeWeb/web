import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { User } from "lucide-react";

import { Card } from "@/ui/components/Card";
import editProfileForm from "@/ui/forms/editProfile";

export default function Profile() {
  return (
    <Card
      description="Update your personal information"
      icon={User}
      title="Profile Information">
      <SchemaForm config={editProfileForm()}></SchemaForm>
    </Card>
  );
}
