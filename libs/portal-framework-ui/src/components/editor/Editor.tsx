import React, { Suspense } from "react";

import type { EditorProps, ToolbarOption } from "./EditorInner";

const EditorInner = React.lazy(() => import("./EditorInner"));

export type { EditorProps, ToolbarOption };

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  (props, ref) => (
    <Suspense fallback={<div className="min-h-[150px]" />}>
      <EditorInner {...props} ref={ref} />
    </Suspense>
  ),
);
Editor.displayName = "Markdown";
