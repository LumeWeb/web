import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import { Card } from "@/ui/components/Card";
import editProfileForm from "@/ui/forms/editProfile";
const User = lazyIcon("User");


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
