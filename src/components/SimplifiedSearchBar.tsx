"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import React, { FormEvent, useState } from "react"

type Props = {
  value: string
  placeholder?: string
  className?: string
}

const SimplifiedSearchBar = ({
  value: initialValue,
  placeholder,
  className
}: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState<string>(initialValue)
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams)

    if(value) {
      newSearchParams.set('q', value)
    } else {
      newSearchParams.delete('q')
    }

    router.push(`${pathname}?${newSearchParams}`)
  }
  return (
    <form
      className={`flex items-center text-lg border-b border-primary pb-2`}
      onSubmit={handleSearch}
    >
      <div className="flex-1 flex flex-row max-w-full">
        <span className="text-white mr-2">results: </span>
        <fieldset
          className={`${value && value !== "" ? `after:content-['"'] before:content-['"'] relative after:absolute after:-right-1` : "w-full"} text-primary ${className}`}
        >
          <input
            className={`flex-grow inline bg-transparent placeholder-gray-400 outline-none ring-none text-primary ${value && value !== "" ? "" : "w-full"}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            size={value.length}
          />
        </fieldset>
      </div>
      <div className="w-[220px] flex">
          {/* Dropdown component should be here */}
          <div className="uppercase text-white text-[12px] mx-3 font-semibold">
            <span>All Sites</span>
            <ChevronDownIcon className="w-4 h-4 inline-block ml-2" />
          </div>
          {/* Dropdown component should be here */}
          <div className="uppercase text-white text-[12px] mx-3 font-semibold">
            <span>All Times</span>
            <ChevronDownIcon className="w-4 h-4 inline-block ml-2" />
          </div>
        </div>
    </form>
  )
}

export default SimplifiedSearchBar
