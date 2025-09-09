import React from "react";

interface PageHeaderProps {
  children?: React.ReactNode;
  description: string;
  title: string;
}

export function PageHeader({ children, description, title }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-gray-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
