import React from "react";

export default function ManagementGrid({
  children,
  columns = 3,
}: {
  children: React.ReactNode;
  columns?: number;
}) {
  const grids = Math.ceil(React.Children.toArray(children).length / columns);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
      {React.Children.map(children, (child, index) => (
        <div key={index}>{child}</div>
      ))}
      {Array.from({
        length: grids * columns - React.Children.toArray(children).length,
      })
        .fill(null)
        .map((_, index) => (
          <div key={index} />
        ))}
    </div>
  );
}
