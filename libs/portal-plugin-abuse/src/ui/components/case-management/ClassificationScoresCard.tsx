import { Card, CardContent, CardHeader, CardTitle, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";
const BarChart = lazyIcon("BarChart");


interface ClassificationScoresCardProps {
  scores: Record<string, number> | undefined;
}

export function ClassificationScoresCard({
  scores,
}: ClassificationScoresCardProps) {
  if (!scores || Object.keys(scores).length === 0) {
    return null;
  }

  // Convert scores to a sorted array of [name, value] pairs
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <BarChart className="h-4 w-4 text-blue-500" />
          Classification Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedScores.map(([name, score]) => (
            <div className="space-y-1" key={name}>
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">
                  {name.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-medium">{(score * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
