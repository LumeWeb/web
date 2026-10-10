import { useEffect } from "react";
import { useStore } from "zustand";
import { useAuthStore } from "../../stores/auth";
import { PlayerScreen } from "../player/PlayerScreen";
import { AuthStatus, selectAuthStep } from "./authFlow";
import { ApproveScreen } from "./ApproveScreen";
import { GateScreen } from "./GateScreen";
import { LoadingScreen } from "./LoadingScreen";
import { RecoveryScreen } from "./RecoveryScreen";

export function AuthFlow() {
  const indexerUrl = useStore(useAuthStore, (s) => s.indexerUrl);
  const sharingKeyHex = useStore(useAuthStore, (s) => s.sharingKeyHex);
  const status = useStore(useAuthStore, (s) => s.status);
  const userKeyHex = useStore(useAuthStore, (s) => s.userKeyHex);
  const reconnect = useStore(useAuthStore, (s) => s.reconnect);

  // A persisted app-key seed is reconnected whenever the store is in (or
  // returns to) `Disconnected` while a user key is present, so a reloaded SSO
  // session returns straight to the player and a transient failure re-arms the
  // retry. The connection is idempotent: `reconnect` skips any non-disconnected
  // store, so this effect only ever starts one in-flight attempt. A sharing key
  // never waits on this (see `selectAuthStep`), so keyless sessions are skipped.
  useEffect(() => {
    if (status === AuthStatus.Disconnected && userKeyHex) void reconnect();
  }, [reconnect, status, userKeyHex]);

  const step = selectAuthStep({ sharingKeyHex, status });

  switch (step) {
    case "approve":
      return <ApproveScreen />;
    case "loading":
      return <LoadingScreen label={`Connecting to ${indexerUrl}…`} />;
    case "player":
      return <PlayerScreen />;
    case "recovery":
      return <RecoveryScreen />;
    default:
      return <GateScreen />;
  }
}
