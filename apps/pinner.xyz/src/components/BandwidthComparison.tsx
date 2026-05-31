import { cn } from "@/lib/utils";

interface BandwidthComparisonProps {
  competitor: string;
  competitorAllowance: string;
  competitorOverage: string;
  competitorMonthlyCost?: string;
  pinnerAllowance: string;
  pinnerMonthlyCost?: string;
  verifiedDate: string;
  className?: string;
}

export default function BandwidthComparison({
  competitor,
  competitorAllowance,
  competitorOverage,
  competitorMonthlyCost,
  pinnerAllowance,
  pinnerMonthlyCost,
  verifiedDate,
  className,
}: BandwidthComparisonProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-content-divider/50 bg-white overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Competitor column */}
        <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-content-divider/50">
          <p className="text-content-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            {competitor}
          </p>
          <p className="text-content-text text-2xl md:text-3xl font-medium mb-2">
            {competitorAllowance}
          </p>
          <p className="text-content-text-muted text-sm md:text-base mb-1">
            {competitorOverage}
          </p>
          {competitorMonthlyCost && (
            <p className="text-content-text-muted text-sm">
              {competitorMonthlyCost}
            </p>
          )}
        </div>

        {/* Pinner column */}
        <div className="flex-1 p-6 md:p-8 bg-content-section-gray">
          <p className="text-content-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Pinner
          </p>
          <p className="text-content-text text-2xl md:text-3xl font-medium mb-2">
            {pinnerAllowance}
          </p>
          {pinnerMonthlyCost && (
            <p className="text-content-text text-sm md:text-base">
              {pinnerMonthlyCost}
            </p>
          )}
        </div>
      </div>

      {/* Pricing verified stamp */}
      <div className="px-6 md:px-8 py-3 border-t border-content-divider/50 bg-white">
        <p className="text-content-text-muted text-xs text-right italic">
          Bandwidth pricing verified {verifiedDate}
        </p>
      </div>
    </div>
  );
}
