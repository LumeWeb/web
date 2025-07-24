import { Tabs } from "@lumeweb/portal-framework-ui-core";
import React from "react";

export default function Manager() {
  //const serviceIds = getServiceIds().sort();
  return (
    <Tabs /*defaultValue={serviceIds[0]}*/>
      {/*      <TabsList className="mb-6">
        {serviceIds.map((serviceId) => {
          const service = getServiceById(serviceId);
          return (
            <>
              <TabsTrigger key={"activeService"} value={serviceId}>
                <span className={"text-foreground"}> {service?.name()}</span>
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
                    autoRefresh
                    autoRefreshInterval={5000}
                    className="min-w-full border border-gray-700 border-x-1"
                    columns={service?.UIUploadQueueColumns() || []}
                    dataProviderName={service?.id() || ""}
                    resource={service?.id() || ""}
                  />
                </div>
              </section>
            </TabsContent>
          </>
        );
      })}*/}
      */
    </Tabs>
  );
}
