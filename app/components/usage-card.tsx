import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface UsageCardProps {
    usageName: string,
    monthlyUsage: number, // Asumming that the minimium is 1GB
    currentUsage: number,
    icon: React.ReactNode
}

export const UsageList = ({ children }: React.PropsWithChildren<{}>) => {
    return (
        <div className="grid grid-cols-2 gap-8 flex-wrap w-full">
            {children}
        </div>
    )
}

export const UsageCard = ({ usageName, monthlyUsage, currentUsage, icon }: UsageCardProps) => {
    return (
        <div className="p-8 border rounded-lg w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="text-primary-2 text-sm">
                    <div className="flex items-center gap-x-2 text-lg font-bold text-white mb-2">
                        {icon}
                        {usageName}
                    </div>
                    Montly {usageName.toLocaleLowerCase()} limit is {monthlyUsage} GB
                </div>
                <Button className="gap-x-2 h-12">
                    <AddIcon />
                    Add More
                </Button>
            </div>
            <Progress max={monthlyUsage} value={currentUsage} />
            <div className="flex items-center justify-between mt-4 font-bold text-sm">
                <span className="text-primary-2">{currentUsage} GB used</span>
                <span className="text-white">{monthlyUsage - currentUsage} GB left</span>
            </div>
        </div>
    )
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