import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
  className?: string;
}

export default function FAQ({ faqs, className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("mx-auto max-w-[800px]", className)}>
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border-content-divider/50 border-b last:border-0"
        >
          <button
            onClick={() => {
              const isOpening = openIndex !== i;
              setOpenIndex(openIndex === i ? null : i);
              if (isOpening) {
                window.posthog?.capture("faq_item_expanded", { question: faq.question });
              }
            }}
            className="flex w-full items-center justify-between py-5 text-left md:py-6"
          >
            <span className="text-content-text pr-4 text-base font-medium md:text-lg">
              {faq.question}
            </span>
            <span
              className={cn(
                "text-content-text-muted flex-shrink-0 text-xl transition-transform duration-200",
                openIndex === i && "rotate-45"
              )}
            >
              +
            </span>
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              openIndex === i ? "max-h-96 pb-5 md:pb-6" : "max-h-0"
            )}
          >
            <p className="text-content-text-muted text-sm leading-relaxed md:text-base" dangerouslySetInnerHTML={{ __html: faq.answer }} />
          </div>
        </div>
      ))}
    </div>
  );
}
