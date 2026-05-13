import { useEffect, useRef } from "react";
import type { CheckoutUIFragment } from "@/types/subscription";
import { decodeHTML } from "entities";
import { useFragmentQueue } from "@/ui/context/FragmentQueueContext";

export interface FragmentRendererProps {
  fragments: CheckoutUIFragment[];
  /** Session ID for the checkout flow (used for debugging/logging) */
  sessionId?: string;
}

function FragmentCleanup() {
  const { runCleanup } = useFragmentQueue();
  useEffect(() => () => runCleanup(), [runCleanup]);
  return null;
}

function LinkFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  return (
    <a
      href={fragment.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline hover:no-underline"
    >
      {decodeHTML(fragment.html ?? "") || fragment.link}
    </a>
  );
}

function HtmlFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { executeInlineScripts } = useFragmentQueue();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scripts = container.querySelectorAll("script");
    if (scripts.length === 0) return;

    executeInlineScripts(container);
  }, [fragment.html, executeInlineScripts]);

  return (
    <div
      ref={containerRef}
      className="fragment-html"
      dangerouslySetInnerHTML={{ __html: decodeHTML(fragment.html ?? "") }}
    />
  );
}

interface UseScriptOptions {
  scriptText: string | undefined;
  getMountPoint: () => HTMLElement | null;
  isUrl: boolean;
}

function useScript({ scriptText, getMountPoint, isUrl }: UseScriptOptions) {
  const appendedScriptRef = useRef<HTMLScriptElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const { executeScript } = useFragmentQueue();

  useEffect(() => {
    controllerRef.current = new AbortController();
    const content = scriptText ?? "";
    if (!content) return;
    if (isUrl && !content.startsWith("http")) return;

    const mountPoint = getMountPoint();
    if (!mountPoint) return;

    const script = document.createElement("script");
    if (isUrl) {
      script.setAttribute("src", content);
      script.setAttribute("async", "true");
    } else {
      script.textContent = content;
    }

    executeScript(script, mountPoint, controllerRef.current.signal).then((el) => {
      if (controllerRef.current?.signal.aborted && el?.parentNode) {
        el.remove();
      } else {
        appendedScriptRef.current = el ?? null;
      }
    });

    return () => {
      controllerRef.current?.abort();
      if (appendedScriptRef.current?.parentNode) {
        appendedScriptRef.current.remove();
      }
      appendedScriptRef.current = null;
    };
  }, [scriptText, isUrl, getMountPoint, executeScript]);
}

function ScriptFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const decoded = decodeHTML(fragment.script ?? "");

  useScript({
    scriptText: decoded,
    isUrl: false,
    getMountPoint: () => containerRef.current,
  });

  return <div ref={containerRef} className="fragment-script" />;
}

function ScriptUrlFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  useScript({
    scriptText: fragment.script,
    isUrl: true,
    getMountPoint: () => document.body,
  });

  return null;
}

function IframeFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  const src = fragment.link || fragment.html;
  if (!src) return null;

  return (
    <iframe
      src={src}
      className="fragment-iframe h-64 w-full border-0"
      title="Checkout iframe"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}

function ModalFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  return (
    <div className="fragment-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background max-h-[80vh] max-w-lg overflow-auto rounded-lg p-6 shadow-lg">
        {fragment.html && (
          <div dangerouslySetInnerHTML={{ __html: decodeHTML(fragment.html) }} />
        )}
        {fragment.link && (
          <a
            href={fragment.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            Open link
          </a>
        )}
      </div>
    </div>
  );
}

function ButtonFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  return (
    <>
      <style>{`.fragment-button button {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  width: 100%;
}
.fragment-button button:hover { opacity: 0.9; }
`}</style>
      <div
        className="fragment-button"
        dangerouslySetInnerHTML={{ __html: decodeHTML(fragment.html ?? "") || "" }}
      />
    </>
  );
}

function FormFragment({ fragment }: { fragment: CheckoutUIFragment }) {
  return (
    <div
      className="fragment-form"
      dangerouslySetInnerHTML={{ __html: decodeHTML(fragment.html ?? "") }}
    />
  );
}

function CssInjector({ fragments }: { fragments: CheckoutUIFragment[] }) {
  const cssFragments = fragments.filter((f) => f.css);
  const cssContent = cssFragments.map((f) => f.css).join("\n");

  useEffect(() => {
    if (!cssContent) return;
    const style = document.createElement("style");
    style.textContent = cssContent;
    style.setAttribute("data-billing-fragments", "true");
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [cssContent]);

  return null;
}

const FRAGMENT_RENDERERS: Record<string, React.ComponentType<{ fragment: CheckoutUIFragment }>> = {
  link: LinkFragment,
  html: HtmlFragment,
  script: ScriptFragment,
  script_url: ScriptUrlFragment,
  iframe: IframeFragment,
  modal: ModalFragment,
  button: ButtonFragment,
  form: FormFragment,
};

export function FragmentRenderer({
  fragments,
}: FragmentRendererProps) {
  const safeFragments = fragments ?? [];

  return (
    <>
      <FragmentCleanup />
      <CssInjector fragments={safeFragments} />
      {safeFragments.map((fragment, index) => {
        const Renderer = FRAGMENT_RENDERERS[fragment.type];
        if (!Renderer) {
          console.warn(`Unknown fragment type: ${fragment.type}`);
          return null;
        }
        return (
          <div key={`${fragment.type}-${index}`} className="billing-fragment">
            <Renderer fragment={fragment} />
          </div>
        );
      })}
    </>
  );
}
