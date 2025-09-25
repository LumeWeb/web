import { CustomDialogConfig, DialogType, DialogTypes } from "@lumeweb/portal-framework-ui";

import AvatarUpload from "@/ui/components/AvatarUpload";

export function uploadAvatarDialogConfig(
  userName: string,
  currentAvatar: string | undefined,
  onSuccess: () => void,
): CustomDialogConfig {
  return {
    content: (
      <AvatarUpload
        currentAvatar={currentAvatar}
        onSuccess={onSuccess}
        userName={userName}
      />
    ),
    title: "Update Profile Picture",
    type: DialogTypes.CUSTOM,
  };
}
