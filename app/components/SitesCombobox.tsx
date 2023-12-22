import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { SelectOptions, SiteList } from "@/types.js";
import slugify from "slugify";

export function SitesCombobox({ siteList }: { siteList: SiteList }) {
  const sites = Object.entries(siteList).map((item) => {
    return {
      label: item[1].name,
      value: slugify(item[0]),
    };
  });
  const [open, setOpen] = React.useState(false);
  const [selectedSite, setSelectedSite] = React.useState<SelectOptions | null>(
    null
  );

  return (
    <div className="flex flex- items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"ghost"}
            className="max-w-[120px] focus:ring-2 focus:ring-ring px-2 font-bold items-center w-full flex justify-between text-white text-xs uppercase"
          >
            {selectedSite ? <>{selectedSite.label}</> : <>All Sites</>}
            <ChevronDownIcon className="ml-3 w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Select site..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {sites?.map((status) => (
                  <CommandItem
                    className="text-white"
                    key={status.value}
                    value={status.value}
                    onSelect={(value) => {
                      setSelectedSite(
                        sites.find((priority) => priority.value === value) ||
                          null
                      );
                      setOpen(false);
                    }}
                  >
                    {status.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
