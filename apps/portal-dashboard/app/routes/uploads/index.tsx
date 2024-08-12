import { Authenticated } from "@refinedev/core";
import { GeneralLayout } from "~/components/layout/GeneralLayout";
import React from "react";
import Manager from "~/routes/uploads/components/Manager";

export default function Uploads() {
  return (
    <Authenticated key="uploads" v3LegacyAuthProviderCompatible={false}>
      <GeneralLayout>
        <Manager />
      </GeneralLayout>
    </Authenticated>
  );
}
