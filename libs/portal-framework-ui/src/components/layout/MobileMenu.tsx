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
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild className="ml-2 lg:hidden">
        <Button className="h-8 w-8" size="icon" variant="outline">
          <MenuIcon size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col px-3 sm:w-72" side="right">
        <SheetHeader>
          <Button
            asChild
            className="flex items-center justify-center pb-2 pt-1"
            variant="link">
            <Link className="flex items-center gap-2" to="/dashboard">
              <SheetTitle className="text-lg font-bold">Portal</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <MainNavigation isOpen onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
