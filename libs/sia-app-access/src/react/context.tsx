/** Typed context distributes an app-owned controller without changing its lifetime. */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { SiaAccess, SiaAccessInteractions } from "@/access-types";
import {
  useSiaAccess,
  useSiaAccessInteractions,
  useSiaAccessSelector,
} from "./hooks/observation.ts";
import type {
  SiaAccessBinding,
  SiaAccessInteractionBinding,
  SiaAccessInteractionReactOptions,
  SiaAccessReactOptions,
  SiaAccessSelector,
} from "./hooks/observation.ts";
import { SiaAccessView } from "./components/views.tsx";
import type { SiaAccessRenderProps } from "./components/views.tsx";

export interface SiaAccessContext<Session> {
  Provider(props: SiaAccessProviderProps<Session>): ReactNode;
  useAccess(options?: SiaAccessReactOptions): SiaAccessBinding<Session>;
  useInteractions(
    options?: SiaAccessInteractionReactOptions,
  ): SiaAccessInteractionBinding<Session>;
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
        "Interaction observation requires a controller with interaction metadata",
      );
    return access;
  }
  return {
    Provider({ access, children }) {
      return <Context value={access}>{children}</Context>;
    },
    useAccess(options) {
      return useSiaAccess(useController(), options);
    },
    useInteractions: (options) =>
      useSiaAccessInteractions(useInteractions(), options),
    useSelector(selector, options) {
      return useSiaAccessSelector(useController(), selector, options);
    },
    View(props) {
      return <SiaAccessView {...props} access={useController()} />;
    },
  };
}
