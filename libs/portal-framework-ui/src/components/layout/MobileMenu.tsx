import {
  Button,
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
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="lg:hidden ml-2">
        <Button className="h-8 w-8" size="icon" variant="outline">
          <MenuIcon size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="right">
        <SheetHeader>
          <Button
            asChild
            className="flex justify-center items-center pb-2 pt-1"
            variant="link">
            <Link className="flex items-center gap-2" to="/dashboard">
              <SheetTitle className="font-bold text-lg">Portal</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <MainNavigation 
          isOpen 
          onItemClick={() => setOpen(false)} 
        />
      </SheetContent>
    </Sheet>
  );
}
