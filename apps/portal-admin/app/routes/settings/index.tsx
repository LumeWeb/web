import React, { useState } from "react";
import { Authenticated, useOne, useUpdate } from "@refinedev/core";
import GeneralLayout from "@/components/layout/GeneralLayout";
import { SettingsEditor } from "./components/SettingsEditor";

export default function Settings() {
  return (
    <Authenticated key="settings" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <SettingsEditor />
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
