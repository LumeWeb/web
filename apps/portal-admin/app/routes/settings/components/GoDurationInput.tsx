import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "portal-shared/components/ui/input";
import { Label } from "portal-shared/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";

interface GoDurationInputProps extends Omit<ControllerRenderProps, "ref"> {
  label?: string;
}

const parseDuration = (durationString: string): number | null => {
  const regex = /^(\d+(\.\d+)?)(ns|us|µs|ms|s|m|h)$/;
  const parts = durationString.match(/(\d+(\.\d+)?[nµumsh])/g);
  if (!parts) return null;

  let totalMs = 0;
  for (const part of parts) {
    const match = part.match(regex);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[3];

    const unitToMs: { [key: string]: number } = {
      ns: value / 1e6,
      us: value / 1e3,
      µs: value / 1e3,
      ms: value,
      s: value * 1e3,
      m: value * 60 * 1e3,
      h: value * 60 * 60 * 1e3,
    };

    totalMs += unitToMs[unit] || 0;
  }

  return totalMs;
};

const formatDuration = (ms: number): string => {
  const units = [
    { value: 60 * 60 * 1000, label: "h" },
    { value: 60 * 1000, label: "m" },
    { value: 1000, label: "s" },
    { value: 1, label: "ms" },
    { value: 0.001, label: "us" },
    { value: 0.000001, label: "ns" },
  ];

  let result = "";
  let remainingMs = ms;

  for (const unit of units) {
    if (remainingMs >= unit.value || result !== "") {
      const count = Math.floor(remainingMs / unit.value);
      if (count > 0) {
        result += `${count}${unit.label}`;
        remainingMs %= unit.value;
      }
    }
  }

  return result || "0ns";
};

export default function GoDurationInput({
  value,
  onChange,
  onBlur,
  label,
  ...field
}: GoDurationInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (typeof value === "string") {
      setInputValue(value);
    } else if (typeof value === "number") {
      setInputValue(formatDuration(value));
    }
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue === "") {
      setError("Duration cannot be empty");
      onChange(value); // Revert to previous valid value
    } else {
      const parsedValue = parseDuration(newValue);
      if (parsedValue !== null) {
        setError("");
        onChange(newValue); // Keep the original string format
      } else {
        setError("Invalid duration format");
        onChange(value); // Revert to previous valid value
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex space-x-2">
        <Input
          {...field}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder="e.g., 5m, 2h30m, 10s"
          className={error ? "border-red-500" : ""}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
