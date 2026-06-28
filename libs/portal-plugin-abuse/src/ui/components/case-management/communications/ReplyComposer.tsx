import {
  CommunicationDirection,
  type CommunicationUpdateRequest,
  CommunicationType,
} from "@/types/communication";
import { RefineResource } from "@/types/resources";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { Textarea } from "@lumeweb/portal-framework-ui-core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@lumeweb/portal-framework-ui-core";
import { useCreate } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";

import { useState } from "react";
import React from "react";

import { CommunicationDirectionBadge } from "./CommunicationDirectionBadge";
import { CommunicationTypeIcon } from "./CommunicationTypeIcon";
const Loader2 = lazyIcon("Loader2");


interface ReplyComposerProps {
  caseId: number;
  onSuccess?: () => void;
  parentId?: number;
}

export function ReplyComposer({
  caseId,
  onSuccess,
  parentId,
}: ReplyComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useCreate();

  const form = useForm<CommunicationUpdateRequest>({
    defaultValues: {
      content: "",
      direction: CommunicationDirection.Outgoing,
      parentId,
      type: CommunicationType.Response,
    },
  });

  const onSubmit = (data: CommunicationUpdateRequest) => {
    setIsSubmitting(true);

    try {
      mutate(
        {
          resource: RefineResource.Communication,
          values: {
            ...data,
            caseId,
          },
        },
        {
          onError: () => {
            setIsSubmitting(false);
          },
          onSuccess: () => {
            form.reset({
              content: "",
              direction: CommunicationDirection.Outgoing,
              parentId,
              type: CommunicationType.Response,
            });
            setIsSubmitting(false);
            if (onSuccess) {
              onSuccess();
            }
          },
        },
      );
    } catch (error) {
      console.error("Error submitting reply:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t p-4 bg-card">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="min-h-[100px] resize-none focus-visible:ring-1"
                    placeholder="Type your reply here..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CommunicationType).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <CommunicationTypeIcon
                                className="h-4 w-4"
                                type={type}
                              />
                              <span className="capitalize">{type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CommunicationDirection).map(
                          (direction) => (
                            <SelectItem key={direction} value={direction}>
                              <div className="flex items-center gap-2">
                                <CommunicationDirectionBadge
                                  className="h-5"
                                  direction={direction}
                                />
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reply"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
