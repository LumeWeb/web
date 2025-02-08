import React from "react";

import SortableList, { SortableItem } from "../../lib/react-easy-sort";
import { cn } from "../../util/cn";
import { Tag, TagProps } from "./tag";
import { TagInputStyleClassesProps, type Tag as TagType } from "./tag-input";

export type TagListProps = Omit<TagProps, "tagObj"> & {
  activeTagIndex?: null | number;
  className?: string;
  classStyleProps: {
    tagClasses: TagInputStyleClassesProps["tag"];
    tagListClasses: TagInputStyleClassesProps["tagList"];
  };
  customTagRenderer?: (tag: TagType, isActiveTag: boolean) => React.ReactNode;
  direction?: TagProps["direction"];
  disabled?: boolean;
  inlineTags?: boolean;
  onSortEnd: (oldIndex: number, newIndex: number) => void;
  setActiveTagIndex?: (index: null | number) => void;
  tags: TagType[];
};

const DropTarget: React.FC = () => {
  return <div className={cn("h-full rounded-md bg-secondary/50")} />;
};

export const TagList: React.FC<TagListProps> = ({
  activeTagIndex,
  className,
  classStyleProps,
  customTagRenderer,
  direction,
  disabled,
  draggable,
  inlineTags,
  onSortEnd,
  setActiveTagIndex,
  tags,
  ...tagListProps
}) => {
  const [draggedTagId, setDraggedTagId] = React.useState<null | string>(null);

  const handleMouseDown = (id: string) => {
    setDraggedTagId(id);
  };

  const handleMouseUp = () => {
    setDraggedTagId(null);
  };

  return (
    <>
      {!inlineTags ? (
        <div
          className={cn(
            "rounded-md w-full",
            // className,
            {
              "flex flex-col gap-2": direction === "column",
              "flex flex-wrap gap-2": direction === "row",
            },
            classStyleProps?.tagListClasses?.container,
          )}>
          {draggable ? (
            <SortableList
              // className="flex flex-wrap gap-2 list"
              className={`flex flex-wrap gap-2 list ${classStyleProps?.tagListClasses?.sortableList}`}
              dropTarget={<DropTarget />}
              onSortEnd={onSortEnd}>
              {tags.map((tagObj, index) => (
                <SortableItem key={tagObj.id}>
                  <div
                    className={cn(
                      {
                        "border border-solid border-primary rounded-md":
                          draggedTagId === tagObj.id,
                      },
                      "transition-all duration-200 ease-in-out",
                    )}
                    onMouseDown={() => handleMouseDown(tagObj.id)}
                    onMouseLeave={handleMouseUp}>
                    {customTagRenderer ? (
                      customTagRenderer(tagObj, index === activeTagIndex)
                    ) : (
                      <Tag
                        direction={direction}
                        draggable={draggable}
                        isActiveTag={index === activeTagIndex}
                        tagClasses={classStyleProps?.tagClasses}
                        tagObj={tagObj}
                        {...tagListProps}
                        disabled={disabled}
                      />
                    )}
                  </div>
                </SortableItem>
              ))}
            </SortableList>
          ) : (
            tags.map((tagObj, index) =>
              customTagRenderer ? (
                customTagRenderer(tagObj, index === activeTagIndex)
              ) : (
                <Tag
                  direction={direction}
                  draggable={draggable}
                  isActiveTag={index === activeTagIndex}
                  key={tagObj.id}
                  tagClasses={classStyleProps?.tagClasses}
                  tagObj={tagObj}
                  {...tagListProps}
                  disabled={disabled}
                />
              ),
            )
          )}
        </div>
      ) : (
        <>
          {draggable ? (
            <SortableList
              className="flex flex-wrap gap-2 list"
              dropTarget={<DropTarget />}
              onSortEnd={onSortEnd}>
              {tags.map((tagObj, index) => (
                <SortableItem key={tagObj.id}>
                  <div
                    className={cn(
                      {
                        "border border-solid border-primary rounded-md":
                          draggedTagId === tagObj.id,
                      },
                      "transition-all duration-200 ease-in-out",
                    )}
                    onMouseDown={() => handleMouseDown(tagObj.id)}
                    onMouseLeave={handleMouseUp}>
                    {customTagRenderer ? (
                      customTagRenderer(tagObj, index === activeTagIndex)
                    ) : (
                      <Tag
                        direction={direction}
                        draggable={draggable}
                        isActiveTag={index === activeTagIndex}
                        tagClasses={classStyleProps?.tagClasses}
                        tagObj={tagObj}
                        {...tagListProps}
                        disabled={disabled}
                      />
                    )}
                  </div>
                </SortableItem>
              ))}
            </SortableList>
          ) : (
            tags.map((tagObj, index) =>
              customTagRenderer ? (
                customTagRenderer(tagObj, index === activeTagIndex)
              ) : (
                <Tag
                  direction={direction}
                  draggable={draggable}
                  isActiveTag={index === activeTagIndex}
                  key={tagObj.id}
                  tagClasses={classStyleProps?.tagClasses}
                  tagObj={tagObj}
                  {...tagListProps}
                  disabled={disabled}
                />
              ),
            )
          )}
        </>
      )}
    </>
  );
};
