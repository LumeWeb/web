import type { ReactElement, ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
import { Children, isValidElement, useMemo } from 'react';

export interface MultiTabProps {
  /** Tab panels as children wrapped in Tab components */
  children: ReactNode;
  /** Default tab value to show on initial render */
  defaultValue?: string;
  /** Additional class name for the root container */
  className?: string;
}

export interface TabProps {
  /** Unique value for this tab */
  value: string;
  /** Display label for the tab trigger */
  label: string;
  /** Content (usually a code block) */
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return children as ReactElement;
}

type TabElement = ReactElement<TabProps>;

function isTabElement(child: ReactNode): child is TabElement {
  return isValidElement<TabProps>(child) && typeof child.props.value === 'string' && typeof child.props.label === 'string';
}

export function MultiTab({ children, defaultValue, className }: MultiTabProps) {
  const tabs = useMemo(() => {
    return Children.toArray(children).filter(isTabElement);
  }, [children]);

  const firstValue = tabs[0]?.props.value;

  return (
    <Tabs.Root
      className={clsx('bg-codeBlockBackground border border-codeInlineBorder rounded', className)}
      defaultValue={defaultValue ?? firstValue}
    >
      <Tabs.List className="flex bg-codeTitleBackground border-b border-border rounded-t px-8 md:px-[56px]">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.props.value}
            value={tab.props.value}
            className="text-sm font-medium text-text3 transition-colors duration-100 hover:text-text data-[state=active]:text-title data-[state=active]:border-b-2 data-[state=active]:border-borderAccent py-2 pr-2 pb-1.5 pl-2"
          >
            {tab.props.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.props.value}
          value={tab.props.value}
          className="bg-codeBlockBackground p-5 md:px-[22px]"
        >
          {tab.props.children}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}