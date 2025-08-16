import React from "react";

interface ApiKeyAlertMessageProps {
  apiKey: string;
}

export function ApiKeyAlertMessage({ apiKey }: ApiKeyAlertMessageProps) {
  return (
    <div className="space-y-2 relative w-full">
      <p className="text-sm">Your new API key is:</p>
      <textarea
        readOnly
        value={apiKey}
        className="font-mono w-full bg-gray-800 p-2 rounded break-all resize-none overflow-hidden min-h-[60px]"
        rows={Math.max(3, Math.ceil(apiKey.length / 60))}
        onClick={(e) => e.currentTarget.select()}
      />
      <p className="text-sm text-destructive">
        This is the ONLY time this key will be shown. Please save it somewhere
        secure.
      </p>
    </div>
  );
}
