import { Avatar } from "@radix-ui/react-avatar";
import { ChevronDownIcon, ExitIcon } from "@radix-ui/react-icons";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import type { Identity } from "~/dataProviders/authProvider";
import useIsMobile from "~/hooks/useIsMobile";
import { ThemeSwitcher } from "~/hooks/useTheme";
import discordLogoPng from "~/images/discord-logo.png?url";
import lumeColorLogoPng from "~/images/lume-color-logo.png?url";
import { PinningNetworkBanner } from "../PinningNetworkBanner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";

export const GeneralLayout = ({ children }: React.PropsWithChildren) => {
  const { data: identity } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();

  const isMobile = useIsMobile();

  return (
    /*<PinningProvider>*/
    <>
      {!identity?.verified ? (
        <div className="bg-secondary text-foreground p-2">
          We have sent you a verification email. Please click on the link in the
          email to start using the platform.
        </div>
      ) : null}
      <div className="w-full h-full flex flex-col sm:flex-row">
        {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10">
          <div className="hidden sm:flex items-center gap-x-4 justify-end">
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="border rounded-full h-auto p-2 gap-x-2 text-foreground font-semibold">
                  <Avatar className="bg-ring h-7 w-7 rounded-full" />
                  {`${identity?.firstName} ${identity?.lastName}`}
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => logout()}>
                    <ExitIcon className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {children}
          <footer className="mt-5">
            <ul className="flex flex-row">
              <li>
                <Link to="https://discord.lumeweb.com">
                  <Button
                    variant={"link"}
                    className="flex flex-row gap-x-2 text-input-placeholder">
                    <img
                      className="h-5"
                      src={discordLogoPng}
                      alt="Discord Logo"
                    />
                    Connect with us
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="https://lumeweb.com">
                  <Button
                    variant={"link"}
                    className="flex flex-row gap-x-2 text-input-placeholder">
                    <img
                      className="h-5"
                      src={lumeColorLogoPng}
                      alt="Lume Logo"
                    />
                    Connect with us
                  </Button>
                </Link>
              </li>
            </ul>
          </footer>
        </div>
      </div>
      <PinningNetworkBanner />
    </>
    /*</PinningProvider>*/
  );
};
