import { cn } from "@lumeweb/portal-framework-ui-core";
import React, { type ReactNode } from "react";

type TimelineContentProps = {
  children: ReactNode;
};

const TimelineContent: React.FC<TimelineContentProps> = ({ children }) => (
  <div className={cn("ml-4 w-full")}>{children}</div>
);
TimelineContent.displayName = "TimelineContent";

type TimelineDotProps = {
  children?: ReactNode;
  className?: string;
};

const TimelineDot: React.FC<TimelineDotProps> = ({ children, className }) => (
  <div
    className={cn(
      "h-8 w-8 rounded-full flex items-center justify-center bg-primary/20",
      className,
    )}>
    {children}
  </div>
);
TimelineDot.displayName = "TimelineDot";

type TimelineItemProps = {
  children: React.ReactNode;
  className?: string;
  dotClassName?: string;
  icon?: React.ReactNode;
};

const TimelineItem: React.FC<TimelineItemProps> = ({
  children,
  className,
  dotClassName,
  icon,
}) => (
  <div className={cn("flex", className)}>
    <div className="flex flex-col items-center">
      <TimelineDot className={dotClassName}>{icon}</TimelineDot>
    </div>
    <TimelineContent>{children}</TimelineContent>
  </div>
);
TimelineItem.displayName = "TimelineItem";

type TimelineProps = {
  children: React.ReactNode;
  className?: string;
  connectorClassName?: string;
};

const Timeline: React.FC<TimelineProps> = ({
  children,
  className,
  connectorClassName,
}) => {
  const timelineItems = React.Children.toArray(children);

  return (
    <div className={cn("flex flex-col", className)}>
      {timelineItems.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < timelineItems.length - 1 && (
            <div
              className={cn(
                "w-[2px] bg-border h-12 ml-4",
                connectorClassName,
              )}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
Timeline.displayName = "Timeline";

export { Timeline, TimelineDot, TimelineItem };
