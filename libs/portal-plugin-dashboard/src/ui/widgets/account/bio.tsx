import type { Identity } from "@lumeweb/portal-framework-core";

import { useDialog } from "@lumeweb/portal-framework-ui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from "@lumeweb/portal-framework-ui-core";
import { useGetIdentity } from "@refinedev/core";
import { format } from "date-fns";
import { Calendar, Camera, Check } from "lucide-react";

import { Card } from "@/ui/components/Card";
import { uploadAvatarDialogConfig } from "@/ui/dialogs/uploadAvatar";

export default function Bio() {
  const { data: identity, refetch } = useGetIdentity<Identity>();
  const { closeDialog, openDialog } = useDialog();

  if (!identity) {
    return null;
  }

  const displayName =
    `${identity?.firstName || ""} ${identity?.lastName || ""}`.trim();

  const handleAvatarUpdate = () => {
    refetch?.();
    closeDialog();
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              alt={displayName}
              src={identity.avatar || "/placeholder.svg"}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {identity.firstName?.charAt(0) ||
                identity.lastName?.charAt(0) ||
                "?"}
            </AvatarFallback>
          </Avatar>
          <Button
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={() =>
              openDialog(
                uploadAvatarDialogConfig(
                  displayName,
                  identity.avatar || "/placeholder.svg",
                  handleAvatarUpdate,
                ),
              )
            }
            size="sm"
            variant="secondary">
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-lg font-semibold">
              {displayName}
            </h3>
            {identity.verified && (
              <div className="bg-success flex h-5 w-5 items-center justify-center rounded-full">
                <Check className="text-success-foreground h-3 w-3" />
              </div>
            )}
          </div>
        </div>

        <div className="text-muted-foreground mt-4 flex w-full flex-col gap-2 text-sm">
          {identity.created_at &&
            (() => {
              try {
                const createdDate = new Date(identity.created_at);
                if (isNaN(createdDate.getTime())) return null;
                return (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Account created {format(createdDate, "MMMM yyyy")}
                    </span>
                  </div>
                );
              } catch {
                return null;
              }
            })()}
        </div>
      </div>
    </Card>
  );
}
