import {
  BlockAction,
  BlockReason,
  BlockSeverity,
  BlockSource,
} from "@/types/blocklist";
import { CaseStatus } from "@/types/case";
import { RefineResource } from "@/types/resources";
import { useShow } from "@refinedev/core";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Label, RadioGroup, RadioGroupItem, Textarea, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useCustomMutation, useNotification } from "@refinedev/core";

import React, { useState } from "react";
import { SubjectResponse } from "@/types/subject";
const Shield = lazyIcon("Shield");
const ShieldAlert = lazyIcon("ShieldAlert");
const ShieldCheck = lazyIcon("ShieldCheck");
const ShieldX = lazyIcon("ShieldX");


interface BlockManagementCardProps {
  caseId: number;
  isBlocked: boolean;
  onRefresh?: () => void;
  onStatusChange: (status: CaseStatus, comment: string) => Promise<void>;
  subjectId: number;
}

export function BlockManagementCard({
  caseId,
  isBlocked,
  onRefresh,
  onStatusChange,
  subjectId,
}: BlockManagementCardProps) {
  const {
    queryResult: { data: subjectData },
  } = useShow<SubjectResponse>({
    resource: RefineResource.Subject,
    id: subjectId,
  });

  const subjectName = subjectData?.data.identifier || `Subject ${subjectId}`;
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState<BlockReason>(
    BlockReason.system_policy,
  );
  const [blockNotes, setBlockNotes] = useState("");
  const [unblockNotes, setUnblockNotes] = useState("");

  const { open: openNotification } = useNotification();

  // Block subject mutation
  const { isLoading: isBlocking, mutate: blockSubject } = useCustomMutation();

  // Unblock subject mutation
  const { isLoading: isUnblocking, mutate: unblockSubject } =
    useCustomMutation();

  const handleBlock = async () => {
    blockSubject(
      {
        method: "post",
        url: `/abuse/${RefineResource.Blocklist}`,
        values: {
          action: BlockAction.reject,
          caseId,
          description:
            blockNotes ||
            `Subject blocked due to ${blockReason.replace("_", " ")}`,
          hash: subjectData?.data?.identifier,
          mimeType: subjectData?.data?.mime_type || undefined,
          reason: blockReason,
          severity: BlockSeverity.high,
          size: subjectData?.data?.size || undefined,
          source: BlockSource.admin,
          uploaderId: subjectId,
        },
      },
      {
        onError: (error) => {
          openNotification?.({
            description:
              error?.message || "An error occurred while blocking the subject.",
            message: "Failed to block subject",
            type: "error",
          });
        },
        onSuccess: async () => {
          openNotification?.({
            description: `${subjectName} has been blocked successfully.`,
            message: "Subject blocked",
            type: "success",
          });

          // Mark case as resolved
          await onStatusChange(
            CaseStatus.resolved,
            `Case resolved due to subject being blocked. Reason: ${blockReason.replace("_", " ")}`,
          );

          setBlockDialogOpen(false);
          setBlockNotes("");
          if (onRefresh) onRefresh();
        },
      },
    );
  };

  const handleUnblock = async () => {
    unblockSubject(
      {
        method: "delete",
        url: `/abuse/${RefineResource.Blocklist}/${subjectData?.data?.identifier}`,
        values: {},
      },
      {
        onError: (error) => {
          openNotification?.({
            description:
              error?.message ||
              "An error occurred while unblocking the subject.",
            message: "Failed to unblock subject",
            type: "error",
          });
        },
        onSuccess: () => {
          openNotification?.({
            description: `${subjectName} has been unblocked successfully.`,
            message: "Subject unblocked",
            type: "success",
          });

          setUnblockDialogOpen(false);
          setUnblockNotes("");
          if (onRefresh) onRefresh();
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Block Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
            {isBlocked ? (
              <>
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <div className="text-sm font-medium">
                  Subject is currently blocked
                </div>
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Subject is not blocked
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            {!isBlocked ? (
              <Dialog onOpenChange={setBlockDialogOpen} open={blockDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full flex items-center gap-2"
                    variant="destructive">
                    <ShieldX className="h-4 w-4" />
                    Block Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Block Subject</DialogTitle>
                    <DialogDescription>
                      This will block the subject and mark the case as resolved.
                      This action cannot be easily undone.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Block Reason</Label>
                      <RadioGroup
                        onValueChange={(value) =>
                          setBlockReason(value as BlockReason)
                        }
                        value={blockReason}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            id="policy"
                            value={BlockReason.system_policy}
                          />
                          <Label htmlFor="policy">Policy Violation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            id="harassment"
                            value={BlockReason.harassment}
                          />
                          <Label htmlFor="harassment">Harassment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem id="spam" value={BlockReason.spam} />
                          <Label htmlFor="spam">Spam</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            id="hate-speech"
                            value={BlockReason.hate_speech}
                          />
                          <Label htmlFor="hate-speech">Hate Speech</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            id="malware"
                            value={BlockReason.malware}
                          />
                          <Label htmlFor="malware">Malware</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="block-notes">Additional Notes</Label>
                      <Textarea
                        id="block-notes"
                        onChange={(e) => setBlockNotes(e.target.value)}
                        placeholder="Enter any additional details about this block..."
                        value={blockNotes}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={() => setBlockDialogOpen(false)}
                      variant="outline">
                      Cancel
                    </Button>
                    <Button
                      disabled={isBlocking}
                      onClick={handleBlock}
                      variant="destructive">
                      {isBlocking ? "Blocking..." : "Block Subject"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog
                onOpenChange={setUnblockDialogOpen}
                open={unblockDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full flex items-center gap-2"
                    variant="outline">
                    <ShieldCheck className="h-4 w-4" />
                    Unblock Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Unblock Subject</DialogTitle>
                    <DialogDescription>
                      This will remove the block from the subject. Are you sure
                      you want to proceed?
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="unblock-notes">
                        Reason for Unblocking
                      </Label>
                      <Textarea
                        id="unblock-notes"
                        onChange={(e) => setUnblockNotes(e.target.value)}
                        placeholder="Enter the reason for unblocking this subject..."
                        value={unblockNotes}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={() => setUnblockDialogOpen(false)}
                      variant="outline">
                      Cancel
                    </Button>
                    <Button
                      disabled={isUnblocking}
                      onClick={handleUnblock}
                      variant="default">
                      {isUnblocking ? "Unblocking..." : "Unblock Subject"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
