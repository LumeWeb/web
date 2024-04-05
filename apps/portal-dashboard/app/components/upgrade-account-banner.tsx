import { useGetIdentity } from "@refinedev/core"
import { Identity } from "~/data/auth-provider"

import {
  CrownIcon,
  PersonIcon,
  CloudIcon,
  CheckRoundedIcon,
  AddIcon,
  CloudDownloadIcon
} from "./icons"
import { Avatar } from "./ui/avatar"
import { Button } from "./ui/button"

export const UpgradeAccountBanner = () => {
  const { data: identity } = useGetIdentity<Identity>();
  return (
    <div className="flex items-center justify-between p-8 border border-ring rounded-lg bg-secondary-1">
      <div className="flex items-center gap-x-4">
        <Avatar className="border-2 border-ring h-20 w-20" />
        <div>
          <div className="flex items-center gap-x-2 font-bold">
            {`${identity?.firstName} ${identity?.lastName}`}
            <CrownIcon className="text-ring" />
          </div>
          <div className="flex gap-x-5 mt-2">
            <div className="flex items-center gap-x-2 text-white text-sm">
              <PersonIcon />
              Lite Account (upgrade)
            </div>
            <div className="flex items-center gap-x-2 text-white text-sm">
              <CloudIcon />
              120 GB / 130 GB
            </div>
            <div className="flex items-center gap-x-2 text-white text-sm">
              <CloudDownloadIcon />
              10 GB / 25 GB
            </div>
            <div className="flex items-center gap-x-2 text-white text-sm">
              <CheckRoundedIcon />
              0% Free Usage
            </div>
          </div>
        </div>
      </div>
      <Button className="gap-x-2 py-6" variant="accent">
        <AddIcon />
        Upgrade to Premium
      </Button>
    </div>
  )
}
