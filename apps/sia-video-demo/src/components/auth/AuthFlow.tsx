import { useEffect } from "react";
import { useStore } from "zustand";
import { useAuthStore } from "../../stores/auth";
import { PlayerScreen } from "../player/PlayerScreen";
import { selectAuthStep, shouldAutoReconnect } from "./authFlow";
import { ApproveScreen } from "./ApproveScreen";
import { GateScreen } from "./GateScreen";
import { LoadingScreen } from "./LoadingScreen";
import { RecoveryScreen } from "./RecoveryScreen";

export function AuthFlow() {
  const indexerUrl = useStore(useAuthStore, (s) => s.indexerUrl);
  const sharingKeyHex = useStore(useAuthStore, (s) => s.sharingKeyHex);
  const status = useStore(useAuthStore, (s) => s.status);
  const savedUserKeyHex = useStore(useAuthStore, (s) => s.savedUserKeyHex);
  const reconnect = useStore(useAuthStore, (s) => s.reconnect);
  const reconnectError = useStore(useAuthStore, (s) => s.reconnectError);
  const accountError = useStore(useAuthStore, (s) => s.accountError);

  // Automatic reconnect after a failed account request would replace its error
  // before the user can retry. Sharing sessions do not open an account SDK.
  useEffect(() => {
    if (
      shouldAutoReconnect({
        accountError,
        reconnectError,
        savedUserKeyHex,
        sharingKeyHex,
        status,
      })
    ) {
      void reconnect();
    }
  }, [
    accountError,
    reconnect,
    reconnectError,
    savedUserKeyHex,
    sharingKeyHex,
    status,
  ]);

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
