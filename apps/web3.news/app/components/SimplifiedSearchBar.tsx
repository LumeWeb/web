import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "@remix-run/react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { SitesCombobox } from "./SitesCombobox";
import { FILTER_TIMES } from "@/utils";
import { SiteList } from "@/types.js";

type Props = {
  value: string;
  placeholder?: string;
  className?: string;
  filters?: {
    sites: { value: string; label: string }[];
  };
  sites: SiteList;
};

const SimplifiedSearchBar = ({
  value: initialValue,
  placeholder,
  filters,
  className,
  sites,
}: Props) => {
  let navigate = useNavigate();
  let location = useLocation();
  const [value, setValue] = useState<string>(initialValue);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      doSearch();
    },
    [value]
  );

  function doSearch() {
    const newSearchParams = new URLSearchParams(location.search);

    if (value) {
      newSearchParams.set("q", value);
    } else {
      newSearchParams.delete("q");
      return;
    }

    if (selectedSite) {
      newSearchParams.set("site", selectedSite);
    }

    if (selectedTime) {
      const timestampInMilliseconds = Date.parse(selectedTime); // Date.parse returns the timestamp in milliseconds
      const timestamp = timestampInMilliseconds / 1000;
      newSearchParams.set("time", timestamp.toString());
    }

    navigate(`${location.pathname}?${newSearchParams}`);
  }

  useEffect(() => {
    doSearch();
  }, [selectedSite, selectedTime]);

  return (
    <form
      className={`flex items-center text-lg border-b border-primary pb-2 ${className}`}
      onSubmit={handleSearch}
    >
      <div className="flex-1 flex flex-row max-w-full">
        <span className="text-white mr-2">results: </span>
        <fieldset
          className={`${
            value && value !== ""
              ? `after:content-['"'] before:content-['"'] relative after:absolute after:-right-1`
              : "w-full"
          } text-primary ${className}`}
        >
          <input
            className={`flex-grow inline bg-transparent placeholder-gray-400 outline-none ring-none text-primary ${
              value && value !== "" ? "" : "w-full"
            }`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            size={value.length}
          />
        </fieldset>
      </div>
      <div className="w-56 flex gap-2">
        {/* Dropdown component should be here */}
        <SitesCombobox siteList={sites} onSiteSelect={setSelectedSite} />
        {/* Dropdown component should be here */}
        <Select defaultValue={"0"} onValueChange={(v) => setSelectedTime(v)}>
          <SelectTrigger className="hover:bg-muted w-auto">
            <SelectValue placeholder="Time ago" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_TIMES.map((v) => (
              <SelectItem
                value={String(v.value)}
                key={`FilteTimeSelectItem_${v.value}`}
              >
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

export default SimplifiedSearchBar;
