import { useState } from "react";
import Section from "@/components/layout/Section";
import Heading from "@/components/Heading";
import { frameworkList } from "@/lib/frameworks";

const faqs = [
  {
    group: "Website Hosting",
    items: [
      {
        question: "How do custom domains work?",
        answer:
          "Point your domain to Pinner via DNS. Your site loads at yourdomain.com with HTTPS.",
      },
      {
        question: "What frameworks can I use?",
        answer:
          `Any static site generator. ${frameworkList({ format: "technical", andMore: false })}, Vite, or plain HTML. Build your site, upload the output, and Pinner hosts it.`,
      },
      {
        question: "Is my site always online?",
        answer:
          "Your files are stored on the Sia network, where independent providers host your data and only get paid when they prove it's there. The serving layer runs through our gateway. A CDN layer is in progress.",
      },
    ],
  },
  {
    group: "IPFS Pinning",
    items: [
      {
        question: "What is IPFS?",
        answer:
          "The technology behind the hosting. Your site gets a permanent, verifiable address. Tied to your files, not to us. Change the files, get a new address. Don't change them, the same link works.",
      },
      {
        question: "What does 'pinned' mean?",
        answer:
          "Pinned means your files stay online. Unpinned content can be garbage-collected by the network. Pinned content is kept persistently.",
      },
      {
        question: "Is my pinned content public?",
        answer:
          "Yes. IPFS is a public network. Anyone with the content address can retrieve it. For private data, use private storage with zero-knowledge encryption instead.",
      },
    ],
  },
  {
    group: "Private Storage",
    items: [
      {
        question: "Can you read my files?",
        answer:
          "No. Zero-knowledge encryption means even we don't have the keys. Only you can decrypt your data.",
      },
      {
        question: "How is this different from IPFS pinning?",
        answer:
          "IPFS pinning is public, content-addressed storage. Anyone with the address can see it. Private storage encrypts your data before it leaves your device. No one can read it without your keys: not us, not the storage hosts, not the network.",
      },
      {
        question: "Are my deletes really deleted?",
        answer:
          "Yes. Private storage is not content-addressed. When you delete a file, it's gone. No ghost copies floating on the network, no caches that outlive the delete. Storage hosts are paid to keep data, and they lose income when it's removed.",
      },
    ],
  },
  {
    group: "S3 Storage",
    items: [
      {
        question: "Is it S3 compatible?",
        answer:
          "Yes. The S3 API is built into the open-source gateway you deploy yourself. Standard S3 operations work out of the box.",
      },
      {
        question: "Can I use my existing S3 tools?",
        answer:
          "Yes. Deploy the gateway on your server, then point any S3 client, CLI, SDK, or backup tool at your own endpoint.",
      },
    ],
  },
  {
    group: "General",
    items: [
      {
        question: "Can I try Pinner before paying?",
        answer:
          "Founding Offer: first 50 accounts get their rate locked for life, a 30-day money-back guarantee, and a deployment promise: create a website and if it isn't live in 5 minutes, we'll deploy it for you. Pay for storage and bandwidth. No hidden fees.",
      },
      {
        question: "How does billing work?",
        answer:
          "Pay for storage and bandwidth. No hidden fees, no API call charges. Monthly or annual. Card or crypto.",
      },
    ],
  },
];

const FAQItem = ({
  question,
  answer,
  group,
}: {
  question: string;
  answer: string;
  group: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-home-text/10 last:border-0">
      <button
        type="button"
        className="w-full text-left py-5 flex items-center justify-between gap-4 cursor-pointer"
        onClick={() => {
          const isOpening = !open;
          setOpen(!open);
          if (isOpening) {
            window.posthog?.capture("faq_item_expanded", { question, group });
          }
        }}
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

        <div className="mx-auto max-w-[720px] xl:max-w-[800px]">
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
                  group={group.group}
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
