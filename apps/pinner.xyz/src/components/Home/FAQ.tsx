import { useState } from "react";
import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";

const faqs = [
  {
    group: "Getting Started",
    items: [
      {
        question: "What can I do with Pinner?",
        answer:
          "Pin files on IPFS — content stays online as long as it's pinned. Host static websites. Store private data with zero-knowledge encryption — even we can't read the files. One platform, two ways to store data — public and private.",
      },
      {
        question: "How does IPFS pinning work?",
        answer:
          "Upload files through our command-line tool or developer SDK and we pin them to IPFS — content gets a link that stays online as long as it's pinned. No setup required — just pin and go.",
      },
      {
        question: "Can I store private files that no one else can see?",
        answer:
          "Yes — private storage is available now for advanced setups. You get an S3-compatible API with encryption at rest (zero-knowledge encryption — even we can't read your files). You deploy your own server and manage access yourself. A simpler 1-click setup is coming soon — subscribe below to get notified.",
      },
    ],
  },
  {
    group: "Pricing & Billing",
    items: [
      {
        question: "Can I try Pinner before paying?",
        answer:
          "We're onboarding a small group of founding users for a 6-week trial — IPFS pinning at no cost. Help shape the service and get direct access to the team. See our pricing section for details.",
      },
      {
        question: "How does billing work?",
        answer:
          "Pay for what you store and download. No hidden fees, no API call charges. Choose monthly or annual billing — annual saves you 20%. Card or crypto accepted.",
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Yes — cancel from the account dashboard anytime. No phone calls, no runaround. Data stays accessible until the current billing period ends.",
      },
    ],
  },
  {
    group: "Comparisons",
    items: [
      {
        question: "I already use Pinata or Filebase. Why switch?",
        answer:
          "They're solid for IPFS pinning. Pinner adds website hosting from the same pinned content and encrypted private storage — one service, one invoice, one set of credentials. Pinning only? They're great. Want pinning plus hosting and encrypted storage without juggling separate providers? That's where Pinner fits. Need help moving your pins? Reach out and we'll help you migrate.",
      },
      {
        question: "How does Pinner compare to traditional S3?",
        answer:
          "Pinner's private storage is S3-compatible — buckets, objects, uploads, and standard clients work out of the box. Because we use zero-knowledge encryption, the encryption keys must live on your hardware. We literally cannot read your files — which also means we can't host the decryption for you. Instead, you run a lightweight gateway appliance through our 1-click setup. It handles encryption locally and stores only encrypted fragments on the Sia network. It uses minimal CPU and runs fine on any VPS or cloud server.",
      },
    ],
  },
];

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-home-text/10 last:border-0">
      <button
        type="button"
        className="w-full text-left py-5 flex items-center justify-between gap-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className="text-home-text text-base font-medium lg:text-lg">
          {question}
        </span>
        <span className="text-home-text-muted text-xl flex-shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          +
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? "300px" : "0" }}
      >
        <p className="text-home-text-muted text-sm leading-relaxed pb-5 lg:text-base">
          {answer}
        </p>
      </div>
    </div>
  );
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((group) =>
    group.items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    }))
  ),
};

const FAQ = () => {
  return (
    <Section variant="dark" padding="md">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="xl:container px-6">
        <Heading title="Questions" highlightText="answered" />

        <div className="mx-auto max-w-[720px]">
          {faqs.map((group) => (
            <div key={group.group}>
              <p className="text-home-text-muted text-xs font-semibold uppercase tracking-wider mt-6 mb-3 first:mt-0">
                {group.group}
              </p>
              {group.items.map((faq) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default FAQ;
