import {
  Avatar,
  Button,
  cn,
  EditIcon,
  FingerPrintIcon,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

const ManagementCardAvatar = ({
  button,
  onClick,
}: {
  button?: React.ReactNode;
  onClick?: () => void;
  src?: string;
}) => {
  return (
    <div className="flex justify-center">
      <div className="relative h-fit w-fit">
        <Avatar className="border-ring h-28 w-28 border-2" />
        {!button ? (
          <Button
            className="hover:bg-secondary-2 absolute bottom-0 right-0 z-50 flex h-10 w-10 items-center justify-center rounded-full border-white p-0"
            onClick={onClick}
            variant="outline">
            <EditIcon />
          </Button>
        ) : (
          button
        )}
      </div>
    </div>
  );
};

const ManagementCardTitle = ({
  children,
  className,
  icon: Icon = FingerPrintIcon,
}: React.PropsWithChildren<{
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}>) => {
  return (
    <div className={cn("flex items-center gap-x-2 font-semibold", className)}>
      <Icon className="text-foreground" />
      {children}
    </div>
  );
};

const ManagementCardContent = ({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn("text-muted mb-8 mt-4 text-sm", className)}>
      {children}
    </div>
  );
};

const ManagementCardFooter = ({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => {
  return <div className={className}>{children}</div>;
};

const ManagementCard = ({
  children,
  variant,
}: React.PropsWithChildren<{ variant?: string }>) => {
  return (
    <div
      className={cn(
        "border-border/30 bg-secondary/30 w-full rounded-lg border p-8",
        !variant && "[--variant-color:theme(colors.border)]",
        variant === "accent" &&
          "[--variant-color:theme(colors.primary-1.DEFAULT)]",
      )}>
      {children}
    </div>
  );
};

export {
  ManagementCard,
  ManagementCardAvatar,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardTitle,
};
