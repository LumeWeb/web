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
  const reconnectError = useStore(useAuthStore, (s) => s.reconnectError);

  // Retaining the account key after failure must not rearm automatic reconnect.
  // Sharing sessions use their own credential without opening an account SDK.
  useEffect(() => {
    if (status === AuthStatus.Disconnected && userKeyHex && !sharingKeyHex && !reconnectError) {
      void reconnect();
    }
  }, [reconnect, reconnectError, sharingKeyHex, status, userKeyHex]);

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
