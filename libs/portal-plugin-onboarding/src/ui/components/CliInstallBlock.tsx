import { useState, useCallback } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger, cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Copy = lazyIcon("Copy");
const Check = lazyIcon("Check");


type Platform = "unix" | "windows";
type WindowsShell = "powershell" | "cmd";

const UNIX_COMMAND = "curl -fsSL https://get.pinner.xyz | sh";
const WINDOWS_COMMANDS: Record<WindowsShell, string> = {
  powershell: "irm https://get.pinner.xyz/install.ps1 | iex",
  cmd: 'powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://get.pinner.xyz/install.ps1 | iex"',
};

const WINDOWS_SHELL_LABELS: Record<WindowsShell, string> = {
  powershell: "PowerShell",
  cmd: "Command Prompt",
};

const SHELL_TAB_BASE =
  "pb-0.5 border-b-2 transition-colors";
const SHELL_TAB_ACTIVE = "border-foreground text-foreground";
const SHELL_TAB_INACTIVE =
  "border-transparent text-muted-foreground hover:text-foreground";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unix";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  return "unix";
}

export function CliInstallBlock() {
  const [activePlatform, setActivePlatform] = useState<Platform>(detectPlatform);
  const [windowsShell, setWindowsShell] = useState<WindowsShell>("powershell");
  const [copied, setCopied] = useState(false);

  const activeCommand =
    activePlatform === "unix"
      ? UNIX_COMMAND
      : WINDOWS_COMMANDS[windowsShell];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeCommand).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activeCommand]);

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
          <div className="px-4 py-3">
            <code className="text-sm font-mono text-green-600 dark:text-green-400 block">
              {UNIX_COMMAND}
            </code>
            <p className="mt-2 text-xs text-muted-foreground">
              Paste into your terminal and press Enter.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="windows" className="mt-0">
          <div className="px-4 py-3">
            <div className="flex gap-3 mb-2 text-xs">
              {(Object.keys(WINDOWS_SHELL_LABELS) as WindowsShell[]).map((shell) => (
                <button
                  key={shell}
                  type="button"
                  onClick={() => setWindowsShell(shell)}
                  className={cn(
                    SHELL_TAB_BASE,
                    windowsShell === shell ? SHELL_TAB_ACTIVE : SHELL_TAB_INACTIVE,
                  )}
                >
                  {WINDOWS_SHELL_LABELS[shell]}
                </button>
              ))}
            </div>
            <code className="text-sm font-mono text-green-600 dark:text-green-400 block break-all">
              {WINDOWS_COMMANDS[windowsShell]}
            </code>
            <p className="mt-2 text-xs text-muted-foreground">
              {windowsShell === "powershell"
                ? "Paste into PowerShell and press Enter."
                : "Paste into Command Prompt (cmd.exe) and press Enter."}
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
