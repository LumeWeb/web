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
  CommandList,
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
  const [showFreeInput, setShowFreeInput] = React.useState(false);
  const options = useList();

  React.useEffect(() => {
    setShowFreeInput(options.length === 0);
  }, [options]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          {showFreeInput ? (
            <FormControl>
              <Input
                {...field}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </FormControl>
          ) : (
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
              <Command
                filter={(value, search) => {
                  const name = options?.find(
                    (option) =>
                      option.value.toLowerCase() === value.toLowerCase(),
                  )?.label;
                  if (
                    value.includes(search) ||
                    name?.toLowerCase()?.includes(search.toLowerCase())
                  ) {
                    return 1;
                  }
                  return 0;
                }}>
                <CommandInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                />
                <CommandList>
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        field.onChange(option.value);
                        if (onSelectionChange) {
                          onSelectionChange(option.value);
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
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
