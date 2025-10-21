import React from "react";

interface StripePricingTableProps {
  pricingTableId: string;
  publishableKey: string;
  customerEmail?: string;
  clientReferenceId?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-pricing-table": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export const StripePricingTable: React.FC<StripePricingTableProps> = ({
  pricingTableId,
  publishableKey,
  customerEmail,
  clientReferenceId
}) => {
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <stripe-pricing-table
      pricing-table-id={pricingTableId}
      publishable-key={publishableKey}
      {...(customerEmail && { "customer-email": customerEmail })}
      {...(clientReferenceId && { "client-reference-id": clientReferenceId })}
    />
  );
};
