import { GeneralLayout } from "~/components/general-layout";
import { FileCard, FileCardList, FileTypes } from "~/components/file-card";
import { DataTable } from "~/components/data-table";
import { columns } from "./columns";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AddIcon } from "~/components/icons";
import { Authenticated } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Field } from "~/components/forms";

export default function FileManager() {
  return (
    <Authenticated key="dashboard" v3LegacyAuthProviderCompatible>
      <GeneralLayout>
        <Dialog>
          <h1 className="font-bold mb-4 text-lg">File Manager</h1>
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
          <h2 className="font-bold text-l mt-8">Files</h2>
          <div className="flex items-center space-x-4 my-6 w-full">
            <Input
              fullWidth
              leftIcon={<AddIcon />}
              placeholder="Search files by name or CID"
              className="border-ring font-medium w-full grow h-12 flex-1 bg-primary-2/10"
            />
            <Button className="h-12 gap-x-2">
              <AddIcon />
              Select All
            </Button>
            <DialogTrigger asChild>
              <Button className="h-12 gap-x-2">
                <AddIcon />
                Pin Content
              </Button>
            </DialogTrigger>
          </div>
          <DataTable columns={columns} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pin Content</DialogTitle>
            </DialogHeader>
            <form action="" className="w-full flex flex-col gap-y-4">
              <Field
                inputProps={{
                  name: "cids",
                  placeholder: "Comma separated CIDs",
                }}
                labelProps={{ htmlFor: "cids", children: "Content to Pin" }}
              />

              <Button type="submit" className="w-full">
                Pin Content
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </GeneralLayout>
    </Authenticated>
  );
}
