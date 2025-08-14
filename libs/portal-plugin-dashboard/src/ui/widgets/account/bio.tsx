import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from "@lumeweb/portal-framework-ui-core";
import { useGetIdentity } from "@refinedev/core";

import { format } from "date-fns";
import { Calendar, Camera, Check } from "lucide-react";
import type { Identity } from "@lumeweb/portal-framework-core";
export default function Bio() {
  const { data: identity } = useGetIdentity<Identity>();

  if (!identity) {
    return null;
  }

  const displayName =
    `${identity?.firstName || ""} ${identity?.lastName || ""}`.trim();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={identity.avatar || "/placeholder.svg"}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {identity.firstName?.charAt(0) ||
                  identity.lastName?.charAt(0) ||
                  "?"}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0">
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {displayName}
              </h3>
              {identity.verified && (
                <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-success-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4 w-full text-sm text-muted-foreground">
            {identity.created_at &&
              (() => {
                try {
                  const createdDate = new Date(identity.created_at);
                  if (isNaN(createdDate.getTime())) return null;
                  return (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
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
      </CardContent>
    </Card>
  );
}
