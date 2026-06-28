"use client"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { lazyIcon } from "@/components/lazy-icons";
import * as React from "react"
import { DayPicker } from "react-day-picker"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
                    className,
                    classNames,
                    showOutsideDays = true,
                    ...props
                  }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        month_caption: "flex justify-center pt-1 relative items-center", // caption -> month_caption
        caption_label: "text-sm font-medium", // Keep
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20", // cell -> day, update selectors
        day_button: cn( // day -> day_button
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        disabled: "text-muted-foreground opacity-50", // day_disabled -> disabled
        hidden: "invisible", // day_hidden -> hidden
        outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground", // day_outside -> outside
        range_end: "day-range-end", // day_range_end -> range_end
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground", // day_range_middle -> range_middle
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground", // day_selected -> selected
        today: "bg-accent text-accent-foreground", // day_today -> today
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]", // head_cell -> weekday
        weekdays: "flex", // head_row -> weekdays
        month: "space-y-4", // Keep
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0", // Keep
        nav: "space-x-1 flex items-center", // Keep
        button_previous: cn( // nav_button_previous -> button_previous
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn( // nav_button_next -> button_next
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        week: "flex w-full mt-2", // row -> week
        month_grid: "w-full border-collapse space-y-1", // table -> month_grid
        ...classNames,
      }}
      components={{
        Chevron: ({ className, ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", className)} {...props} />;
const ChevronLeft = lazyIcon("ChevronLeft");
const ChevronRight = lazyIcon("ChevronRight");

          }
          return <ChevronRight className={cn("h-4 w-4", className)} {...props} />;
        },
      }}
      showOutsideDays={showOutsideDays}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar }
