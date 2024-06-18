import { AddIcon } from "./icons";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface UsageCardProps {
    label: string,
    monthlyUsage: number, // Asumming that the minimium is 1GB
    currentUsage: number,
    icon: React.ReactNode,
    button?: React.ReactNode;
}

export const UsageCard = ({ label, monthlyUsage, currentUsage, icon, button }: UsageCardProps) => {
    return (
        <div className="p-8 border border-border/30 bg-secondary/50 rounded-lg w-full ">
            <div className="flex items-center justify-between mb-8">
                <div className="text-foreground text-sm">
                    <div className="flex items-center gap-x-2 text-lg font-bold text-foreground mb-2">
                        {icon}
                        {label}
                    </div>
                    Monthly {label.toLocaleLowerCase()} limit is {monthlyUsage} GB
                </div>
                <div className=" hidden lg:flex  mt-4 text-sm">
                    {!button ? (
                        <Button className="gap-x-2 h-12">
                            <AddIcon />
                            Add More
                        </Button>
                    ) : (
                        button
                    )}
                </div>
            </div>
            <Progress max={monthlyUsage} value={currentUsage} />
            <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-foreground">{currentUsage} GB used</span>
                <span className="text-foreground">{monthlyUsage - currentUsage} GB left</span>
            </div>
            <div className=" flex lg:hidden items-center justify-end mt-4 text-sm">
                {!button ? (
                    <Button className="gap-x-2 h-12">
                        <AddIcon />
                        Add More
                    </Button>
                ) : (
                    button
                )}
            </div>
        </div>
    )
}
