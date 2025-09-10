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
      className="border-border/20 bg-secondary mt-4 flex items-center justify-between overflow-hidden rounded-lg border p-10"
      style={{
        backgroundImage: `url(${accountBannerImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}>
      <div className="flex items-center gap-x-4">
        <Avatar className="border-ring h-20 w-20 border-2" />
        <div>
          <div className="flex items-center gap-x-2 font-bold">
            {`${identity?.firstName} ${identity?.lastName}`}
            <CrownIcon className="text-ring" />
          </div>
          <div className="text-foreground flex items-center gap-x-2 whitespace-nowrap text-sm sm:hidden">
            <PersonIcon />
            Lite Account (upgrade)
          </div>
          <div className="mt-2 hidden gap-x-5 lg:flex">
            <div className="text-foreground flex items-center gap-x-2 text-sm">
              <PersonIcon />
              Lite Account (upgrade)
            </div>
            <div className="text-foreground flex items-center gap-x-2 text-sm">
              <CloudIcon />
              120 GB / 130 GB
            </div>
            <div className="text-foreground flex items-center gap-x-2 text-sm">
              <CloudDownloadIcon />
              10 GB / 25 GB
            </div>
            <div className="text-foreground flex items-center gap-x-2 text-sm">
              <CheckRoundedIcon />
              0% Free Usage
            </div>
          </div>
        </div>
      </div>
      <Button
        className="border-border bg-secondary hidden gap-x-2 border py-6 sm:flex"
        variant="default">
        <AddIcon />
        Upgrade to Premium
      </Button>
    </div>
  );
};
