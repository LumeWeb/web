import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lumeweb/portal-framework-ui-core";

type Platform = "unix" | "windows";

const INSTALL_COMMANDS: Record<Platform, string> = {
  unix: "curl -fsSL https://get.pinner.xyz | sh",
  windows: "irm https://pinner.xyz/install.ps1 | iex",
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unix";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  return "unix";
}

export function CliInstallBlock() {
  const [activePlatform, setActivePlatform] = useState<Platform>(detectPlatform);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(INSTALL_COMMANDS[activePlatform]).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activePlatform]);

  return (
    <Tabs
      value={activePlatform}
      onValueChange={(v) => setActivePlatform(v as Platform)}
      className="mt-2"
    >
      <div className="inline-block w-fit max-w-full rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center bg-muted border-b px-2">
          <TabsList>
            <TabsTrigger value="unix">Linux / macOS</TabsTrigger>
            <TabsTrigger value="windows">Windows</TabsTrigger>
          </TabsList>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 ml-auto rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Copy command"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <TabsContent value="unix" className="mt-0">
          <div className="flex items-center px-4 py-3">
            <code className="text-sm font-mono text-green-600 dark:text-green-400">
              {INSTALL_COMMANDS.unix}
            </code>
          </div>
        </TabsContent>
        <TabsContent value="windows" className="mt-0">
          <div className="flex items-center px-4 py-3">
            <code className="text-sm font-mono text-green-600 dark:text-green-400">
              {INSTALL_COMMANDS.windows}
            </code>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
