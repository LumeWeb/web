import React from "react";
import { getGetServices } from "@/services/index";

export default function UploadsActiveLoader() {
  const getServices = getGetServices();

  const services = getServices();

  const hasActiveUploads =
    services &&
    services.some((svc) => {
      return svc?.UIGetHasActiveUploads() ?? false;
    });

  if (!hasActiveUploads) {
    return null;
  }

  return (
    <div
      className="flex space-x-1 h-8 w-8 items-center justify-center mt-2"
      role="status"
      aria-label="Loading">
      <div
        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0s" }}></div>
      <div
        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0.2s" }}></div>
      <div
        className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: "0.4s" }}></div>
    </div>
  );
}
