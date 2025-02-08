import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "../../util/cn";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TagInputStyleClassesProps, type Tag as TagType } from "./tag-input";
import { TagList, TagListProps } from "./tag-list";

type TagPopoverProps = TagListProps & {
  activeTagIndex?: null | number;
  children: React.ReactNode;
  classStyleProps: {
    popoverClasses: TagInputStyleClassesProps["tagPopover"];
    tagClasses: TagInputStyleClassesProps["tag"];
    tagListClasses: TagInputStyleClassesProps["tagList"];
  };
  customTagRenderer?: (tag: TagType, isActiveTag: boolean) => React.ReactNode;
  disabled?: boolean;
  setActiveTagIndex?: (index: null | number) => void;
  tags: TagType[];
  usePortal?: boolean;
};

export const TagPopover: React.FC<TagPopoverProps> = ({
  activeTagIndex,
  children,
  classStyleProps,
  customTagRenderer,
  disabled,
  setActiveTagIndex,
  tags,
  usePortal,
  ...tagProps
}) => {
  const triggerContainerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverContentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [popoverWidth, setPopoverWidth] = useState<number>(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [, setInputFocused] = useState(false);
  const [sideOffset, setSideOffset] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (triggerContainerRef.current && triggerRef.current) {
        setPopoverWidth(triggerContainerRef.current.offsetWidth);
        setSideOffset(
          triggerContainerRef.current.offsetWidth -
            triggerRef?.current?.offsetWidth,
        );
      }
    };

    handleResize(); // Call on mount and layout changes

    window.addEventListener("resize", handleResize); // Adjust on window resize
    return () => window.removeEventListener("resize", handleResize);
  }, [triggerContainerRef, triggerRef]);

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
      setPopoverWidth(triggerContainerRef.current.offsetWidth);
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

  return (
    <Popover
      modal={usePortal}
      onOpenChange={handleOpenChange}
      open={isPopoverOpen}>
      <div
        className="relative flex items-center rounded-md border border-input bg-transparent pr-3"
        ref={triggerContainerRef}>
        {React.cloneElement(children as React.ReactElement<any>, {
          onBlur: handleInputBlur,
          onFocus: handleInputFocus,
          ref: inputRef,
        })}
        <PopoverTrigger asChild>
          <Button
            className={cn(
              `hover:bg-transparent`,
              classStyleProps?.popoverClasses?.popoverTrigger,
            )}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            ref={triggerRef}
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
        className={cn(
          `w-full space-y-3`,
          classStyleProps?.popoverClasses?.popoverContent,
        )}
        ref={popoverContentRef}
        style={{
          marginLeft: `-${sideOffset}px`,
          width: `${popoverWidth}px`,
        }}>
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">Entered Tags</h4>
          <p className="text-sm text-muted-foregrounsd text-left">
            These are the tags you&apos;ve entered.
          </p>
        </div>
        <TagList
          activeTagIndex={activeTagIndex}
          classStyleProps={{
            tagClasses: classStyleProps?.tagClasses,
            tagListClasses: classStyleProps?.tagListClasses,
          }}
          customTagRenderer={customTagRenderer}
          setActiveTagIndex={setActiveTagIndex}
          tags={tags}
          {...tagProps}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
};
