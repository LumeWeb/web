import { Button, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Label, RadioGroup, RadioGroupItem, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useNotification } from "@refinedev/core";

import React, { useState } from "react";
const Download = lazyIcon("Download");
const Loader2 = lazyIcon("Loader2");


interface ExportCaseDialogProps {
  caseId: number;
  caseReference: string;
}

type ExportFormat = "csv" | "json" | "pdf";

export function ExportCaseDialog({ caseReference }: ExportCaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includeOptions, setIncludeOptions] = useState({
    caseDetails: true,
    communications: true,
    notes: true,
    timeline: true,
    userInfo: false,
  });
  const { open: openNotification } = useNotification();

  const handleExport = async () => {
    setIsSubmitting(true);

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    openNotification({
      description: `${caseReference} has been exported as ${format.toUpperCase()}.`,
      message: "Case exported successfully",
      type: "success",
    });

    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full flex items-center gap-1" variant="outline">
          <Download className="h-4 w-4" />
          Export Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Case {caseReference}</DialogTitle>
          <DialogDescription>
            Choose the format and content to include in the export.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Export Format</h3>
            <RadioGroup
              onValueChange={(value) => setFormat(value as ExportFormat)}
              value={format}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="pdf" value="pdf" />
                <Label htmlFor="pdf">PDF Document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="csv" value="csv" />
                <Label htmlFor="csv">CSV Spreadsheet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="json" value="json" />
                <Label htmlFor="json">JSON Data</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Include Content</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeOptions.caseDetails}
                  id="caseDetails"
                  onCheckedChange={(checked) =>
                    setIncludeOptions({
                      ...includeOptions,
                      caseDetails: checked === true,
                    })
                  }
                />
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="caseDetails">
                  Case Details
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeOptions.communications}
                  id="communications"
                  onCheckedChange={(checked) =>
                    setIncludeOptions({
                      ...includeOptions,
                      communications: checked === true,
                    })
                  }
                />
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="communications">
                  Communications
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeOptions.notes}
                  id="notes"
                  onCheckedChange={(checked) =>
                    setIncludeOptions({
                      ...includeOptions,
                      notes: checked === true,
                    })
                  }
                />
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="notes">
                  Internal Notes
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeOptions.timeline}
                  id="timeline"
                  onCheckedChange={(checked) =>
                    setIncludeOptions({
                      ...includeOptions,
                      timeline: checked === true,
                    })
                  }
                />
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="timeline">
                  Timeline History
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={includeOptions.userInfo}
                  id="userInfo"
                  onCheckedChange={(checked) =>
                    setIncludeOptions({
                      ...includeOptions,
                      userInfo: checked === true,
                    })
                  }
                />
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="userInfo">
                  User Information
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
            variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleExport}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
