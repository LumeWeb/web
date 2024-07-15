import React, { useState } from "react";
import { Button } from "portal-shared/components/ui/button";
import { Input } from "portal-shared/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "portal-shared/components/ui/sheet";
import { MoreHorizontal, Search } from "lucide-react";
import usePluginMeta from "portal-shared/hooks/usePluginMeta";
import socialLoginProviders from "./SocialProviders";
import useAccountSubdomain from "@/hooks/useAccountSubdomain";
import { useParsed } from "@refinedev/core";

export default function SocialLogin() {
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

    let toPath = parsed.params?.to || "/";
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
    <div className="w-full max-w-[300px] space-y-3 mr-10">
      {visibleProviders.map(({ key, name, icon: Icon, bgColor }) => (
        <Button
          key={key}
          variant="outline"
          className={`w-full ${bgColor} text-white hover:opacity-90`}
          onClick={() => handleLogin(key)}>
          <Icon className="w-5 h-5 mr-2" />
          Continue with {name}
        </Button>
      ))}

      {remainingProviders.length > 0 && (
        <Sheet open={isExtraOpen} onOpenChange={setIsExtraOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
              More options
              <MoreHorizontal className="w-5 h-5 m-2" />
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
                  type="search"
                  placeholder="Search login options..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              {filteredOptions.map(({ key, name, icon: Icon, bgColor }) => (
                <Button
                  key={key}
                  variant="outline"
                  className={`w-full justify-start ${bgColor} text-white hover:opacity-90`}
                  onClick={() => handleLogin(key)}>
                  <Icon className="w-5 h-5 mr-2" />
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
