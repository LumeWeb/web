"use client"

import { ArrowLeftIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TEXT_DICT = {
    "/about": {
        headline: "Sharing community news on the open, user-owned web you deserve.",
        tagline: "Learn about our community"
    },
    "/donate": {
        headline: "We think people should have free access to information no matter how they choose to access it.",
        tagline: "Help us break the pattern"
    }
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const text = TEXT_DICT[pathname! as '/about' | '/donate']
  return (
    <section className="w-full">
      <header className="text-white mt-10 pb-3 border-b-2 border-primary">
        <h2>{text.headline}</h2>
      </header>
      <Link href="/">
        <button className="my-4 -ml-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded">
          <ArrowLeftIcon className="w-4 h-4 inline mr-2 -mt-1" />
          Back to Home
        </button>
      </Link>
      <div className="flex flex-row mt-6">
        <aside className="w-1/3">
          <h3 className="text-white mb-5">{text.tagline}</h3>
          <nav className="sticky top-3">
            <ol>
              <AsideItem href="/about" title="About Web3News" />
              <AsideItem href="/donate" title="Donate" />
            </ol>
          </nav>
        </aside>
        <section className="w-full">{children}</section>
      </div>
    </section>
  )
}

const AsideItem = ({ title, href }: { title: string; href: string }) => {
  const pathname = usePathname()
  return (
    <Link href={href}>
      <li>
        <button
          className={`w-[calc(100%-20px)] mb-3 p-8 text-gray-500 bg-gray-800 text-start ${
            pathname === href
              ? "border border-primary text-primary bg-transparent"
              : "hover:bg-gray-800/70"
          }`}
        >
          {title}
        </button>
      </li>
    </Link>
  )
}
