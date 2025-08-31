import React from "react";

interface ApiKeyAlertMessageProps {
  apiKey: string;
}

export function ApiKeyAlertMessage({ apiKey }: ApiKeyAlertMessageProps) {
  return (
    <div className="relative w-full space-y-2">
      <p className="text-sm">Your new API key is:</p>
      <textarea
        className="min-h-[60px] w-full resize-none overflow-hidden break-all rounded bg-gray-800 p-2 font-mono"
        onClick={(e) => e.currentTarget.select()}
        readOnly
        rows={Math.max(3, Math.ceil(apiKey.length / 60))}
        value={apiKey}
      />
      <p className="text-destructive text-sm">
        This is the ONLY time this key will be shown. Please save it somewhere
        secure.
      </p>
    </div>
  );
}
