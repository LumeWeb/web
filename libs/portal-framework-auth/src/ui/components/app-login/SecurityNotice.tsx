import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

const ShieldCheck = lazyIcon("ShieldCheck");

interface SecurityNoticeProps {
  appName: string;
}

export function SecurityNotice({ appName }: SecurityNoticeProps) {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 text-secondary" />
      <span>
        Your password is entered only on this portal and is never shared
        with {appName}.
      </span>
    </div>
  );
}
