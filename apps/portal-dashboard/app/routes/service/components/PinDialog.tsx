"use client";

import { SetStateAction, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModalForm } from "@refinedev/react-hook-form";
import * as z from "zod";
import { Tag, TagInput } from "portal-shared/components/ui/tag-input";
import { Button } from "portal-shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "portal-shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "portal-shared/components/ui/form";
import { useActiveService } from "../hooks/useActiveService";

const formSchema = z.object({
  cid: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
});

export default function PinDialog({
  open,
  stateChange,
}: {
  open: boolean;
  stateChange: (open: boolean) => void;
}) {
  const svc = useActiveService();
  const [tags, setTags] = useState<Tag[]>([]);
  const form = useModalForm<z.infer<typeof formSchema>>({
    modalProps: {
      defaultVisible: open,
    },
    //   warnWhenUnsavedChanges: true,
    resolver: zodResolver(formSchema),
    refineCoreProps: {
      resource: svc?.id(),
      action: "create",
      successNotification(data) {
        return {
          message: "CID(s) pinned successfully",
          type: "success",
        };
      },
      errorNotification(error) {
        return {
          message: "Error pinning CID",
          description: error?.message,
          type: "error",
        };
      },
    },
  });

  const {
    setValue,
    saveButtonProps,
    modal: { visible, close, show },
  } = form;

  const reset = () => {
    form.reset();
    setTags([]);
  };
  const doStateChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    open ? show() : close();
    stateChange(open);
  };

  useEffect(() => {
    open ? show() : close();
  }, [open]);

  /*
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (value && !type) {
        form.control._subjects.values.next({
          value,
          name,
          type: "change",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
*/

  useEffect(() => {
    form.refineCore.mutation.status === "success" && doStateChange(false);
  }, [form.refineCore.mutation.status]);

  return (
    <Dialog open={visible} onOpenChange={doStateChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pin CID</DialogTitle>
          <DialogDescription>
            Pin one or more CIDs to your account
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="cid"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagInput
                      addOnPaste={true}
                      direction="row"
                      inputFieldPosition="top"
                      activeTagIndex={null}
                      styleClasses={{
                        input: "order-first w-full",
                        tagList: {
                          container: "flex flex-wrap",
                        },
                      }}
                      setActiveTagIndex={function (
                        value: SetStateAction<number | null>,
                      ): void {}}
                      {...field}
                      placeholder="Enter a CID"
                      tags={tags}
                      className="sm:min-w-[450px]"
                      setTags={(newTags: any) => {
                        setTags(newTags);
                        setValue("cid", newTags?.() as [Tag, ...Tag[]]);
                      }}
                      validateTag={(tag) => svc!.validateCid(tag)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button {...saveButtonProps}>Pin</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
