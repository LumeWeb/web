import { AddIcon } from "./icons";
import { Button } from "./ui/button";
import { IndeterminateProgress } from "./ui/indeterminate-progress";
import { Progress } from "./ui/progress";
import filesize from "@/util/filesize.js";
import useIsBillingEnabled from "@/hooks/useIsBillingEnabled";
import useIsPaidBillingEnabled from "@/hooks/useIsPaidBillingEnabled";
import { Link } from "@remix-run/react";

interface UsageCardProps {
  label: string;
  maxUsage: number; // Asumming that the minimium is 1GB
  currentUsage: number;
  icon: React.ReactNode;
  button?: React.ReactNode;
}

export const UsageCard = ({
  label,
  maxUsage,
  currentUsage,
  icon,
  button,
}: UsageCardProps) => {
  const limitEnabled = maxUsage > -1;

  const paidBillingEnabled = useIsPaidBillingEnabled();

  return (
    <div className="p-8 border border-border/30 bg-secondary/50 rounded-lg w-full ">
      <div className="flex items-center justify-between mb-8">
        <div className="text-foreground text-sm">
          <div className="flex items-center gap-x-2 text-lg font-bold text-foreground mb-2">
            {icon}
            {label}
          </div>
          {limitEnabled && (
            <div className="text-sm text-foreground/60">
              Monthly {label.toLocaleLowerCase()} limit is {filesize(maxUsage)}
            </div>
          )}
        </div>
        {limitEnabled && paidBillingEnabled && (
          <div className=" hidden lg:flex  mt-4 text-sm">
            <Link to="/account/subscription">
              {!button ? (
                <Button className="gap-x-2 h-12">
                  <AddIcon />
                  Add More
                </Button>
              ) : (
                button
              )}
            </Link>
          </div>
        )}
      </div>
      {limitEnabled && <Progress max={maxUsage} value={currentUsage} />}
      {!limitEnabled && <IndeterminateProgress />}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-foreground">{filesize(currentUsage)} used</span>
        {limitEnabled && (
          <span className="text-foreground">
            {filesize(maxUsage - currentUsage)} left
          </span>
        )}
      </div>
      {limitEnabled && (
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
      )}
    </div>
  );
};
