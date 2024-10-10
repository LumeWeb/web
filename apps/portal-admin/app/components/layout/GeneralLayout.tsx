import { GeneralLayout as GeneralLayoutBase } from "portal-shared/components/layout/GeneralLayout";
import { ReactNode } from "react";

interface GeneralLayoutWrapperProps {
  children?: ReactNode;
}

function GeneralLayout({ children }: GeneralLayoutWrapperProps): JSX.Element {
  return (
    <GeneralLayoutBase showUploadForm={false}>{children}</GeneralLayoutBase>
  );
}

export default GeneralLayout;
