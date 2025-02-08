import type { Identity } from "@lumeweb/portal-framework-core";

import {
  AddIcon,
  Avatar,
  Button,
  CheckRoundedIcon,
  CloudDownloadIcon,
  CloudIcon,
  CrownIcon,
  PersonIcon,
} from "@lumeweb/portal-framework-ui";
import { accountBannerImage } from "@lumeweb/portal-framework-ui/images";
import { useGetIdentity } from "@refinedev/core";
import React from "react";

export const UpgradeAccountBanner = () => {
  const { data: identity } = useGetIdentity<Identity>();
  return (
    <div
      className="flex items-center justify-between p-10 border border-border/20 overflow-hidden rounded-lg bg-secondary mt-4"
      style={{
        backgroundImage: `url(${accountBannerImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}>
      <div className="flex items-center gap-x-4">
        <Avatar className="border-2 border-ring h-20 w-20" />
        <div>
          <div className="flex items-center gap-x-2 font-bold">
            {`${identity?.firstName} ${identity?.lastName}`}
            <CrownIcon className="text-ring" />
          </div>
          <div className="flex sm:hidden items-center gap-x-2 text-foreground text-sm whitespace-nowrap">
            <PersonIcon />
            Lite Account (upgrade)
          </div>
          <div className="hidden lg:flex gap-x-5 mt-2">
            <div className="flex items-center gap-x-2 text-foreground text-sm">
              <PersonIcon />
              Lite Account (upgrade)
            </div>
            <div className="flex items-center gap-x-2 text-foreground text-sm">
              <CloudIcon />
              120 GB / 130 GB
            </div>
            <div className="flex items-center gap-x-2 text-foreground text-sm">
              <CloudDownloadIcon />
              10 GB / 25 GB
            </div>
            <div className="flex items-center gap-x-2 text-foreground text-sm">
              <CheckRoundedIcon />
              0% Free Usage
            </div>
          </div>
        </div>
      </div>
      <Button
        className="hidden sm:flex gap-x-2 py-6 border-border border bg-secondary"
        variant="default">
        <AddIcon />
        Upgrade to Premium
      </Button>
    </div>
  );
};
