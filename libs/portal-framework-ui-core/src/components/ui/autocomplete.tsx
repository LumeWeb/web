import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "../../util/cn";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TagInputStyleClassesProps, type Tag as TagType } from "./tag-input";

type AutocompleteProps = {
  allowDuplicates: boolean;
  autocompleteOptions: TagType[];
  children: React.ReactNode;
  classStyleProps: TagInputStyleClassesProps["autoComplete"];
  inlineTags?: boolean;
  maxTags?: number;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  setTagCount: React.Dispatch<React.SetStateAction<number>>;
  setTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  tags: TagType[];
  usePortal?: boolean;
};

export const Autocomplete: React.FC<AutocompleteProps> = ({
  allowDuplicates,
  autocompleteOptions,
  children,
  classStyleProps,
  inlineTags,
  maxTags,
  onTagAdd,
  onTagRemove,
  setInputValue,
  setTagCount,
  setTags,
  tags,
  usePortal,
}) => {
  const triggerContainerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverContentRef = useRef<HTMLDivElement | null>(null);

  const [popoverWidth, setPopoverWidth] = useState<number>(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [, setInputFocused] = useState(false);
  const [popooverContentTop, setPopoverContentTop] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Dynamically calculate the top position for the popover content
  useEffect(() => {
    if (!triggerContainerRef.current || !triggerRef.current) return;
    setPopoverContentTop(
      triggerContainerRef.current?.getBoundingClientRect().bottom -
        triggerRef.current?.getBoundingClientRect().bottom,
    );
  }, [tags]);

  // Close the popover when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent | React.MouseEvent | React.TouchEvent | TouchEvent,
    ) => {
      if (
        isPopoverOpen &&
        triggerContainerRef.current &&
        popoverContentRef.current &&
        !triggerContainerRef.current.contains(event.target as Node) &&
        !popoverContentRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isPopoverOpen]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open && triggerContainerRef.current) {
      const { width } = triggerContainerRef.current.getBoundingClientRect();
      setPopoverWidth(width);
    }

    if (open) {
      inputRef.current?.focus();
      setIsPopoverOpen(open);
    }
  }, []);

  const handleInputFocus = (
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.FocusEvent<HTMLTextAreaElement>,
  ) => {
    if (triggerContainerRef.current) {
      const { width } = triggerContainerRef.current.getBoundingClientRect();
      setPopoverWidth(width);
      setIsPopoverOpen(true);
    }

    // Only set inputFocused to true if the popover is already open.
    // This will prevent the popover from opening due to an input focus if it was initially closed.
    if (isPopoverOpen) {
      setInputFocused(true);
    }

    const userOnFocus = (children as React.ReactElement<any>).props.onFocus;
    if (userOnFocus) userOnFocus(event);
  };

  const handleInputBlur = (
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.FocusEvent<HTMLTextAreaElement>,
  ) => {
    setInputFocused(false);

    // Allow the popover to close if no other interactions keep it open
    if (!isPopoverOpen) {
      setIsPopoverOpen(false);
    }

    const userOnBlur = (children as React.ReactElement<any>).props.onBlur;
    if (userOnBlur) userOnBlur(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isPopoverOpen) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex === autocompleteOptions.length - 1 ? 0 : prevIndex + 1,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex <= 0 ? autocompleteOptions.length - 1 : prevIndex - 1,
        );
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex !== -1) {
          toggleTag(autocompleteOptions[selectedIndex]);
          setSelectedIndex(-1);
        }
        break;
    }
  };

  const toggleTag = (option: TagType) => {
    // Check if the tag already exists in the array
    const index = tags.findIndex((tag) => tag.text === option.text);

    if (index >= 0) {
      // Tag exists, remove it
      const newTags = tags.filter((_, i) => i !== index);
      setTags(newTags);
      setTagCount((prevCount) => prevCount - 1);
      if (onTagRemove) {
        onTagRemove(option.text);
      }
    } else {
      // Tag doesn't exist, add it if allowed
      if (!allowDuplicates && tags.some((tag) => tag.text === option.text)) {
        // If duplicates aren't allowed and a tag with the same text exists, do nothing
        return;
      }

      // Add the tag if it doesn't exceed max tags, if applicable
      if (!maxTags || tags.length < maxTags) {
        setTags([...tags, option]);
        setTagCount((prevCount) => prevCount + 1);
        setInputValue("");
        if (onTagAdd) {
          onTagAdd(option.text);
        }
      }
    }
    setSelectedIndex(-1);
  };

  const childrenWithProps = React.cloneElement(
    children as React.ReactElement<any>,
    {
      onBlur: handleInputBlur,
      onFocus: handleInputFocus,
      onKeyDown: handleKeyDown,
      ref: inputRef,
    },
  );

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        classStyleProps?.command,
      )}>
      <Popover
        modal={usePortal}
        onOpenChange={handleOpenChange}
        open={isPopoverOpen}>
        <div
          className="relative h-full flex items-center rounded-md border bg-transparent pr-3"
          ref={triggerContainerRef}>
          {childrenWithProps}
          <PopoverTrigger asChild ref={triggerRef}>
            <Button
              className={cn(
                `hover:bg-transparent ${!inlineTags ? "ml-auto" : ""}`,
                classStyleProps?.popoverTrigger,
              )}
              onClick={() => {
                setIsPopoverOpen(!isPopoverOpen);
              }}
              role="combobox"
              size="icon"
              variant="ghost">
              <svg
                className={`lucide lucide-chevron-down h-4 w-4 shrink-0 opacity-50 ${isPopoverOpen ? "rotate-180" : "rotate-0"}`}
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg">
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent
          align="start"
          className={cn(`p-0 relative`, classStyleProps?.popoverContent)}
          forceMount
          ref={popoverContentRef}
          side="bottom"
          style={{
            marginLeft: `calc(-${popoverWidth}px + 36px)`,
            minWidth: `${popoverWidth}px`,
            top: `${popooverContentTop}px`,
            width: `${popoverWidth}px`,
            zIndex: 9999,
          }}>
          <div
            className={cn(
              "max-h-[300px] overflow-y-auto overflow-x-hidden",
              classStyleProps?.commandList,
            )}
            key={autocompleteOptions.length}
            style={{
              minHeight: "68px",
            }}>
            {autocompleteOptions.length > 0 ? (
              <div
                className={cn(
                  "overflow-y-auto overflow-hidden p-1 text-foreground",
                  classStyleProps?.commandGroup,
                )}
                key={autocompleteOptions.length}
                role="group"
                style={{
                  minHeight: "68px",
                }}>
                <span className="text-muted-foreground font-medium text-sm py-1.5 px-2 pb-2">
                  Suggestions
                </span>
                <div className="py-0.5" role="separator" />
                {autocompleteOptions.map((option, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      aria-selected={isSelected}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent",
                        isSelected && "bg-accent text-accent-foreground",
                        classStyleProps?.commandItem,
                      )}
                      data-value={option.text}
                      key={option.id}
                      onClick={() => toggleTag(option)}
                      role="option">
                      <div className="w-full flex items-center gap-2">
                        {option.text}
                        {tags.some((tag) => tag.text === option.text) && (
                          <svg
                            className="lucide lucide-check"
                            fill="none"
                            height="14"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="14"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6 9 17l-5-5"></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-sm">No results found.</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
