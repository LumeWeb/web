import { useEffect } from "react";
import { captureUTMsFromURL, saveUTMParams, loadUTMParams } from "@/lib/utm";

const UTMCapture = () => {
  useEffect(() => {
    const utms = captureUTMsFromURL();
    if (utms) {
      saveUTMParams(utms);
    }

    const stored = loadUTMParams();
    if (Object.keys(stored).length > 0 && window.posthog) {
      window.posthog.register_for_session({ ...stored });
    }
  }, []);

  return null;
};

export default UTMCapture;
