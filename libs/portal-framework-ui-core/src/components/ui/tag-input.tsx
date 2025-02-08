"use client";

import { type VariantProps } from "class-variance-authority";
import React, { useMemo } from "react";

import { cn } from "../../util/cn";
import { uuid } from "../../util/uuid";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Autocomplete } from "./autocomplete";
import { tagVariants } from "./tag";
import { TagList } from "./tag-list";
import { TagPopover } from "./tag-popover";

export enum Delimiter {
  Comma = ",",
  Enter = "Enter",
}

export type Tag = {
  id: string;
  text: string;
};

export interface TagInputProps
  extends OmittedInputProps,
    VariantProps<typeof tagVariants> {
  activeTagIndex: null | number;
  addOnPaste?: boolean;
  addTagsOnBlur?: boolean;
  allowDuplicates?: boolean;
  autocompleteFilter?: (option: string) => boolean;
  autocompleteOptions?: Tag[];
  clearAll?: boolean;
  customTagRenderer?: (tag: Tag, isActiveTag: boolean) => React.ReactNode;
  delimiter?: Delimiter;
  delimiterList?: string[];
  direction?: "column" | "row";
  disabled?: boolean;
  draggable?: boolean;
  enableAutocomplete?: boolean;
  generateTagId?: () => string;
  inlineTags?: boolean;
  inputFieldPosition?: "bottom" | "top";
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  maxLength?: number;
  maxTags?: number;
  minLength?: number;
  minTags?: number;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onClearAll?: () => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onInputChange?: (value: string) => void;
  onTagAdd?: (tag: string) => void;
  onTagClick?: (tag: Tag) => void;
  onTagRemove?: (tag: string) => void;
  placeholder?: string;
  placeholderWhenFull?: string;
  readOnly?: boolean;
  restrictTagsToAutocompleteOptions?: boolean;
  setActiveTagIndex: React.Dispatch<React.SetStateAction<null | number>>;
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  showCount?: boolean;
  sortTags?: boolean;
  styleClasses?: TagInputStyleClassesProps;
  tags: Tag[];
  truncate?: number;
  usePopoverForTags?: boolean;
  usePortal?: boolean;
  validateTag?: (tag: string) => boolean;
  value?: number | readonly string[] | string | { id: string; text: string }[];
}

export interface TagInputStyleClassesProps {
  autoComplete?: {
    command?: string;
    commandGroup?: string;
    commandItem?: string;
    commandList?: string;
    popoverContent?: string;
    popoverTrigger?: string;
  };
  clearAllButton?: string;
  inlineTagsContainer?: string;
  input?: string;
  tag?: {
    body?: string;
    closeButton?: string;
  };
  tagList?: {
    container?: string;
    sortableList?: string;
  };
  tagPopover?: {
    popoverContent?: string;
    popoverTrigger?: string;
  };
}

type OmittedInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value"
>;

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (props, _ref) => {
    const {
      activeTagIndex,
      addOnPaste = false,
      addTagsOnBlur = false,
      allowDuplicates,
      animation,
      autocompleteOptions,
      borderStyle,
      clearAll = false,
      customTagRenderer,
      delimiter = Delimiter.Comma,
      delimiterList,
      direction = "row",
      disabled = false,
      draggable = false,
      enableAutocomplete,
      generateTagId = uuid,
      id,
      inlineTags = true,
      inputFieldPosition = "bottom",
      inputProps = {},
      interaction,
      maxLength,
      maxTags,
      minLength,
      onBlur,
      onClearAll,
      onFocus,
      onInputChange,
      onTagAdd,
      onTagClick,
      onTagRemove,
      placeholder,
      placeholderWhenFull = "Max tags reached",
      restrictTagsToAutocompleteOptions,
      setActiveTagIndex,
      setTags,
      shape,
      showCount,
      size,
      sortTags,
      styleClasses = {},
      tags,
      textCase,
      textStyle,
      truncate,
      usePopoverForTags = false,
      usePortal = false,
      validateTag,
      variant,
    } = props;

    const [inputValue, setInputValue] = React.useState("");
    const [tagCount, setTagCount] = React.useState(Math.max(0, tags.length));
    const inputRef = React.useRef<HTMLInputElement>(null);

    if (
      (maxTags !== undefined && maxTags < 0) ||
      (props.minTags !== undefined && props.minTags < 0)
    ) {
      console.warn("maxTags and minTags cannot be less than 0");
      // error
      return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (addOnPaste && newValue.includes(delimiter)) {
        const splitValues = newValue
          .split(delimiter)
          .map((v) => v.trim())
          .filter((v) => v);
        splitValues.forEach((value) => {
          if (!value) return; // Skip empty strings from split

          const newTagText = value.trim();

          // Check if the tag is in the autocomplete options if restrictTagsToAutocomplete is true
          if (
            restrictTagsToAutocompleteOptions &&
            !autocompleteOptions?.some((option) => option.text === newTagText)
          ) {
            console.warn("Tag not allowed as per autocomplete options");
            return;
          }

          if (validateTag && !validateTag(newTagText)) {
            console.warn("Invalid tag as per validateTag");
            return;
          }

          if (minLength && newTagText.length < minLength) {
            console.warn(`Tag "${newTagText}" is too short`);
            return;
          }

          if (maxLength && newTagText.length > maxLength) {
            console.warn(`Tag "${newTagText}" is too long`);
            return;
          }

          const newTagId = generateTagId();

          // Add tag if duplicates are allowed or tag does not already exist
          if (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) {
            if (maxTags === undefined || tags.length < maxTags) {
              // Check for maxTags limit
              const newTag = { id: newTagId, text: newTagText };
              setTags((prevTags) => [...prevTags, newTag]);
              onTagAdd?.(newTagText);
            } else {
              console.warn("Reached the maximum number of tags allowed");
            }
          } else {
            console.warn(`Duplicate tag "${newTagText}" not added`);
          }
        });
        setInputValue("");
      } else {
        setInputValue(newValue);
      }
      onInputChange?.(newValue);
    };

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setActiveTagIndex(null); // Reset active tag index when the input field gains focus
      onFocus?.(event);
    };

    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (addTagsOnBlur && inputValue.trim()) {
        const newTagText = inputValue.trim();

        if (validateTag && !validateTag(newTagText)) {
          return;
        }

        if (minLength && newTagText.length < minLength) {
          console.warn("Tag is too short");
          return;
        }

        if (maxLength && newTagText.length > maxLength) {
          console.warn("Tag is too long");
          return;
        }

        if (
          (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) &&
          (maxTags === undefined || tags.length < maxTags)
        ) {
          const newTagId = generateTagId();
          setTags([...tags, { id: newTagId, text: newTagText }]);
          onTagAdd?.(newTagText);
          setTagCount((prevTagCount) => prevTagCount + 1);
          setInputValue("");
        }
      }

      onBlur?.(event);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        delimiterList
          ? delimiterList.includes(e.key)
          : e.key === delimiter || e.key === Delimiter.Enter
      ) {
        e.preventDefault();
        const newTagText = inputValue.trim();

        // Check if the tag is in the autocomplete options if restrictTagsToAutocomplete is true
        if (
          restrictTagsToAutocompleteOptions &&
          !autocompleteOptions?.some((option) => option.text === newTagText)
        ) {
          // error
          return;
        }

        if (validateTag && !validateTag(newTagText)) {
          return;
        }

        if (minLength && newTagText.length < minLength) {
          console.warn("Tag is too short");
          // error
          return;
        }

        // Validate maxLength
        if (maxLength && newTagText.length > maxLength) {
          // error
          console.warn("Tag is too long");
          return;
        }

        const newTagId = generateTagId();

        if (
          newTagText &&
          (allowDuplicates || !tags.some((tag) => tag.text === newTagText)) &&
          (maxTags === undefined || tags.length < maxTags)
        ) {
          setTags([...tags, { id: newTagId, text: newTagText }]);
          onTagAdd?.(newTagText);
          setTagCount((prevTagCount) => prevTagCount + 1);
        }
        setInputValue("");
      } else {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            if (activeTagIndex === null) {
              setActiveTagIndex(tags.length - 1);
            } else {
              setActiveTagIndex((prev) =>
                prev! === 0 ? tags.length - 1 : prev! - 1,
              );
            }
            break;
          case "ArrowRight":
            e.preventDefault();
            if (activeTagIndex === null) {
              setActiveTagIndex(0);
            } else {
              setActiveTagIndex((prev) =>
                prev! + 1 >= tags.length ? 0 : prev! + 1,
              );
            }
            break;
          case "Backspace":
            if (activeTagIndex !== null) {
              e.preventDefault();
              const newTags = [...tags];
              newTags.splice(activeTagIndex, 1);
              setTags(newTags);
              setActiveTagIndex((prev) => (prev! === 0 ? null : prev! - 1));
              setTagCount((prevTagCount) => prevTagCount - 1);
              onTagRemove?.(tags[activeTagIndex].text);
            }
            break;
          case "Delete":
            if (activeTagIndex !== null) {
              e.preventDefault();
              const newTags = [...tags];
              newTags.splice(activeTagIndex, 1);
              setTags(newTags);
              setActiveTagIndex((prev) =>
                newTags.length === 0
                  ? null
                  : prev! >= newTags.length
                    ? newTags.length - 1
                    : prev,
              );
              setTagCount((prevTagCount) => prevTagCount - 1);
              onTagRemove?.(tags[activeTagIndex].text);
            }
            break;
          case "End":
            e.preventDefault();
            setActiveTagIndex(tags.length - 1);
            break;
          case "Home":
            e.preventDefault();
            setActiveTagIndex(0);
            break;
        }
      }
    };

    const removeTag = (idToRemove: string) => {
      setTags(tags.filter((tag) => tag.id !== idToRemove));
      onTagRemove?.(tags.find((tag) => tag.id === idToRemove)?.text || "");
      setTagCount((prevTagCount) => prevTagCount - 1);
    };

    const onSortEnd = (oldIndex: number, newIndex: number) => {
      setTags((currentTags) => {
        const newTags = [...currentTags];
        const [removedTag] = newTags.splice(oldIndex, 1);
        newTags.splice(newIndex, 0, removedTag);

        return newTags;
      });
    };

    const handleClearAll = () => {
      if (!onClearAll) {
        setActiveTagIndex(-1);
        setTags([]);
        return;
      }
      onClearAll?.();
    };

    // const filteredAutocompleteOptions = autocompleteFilter
    //   ? autocompleteOptions?.filter((option) => autocompleteFilter(option.text))
    //   : autocompleteOptions;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const filteredAutocompleteOptions = useMemo(() => {
      return (autocompleteOptions || []).filter((option) =>
        option.text
          .toLowerCase()
          .includes(inputValue ? inputValue.toLowerCase() : ""),
      );
    }, [inputValue, autocompleteOptions]);

    const displayedTags = sortTags ? [...tags].sort() : tags;

    const truncatedTags = truncate
      ? tags.map((tag) => ({
          id: tag.id,
          text:
            tag.text?.length > truncate
              ? `${tag.text.substring(0, truncate)}...`
              : tag.text,
        }))
      : displayedTags;

    return (
      <div
        className={`w-full flex ${!inlineTags && tags.length > 0 ? "gap-3" : ""} ${
          inputFieldPosition === "bottom"
            ? "flex-col"
            : inputFieldPosition === "top"
              ? "flex-col-reverse"
              : "flex-row"
        }`}>
        {!usePopoverForTags &&
          (!inlineTags ? (
            <TagList
              activeTagIndex={activeTagIndex}
              animation={animation}
              borderStyle={borderStyle}
              classStyleProps={{
                tagClasses: styleClasses?.tag,
                tagListClasses: styleClasses?.tagList,
              }}
              customTagRenderer={customTagRenderer}
              direction={direction}
              disabled={disabled}
              draggable={draggable}
              inlineTags={inlineTags}
              interaction={interaction}
              onRemoveTag={removeTag}
              onSortEnd={onSortEnd}
              onTagClick={onTagClick}
              setActiveTagIndex={setActiveTagIndex}
              shape={shape}
              size={size}
              tags={truncatedTags}
              textCase={textCase}
              textStyle={textStyle}
              variant={variant}
            />
          ) : (
            !enableAutocomplete && (
              <div className="w-full">
                <div
                  className={cn(
                    `flex flex-row flex-wrap items-center gap-2 p-2 w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                    styleClasses?.inlineTagsContainer,
                  )}>
                  <TagList
                    activeTagIndex={activeTagIndex}
                    animation={animation}
                    borderStyle={borderStyle}
                    classStyleProps={{
                      tagClasses: styleClasses?.tag,
                      tagListClasses: styleClasses?.tagList,
                    }}
                    customTagRenderer={customTagRenderer}
                    direction={direction}
                    disabled={disabled}
                    draggable={draggable}
                    inlineTags={inlineTags}
                    interaction={interaction}
                    onRemoveTag={removeTag}
                    onSortEnd={onSortEnd}
                    onTagClick={onTagClick}
                    setActiveTagIndex={setActiveTagIndex}
                    shape={shape}
                    size={size}
                    tags={truncatedTags}
                    textCase={textCase}
                    textStyle={textStyle}
                    variant={variant}
                  />
                  <Input
                    id={id}
                    onBlur={handleInputBlur}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      maxTags !== undefined && tags.length >= maxTags
                        ? placeholderWhenFull
                        : placeholder
                    }
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    {...inputProps}
                    autoComplete={enableAutocomplete ? "on" : "off"}
                    className={cn(
                      "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                      // className,
                      styleClasses?.input,
                    )}
                    disabled={
                      disabled ||
                      (maxTags !== undefined && tags.length >= maxTags)
                    }
                    list={
                      enableAutocomplete ? "autocomplete-options" : undefined
                    }
                  />
                </div>
              </div>
            )
          ))}
        {enableAutocomplete ? (
          <div className="w-full">
            <Autocomplete
              allowDuplicates={allowDuplicates ?? false}
              autocompleteOptions={filteredAutocompleteOptions as Tag[]}
              classStyleProps={{
                command: styleClasses?.autoComplete?.command,
                commandGroup: styleClasses?.autoComplete?.commandGroup,
                commandItem: styleClasses?.autoComplete?.commandItem,
                commandList: styleClasses?.autoComplete?.commandList,
                popoverContent: styleClasses?.autoComplete?.popoverContent,
                popoverTrigger: styleClasses?.autoComplete?.popoverTrigger,
              }}
              inlineTags={inlineTags}
              maxTags={maxTags}
              onTagAdd={onTagAdd}
              onTagRemove={onTagRemove}
              setInputValue={setInputValue}
              setTagCount={setTagCount}
              setTags={setTags}
              tags={tags}
              usePortal={usePortal}>
              {!usePopoverForTags ? (
                !inlineTags ? (
                  // <CommandInput
                  //   placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                  //   ref={inputRef}
                  //   value={inputValue}
                  //   disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                  //   onChangeCapture={handleInputChange}
                  //   onKeyDown={handleKeyDown}
                  //   onFocus={handleInputFocus}
                  //   onBlur={handleInputBlur}
                  //   className={cn(
                  //     'w-full',
                  //     // className,
                  //     styleClasses?.input,
                  //   )}
                  // />
                  <Input
                    id={id}
                    onBlur={handleInputBlur}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      maxTags !== undefined && tags.length >= maxTags
                        ? placeholderWhenFull
                        : placeholder
                    }
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    {...inputProps}
                    autoComplete={enableAutocomplete ? "on" : "off"}
                    className={cn(
                      "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                      // className,
                      styleClasses?.input,
                    )}
                    disabled={
                      disabled ||
                      (maxTags !== undefined && tags.length >= maxTags)
                    }
                    list={
                      enableAutocomplete ? "autocomplete-options" : undefined
                    }
                  />
                ) : (
                  <div
                    className={cn(
                      `flex flex-row flex-wrap items-center p-2 gap-2 h-fit w-full bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                      styleClasses?.inlineTagsContainer,
                    )}>
                    <TagList
                      activeTagIndex={activeTagIndex}
                      animation={animation}
                      borderStyle={borderStyle}
                      classStyleProps={{
                        tagClasses: styleClasses?.tag,
                        tagListClasses: styleClasses?.tagList,
                      }}
                      customTagRenderer={customTagRenderer}
                      direction={direction}
                      disabled={disabled}
                      draggable={draggable}
                      inlineTags={inlineTags}
                      interaction={interaction}
                      onRemoveTag={removeTag}
                      onSortEnd={onSortEnd}
                      onTagClick={onTagClick}
                      setActiveTagIndex={setActiveTagIndex}
                      shape={shape}
                      size={size}
                      tags={truncatedTags}
                      textCase={textCase}
                      textStyle={textStyle}
                      variant={variant}
                    />
                    {/* <CommandInput
                    placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                    ref={inputRef}
                    value={inputValue}
                    disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                    onChangeCapture={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    inlineTags={inlineTags}
                    className={cn(
                      'border-0 flex-1 w-fit h-5',
                      // className,
                      styleClasses?.input,
                    )}
                  /> */}
                    <Input
                      id={id}
                      onBlur={handleInputBlur}
                      onChange={handleInputChange}
                      onFocus={handleInputFocus}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        maxTags !== undefined && tags.length >= maxTags
                          ? placeholderWhenFull
                          : placeholder
                      }
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      {...inputProps}
                      autoComplete={enableAutocomplete ? "on" : "off"}
                      className={cn(
                        "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                        // className,
                        styleClasses?.input,
                      )}
                      disabled={
                        disabled ||
                        (maxTags !== undefined && tags.length >= maxTags)
                      }
                      list={
                        enableAutocomplete ? "autocomplete-options" : undefined
                      }
                    />
                  </div>
                )
              ) : (
                <TagPopover
                  activeTagIndex={activeTagIndex}
                  animation={animation}
                  borderStyle={borderStyle}
                  classStyleProps={{
                    popoverClasses: styleClasses?.tagPopover,
                    tagClasses: styleClasses?.tag,
                    tagListClasses: styleClasses?.tagList,
                  }}
                  customTagRenderer={customTagRenderer}
                  direction={direction}
                  disabled={disabled}
                  draggable={draggable}
                  interaction={interaction}
                  onRemoveTag={removeTag}
                  onSortEnd={onSortEnd}
                  onTagClick={onTagClick}
                  setActiveTagIndex={setActiveTagIndex}
                  shape={shape}
                  size={size}
                  tags={truncatedTags}
                  textCase={textCase}
                  textStyle={textStyle}
                  variant={variant}>
                  {/* <CommandInput
                  placeholder={maxTags !== undefined && tags.length >= maxTags ? placeholderWhenFull : placeholder}
                  ref={inputRef}
                  value={inputValue}
                  disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)}
                  onChangeCapture={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={cn(
                    'w-full',
                    // className,
                    styleClasses?.input,
                  )}
                /> */}
                  <Input
                    id={id}
                    onBlur={handleInputBlur}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      maxTags !== undefined && tags.length >= maxTags
                        ? placeholderWhenFull
                        : placeholder
                    }
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    {...inputProps}
                    autoComplete={enableAutocomplete ? "on" : "off"}
                    className={cn(
                      "border-0 h-5 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 flex-1 w-fit",
                      // className,
                      styleClasses?.input,
                    )}
                    disabled={
                      disabled ||
                      (maxTags !== undefined && tags.length >= maxTags)
                    }
                    list={
                      enableAutocomplete ? "autocomplete-options" : undefined
                    }
                  />
                </TagPopover>
              )}
            </Autocomplete>
          </div>
        ) : (
          <div className="w-full">
            {!usePopoverForTags ? (
              !inlineTags ? (
                <Input
                  id={id}
                  onBlur={handleInputBlur}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    maxTags !== undefined && tags.length >= maxTags
                      ? placeholderWhenFull
                      : placeholder
                  }
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  {...inputProps}
                  autoComplete={enableAutocomplete ? "on" : "off"}
                  className={cn(
                    styleClasses?.input,
                    // className
                  )}
                  disabled={
                    disabled ||
                    (maxTags !== undefined && tags.length >= maxTags)
                  }
                  list={enableAutocomplete ? "autocomplete-options" : undefined}
                />
              ) : null
            ) : (
              <TagPopover
                activeTagIndex={activeTagIndex}
                animation={animation}
                borderStyle={borderStyle}
                classStyleProps={{
                  popoverClasses: styleClasses?.tagPopover,
                  tagClasses: styleClasses?.tag,
                  tagListClasses: styleClasses?.tagList,
                }}
                customTagRenderer={customTagRenderer}
                direction={direction}
                disabled={disabled}
                draggable={draggable}
                interaction={interaction}
                onRemoveTag={removeTag}
                onSortEnd={onSortEnd}
                onTagClick={onTagClick}
                setActiveTagIndex={setActiveTagIndex}
                shape={shape}
                size={size}
                tags={truncatedTags}
                textCase={textCase}
                textStyle={textStyle}
                variant={variant}>
                <Input
                  id={id}
                  onBlur={handleInputBlur}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    maxTags !== undefined && tags.length >= maxTags
                      ? placeholderWhenFull
                      : placeholder
                  }
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  {...inputProps}
                  autoComplete={enableAutocomplete ? "on" : "off"}
                  className={cn(
                    "border-0 w-full",
                    styleClasses?.input,
                    // className
                  )}
                  disabled={
                    disabled ||
                    (maxTags !== undefined && tags.length >= maxTags)
                  }
                  list={enableAutocomplete ? "autocomplete-options" : undefined}
                />
              </TagPopover>
            )}
          </div>
        )}

        {showCount && maxTags && (
          <div className="flex">
            <span className="text-muted-foreground text-sm mt-1 ml-auto">
              {`${tagCount}`}/{`${maxTags}`}
            </span>
          </div>
        )}
        {clearAll && (
          <Button
            className={cn("mt-2", styleClasses?.clearAllButton)}
            onClick={handleClearAll}
            type="button">
            Clear All
          </Button>
        )}
      </div>
    );
  },
);

TagInput.displayName = "TagInput";

export { TagInput };
