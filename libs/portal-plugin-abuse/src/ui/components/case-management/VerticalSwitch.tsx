import {
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  toast,
  ToastAction,
} from "@lumeweb/portal-framework-ui-core";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import React, { useState } from "react";

export interface SwitchOption<T extends string> {
  className?: string;
  icon?: React.ReactNode;
  label: string;
  value: T;
}

interface VerticalSwitchProps<T extends string> {
  className?: string;
  label?: string;
  onChange: (value: T) => Promise<void>;
  options: SwitchOption<T>[];
  renderOption?: (
    option: SwitchOption<T>,
    isSelected: boolean,
  ) => React.ReactNode;
  value: T;
}

export function VerticalSwitch<T extends string>({
  className,
  label,
  onChange,
  options,
  value,
}: VerticalSwitchProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingValue, setLoadingValue] = useState<null | T>(null);

  const currentOption =
    options.find((option) => option.value === value) || options[0];

  const handleSelect = async (newValue: T) => {
    if (newValue === value || isLoading) return;

    setIsLoading(true);
    setLoadingValue(newValue);

    try {
      await onChange(newValue);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update value:", error);
      toast({
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => handleSelect(newValue)}>
            Try again
          </ToastAction>
        ),
        description:
          "There was a problem updating the value. Please try again.",
        title: "Update failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingValue(null);
    }
  };

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <Popover onOpenChange={setIsOpen} open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn("justify-between w-full", currentOption.className)}
            disabled={isLoading}
            size="sm"
            variant="outline">
            <span className="flex items-center gap-2">
              {currentOption.icon}
              {currentOption.label}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0">
          <div className="flex flex-col">
            {options.map((option) => {
              const isSelected = option.value === value;
              const isCurrentlyLoading =
                loadingValue === option.value && isLoading;

              return (
                <Button
                  className={cn(
                    "justify-start rounded-none h-9",
                    option.className,
                    isSelected && "bg-accent",
                  )}
                  disabled={isLoading}
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  size="sm"
                  variant="ghost">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                    {isCurrentlyLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isSelected ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : null}
                  </div>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
