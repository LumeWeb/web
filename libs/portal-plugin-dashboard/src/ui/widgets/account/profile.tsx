import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { User } from "lucide-react";
import { SchemaForm } from "@lumeweb/portal-framework-ui";
import editProfileForm from "@/ui/forms/editProfile";

export default function Profile() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#adf0dd]" />
          Profile Information
        </CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SchemaForm config={editProfileForm()}></SchemaForm>
      </CardContent>
    </Card>
  );
}
