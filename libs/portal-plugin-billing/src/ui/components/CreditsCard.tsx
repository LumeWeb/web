import { useCredits } from "@/hooks/useCredits";
import { cn } from "@lumeweb/portal-framework-ui-core";
import type { UserCreditItem } from "@/types/subscription";
import { formatAmount } from "@/utils/formatAmount";

interface CreditsCardProps {
  className?: string;
}

function CreditRow({ credit }: { credit: UserCreditItem }) {
  const isCredit = credit.direction === "credit";

  return (
    <div className="flex items-center justify-between border-b py-2 last:border-b-0">
      <div>
        <p className="text-sm font-medium">{credit.description ?? credit.type}</p>
        <p className="text-muted-foreground text-xs">
          {new Date(credit.created_at).toLocaleDateString()}
        </p>
      </div>
      <span className={cn("text-sm font-medium", isCredit ? "text-green-600" : "text-destructive")}>
        {isCredit ? "+" : "-"}
        {formatAmount(credit.amount as unknown as string | number)}
      </span>
    </div>
  );
}

export function CreditsCard({ className }: CreditsCardProps) {
  const { balance, history } = useCredits();

  const balanceValue = balance.data?.balance;
  const balanceStr = balanceValue ? formatAmount(balanceValue as unknown as string | number) : "0";
  const creditItems = history.data ?? [];

  return (
    <div className={cn("border-border/30 bg-secondary/30 rounded-lg border p-6", className)}>
      <h3 className="text-lg font-semibold">Credits</h3>

      <div className="mt-4">
        <span className="text-muted-foreground text-sm">Balance</span>
        <p className="text-2xl font-bold">{balanceStr}</p>
      </div>

      {creditItems.length > 0 && (
        <div className="mt-4">
          <h4 className="text-muted-foreground mb-2 text-sm font-medium">Recent Transactions</h4>
          <div>
            {creditItems.map((credit, index) => (
              <CreditRow key={index} credit={credit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
