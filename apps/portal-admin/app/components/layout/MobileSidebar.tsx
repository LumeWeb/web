import { Link, useLocation } from "@remix-run/react";
import {
  ChevronDownIcon,
  CircleLockIcon,
  ClockIcon,
  CloudUploadIcon,
  CurrentUsageIcon,
  DriveIcon,
  HamburgerMenuIcon,
  ThemeIcon,
} from "apps/portal-dashboard/app/components/icons";
import LumeLogo from "~/components/LumeLogo";
import NavigationButton from "~/components/NavigationButton";
import { Button } from "apps/portal-dashboard/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "apps/portal-dashboard/app/components/ui/dropdown-menu";
import { Avatar } from "apps/portal-dashboard/app/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "apps/portal-dashboard/app/components/ui/sheet";
import { ExitIcon } from "@radix-ui/react-icons";
import { useLogout } from "@refinedev/core";

const navigationLinks = [
  { path: "/dashboard", label: "Dashboard", icon: ClockIcon },
];

export default function MobileSidebar() {
  const location = useLocation();
  const { mutate: logout } = useLogout();
  return (
    <>
      <header className="flex flex-row w-full max-h-30 items-center justify-between p-4  bg-secondary border-b">
        <LumeLogo />
        <nav className="relative">
          <div className="flex items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-none outline-none h-full flex flex-row gap-2">
                  <Avatar className="bg-ring h-10 w-10 rounded-full" />
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
            <Sheet>
              <SheetTrigger>
                <Button
                  size="lg"
                  className="h-full p-2 border border-border bg-none">
                  <HamburgerMenuIcon className="text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetDescription>
                    <div className="w-full flex flex-col items-start justify-between my-auto">
                      <div className="w-full flex flex-col items-start justify-between ">
                        {navigationLinks.map((link) => (
                          <Link key={link.path} to={link.path}>
                            <NavigationButton
                              active={location.pathname.includes(link.path)}>
                              {link.icon && (
                                <link.icon className="w-5 h-5 mr-2" />
                              )}
                              {link.label}
                            </NavigationButton>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>
    </>
  );
}
