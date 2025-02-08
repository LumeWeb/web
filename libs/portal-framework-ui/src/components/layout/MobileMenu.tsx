import {
  Button,
  Menu,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { Link } from "@refinedev/core";
import { MenuIcon } from "lucide-react";
import React from "react";
import { MainNavigation } from "@/components/MainNavigation";

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden ml-2" asChild>
        <Button className="h-8 w-8" variant="outline" size="icon">
          <MenuIcon size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="right">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <SheetTitle className="font-bold text-lg">Portal</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <MainNavigation isOpen />
      </SheetContent>
    </Sheet>
  );
}
