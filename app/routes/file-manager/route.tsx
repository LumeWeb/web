import { GeneralLayout } from "~/components/general-layout";
import { FileCard, FileCardList, FileTypes } from "~/components/file-card";
import { DataTable } from "~/components/data-table";
import { columns } from "./columns";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

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
          className="border-ring font-bold w-full grow h-12 flex-1"
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

const AddIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_323_1258)">
        <path
          d="M9 1.5C4.85625 1.5 1.5 4.85625 1.5 9C1.5 13.1438 4.85625 16.5 9 16.5C13.1438 16.5 16.5 13.1438 16.5 9C16.5 4.85625 13.1438 1.5 9 1.5ZM12.75 9.75H9.75V12.75H8.25V9.75H5.25V8.25H8.25V5.25H9.75V8.25H12.75V9.75Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_323_1258">
          <rect width="18" height="18" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};
