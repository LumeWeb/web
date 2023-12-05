import Link from "next/link";

export default function Page() {
  return (
    <span className="px-8 block text-gray-400 space-y-5">
      <h1 className="text-primary text-3xl leading-9">
        You believe the internet should be free and open for everyone,
        regardless of political beliefs.
      </h1>
      <p className="text-white mt-3 leading-7">
        Please understand that, according to United States regulations for our
        present incorporation status, donations are not currently
        tax-deductible.
      </p>
      <p>
        If you are a corporation or business, planning to make a large donation,
        we recommend that you consult a CPA to ensure you understand the tax
        implications of your donated funds first.
      </p>

      <p>
        All payments are nondeductible donations (unless you get consulted
        otherwise) and do not create any implied service contract or obligation
        for Hammer Technologies LLC to render any services.
      </p>

      <p>
        To those that see Web3 as DeFi, we ask this: Do you go on your web
        browser to access TradingView or other market tools as your homepage, or
        do you go check your social media, email, and news sites, as well as
        your money? Blockchain itself is more than just money, and so is Web3,
        and by extension P2P networks.
      </p>

      <p>So help us in our goals to level-up Web3.</p>

      <Link href="https://gitcoin.com">
        <button
          className={`my-6 p-8 text-gray-500 bg-gray-800 hover:bg-gray-800/70`}
        >
          Donate via Gitcoin during funding rounds
        </button>
      </Link>
    </span>
  )
}
