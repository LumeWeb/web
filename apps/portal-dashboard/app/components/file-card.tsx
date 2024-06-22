import { FolderIcon, MoreIcon, RecentIcon } from "./icons";

export enum FileTypes {
  Folder = "FOLDER",
  Document = "DOCUMENT",
  Image = "IMAGE",
}

interface FileCardProps {
  type: FileTypes;
  fileName: string;
  createdAt: string;
  size: string;
}

export const FileCardList = ({ children }: React.PropsWithChildren<{}>) => {
  return <div
    style={{
      scrollSnapType: "x mandatory",
      scrollbarColor: "transparent transparent",

    }}
    className="flex flex-row gap-x-8 gap-6 overflow-x-auto">{children}
  </div>;
};

export const FileCard = ({ type, fileName, createdAt, size }: FileCardProps) => {
  return (
    <div className="border border-border/30 bg-secondary/30 rounded-lg p-4 w-[calc((100%/4))] min-w-[300px]">
      <div className="flex justify-end">
        <MoreIcon className="text-foreground/50" />
      </div>
      <FolderIcon className="text-foreground" />
      <span className="block font-semibold my-4">{fileName}</span>
      <div className="flex justify-between items-center">
        <span className="text-foreground text-sm">{size}</span>
        <div className="flex items-center space-x-2 text-foreground">
          <RecentIcon
          />
          <span className="text-sm">{createdAt}</span>
        </div>
      </div>
    </div>
  );
};
