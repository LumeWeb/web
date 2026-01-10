import { AbuseReportResponse } from "@/types";
import { Home } from "@/ui/components/Home";
import { useDialog } from "@lumeweb/portal-framework-ui";
import { useGo } from "@refinedev/core";
import { FlagIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";

import { DIALOG_IDS } from "../dialogs/dialog-ids";
import {
  getConfirmationDialogConfig,
  getReportDialogConfig,
} from "../dialogs/reportDialogs";

function Report() {
  const location = useLocation();

  return (
    <Home>
      <ReportDialogTrigger />
    </Home>
  );
}

function ReportDialogTrigger() {
  const { closeDialog, currentDialog, openDialog, replaceDialog } = useDialog();
  const didOpen = useRef(false);
  const baseGo = useGo();
  const go = useGo();
  const handleConfirmationCancel = useCallback(() => {
    go({ to: "/", type: "replace" });
  }, [go]);

  const handleViewCase = useCallback(
    (accessKey: string) => {
      closeDialog();
      localStorage.setItem("caseAccessToken", accessKey);
      go({ to: "/case/access" });
    },
    [closeDialog, go],
  );

  const handleCancel = useCallback(() => {
    go({ to: "/" });
  }, [go]);

  const handleSuccess = useCallback(
    (data: AbuseReportResponse) => {
      replaceDialog(
        getConfirmationDialogConfig({
          data,
          onCancel: handleConfirmationCancel,
          onViewCase: () => handleViewCase(data.access_token),
        }),
      );
    },
    [replaceDialog, handleConfirmationCancel, handleViewCase],
  );

  const handleErrorNotification = useCallback(
    (error: any) => ({
      description: error?.message || "An unknown error occurred.",
      message: "Failed to submit report",
      type: "error" as const,
    }),
    [],
  );

  const reportIcon = useMemo(
    () => <FlagIcon className="h-6 w-6 text-primary" />,
    [],
  );

  const reportDialogConfig = useMemo(
    () =>
      getReportDialogConfig({
        errorNotification: handleErrorNotification,
        go,
        icon: reportIcon,
        onCancel: handleCancel,
        onSuccess: handleSuccess,
        replaceDialog,
      }),
    [
      go,
      replaceDialog,
      handleCancel,
      handleSuccess,
      handleErrorNotification,
      reportIcon,
    ],
  );

  useEffect(() => {
    if (!didOpen.current) {
      const currentDialogId = currentDialog?.id;
      const isReportFlowActive =
        currentDialogId === DIALOG_IDS.REPORT_FORM ||
        currentDialogId === DIALOG_IDS.REPORT_CONFIRMATION;

      if (!isReportFlowActive) {
        openDialog(reportDialogConfig);
      }
      didOpen.current = true;
    }
  }, []);

  return null;
}

export default Report;
