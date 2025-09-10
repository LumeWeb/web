import {
  Input,
  useAccountSubdomain,
  usePluginMeta,
} from "@lumeweb/portal-framework-ui";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { useParsed } from "@refinedev/core";
import { MoreHorizontal, Search } from "lucide-react";
import React, { useState } from "react";

import socialLoginProviders from "./SocialProviders";

export function SocialLogin() {
  const socialLoginProvidersList =
    usePluginMeta<string[]>("dashboard", "social_providers") ||
    Array.from(socialLoginProviders.keys());

  const accountSubdomain = useAccountSubdomain();
  const parsed = useParsed();

  const [searchTerm, setSearchTerm] = useState("");
  const [isExtraOpen, setIsExtraOpen] = useState(false);

  const orderedProviders = socialLoginProvidersList
    .filter((provider) => socialLoginProviders.has(provider))
    .map((provider) => ({
      key: provider,
      ...socialLoginProviders.get(provider)!,
    }));

  const visibleProviders = orderedProviders.slice(0, 3);
  const remainingProviders = orderedProviders.slice(3);

  const filteredOptions = remainingProviders.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLogin = (providerId: string) => {
    setIsExtraOpen(false);
    const queryParams = new URLSearchParams();

    const toPath = parsed.params?.to || "/";
    const currentUrl = new URL(window.location.href);
    const currentProtocol = currentUrl.protocol;
    const currentDomain = currentUrl.hostname;
    const currentPort = currentUrl.port;

    // Construct the return URL, including protocol and port if necessary
    let returnUrl = `${currentProtocol}//${currentDomain}`;
    if (
      currentPort &&
      !(
        (currentProtocol === "http:" && currentPort === "80") ||
        (currentProtocol === "https:" && currentPort === "443")
      )
    ) {
      returnUrl += `:${currentPort}`;
    }
    returnUrl += toPath;

    queryParams.set("return", returnUrl);
    window.location.href = `https://${accountSubdomain}/api/account/auth/sso/${providerId}?${queryParams.toString()}`;
  };

  return (
    <div className="mr-10 w-full max-w-[300px] space-y-3">
      {visibleProviders.map(({ bgColor, icon: Icon, key, name }) => (
        <Button
          className={`w-full ${bgColor} text-white hover:opacity-90`}
          key={key}
          onClick={() => handleLogin(key)}
          variant="outline">
          <Icon className="mr-2 h-5 w-5" />
          Continue with {name}
        </Button>
      ))}

      {remainingProviders.length > 0 && (
        <Sheet onOpenChange={setIsExtraOpen} open={isExtraOpen}>
          <SheetTrigger asChild>
            <Button
              className="w-full border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
              variant="outline">
              More options
              <MoreHorizontal className="m-2 h-5 w-5" />
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
              {filteredOptions.map(({ bgColor, icon: Icon, key, name }) => (
                <Button
                  className={`w-full justify-start ${bgColor} text-white hover:opacity-90`}
                  key={key}
                  onClick={() => handleLogin(key)}
                  variant="outline">
                  <Icon className="mr-2 h-5 w-5" />
                  Continue with {name}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
