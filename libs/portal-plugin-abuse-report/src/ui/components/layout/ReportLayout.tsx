import { ReportButton } from "@/ui/components/ReportButton";
import { withTheme } from "@lumeweb/portal-framework-ui";
import { useGo } from "@refinedev/core";
import React from "react";
import "@lumeweb/portal-framework-ui-core/tailwind.css";
import "@/css/styles.css";
import { Link, Outlet } from "react-router";

import { Footer } from "./Footer";
import { Header } from "./Header";

function _ReportLayout() {
  const go = useGo();
  const handleReportClick = () => {
    go({ to: "/report" });
  };

  return (
    <>
      <Header
        rightContent={
          <Link
            to={{
              pathname: "/report",
            }}>
            <ReportButton
              className="h-12 py-0 text-base"
              onClick={handleReportClick}>
              Report an abuse
            </ReportButton>
          </Link>
        }
      />
      <Outlet />
      <Footer />
    </>
  );
}

export const ReportLayout = withTheme(_ReportLayout);
