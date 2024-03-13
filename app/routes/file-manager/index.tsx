import { GeneralLayout } from "~/components/general-layout";
import { FileCard, FileCardList, FileTypes } from "~/components/file-card";
import { DataTable } from "~/components/data-table";
import { columns } from "./columns";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AddIcon } from "~/components/icons";

export default function FileManager() {
  const isLogged = true;
  if (!isLogged) {
    window.location.href = "/login";
  }

  return (
    <GeneralLayout>
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
        <Button className="h-12 gap-x-2">
          <AddIcon />
          New Folder
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={[
          {
            name: "whirly-final-draft.psd",
            cid: "0xB45165ED3CD437B",
            size: "1.89 MB",
            createdOn: "03/02/2024 at 13:29 PM",
          },
          {
            name: "whirly-final-draft.psd",
            cid: "0xB45165ED3CD437B",
            size: "1.89 MB",
            createdOn: "03/02/2024 at 13:29 PM",
          },
        ]}
      />
    </GeneralLayout>
  );
}
