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
  return <div className="flex flex-row gap-x-8">{children}</div>;
};

export const FileCard = ({ type, fileName, createdAt, size }: FileCardProps) => {
  return (
    <div className="border-1 rounded-lg p-4 w-[calc((100%/4))]">
      <div className="flex justify-end">
        <MoreIcon className="text-ring/50" />
      </div>
      <FolderIcon className="text-ring" />
      <span className="block font-semibold my-4">{fileName}</span>
      <div className="flex justify-between items-center">
        <span className="text-primary-2 font-semibold text-sm">{size}</span>
        <div className="flex items-center space-x-2 text-primary-2">
          <RecentIcon />
          <span className="font-semibold text-sm">{createdAt}</span>
        </div>
      </div>
    </div>
  );
};

const FolderIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="28"
      height="22"
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11 0H2.75C1.2375 0 0 1.2375 0 2.75V19.25C0 20.7625 1.2375 22 2.75 22H24.75C26.2625 22 27.5 20.7625 27.5 19.25V5.5C27.5 3.9875 26.2625 2.75 24.75 2.75H13.75L11 0Z"
        fill="currentColor"
      />
    </svg>
  );
};

const MoreIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19 8H5C4.73478 8 4.48043 7.89464 4.29289 7.70711C4.10536 7.51957 4 7.26522 4 7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H19C19.2652 6 19.5196 6.10536 19.7071 6.29289C19.8946 6.48043 20 6.73478 20 7C20 7.26522 19.8946 7.51957 19.7071 7.70711C19.5196 7.89464 19.2652 8 19 8Z"
        fill="currentColor"
      />
      <path
        d="M19 13H5C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11H19C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13Z"
        fill="currentColor"
      />
      <path
        d="M19 18H5C4.73478 18 4.48043 17.8946 4.29289 17.7071C4.10536 17.5196 4 17.2652 4 17C4 16.7348 4.10536 16.4804 4.29289 16.2929C4.48043 16.1054 4.73478 16 5 16H19C19.2652 16 19.5196 16.1054 19.7071 16.2929C19.8946 16.4804 20 16.7348 20 17C20 17.2652 19.8946 17.5196 19.7071 17.7071C19.5196 17.8946 19.2652 18 19 18Z"
        fill="currentColor"
      />
    </svg>
  );
};

const RecentIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_323_1182)">
        <path
          d="M6 0C4.81331 0 3.65328 0.351894 2.66658 1.01118C1.67989 1.67047 0.910851 2.60754 0.456726 3.7039C0.00259972 4.80026 -0.11622 6.00666 0.115291 7.17054C0.346802 8.33443 0.918247 9.40353 1.75736 10.2426C2.59648 11.0818 3.66558 11.6532 4.82946 11.8847C5.99335 12.1162 7.19975 11.9974 8.2961 11.5433C9.39246 11.0892 10.3295 10.3201 10.9888 9.33342C11.6481 8.34673 12 7.18669 12 6C11.9983 4.40923 11.3656 2.88411 10.2407 1.75926C9.1159 0.634414 7.59077 0.00172054 6 0ZM6 11C5.0111 11 4.0444 10.7068 3.22215 10.1573C2.39991 9.60794 1.75904 8.82705 1.38061 7.91342C1.00217 6.99979 0.90315 5.99445 1.09608 5.02455C1.289 4.05464 1.76521 3.16373 2.46447 2.46447C3.16373 1.7652 4.05465 1.289 5.02455 1.09607C5.99446 0.903148 6.99979 1.00216 7.91342 1.3806C8.82705 1.75904 9.60794 2.3999 10.1574 3.22215C10.7068 4.04439 11 5.01109 11 6C10.9985 7.32564 10.4713 8.59656 9.53393 9.53393C8.59656 10.4713 7.32564 10.9985 6 11Z"
          fill="currentColor"
        />
        <path
          d="M6.5 5.793V3C6.5 2.86739 6.44732 2.74021 6.35355 2.64645C6.25979 2.55268 6.13261 2.5 6 2.5C5.86739 2.5 5.74021 2.55268 5.64645 2.64645C5.55268 2.74021 5.5 2.86739 5.5 3V6C5.50003 6.1326 5.55273 6.25975 5.6465 6.3535L7.1465 7.8535C7.2408 7.94458 7.3671 7.99498 7.4982 7.99384C7.6293 7.9927 7.75471 7.94011 7.84741 7.84741C7.94011 7.75471 7.9927 7.6293 7.99384 7.4982C7.99498 7.3671 7.94458 7.2408 7.8535 7.1465L6.5 5.793Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_323_1182">
          <rect width="12" height="12" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};
