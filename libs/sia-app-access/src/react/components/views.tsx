/** Render callbacks preserve caller markup and application controller ownership. */
import type { ReactNode } from "react";
import type { SiaAccess } from "@/access-types";
import { useSiaAccess } from "@/react/hooks/observation";
import type {
  SiaAccessBinding,
  SiaAccessReactOptions,
} from "@/react/hooks/observation";

export interface SiaAccessRenderProps<Session> extends SiaAccessReactOptions {
  readonly children: (binding: SiaAccessBinding<Session>) => ReactNode;
}
export interface SiaAccessViewProps<
  Session,
> extends SiaAccessRenderProps<Session> {
  readonly access: SiaAccess<Session>;
}
/** The caller renders all DOM and handles command outcomes; this view only observes access. */
export function SiaAccessView<Session>(
  props: SiaAccessViewProps<Session>,
): ReactNode {
  const binding = useSiaAccess(props.access, props);
  return props.children(binding);
}
