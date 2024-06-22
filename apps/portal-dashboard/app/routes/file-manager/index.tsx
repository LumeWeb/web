import { GeneralLayout } from "~/components/general-layout";
import { FileCard, FileCardList, FileTypes } from "~/components/file-card";
import { DataTable } from "~/components/data-table";
import { columns } from "./columns";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AddIcon, CurrentUsageIcon, FilesIcon } from "~/components/icons";
import { Authenticated } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { TextareaField } from "~/components/forms";
import { z } from "zod";
import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { usePinning } from "~/hooks/usePinning";
import { CID } from "@lumeweb/libs5";
import { useEffect, useState } from "react";
import SectionTitle from "~/components/section-title";
import fileIcon from "~/images/icons/file.svg?url";

export default function FileManager() {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  return (
    <Authenticated key="file-manager">
      <GeneralLayout>
        <Dialog open={open} onOpenChange={setOpen}>
          <SectionTitle
            icon={<FilesIcon className="text-foreground w-8 h-8" />}
            title="Recently Viewed Files" />
          <FileCardList>
            <FileCard
              fileName="Backups"
              size="33 files"
              type={FileTypes.Folder}
              createdAt="2 days ago"
            />
            <FileCard
              fileName="Backups"
              size="33 files"
              type={FileTypes.Folder}
              createdAt="2 days ago"
            />
            <FileCard
              fileName="Backups"
              size="33 files"
              type={FileTypes.Folder}
              createdAt="2 days ago"
            />
            <FileCard
              fileName="Backups"
              size="33 files"
              type={FileTypes.Folder}
              createdAt="2 days ago"
            />
          </FileCardList>
          <SectionTitle
            icon={<FilesIcon className="text-foreground w-8 h-8" />}
            title="Files" />
          <div className="flex items-center space-x-4 my-6 w-full">
            <Input
              fullWidth
              leftIcon={<AddIcon />}
              placeholder="Search files by name or CID"
              className="border-ring font-medium w-full grow h-12 flex-1 bg-background"
            />
            {/* We dont yet have any functionality for selecting so im commenting this out */}
            {/* <Button className="h-12 gap-x-2">
              <AddIcon />
              Select All
            </Button> */}
            <DialogTrigger asChild>
              <Button className="h-12 gap-x-2">
                <AddIcon />
                Pin Content
              </Button>
            </DialogTrigger>
          </div>
          <DataTable
            columns={columns}
            resource="file"
            dataProviderName="files"
          />
          <DialogContent>
            <PinFilesForm close={closeModal} />
          </DialogContent>
        </Dialog>
      </GeneralLayout>
    </Authenticated>
  );
}

const PinFilesSchema = z.object({
  cids: z
    .string()
    .transform((value) => value.split(","))
    .refine(
      (value) => {
        return value.every((cid) => {
          try {
            CID.decode(cid);
          } catch (e) {
            return false;
          }

          return true;
        });
      },
      (val) => ({
        message: `${val} is not a valid CID`,
      }),
    ),
});

const PinFilesForm = ({ close }: { close: () => void }) => {
  const { bulkPin, pinStatus, fetchProgress } = usePinning();
  const [form, fields] = useForm({
    id: "pin-files",
    constraint: getZodConstraint(PinFilesSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PinFilesSchema });
    },
    shouldValidate: "onSubmit",
    onSubmit(e, { submission }) {
      e.preventDefault();
      if (submission?.status === "success") {
        const value = submission.value;

        bulkPin(value.cids);
      }
    },
  });

  useEffect(() => {
    if (pinStatus === "success") {
      fetchProgress();
      close();
    }
  }, [pinStatus, fetchProgress, close]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pin Content</DialogTitle>
      </DialogHeader>
      <form {...getFormProps(form)} className="w-full flex flex-col gap-y-4">
        <TextareaField
          textareaProps={{
            name: fields.cids.name,
            placeholder: "Comma separated CIDs",
          }}
          labelProps={{ htmlFor: "cids", children: "Content to Pin" }}
          errors={fields.cids.errors || pinStatus === "error" ? ["An error occurred, please try again"] : []}
        />

        <Button type="submit" className="w-full" disabled={pinStatus === "pending"}>
          {pinStatus === "pending" ? "Processing..." : "Pin Content"}
        </Button>
      </form>
    </>
  );
};
