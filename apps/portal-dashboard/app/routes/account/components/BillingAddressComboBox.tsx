import React, { useState, useEffect } from "react";
import {
  useController,
  Control,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GetListResponse } from "@refinedev/core";
import type { QueryObserverResult } from "@tanstack/react-query";

interface ComboBoxProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  placeholder: string;
  useList: () => QueryObserverResult<GetListResponse<Entry>>;
  onSelectionChange?: (value: string) => void;
  disabled?: boolean;
}

export interface Entry {
  name: string;
  code: string;
  supported_entities?: string[];
}

export function BillingAddressComboBox<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  useList,
  onSelectionChange,
  disabled = false,
}: ComboBoxProps<TFieldValues>) {
  const { data, isLoading } = useList();
  const [open, setOpen] = useState(false);
  const [showFreeForm, setShowFreeForm] = useState(false);

  const items: Entry[] = data?.data || [];

  useEffect(() => {
    setShowFreeForm(items.length === 0 && !isLoading);
  }, [items, isLoading]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          {showFreeForm ? (
            <FormControl>
              <Input
                placeholder={`Enter ${label.toLowerCase()}`}
                {...field}
                disabled={disabled}
              />
            </FormControl>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled || isLoading}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground",
                    )}>
                    {isLoading ? (
                      <Skeleton className="h-4 w-[100px]" />
                    ) : field.value ? (
                      items?.find((item) => item.code === field.value)?.name
                    ) : (
                      placeholder
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command
                  filter={(value, search) => {
                    const name = items?.find(
                      (item) => item.code.toLowerCase() === value.toLowerCase(),
                    )?.name;
                    if (
                      value.includes(search) ||
                      name?.toLowerCase()?.includes(search.toLowerCase())
                    ) {
                      return 1;
                    }
                    return 0;
                  }}>
                  <CommandInput placeholder={`Search ${label}...`} />
                  <CommandList>
                    <CommandEmpty>No {label} found.</CommandEmpty>
                    {isLoading ? (
                      <CommandItem disabled>
                        <Skeleton className="h-4 w-full" />
                      </CommandItem>
                    ) : (
                      items?.map((item) => (
                        <CommandItem
                          key={item.code}
                          value={item.code}
                          onSelect={() => {
                            field.onChange(item.code);
                            if (onSelectionChange) {
                              onSelectionChange(item.code);
                            }
                            setOpen(false);
                          }}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              item.code === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {item.name}
                        </CommandItem>
                      ))
                    )}
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
