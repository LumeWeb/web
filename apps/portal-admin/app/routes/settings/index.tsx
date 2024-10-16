import React, { useEffect, useState } from "react";
import { Authenticated, useOne, useList } from "@refinedev/core";
import GeneralLayout from "@/components/layout/GeneralLayout";
import SettingsTable from "./components/SettingsEditor";

export default function Settings() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: schemaData, isLoading: isSchemaLoading } = useOne({
    resource: "settings",
    id: "schema",
  });

  const { data: settingsData, isLoading: isSettingsLoading } = useList({
    resource: "settings",
    filters: [
      {
        field: "key",
        operator: "contains",
        value: searchTerm,
      },
      {
        field: "value",
        operator: "contains",
        value: searchTerm,
      },
    ],
  });

  const [settingsMap, setSettingsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settingsData?.data) {
      const initialData = settingsData.data.reduce(
        (acc, item) => {
          acc[item.key] = item.value;
          return acc;
        },
        {} as Record<string, any>,
      );

      setSettingsMap(initialData);
    }
  }, [settingsData]);

  const handleDataChange = (newData: Record<string, any>) => {
    setSettingsMap(newData);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (isSchemaLoading || isSettingsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Authenticated key="settings" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <div className="p-4 space-y-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          {schemaData?.data && (
            <SettingsTable
              schema={schemaData.data}
              initialData={settingsMap}
              hiddenFields={[]}
              onDataChange={handleDataChange}
              onSearch={handleSearch}
            />
          )}
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
