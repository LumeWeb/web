import React, { useState, useEffect, useRef } from "react";
import type { CryptoCurrency, FiatPlatform } from "@/data/types";

interface DonateProps {
  cryptoCurrencies: CryptoCurrency[];
  fiatPlatforms: FiatPlatform[];
  contactEmail: string;
}

function CryptoCard({ currency }: { currency: CryptoCurrency }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText(currency.address);
    setCopied(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-6 hover:border-aquamarine/40 transition-colors duration-250"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-white">
          {currency.name}
        </h3>
        <span className="font-body text-sm text-aquamarine">
          {currency.symbol}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <code className="font-mono text-sm text-cloud flex-1 break-all">
          {currency.address}
        </code>
        <button
          onClick={copyAddress}
          className={`p-2 rounded-lg transition-colors duration-250 ${
            copied
              ? "bg-aquamarine text-blue-charcoal"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          title="Copy address"
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function FiatCard({ platform }: { platform: FiatPlatform }) {
  if (platform.id === "paypal") {
    return (
      <form action={platform.url} method="post" target="_blank">
        <input type="hidden" name="hosted_button_id" value={platform.hostedButtonId} />
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-4 rounded-xl p-6 hover:bg-opacity-90 transition-colors duration-250"
          style={{
            backgroundColor: platform.backgroundColor,
            borderColor: platform.borderColor,
          }}
        >
          <span className="font-display text-xl font-bold text-white">
            {platform.name}
          </span>
        </button>
      </form>
    );
  }

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-xl p-6 hover:bg-opacity-90 transition-colors duration-250"
      style={{
        backgroundColor: platform.backgroundColor,
        borderColor: platform.borderColor,
      }}
    >
      <span className="font-display text-xl font-bold" style={{ color: platform.id === "liberapay" ? "#000" : "#fff" }}>
        {platform.name}
      </span>
    </a>
  );
}

export function Donate({ cryptoCurrencies, fiatPlatforms, contactEmail }: DonateProps) {
  return (
    <div className="bg-blue-charcoal-2">
      {/* Hero */}
      <section className="py-24 md:py-32 px-6 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
          Fund the open web
        </h1>
        <p className="font-body text-xl text-cloud max-w-2xl mx-auto mb-8">
          Public goods don't fund themselves. Help us build tools that respect users and resist censorship.
        </p>
        <a
          href="#methods"
          className="inline-flex items-center px-8 py-4 bg-aquamarine text-blue-charcoal font-display font-bold text-lg rounded-lg hover:bg-white transition-colors duration-250"
        >
          Make a donation
        </a>
      </section>

      {/* Why */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Why your support matters
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8">
              <h3 className="font-display text-xl font-bold text-aquamarine mb-4">
                No venture capital
              </h3>
              <p className="font-body text-lg text-cloud">
                We haven't taken VC money. No investors demanding returns means no pressure to compromise on privacy or build surveillance features.
              </p>
            </div>
            <div className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8">
              <h3 className="font-display text-xl font-bold text-aquamarine mb-4">
                Open source
              </h3>
              <p className="font-body text-lg text-cloud">
                Everything we build is free and open. Your donation funds public infrastructure that anyone can use and improve.
              </p>
            </div>
            <div className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8">
              <h3 className="font-display text-xl font-bold text-aquamarine mb-4">
                Long-term focus
              </h3>
              <p className="font-body text-lg text-cloud">
                We're not chasing hype cycles. We're building for the next decade of an open, user-owned internet.
              </p>
            </div>
            <div className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8">
              <h3 className="font-display text-xl font-bold text-aquamarine mb-4">
                Community-driven
              </h3>
              <p className="font-body text-lg text-cloud">
                Your voice matters. Donors and contributors shape our priorities through GitHub, Discord, and open discussion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methods */}
      <section id="methods" className="py-24 px-6 bg-blue-charcoal">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-8">
            How to donate
          </h2>

          {/* Crypto */}
          <div className="mb-12">
            <h3 className="font-display text-2xl font-bold text-aquamarine mb-6">
              Cryptocurrency
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {cryptoCurrencies.map((currency) => (
                <CryptoCard key={currency.id} currency={currency} />
              ))}
            </div>
          </div>

          {/* Fiat */}
          <div>
            <h3 className="font-display text-2xl font-bold text-aquamarine mb-6">
              Fiat & Platforms
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {fiatPlatforms.map((platform) => (
                <FiatCard key={platform.id} platform={platform} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Other */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-6">
            Other ways to give
          </h2>
          <p className="font-body text-lg text-cloud">
            If you are interested in donating through other means, please get in touch with us to discuss. If there is a cryptocurrency you wish to contribute with that we have not listed, please let us know!
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-block mt-6 px-8 py-4 bg-aquamarine text-blue-charcoal font-display font-bold text-lg rounded-lg hover:bg-white transition-colors duration-250"
          >
            Get in touch
          </a>
        </div>
      </section>

      {/* Legal */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-6">
            Tax & Legal
          </h2>
          <div className="bg-blue-charcoal border border-aquamarine/20 rounded-xl p-8 space-y-4">
            <p className="font-body text-lg text-cloud">
              <strong className="text-white">
                Donations are not tax-deductible under US regulations for our current incorporation status.
              </strong>
            </p>
            <p className="font-body text-lg text-cloud">
              All payments are nondeductible donations and do not create any implied service contract or obligation for Hammer Technologies LLC to render services.
            </p>
            <p className="font-body text-lg text-cloud">
              For large corporate donations, please consult a CPA to understand the tax implications.
            </p>
            <p className="font-body text-lg text-cloud">
              If you're interested in receiving services from Lume,{' '}
              <a href="/services" className="text-aquamarine hover:underline">
                view our Services page
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Donate;
