import {
  Input,
  usePluginMeta,
} from "@lumeweb/portal-framework-ui";
import {
  Button,
  cn,
  lazyIcon,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lumeweb/portal-framework-ui-core";

import React, { useState } from "react";

import { useSsoUrl } from "@/hooks/useSsoUrl";
import { AuthConsentNotice } from "@/ui/components/common/AuthConsentNotice";
import socialLoginProviders from "@/ui/components/common/SocialProviders";

const MoreHorizontal = lazyIcon("MoreHorizontal");
const Search = lazyIcon("Search");

/** Live providers above this count overflow into the "More login options" Sheet. */
const SHEET_THRESHOLD = 3;
/** Labeled buttons shown in the stack before the Sheet takes over. */
const VISIBLE_PROVIDER_COUNT = 2;
const DEFAULT_DIVIDER_LABEL = "Or continue with email";
/** Neutral bg for provider ids unknown to the generated map. */
const UNKNOWN_PROVIDER_BG = "bg-gray-500";

export interface AuthProvidersProps {
  /**
   * Label for the separator rendered below the provider stack. Pass a falsy
   * value to omit the divider entirely (e.g. when the logo-in row sits above
   * a non-email form).
   */
  dividerLabel?: string;
}

interface ProviderOption {
  /** Final Tailwind classes for the leading icon chip of the button. */
  chipClass: string;
  icon?: React.ComponentType<React.SVGAttributes<SVGSVGElement>>;
  key: string;
  name: string;
}

/**
 * Shared social-login slot used by the login and register auth pages.
 *
 * Providers are resolved from dashboard plugin meta (`social_providers`) and
 * resolved against the build-time generated provider map. Ids unknown to the
 * generated map are not dropped — they render a lettered-avatar fallback
 * (initial + neutral disc, same chip) so freshly enabled backend providers
 * stay usable even with a stale generated module. With no resolved providers
 * the component renders nothing (callers gate on the `social_login` feature
 * flag themselves).
 *
 * Layout: a full-width stack of labeled outline buttons ("Continue with X")
 * matching the wallet button. Up to three live providers render directly in
 * the stack; beyond that the stack shows the first two and the rest move
 * into the searchable "More login options" Sheet.
 */
export function AuthProviders({
  dividerLabel = DEFAULT_DIVIDER_LABEL,
}: AuthProvidersProps) {
  const liveProviders = usePluginMeta<string[]>(
    "dashboard",
    "social_providers",
  );
  const ssoUrl = useSsoUrl();
  const orderedProviders = (liveProviders ?? []).map((provider) => {
    const known = socialLoginProviders.get(provider);
    const name = known?.name ?? humanizeProviderId(provider);
    return {
      chipClass: known?.className
        ? // Override-provided `className` (brand-guideline compliance)
          // replaces the generated brand bg + default text treatment on the
          // chip — a neutral vessel (e.g. white bg + #747775 border for
          // Google) per the override's semantics.
          cn("rounded-md", known.className)
        : // Otherwise the default treatment: brand-bg disc + white glyph.
          cn(
            "rounded-full",
            known?.bgColor ?? UNKNOWN_PROVIDER_BG,
            "text-white",
          ),
      icon: known?.icon,
      key: provider,
      name,
    };
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isExtraOpen, setIsExtraOpen] = useState(false);

  const visibleProviders =
    orderedProviders.length > SHEET_THRESHOLD
      ? orderedProviders.slice(0, VISIBLE_PROVIDER_COUNT)
      : orderedProviders;
  const remainingProviders = orderedProviders.slice(visibleProviders.length);

  const filteredOptions = remainingProviders.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLogin = (providerId: string) => {
    setIsExtraOpen(false);
    window.location.href = ssoUrl(providerId);
  };

  if (orderedProviders.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex w-full flex-col gap-2">
        {visibleProviders.map((option) => (
          <ProviderButton key={option.key} onLogin={handleLogin} option={option} />
        ))}

        {remainingProviders.length > 0 && (
          <Sheet onOpenChange={setIsExtraOpen} open={isExtraOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="More login options"
                className="relative w-full text-muted-foreground"
                title="More login options"
                variant="outline">
                <span className="absolute left-3 flex h-7 w-7 items-center justify-center">
                  <MoreHorizontal className="h-5 w-5" />
                </span>
                More login options
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>More login options</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    className="pl-8"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search login options..."
                    type="search"
                    value={searchTerm}
                  />
                </div>
              </div>
              <div className="space-y-2">
                {filteredOptions.map((option) => (
                  <Button
                    aria-label={`Continue with ${option.name}`}
                    className="relative w-full"
                    key={option.key}
                    onClick={() => handleLogin(option.key)}
                    variant="outline">
                    <span
                      className={cn(
                        "absolute left-3 flex h-7 w-7 items-center justify-center",
                        option.chipClass,
                      )}>
                      {option.icon ? (
                        <option.icon className="h-5 w-5" />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="text-sm font-semibold">
                          {option.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    Continue with {option.name}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Passive ToS/Privacy consent — SSO bypasses the register form's
          explicit consent checkbox, so the disclosure travels with the row. */}
      <AuthConsentNotice />

      {dividerLabel && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              {dividerLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function humanizeProviderId(providerId: string) {
  return providerId
    .split(/[-_.]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * One labeled full-width outline provider button: brand icon on an icon
 * chip + visible "Continue with {Name}" text. Matches WalletLogin's
 * sizing (default-height outline Button) so wallet + social form one column.
 */
function ProviderButton({
  onLogin,
  option,
}: {
  onLogin: (providerId: string) => void;
  option: ProviderOption;
}) {
  const { chipClass, icon: Icon, key, name } = option;

  return (
    <Button
      aria-label={`Continue with ${name}`}
      className="relative w-full"
      onClick={() => onLogin(key)}
      variant="outline">
      <span
        className={cn(
          "absolute left-3 flex h-7 w-7 items-center justify-center",
          chipClass,
        )}>
        {Icon ? (
          <Icon className="h-5 w-5" />
        ) : (
          <span aria-hidden="true" className="text-sm font-semibold">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      Continue with {name}
    </Button>
  );
}


