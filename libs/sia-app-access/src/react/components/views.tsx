/** Render callbacks preserve caller markup and application controller ownership. */
import type { ReactNode } from "react";
import type { SiaAccess, SiaAccessInteractions } from "@/access-types";
import { useSiaAccess } from "@/react/hooks/observation";
import type {
  SiaAccessBinding,
  SiaAccessInteractionReactOptions,
  SiaAccessReactOptions,
} from "@/react/hooks/observation";
import {
  useSiaApproval,
  useSiaRecoveryPhrase,
  useSiaSaveRecovery,
} from "@/react/hooks/tasks";
import type {
  ApprovalTask,
  RecoveryPhraseTask,
  SaveRecoveryTask,
} from "@/react/hooks/tasks";

export interface ApprovalRenderProps extends SiaAccessInteractionReactOptions {
  readonly children: (task: ApprovalTask | null) => ReactNode;
}
export interface ApprovalViewProps<Session> extends ApprovalRenderProps {
  readonly access: SiaAccessInteractions<Session>;
}
export interface RecoveryPhraseRenderProps extends SiaAccessInteractionReactOptions {
  readonly children: (task: null | RecoveryPhraseTask) => ReactNode;
}

export interface RecoveryPhraseViewProps<
  Session,
> extends RecoveryPhraseRenderProps {
  readonly access: SiaAccessInteractions<Session>;
}
export interface SaveRecoveryRenderProps extends SiaAccessInteractionReactOptions {
  readonly children: (task: null | SaveRecoveryTask) => ReactNode;
}
export interface SaveRecoveryViewProps<
  Session,
> extends SaveRecoveryRenderProps {
  readonly access: SiaAccessInteractions<Session>;
}

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

export function SiaApprovalView<Session>(
  props: ApprovalViewProps<Session>,
): ReactNode {
  const task = useSiaApproval(props.access, props);
  return props.children(task);
}
export function SiaRecoveryPhraseView<Session>(
  props: RecoveryPhraseViewProps<Session>,
): ReactNode {
  const task = useSiaRecoveryPhrase(props.access, props);
  return props.children(task);
}
export function SiaSaveRecoveryView<Session>(
  props: SaveRecoveryViewProps<Session>,
): ReactNode {
  const task = useSiaSaveRecovery(props.access, props);
  return props.children(task);
}
