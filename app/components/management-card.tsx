import { cn } from "~/utils";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { EditIcon, FingerPrintIcon } from "./icons";

const ManagementCardAvatar = ({ src }: { src?: string }) => {
  return (
    <div className="flex justify-center">
      <div className="relative w-fit h-fit">
        <Avatar className="border-2 border-ring h-28 w-28" />
        <Button
          variant="outline"
          className="h-10 w-10 rounded-full hover:bg-secondary-2 border-white absolute bottom-0 right-0 z-50">
          <EditIcon />
        </Button>
      </div>
    </div>
  );
};

const ManagementCardTitle = ({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn("flex gap-x-2 items-center font-semibold", className)}>
      <FingerPrintIcon className="text-ring" />
      {children}
    </div>
  );
};

const ManagementCardContent = ({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={cn("text-primary-2 mt-4 mb-8 block text-sm", className)}>
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
        "rounded-lg p-8 border w-full border-[--variant-color]",
        !variant && "[--variant-color:theme(colors.border)]",
        variant === "accent" && "[--variant-color:theme(colors.primary-1.DEFAULT)]",
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