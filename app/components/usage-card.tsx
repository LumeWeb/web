import { AddIcon } from "./icons";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface UsageCardProps {
    label: string,
    monthlyUsage: number, // Asumming that the minimium is 1GB
    currentUsage: number,
    icon: React.ReactNode
}

export const UsageCard = ({ label, monthlyUsage, currentUsage, icon }: UsageCardProps) => {
    return (
        <div className="p-8 border rounded-lg w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="text-primary-2 text-sm">
                    <div className="flex items-center gap-x-2 text-lg font-bold text-white mb-2">
                        {icon}
                        {label}
                    </div>
                    Montly {label.toLocaleLowerCase()} limit is {monthlyUsage} GB
                </div>
                <Button className="gap-x-2 h-12">
                    <AddIcon />
                    Add More
                </Button>
            </div>
            <Progress max={monthlyUsage} value={currentUsage} />
            <div className="flex items-center justify-between mt-4 font-semibold text-sm">
                <span className="text-primary-2">{currentUsage} GB used</span>
                <span className="text-white">{monthlyUsage - currentUsage} GB left</span>
            </div>
        </div>
    )
}