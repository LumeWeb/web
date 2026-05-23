import Section from "@/components/layout/Section";
import paymentMethods from "@/data/payment-methods.json";

interface PaymentMethod {
  id: number;
  src: string;
  alt: string;
  category: string;
}

const groupedOrder: Record<string, number> = {
  stablecoin: 0,
  crypto: 1,
  card: 2,
};

const sorted = [...(paymentMethods as PaymentMethod[])].sort(
  (a, b) => (groupedOrder[a.category] ?? 9) - (groupedOrder[b.category] ?? 9)
);

const cryptoMethods = sorted.filter((m) => m.category !== "card");
const cardMethods = sorted.filter((m) => m.category === "card");

interface PaymentMethodsBarProps {
  variant?: "default" | "dark" | "gray" | "white";
  compact?: boolean;
}

const PaymentMethodsBar = ({ variant = "dark", compact = false }: PaymentMethodsBarProps) => {
  return (
    <Section variant={variant} padding={compact ? "none" : "sm"}>
      <div className="xl:container px-6">
        {!compact && (
          <p className="text-home-text-muted text-center text-xs font-medium uppercase tracking-wider mb-4">
            Pay with crypto or card
          </p>
        )}
        <div className={`flex items-center justify-center gap-3 md:gap-4 ${compact ? "flex-nowrap overflow-hidden" : "flex-wrap"}`}>
          {cryptoMethods.map((method) => (
            <img
              key={method.id}
              src={method.src}
              alt={method.alt}
              width={56}
              height={28}
              className={`${compact ? "w-8 md:w-10 max-h-4 md:max-h-5" : "w-14 md:w-16 max-h-7 md:max-h-8"} object-contain opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}
              loading="lazy"
            />
          ))}

          <span className={`w-px ${compact ? "h-4" : "h-8"} bg-home-text/20 mx-2 flex-shrink-0`} aria-hidden="true" />

          {cardMethods.map((method) => (
            <img
              key={method.id}
              src={method.src}
              alt={method.alt}
              width={56}
              height={28}
              className={`${compact ? "w-8 md:w-10 max-h-4 md:max-h-5" : "w-14 md:w-16 max-h-7 md:max-h-8"} object-contain opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default PaymentMethodsBar;
