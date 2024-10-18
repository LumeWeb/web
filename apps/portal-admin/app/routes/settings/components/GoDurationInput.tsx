import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "portal-shared/components/ui/input";
import { Label } from "portal-shared/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";
import { formatDuration, parseDuration } from "@/lib/time";

interface GoDurationInputProps extends Omit<ControllerRenderProps, "ref"> {
  label?: string;
}

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
