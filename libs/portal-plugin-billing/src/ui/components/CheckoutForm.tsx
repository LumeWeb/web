import type { CheckoutUIFragment } from "@/types/subscription";
import type { GatewayPublicInfo } from "@/types/subscription";
import { FragmentRenderer } from "@/ui/components/FragmentRenderer";
import { formatAmount } from "@/utils/formatAmount";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@lumeweb/portal-framework-ui-core";
import { ArrowLeft } from "lucide-react";

export interface CheckoutFormProps {
  fragments: CheckoutUIFragment[];
  planName: string;
  planPrice: number;
  planCadence: "monthly" | "yearly" | string;
  gatewayName?: string;
  onBack: () => void;
  className?: string;
}

export function CheckoutForm({
  fragments,
  planName,
  planPrice,
  planCadence,
  gatewayName,
  onBack,
  className,
}: CheckoutFormProps) {
  const cadenceLabel = planCadence === "yearly" ? "year" : "month";

  return (
    <Card className={cn("mx-auto max-w-screen-2xl mt-10", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Complete Your Subscription</CardTitle>
            <p className="text-muted-foreground text-sm">
              Review your plan and enter payment details
            </p>
          </div>
          <Button onClick={onBack} size="sm" variant="ghost">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Plans
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{planName}</p>
              <p className="text-muted-foreground text-sm capitalize">
                {planCadence} billing
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {formatAmount(planPrice)}
                <span className="text-muted-foreground text-sm font-normal">
                  /{cadenceLabel}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Fragments */}
        <div className="rounded-md border border-border/30 p-4">
          <FragmentRenderer fragments={fragments} />
        </div>

        {/* Gateway Info */}
        {gatewayName && (
          <p className="text-muted-foreground text-center text-xs">
            Securely powered by {gatewayName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
