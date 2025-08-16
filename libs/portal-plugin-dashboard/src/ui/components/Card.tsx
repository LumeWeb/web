import {
  CardDescription,
  CardHeader,
  CardTitle,
  Card as UICard,
  CardContent as UICardContent,
} from "@lumeweb/portal-framework-ui-core";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface CardProps {
  border?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: string;
  icon?: LucideIcon;
  title?: string;
  titleClassName?: string;
}

export function Card({
  border = false,
  children,
  className = "",
  contentClassName = "",
  description,
  icon: Icon,
  title,
  titleClassName = "",
}: CardProps) {
  return (
    <UICard className={cn(border && "border-border", className)}>
      <CardHeader className={className}>
        {title && (
          <CardTitle className={cn("flex items-center gap-2", titleClassName)}>
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            {title}
          </CardTitle>
        )}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <UICardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </UICardContent>
    </UICard>
  );
}
