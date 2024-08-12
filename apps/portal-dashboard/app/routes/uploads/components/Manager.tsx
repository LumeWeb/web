import { getServiceById, getServiceIds } from "~/services/index.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DataTable } from "~/components/DataTable.js";
import React from "react";

export default function Manager() {
  const serviceIds = getServiceIds().sort();
  return (
    <Tabs defaultValue={serviceIds[0]}>
      <TabsList className="mb-6">
        {serviceIds.map((serviceId) => {
          const service = getServiceById(serviceId);
          return (
            <>
              <TabsTrigger key={"activeService"} value={serviceId}>
                {service?.name()}
              </TabsTrigger>
            </>
          );
        })}
      </TabsList>
      {serviceIds.map((serviceId) => {
        const service = getServiceById(serviceId);
        return (
          <>
            <TabsContent key={"activeService"} value={serviceId}>
              <section>
                <h1 className="mb-4 text-xl font-semibold">IPFS</h1>
                <div className="overflow-x-auto">
                  <DataTable
                    className="min-w-full border border-gray-700 border-x-1"
                    columns={service?.UIUploadQueueColumns() || []}
                    resource={service?.UIUploadQueueResource() || ""}
                    dataProviderName={service?.id() || ""}
                    autoRefresh
                    autoRefreshInterval={5000}
                  />
                </div>
              </section>
            </TabsContent>
          </>
        );
      })}
    </Tabs>
  );
}
