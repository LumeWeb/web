/** Typed context distributes an app-owned controller without changing its lifetime. */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { SiaAccess, SiaAccessInteractions } from "@/access-types";
import {
  useSiaAccess,
  useSiaAccessInteractions,
  useSiaAccessSelector,
} from "./hooks/observation.ts";
import {
  useSiaApproval,
  useSiaRecoveryPhrase,
  useSiaSaveRecovery,
} from "./hooks/tasks.ts";
import {
  SiaAccessView,
  SiaApprovalView,
  SiaRecoveryPhraseView,
  SiaSaveRecoveryView,
} from "./components/views.tsx";
import type {
  SiaAccessBinding,
  SiaAccessInteractionBinding,
  SiaAccessInteractionReactOptions,
  SiaAccessReactOptions,
  SiaAccessSelector,
} from "./hooks/observation.ts";
import type {
  ApprovalTask,
  RecoveryPhraseTask,
  SaveRecoveryTask,
} from "./hooks/tasks.ts";
import type {
  ApprovalRenderProps,
  RecoveryPhraseRenderProps,
  SaveRecoveryRenderProps,
  SiaAccessRenderProps,
} from "./components/views.tsx";

export interface SiaAccessContext<Session> {
  ApprovalView(props: ApprovalRenderProps): ReactNode;
  Provider(props: SiaAccessProviderProps<Session>): ReactNode;
  RecoveryPhraseView(props: RecoveryPhraseRenderProps): ReactNode;
  SaveRecoveryView(props: SaveRecoveryRenderProps): ReactNode;
  useAccess(options?: SiaAccessReactOptions): SiaAccessBinding<Session>;
  useApproval(options?: SiaAccessInteractionReactOptions): ApprovalTask | null;
  useInteractions(
    options?: SiaAccessInteractionReactOptions,
  ): SiaAccessInteractionBinding<Session>;
  useRecoveryPhrase(
    options?: SiaAccessInteractionReactOptions,
  ): null | RecoveryPhraseTask;
  useSaveRecovery(
    options?: SiaAccessInteractionReactOptions,
  ): null | SaveRecoveryTask;
  useSelector<Selection>(
    selector: SiaAccessSelector<Selection>,
    options?: SiaAccessReactOptions,
  ): Selection;
  View(props: SiaAccessRenderProps<Session>): ReactNode;
}
export interface SiaAccessProviderProps<Session> {
  readonly access: SiaAccess<Session>;
  readonly children?: ReactNode;
}
export function createSiaAccessContext<Session>(): SiaAccessContext<Session> {
  const Context = createContext<null | SiaAccess<Session>>(null);
  function useController(): SiaAccess<Session> {
    const access = useContext(Context);
    if (!access) throw new Error("Sia access Provider is missing");
    return access;
  }
  function hasInteractions(
    access: SiaAccess<Session>,
  ): access is SiaAccessInteractions<Session> {
    return "presentation" in access.getSnapshot();
  }
  function useInteractions(): SiaAccessInteractions<Session> {
    const access = useController();
    if (!hasInteractions(access))
      throw new Error(
        "Interaction hooks require a controller with interaction metadata",
      );
    return access;
  }
  return {
    ApprovalView: (props) => (
      <SiaApprovalView {...props} access={useInteractions()} />
    ),
    Provider({ access, children }) {
      return <Context value={access}>{children}</Context>;
    },
    RecoveryPhraseView: (props) => (
      <SiaRecoveryPhraseView {...props} access={useInteractions()} />
    ),
    SaveRecoveryView: (props) => (
      <SiaSaveRecoveryView {...props} access={useInteractions()} />
    ),
    useAccess(options) {
      return useSiaAccess(useController(), options);
    },
    useApproval: (options) => useSiaApproval(useInteractions(), options),
    useInteractions: (options) =>
      useSiaAccessInteractions(useInteractions(), options),
    useRecoveryPhrase: (options) =>
      useSiaRecoveryPhrase(useInteractions(), options),
    useSaveRecovery: (options) =>
      useSiaSaveRecovery(useInteractions(), options),
    useSelector(selector, options) {
      return useSiaAccessSelector(useController(), selector, options);
    },
    View(props) {
      return <SiaAccessView {...props} access={useController()} />;
    },
  };
}
