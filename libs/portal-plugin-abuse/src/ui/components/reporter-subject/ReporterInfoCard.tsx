import type { ReporterDetailResponse } from "@/types/reporter-subject";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { format } from "date-fns";
import { Clock, Mail, Shield, User } from "lucide-react";
import React from "react";

interface ReporterInfoCardProps {
  reporter: ReporterDetailResponse;
}

export function ReporterInfoCard({ reporter }: ReporterInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Reporter Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{reporter.name}</h3>
            <Badge
              className="capitalize"
              variant={
                reporter.verificationStatus === "verified"
                  ? "success"
                  : reporter.verificationStatus === "pending"
                    ? "warning"
                    : "destructive"
              }>
              {reporter.verificationStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span>{reporter.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="font-medium">{reporter.userId}</p>
          </div>
          {/*          <div>
            <p className="text-xs text-muted-foreground">User Type</p>
            <p className="font-medium capitalize">
              {reporter.userType.replace("_", " ")}
            </p>
          </div>*/}
          <div>
            <p className="text-xs text-muted-foreground">Registration Date</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {format(new Date(reporter.created_at), "MMM d, yyyy")}
            </p>
          </div>
          {/*          <div>
            <p className="text-xs text-muted-foreground">Last Login</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {format(new Date(reporter.lastLoginDate), "MMM d, yyyy")}
            </p>
          </div>*/}
          {/*          <div>
            <p className="text-xs text-muted-foreground">
              Total Reported Cases
            </p>
            <p className="font-medium">{reporter.totalReportedCases}</p>
          </div>*/}
          {/*          <div>
            <p className="text-xs text-muted-foreground">Trust Score</p>
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{reporter.trustScore}/100</span>
            </div>
          </div>*/}
        </div>

        {reporter.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{reporter.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
