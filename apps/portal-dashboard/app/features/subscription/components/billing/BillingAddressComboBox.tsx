import React from "react";
import { Control } from "react-hook-form";
import { BillingInfo } from "../../types/billing.types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "portal-shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "portal-shared/components/ui/popover";
import { Button } from "portal-shared/components/ui/button";
import {
  CloudCheckIcon,
  ChevronDownIcon,
} from "portal-shared/components/icons";
import { cn } from "portal-shared/lib/utils";

interface BillingAddressComboBoxProps {
  name: string;
  control: Control<BillingInfo>;
  label: string;
  placeholder: string;
  useList: () => { value: string; label: string }[];
  onSelectionChange?: () => void;
}

export function BillingAddressComboBox({
  name,
  control,
  label,
  placeholder,
  useList,
  onSelectionChange,
}: BillingAddressComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const options = useList();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground",
                  )}>
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label
                    : placeholder}
                  <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                />
                <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        field.onChange(option.value);
                        if (onSelectionChange) {
                          onSelectionChange();
                        }
                        setOpen(false);
                      }}>
                      <CloudCheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          option.value === field.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
