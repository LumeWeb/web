import { Card, CardContent, CardHeader, CardTitle, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";
const AlertTriangle = lazyIcon("AlertTriangle");


interface RiskFactorsCardProps {
  riskFactors: string[] | undefined;
}

export function RiskFactorsCard({ riskFactors }: RiskFactorsCardProps) {
  if (!riskFactors || riskFactors.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Risk Factors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {riskFactors.map((factor, index) => (
            <li className="text-muted-foreground" key={index}>
              {factor}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
