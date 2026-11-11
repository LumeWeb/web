import { useEffect } from "react";
import { useStore } from "zustand";
import { demoAccount, useDemoAccountSnapshot } from "../../stores/auth";
import { demoSettingsStore } from "../../stores/authSettings";
import { PlayerScreen } from "../player/PlayerScreen";
import { selectAuthStep, shouldAutoReconnect } from "./authFlow";
import { ApproveScreen } from "./ApproveScreen";
import { GateScreen } from "./GateScreen";
import { LoadingScreen } from "./LoadingScreen";
import { RecoveryScreen } from "./RecoveryScreen";

export function AuthFlow() {
  const indexerUrl = useStore(demoSettingsStore, (s) => s.indexerUrl);
  const sharingKeyHex = useStore(demoSettingsStore, (s) => s.sharingKeyHex);
  const approvalContinueRequired = useStore(
    demoSettingsStore,
    (s) => s.approvalContinueRequired,
  );
  const snapshot = useDemoAccountSnapshot();
  const savedUserKeyHex = useStore(demoSettingsStore, (s) => s.savedUserKeyHex);
  const reconnectError = useStore(demoSettingsStore, (s) => s.reconnectError);
  const accountError = useStore(demoSettingsStore, (s) => s.accountError);

  // Automatic reconnect after a failed account request would replace its error
  // before the user can retry. Sharing sessions do not open an account SDK.
  useEffect(() => {
    if (
      shouldAutoReconnect({
        accountError,
        reconnectError,
        savedUserKeyHex,
        sharingKeyHex,
        snapshot,
      })
    ) {
      void demoAccount.reconnect();
    }
  }, [accountError, reconnectError, savedUserKeyHex, sharingKeyHex, snapshot]);

  const step = selectAuthStep({
    approvalContinueRequired,
    sharingKeyHex,
    snapshot,
  });

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
