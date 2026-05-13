import * as React from "react";
import { useConsent } from "@lumeweb/analytics";
import type { ConsentCategory } from "@lumeweb/analytics";

import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

function getPortalUrl(path: string): string {
  const domain = import.meta.env.VITE_PORTAL_DOMAIN;
  if (!domain) return path;
  return `https://${domain}${path}`;
}

interface CookieCategoryConfig {
  key: ConsentCategory;
  label: string;
  description: string;
}

const COOKIE_CATEGORIES: CookieCategoryConfig[] = [
  {
    key: "analytics",
    label: "Analytics",
    description: "Help us improve by tracking page visits and interactions",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Receive targeted advertisements based on your activity",
  },
  {
    key: "functional",
    label: "Functional",
    description: "Remember your preferences and settings",
  },
];

function CookieBanner({ className, ...props }: React.ComponentProps<typeof Sheet>) {
  const { status, categories, acceptAll, rejectAll, customize, isConsentExpired } =
    useConsent();

  const [customizing, setCustomizing] = React.useState(false);
  const [localCategories, setLocalCategories] = React.useState<
    Record<ConsentCategory, boolean>
  >(() => ({ ...categories }));

  // Show banner when consent is pending or expired
  const open = status === "pending" || isConsentExpired();

  // Sync local categories when banner opens
  React.useEffect(() => {
    if (open) {
      setLocalCategories({ ...categories });
      setCustomizing(false);
    }
  }, [open, categories]);

  const handleCategoryToggle = (key: ConsentCategory) => {
    setLocalCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    customize(localCategories);
  };

  return (
    <Sheet open={open} {...props}>
      <SheetContent
        side="bottom"
        className={cn(
          "mx-auto max-w-3xl rounded-t-lg border-b-0",
          className,
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">We value your privacy</SheetTitle>
          <SheetDescription>
            We use cookies to enhance your browsing experience, serve personalized
            content, and analyze our traffic. You can choose which categories to
            allow.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex gap-3">
          <Button
            onClick={acceptAll}
            variant="default"
            className="flex-1 h-10 font-medium"
          >
            Accept All
          </Button>
          <Button
            onClick={rejectAll}
            variant="outline"
            className="flex-1 h-10 font-medium"
          >
            Reject All
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setCustomizing((prev) => !prev)}
          className="mt-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          {customizing ? "Hide options" : "Customize"}
        </button>

        {customizing && (
          <div className="mt-4 space-y-4">
            {COOKIE_CATEGORIES.map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={localCategories[key]}
                  onCheckedChange={() => handleCategoryToggle(key)}
                />
              </div>
            ))}

            <Button
              onClick={handleSavePreferences}
              variant="default"
              className="w-full h-10 font-medium"
            >
              Save Preferences
            </Button>
          </div>
        )}

        <div className="mt-4 border-t pt-3 flex gap-4">
          <a
            href={getPortalUrl("/privacy-policy")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href={getPortalUrl("/terms-of-service")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

CookieBanner.displayName = "CookieBanner";

export { CookieBanner };
