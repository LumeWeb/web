const initTracking = (): void => {
  const _paq: any[] = ((window as any)._paq = (window as any)._paq || []);
  const scriptSource: string =
    process.env.TRACKING_SCRIPT_URL || "//piwiki.lumeweb.com/";
  const siteId: string = process.env.TRACKING_SITE_ID || "4";

  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);
  _paq.push(["setTrackerUrl", scriptSource + "matomo.php"]);
  _paq.push(["setSiteId", siteId]);

  const d: Document = document;
  const g: HTMLScriptElement = d.createElement("script");
  const s: HTMLScriptElement = d.getElementsByTagName(
    "script"
  )[0] as HTMLScriptElement;
  g.async = true;
  g.src = scriptSource + "matomo.js";
  s.parentNode?.insertBefore(g, s);

  g.onerror = () => {
    console.error("Error loading the tracking script.");
  };
};

export default initTracking;
