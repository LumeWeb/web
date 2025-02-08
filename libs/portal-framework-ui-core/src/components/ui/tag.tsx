import { cva } from "class-variance-authority";
import React from "react";

import { cn } from "../../util/cn";
import { Button } from "./button";
import {
  TagInputProps,
  TagInputStyleClassesProps,
  type Tag as TagType,
} from "./tag-input";

export const tagVariants = cva(
  "transition-all border inline-flex items-center text-sm pl-2 rounded-md",
  {
    defaultVariants: {
      animation: "fadeIn",
      borderStyle: "default",
      interaction: "nonClickable",
      shape: "default",
      size: "md",
      textStyle: "normal",
      variant: "default",
    },
    variants: {
      animation: {
        bounce: "animate-bounce",
        fadeIn: "animate-fadeIn",
        none: "",
        slideIn: "animate-slideIn",
      },
      borderStyle: {
        dashed: "border-dashed",
        default: "border-solid",
        dotted: "border-dotted",
        double: "border-double",
        none: "border-none",
      },
      interaction: {
        clickable: "cursor-pointer hover:shadow-md",
        nonClickable: "cursor-default",
      },
      shape: {
        default: "rounded-sm",
        pill: "rounded-full",
        rounded: "rounded-lg",
        square: "rounded-none",
      },
      size: {
        lg: "text-base h-9",
        md: "text-sm h-8",
        sm: "text-xs h-7",
        xl: "text-lg h-10",
      },
      textCase: {
        capitalize: "capitalize",
        lowercase: "lowercase",
        uppercase: "uppercase",
      },
      textStyle: {
        bold: "font-bold",
        italic: "italic",
        lineThrough: "line-through",
        normal: "font-normal",
        underline: "underline",
      },
      variant: {
        default:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50",
        destructive:
          "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50",
        primary:
          "bg-primary border-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
      },
    },
  },
);

export type TagProps = Pick<
  TagInputProps,
  "direction" | "draggable" | "onTagClick"
> & {
  animation: TagInputProps["animation"];
  borderStyle: TagInputProps["borderStyle"];
  disabled?: boolean;
  interaction: TagInputProps["interaction"];
  isActiveTag?: boolean;
  onRemoveTag: (id: string) => void;
  shape: TagInputProps["shape"];
  size: TagInputProps["size"];
  tagClasses?: TagInputStyleClassesProps["tag"];
  tagObj: TagType;
  textCase: TagInputProps["textCase"];
  textStyle: TagInputProps["textStyle"];
  variant: TagInputProps["variant"];
};

export const Tag: React.FC<TagProps> = ({
  animation,
  borderStyle,
  direction,
  disabled,
  draggable,
  interaction,
  isActiveTag,
  onRemoveTag,
  onTagClick,
  shape,
  size,
  tagClasses,
  tagObj,
  textCase,
  textStyle,
  variant,
}) => {
  return (
    <span
      className={cn(
        tagVariants({
          animation,
          borderStyle,
          interaction,
          shape,
          size,
          textCase,
          textStyle,
          variant,
        }),
        {
          "cursor-pointer": draggable,
          "justify-between w-full": direction === "column",
          "ring-ring ring-offset-2 ring-2 ring-offset-background": isActiveTag,
        },
        tagClasses?.body,
      )}
      draggable={draggable}
      key={tagObj.id}
      onClick={() => onTagClick?.(tagObj)}>
      {tagObj.text}
      <Button
        className={cn(
          `py-1 px-3 h-full hover:bg-transparent`,
          tagClasses?.closeButton,
        )}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation(); // Prevent event from bubbling up to the tag span
          onRemoveTag(tagObj.id);
        }}
        type="button"
        variant="ghost">
        <svg
          className="lucide lucide-x"
          fill="none"
          height="14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="14"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </Button>
    </span>
  );
};
