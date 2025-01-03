import { ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { type ReactNode, useState } from "react";

interface NavigationProps {
  children: ReactNode;
}

interface NavigationItemProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
}

interface NavigationItemContentProps {
  children: ReactNode;
}

interface NavigationSubItemProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
}

export function Navigation({ children }: NavigationProps) {
  return <nav className="space-y-1">{children}</nav>;
}

export function NavigationItem({
  children,
  href,
  active,
}: NavigationItemProps) {
  const [_isOpen, setIsOpen] = useState(false);
  const childrenArray = React.Children.toArray(children);
  const content = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === NavigationItemContent,
  );
  const subItems = childrenArray.filter(
    (child) => React.isValidElement(child) && child.type === NavigationSubItem,
  );
  const hasSubItems = subItems.length > 0;
  const isOpen = _isOpen || active;
  const itemContent = (
    <button
      data-active={active}
      className={cn(
        "group px-5 text-sm font-medium rounded-md transition-colors text-foreground",
        active
          ? "opacity-100 border-[1px] border-secondary"
          : "opacity-50 hover:opacity-75",
        isOpen && hasSubItems && "bg-input !h-auto pb-4",
      )}
      onClick={() => hasSubItems && setIsOpen(!isOpen)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          hasSubItems && setIsOpen(!isOpen);
        }
      }}
      type="button"
      tabIndex={0}>
      <div className="flex items-center justify-between h-[64px]">
        {href ? (
          <Link to={href} className={"cursor-pointer"}>
            {content}
          </Link>
        ) : (
          content
        )}
        {hasSubItems && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}>
            <ChevronDownIcon
              className={cn(
                "w-4 h-4 transition-transform ml-2",
                isOpen && "transform rotate-180",
              )}
            />
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {hasSubItems && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="ml-4 mt-1 space-y-1 overflow-hidden">
            {subItems}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );

  return <div>{itemContent}</div>;
}

export function NavigationItemContent({
  children,
}: NavigationItemContentProps) {
  return <div className="flex items-center px-3 py-2 text-sm font-medium text-foreground/60 group-data-[active='true']:text-foreground group:data-[active=true]:border-secondary rounded-md transition-colors hover:opacity-50">{children}</div>;
}

export function NavigationSubItem({ children, href, active }: NavigationSubItemProps) {
  const content = (
    <div className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:opacity-50",
      active ? "text-foreground" : "text-foreground/60"
    )}>
      {children}
    </div>
  );

  return href ? (
    <Link to={href} className="flex-grow">
      {content}
    </Link>
  ) : (
    content
  );
}
