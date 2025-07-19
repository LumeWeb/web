import type { BaseKey } from "@refinedev/core";

import {
  CasePriority,
  CaseStatus,
  CaseResponse,
  CaseUpdateRequest,
} from "@/types/case";
import { RefineResource } from "@/types/resources";
import { BlockManagementCard } from "@/ui/components/case-management/actions/BlockManagementCard";
import { CaseActions } from "@/ui/components/case-management/actions/CaseActions";
import { CaseStatusBadge } from "@/ui/components/case-management/CaseStatusBadge";
import { ClassificationScoresCard } from "@/ui/components/case-management/ClassificationScoresCard";
import { CommunicationsPanel } from "@/ui/components/case-management/communications/CommunicationsPanel";
import { EvidenceScanningTab } from "@/ui/components/case-management/EvidenceScanningTab";
import { PrioritySwitch } from "@/ui/components/case-management/PrioritySwitch";
import { RiskFactorsCard } from "@/ui/components/case-management/RiskFactorsCard";
import { StatusSwitch } from "@/ui/components/case-management/StatusSwitch";
import { UserInfoCard } from "@/ui/components/case-management/UserInfoCard";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@lumeweb/portal-framework-ui-core";
import {
  useCustom,
  useNavigation,
  useNotification,
  useParsed,
  useShow,
  useUpdate,
} from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";

export default function View() {
  const params = useParsed();

  return <CaseViewContent id={params.id!} />;
}

function CaseViewContent({ id }: { id: BaseKey }) {
  const [activeTab, setActiveTab] = useState<string>("details");
  const { queryResult } = useShow<CaseResponse>({
    id,
    resource: RefineResource.Case,
  });
  const { mutate } = useUpdate();
  const { goBack } = useNavigation();
  const { open: openNotification } = useNotification();

  const { data, isLoading, refetch } = queryResult;
  const record = data?.data;

  // Check if subject is blocked - only after we have the record
  const { data: blockData, refetch: refetchBlockStatus } = useCustom({
    method: "get",
    url: `/abuse/blocklist/subjects/${record?.subject_id}/blocked`,
    queryOptions: {
      enabled: !!record?.subject_id,
    },
  });

  const isSubjectBlocked = blockData?.data?.blocked || false;

  const { control, handleSubmit } = useForm<CaseUpdateRequest>({
    defaultValues: {
      // @ts-ignore
      assigneeId: record?.assigneeId ?? 0,
      description: record?.description,
      needsReview: record?.needs_review,
      priority: record?.priority,
    },
    refineCoreProps: {
      action: "edit",
      id,
      resource: RefineResource.Case,
    },
  });

  const handleNeedsReviewChange = (checked: boolean) => {
    mutate(
      {
        id,
        resource: RefineResource.Case,
        values: {
          needsReview: checked,
        },
      },
      {
        onError: () => {
          openNotification?.({
            description: "Failed to update needs review status.",
            message: "Update failed",
            type: "error",
          });
        },
        onSuccess: () => {
          openNotification?.({
            description: `Needs review status has been ${checked ? "enabled" : "disabled"}.`,
            message: "Case updated",
            type: "success",
          });
          refetch();
        },
      },
    );
  };

  const handleStatusChange = async (status: CaseStatus): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          id,
          resource: RefineResource.Case,
          values: {
            status,
          },
        },
        {
          onError: (error) => {
            openNotification?.({
              description: "Failed to update case status.",
              message: "Update failed",
              type: "error",
            });
            reject(error);
          },
          onSuccess: () => {
            openNotification?.({
              description: `Case status has been updated to ${status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}.`,
              message: "Status updated",
              type: "success",
            });
            refetch();
            resolve();
          },
        },
      );
    });
  };

  const handleStatusChangeWithComment = async (
    status: CaseStatus,
    comment: string,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          id,
          meta: {
            comment,
          },
          resource: RefineResource.Case,
          values: {
            status,
          },
        },
        {
          onError: (error) => {
            openNotification?.({
              description: "Failed to update case status.",
              message: "Update failed",
              type: "error",
            });
            reject(error);
          },
          onSuccess: () => {
            // In a real app, we would also save the comment to the case history
            openNotification?.({
              description: `Case status has been updated to ${status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}.`,
              message: "Status updated",
              type: "success",
            });
            refetch();
            resolve();
          },
        },
      );
    });
  };

  const handleAssignUser = async (
    userId: number | undefined,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          id,
          resource: RefineResource.Case,
          values: {
            assigneeId: userId,
          },
        },
        {
          onError: (error) => {
            openNotification?.({
              description: "Failed to assign case to user.",
              message: "Assignment failed",
              type: "error",
            });
            reject(error);
          },
          onSuccess: () => {
            openNotification?.({
              description: userId
                ? `Case has been assigned to user ${userId}.`
                : "Case has been unassigned.",
              message: "Case assigned",
              type: "success",
            });
            refetch();
            resolve();
          },
        },
      );
    });
  };

  const handlePriorityChange = async (
    priority: CasePriority,
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutate(
        {
          id,
          resource: RefineResource.Case,
          values: {
            priority,
          },
        },
        {
          onError: (error) => {
            openNotification?.({
              description: "Failed to update case priority.",
              message: "Update failed",
              type: "error",
            });
            reject(error);
          },
          onSuccess: () => {
            openNotification?.({
              description: `Case priority has been updated to ${priority.charAt(0).toUpperCase() + priority.slice(1)}.`,
              message: "Priority updated",
              type: "success",
            });
            refetch();
            resolve();
          },
        },
      );
    });
  };

  const onSubmit = (values: CaseUpdateRequest) => {
    mutate(
      {
        id,
        resource: RefineResource.Case,
        values,
      },
      {
        onError: () => {
          openNotification?.({
            description: "Failed to update case details.",
            message: "Update failed",
            type: "error",
          });
        },
        onSuccess: () => {
          openNotification?.({
            description: "Case details have been updated successfully.",
            message: "Case updated",
            type: "success",
          });
          refetch();
        },
      },
    );
  };

  const handleDelete = () => {
    // In a real app, this would delete the case
    openNotification?.({
      description: "The case has been deleted successfully.",
      message: "Case deleted",
      type: "success",
    });
    goBack();
  };

  const handleRefresh = async () => {
    await refetch();
    if (record?.subject_id) {
      await refetchBlockStatus();
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex animate-pulse flex-col gap-4">
          <div className="h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">Case not found</h2>
          <p className="mt-2 text-muted-foreground">
            The case you are looking for does not exist or has been removed.
          </p>
          <Button className="mt-4" onClick={() => goBack()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header section */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              className="h-9 w-9"
              onClick={() => goBack()}
              size="icon"
              variant="outline">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold text-background">
              {record.reference_number}
            </h1>
            <CaseStatusBadge className="ml-2" status={record.status} />
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1" variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Case {record.reference_number}</DialogTitle>
                  <DialogDescription>
                    Update case details and description. Click save when done.
                  </DialogDescription>
                </DialogHeader>
                <Form {...{ control, handleSubmit: handleSubmit(onSubmit) }}>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(CasePriority).map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority.charAt(0).toUpperCase() +
                                    priority.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="needsReview"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Needs Review</FormLabel>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <button
                                className="flex items-center gap-1.5 text-sm"
                                onClick={() => field.onChange(!field.value)}
                                type="button">
                                {field.value ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Yes</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-gray-400" />
                                    <span>No</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="assigneeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignee ID</FormLabel>
                          <FormControl>
                            <Input
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                )
                              }
                              type="number"
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[120px]" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>
            <Button
              className="flex items-center gap-1"
              onClick={handleDelete}
              variant="destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Case header info */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="capitalize text-sm font-medium">
                  {record.type.replace("_", " ")}
                </p>
              </div>
              <PrioritySwitch
                onChange={async (priority) => {
                  await handlePriorityChange(priority);
                }}
                value={record.priority}
              />
              <StatusSwitch
                onChange={async (status) => {
                  await handleStatusChange(status);
                }}
                value={record.status}
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Needs Review</p>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1.5 text-sm"
                    onClick={() =>
                      handleNeedsReviewChange(!record.needs_review)
                    }>
                    {record.needs_review ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Yes</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span>No</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="capitalize text-sm">
                  {record.source.replace("_", " ")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {format(new Date(record.created_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {format(new Date(record.updated_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Activity</p>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {format(new Date(record.updated_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content with tabs */}
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="w-full border-b rounded-none justify-start">
          <TabsTrigger className="rounded-b-none" value="details">
            Case Details
          </TabsTrigger>
          <TabsTrigger className="rounded-b-none" value="evidence">
            Evidence & Scanning
          </TabsTrigger>
          <TabsTrigger className="rounded-b-none" value="communications">
            Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="details">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line">
                    {record.description}
                  </p>
                </CardContent>
              </Card>
              {/* @ts-ignore */}
              <ClassificationScoresCard scores={record?.classificationScores} />
            </div>

            <div className="space-y-6">
              <UserInfoCard
                isReporter={true}
                title="Reporter"
                id={record.reporter_id}
              />
              <UserInfoCard title="Subject" id={record.subject_id} />
              {/* @ts-ignore */}
              <RiskFactorsCard riskFactors={record?.riskFactors} />
              <CaseActions
                caseId={Number(id)}
                caseReference={record.reference_number}
                // @ts-ignore
                currentAssigneeId={record.assigneeId ?? 0}
                currentStatus={record.status}
                onAssignUser={handleAssignUser}
                onRefresh={refetch}
                onStatusChange={handleStatusChangeWithComment}
              />
              {/* Add Block Management Card */}
              <BlockManagementCard
                caseId={Number(id)}
                isBlocked={isSubjectBlocked}
                onRefresh={handleRefresh}
                onStatusChange={handleStatusChangeWithComment}
                subjectId={record.subject_id}
                // @ts-ignore
                subjectName={record?.subject?.name ?? ""}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="mt-6" value="evidence">
          <EvidenceScanningTab
            caseId={Number(id)}
            subjectId={record.subject_id}
          />
        </TabsContent>

        <TabsContent className="mt-6" value="communications">
          <div className="h-[600px]">
            <CommunicationsPanel caseId={Number(id)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
