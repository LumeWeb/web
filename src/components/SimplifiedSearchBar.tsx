"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { FormEvent, useState } from "react"
import { Select, SelectContent, SelectTrigger, SelectItem } from "./ui/select"
import { subDays, subMonths, subYears } from "date-fns"

type Props = {
  value: string
  placeholder?: string
  className?: string
  filters?: {
    sites: {value: string, label:string}[]
  }
}

export const TIME_FILTER_OPTIONS = [
  { value: subDays(new Date(), 1), label: '1d ago' },
  { value: subDays(new Date(), 7), label: '7d ago' },
  { value: subDays(new Date(), 15), label: '15d ago' },
  { value: subMonths(new Date(), 1), label: '1m ago' },
  { value: subMonths(new Date(), 6), label: '6m ago' },
  { value: subYears(new Date(), 1), label: '1y ago' },
];


const SimplifiedSearchBar = ({
  value: initialValue,
  placeholder,
  filters,
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
      <div className="w-56 flex">
            <Select>
                <SelectTrigger className="w-32 flex-1">
                  All Sites
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Options yet</SelectItem>
                </SelectContent>
            </Select>
          <Select>
                <SelectTrigger className="w-32 flex-1">
                  All Times
                </SelectTrigger>
                <SelectContent>
                  {TIME_FILTER_OPTIONS.map(o => <SelectItem key={o.value.toISOString()} value={o.value.toISOString()}> {o.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    </form>
  )
}

export default SimplifiedSearchBar
