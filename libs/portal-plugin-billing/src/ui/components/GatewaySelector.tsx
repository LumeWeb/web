import type { GatewayPublicInfo } from "@/types/subscription";
import {
  Button,
  cn,
  Skeleton,
} from "@lumeweb/portal-framework-ui-core";
import { createNamespacedId, useCapability } from "@lumeweb/portal-framework-core";
import type { Capability as BillingRefineConfig } from "@/capabilities/refineConfig";
import { useEffect, useRef, useState } from "react";

function useBillingApiUrl(): string {
  const { data: capability } = useCapability<BillingRefineConfig>(createNamespacedId("billing", "refine-config"));
  return capability?.getApiUrl() ?? "";
}

interface GatewaySelectorProps {
  gateways: GatewayPublicInfo[];
  selectedGatewayId?: string;
  onSelect: (gateway: GatewayPublicInfo) => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

function GatewayLogo({
  gateway,
  failed,
  onError,
}: {
  gateway: GatewayPublicInfo;
  failed: boolean;
  onError: () => void;
}) {
  const apiBaseUrl = useBillingApiUrl();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const onErrorRef = useRef(onError);

  // Keep the callback ref up to date
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Convert relative URLs to absolute using the configured API URL
  // Strip /api prefix if present since apiBaseUrl already includes it
  const logoUrl = gateway.logo_url?.startsWith("http")
    ? gateway.logo_url
    : `${apiBaseUrl}${gateway.logo_url?.replace(/^\/api/, "")}`;

  // Fetch SVG content for inline rendering
  useEffect(() => {
    let cancelled = false;

    fetch(logoUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load logo");
        return res.text();
      })
      .then((svg) => {
        if (cancelled) return;
        // Validate that content is SVG
        if (!svg.trim().startsWith("<svg") && !svg.includes("<svg")) {
          throw new Error("Invalid SVG content");
        }
        // Strip XML prolog and DOCTYPE — DOMParser in image/svg+xml mode
        // returns a parsererror document when these are present
        const cleanSvg = svg.replace(/<\?xml[^?]*\?>\s*/g, "").replace(/<!DOCTYPE[^>]*>\s*/g, "");
        // Parse SVG, set width/height for proper rendering in flex containers
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanSvg, "image/svg+xml");
        if (doc.querySelector("parsererror")) throw new Error("SVG parse error");
        const svgEl = doc.querySelector("svg");
        if (!svgEl) throw new Error("No SVG element found");
        svgEl.setAttribute("width", "100%");
        svgEl.setAttribute("height", "100%");

        // Scope all <style> selectors under the logo container class
        const scopeClass = `gw-logo-${gateway.id}`;
        svgEl.querySelectorAll("style").forEach((styleEl) => {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(styleEl.textContent ?? "");
          for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i];
            if (!(rule instanceof CSSStyleRule)) continue;
            rule.selectorText = rule.selectorText
              .split(",")
              .map((s: string) => `.${scopeClass} ${s.trim()}`)
              .join(", ");
          }
          styleEl.textContent = Array.from(sheet.cssRules, (r) => r.cssText).join("\n");
        });

        const svgWithDimensions = new XMLSerializer().serializeToString(svgEl);
        setSvgContent(svgWithDimensions);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        onErrorRef.current();
      });

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  if (failed || loadFailed || !gateway.logo_url) {
    return (
      <span className="text-xl font-semibold">
        {gateway.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  if (svgContent) {
    return (
      <div
        className={`gw-logo-${gateway.id} h-10 w-auto max-w-[80px] flex items-center justify-center`}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // Loading state - show a subtle placeholder
  return (
    <div className="h-10 w-20 bg-muted/30 rounded animate-pulse" />
  );
}

function GatewayCard({
  gateway,
  isSelected,
  onClick,
}: {
  gateway: GatewayPublicInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <button
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all text-left",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary"
          : "border-border/30 hover:border-primary/50 hover:bg-secondary/30"
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex h-12 items-center justify-center">
        <GatewayLogo
          failed={logoFailed}
          gateway={gateway}
          onError={() => setLogoFailed(true)}
        />
      </div>
      <div className="text-center">
        <p className="font-medium">{gateway.name}</p>
        {gateway.description && (
          <p className="text-muted-foreground text-xs mt-1">
            {gateway.description}
          </p>
        )}
      </div>
    </button>
  );
}


export function GatewaySelector({
  gateways,
  selectedGatewayId,
  onSelect,
  isLoading,
  error,
  onRetry,
  className,
}: GatewaySelectorProps) {
  if (isLoading) {
    return (
      <div className={cn("flex h-32 items-center justify-center", className)}>
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-border/30 bg-secondary/30 p-6 text-center", className)}>
        <p className="text-destructive text-sm">
          Failed to load payment gateways
        </p>
        {onRetry && (
          <Button className="mt-3" onClick={onRetry} size="sm" variant="outline">
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className={cn("rounded-lg border border-border/30 bg-secondary/30 p-6 text-center", className)}>
        <p className="text-muted-foreground text-sm">
          No payment gateways available
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
      {gateways.map((gateway) => (
        <GatewayCard
          gateway={gateway}
          isSelected={selectedGatewayId === gateway.id}
          key={gateway.id}
          onClick={() => onSelect(gateway)}
        />
      ))}
    </div>
  );
}
