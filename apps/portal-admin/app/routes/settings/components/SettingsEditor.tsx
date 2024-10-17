import React, { useState, useMemo, useEffect } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { CrudFilters, useList, useOne } from "@refinedev/core";
import { DataTable } from "portal-shared/components/DataTable";
import { Input } from "portal-shared/components/ui/input";
import { Checkbox } from "portal-shared/components/ui/checkbox";
import { Button } from "portal-shared/components/ui/button";
import { Textarea } from "portal-shared/components/ui/textarea";
import { Alert, AlertDescription } from "portal-shared/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "portal-shared/components/ui/popover";
import { TrashIcon, SearchIcon } from "lucide-react";
import { SkeletonLoader } from "portal-shared/components/SkeletonLoader";

interface FlattenedField {
  key: string;
  value: any;
  type: string;
  isEdited: boolean;
  isDisabled: boolean;
  schema: any;
}

const columnHelper = createColumnHelper<FlattenedField>();

const ArrayEditor: React.FC<{
  field: FlattenedField;
  onChange: (newValue: any[], isEdited: boolean) => void;
}> = ({ field, onChange }) => {
  const [newItemValue, setNewItemValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const addItem = () => {
    if (newItemValue) {
      const newArray = [...field.value, newItemValue];
      onChange(newArray, true);
      setNewItemValue("");
    }
  };

  const removeItem = (item: any) => {
    const newArray = field.value.filter((v: any) => v !== item);
    onChange(newArray, true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {field.value.length > 0
            ? field.value[field.value.length - 1]
            : "Select or add an item"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          {field.value.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span>{item}</span>
              <Button variant="ghost" onClick={() => removeItem(item)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex space-x-2">
            <Input
              value={newItemValue}
              onChange={(e) => setNewItemValue(e.target.value)}
              className="bg-background w-full"
              placeholder="New item value"
            />
            <Button onClick={addItem}>Add</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const SettingsEditor: React.FC = () => {
  const [flattenedData, setFlattenedData] = useState<FlattenedField[]>([]);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: schemaData, isLoading: isSchemaLoading } = useOne({
    resource: "settings",
    id: "schema",
  });

  const flattenObject = (
    obj: any,
    schema: any,
    prefix = "",
  ): FlattenedField[] => {
    return Object.keys(obj).reduce((acc: FlattenedField[], k) => {
      const pre = prefix.length ? prefix + "." : "";
      const currentSchema = schema.properties?.[k] || schema.items;
      if (
        typeof obj[k] === "object" &&
        obj[k] !== null &&
        !Array.isArray(obj[k])
      ) {
        acc.push(...flattenObject(obj[k], currentSchema, pre + k));
      } else {
        acc.push({
          key: pre + k,
          value: obj[k],
          type: Array.isArray(obj[k]) ? "array" : typeof obj[k],
          isEdited: false,
          isDisabled: false,
          schema: currentSchema,
        });
      }
      return acc;
    }, []);
  };

  const unflattenObject = (flatData: FlattenedField[]): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const item of flatData) {
      if (!item.isDisabled) {
        let temp = result;
        const keys = item.key.split(".");
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in temp)) {
            temp[keys[i]] = {};
          }
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] = item.value;
      }
    }
    return result;
  };

  const handleFieldChange = (key: string, newValue: any, isEdited: boolean) => {
    const updatedData = flattenedData.map((field) =>
      field.key === key ? { ...field, value: newValue, isEdited } : field,
    );

    setFlattenedData(updatedData);
    const unflattenedData = unflattenObject(updatedData);
    setJsonText(JSON.stringify(unflattenedData, null, 2));
  };

  const handleDisableToggle = (key: string) => {
    const updatedData = flattenedData.map((field) => {
      if (field.key === key || field.key.startsWith(key + ".")) {
        return { ...field, isDisabled: !field.isDisabled };
      }
      return field;
    });

    setFlattenedData(updatedData);
    const unflattenedData = unflattenObject(updatedData);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("key", {
        header: "Setting",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("value", {
        header: "Value",
        cell: (info) => {
          const { key, value, type, isDisabled } = info.row.original;
          if (isDisabled) return <span>{JSON.stringify(value)}</span>;

          switch (type) {
            case "string":
              return (
                <Input
                  value={value}
                  onChange={(e) => handleFieldChange(key, e.target.value, true)}
                  className="h-9 border border-border/30 bg-background"
                />
              );
            case "number":
              return (
                <Input
                  type="number"
                  value={value}
                  onChange={(e) =>
                    handleFieldChange(key, Number(e.target.value), true)
                  }
                  className="h-9 border border-border/30 bg-background"
                />
              );
            case "boolean":
              return (
                <Checkbox
                  checked={value}
                  onCheckedChange={(checked) =>
                    handleFieldChange(key, checked, true)
                  }
                />
              );
            case "array":
              return (
                <ArrayEditor
                  field={info.row.original}
                  onChange={(newValue, isEdited) =>
                    handleFieldChange(key, newValue, isEdited)
                  }
                />
              );
            default:
              return <span>{JSON.stringify(value)}</span>;
          }
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("isDisabled", {
        header: "Enabled",
        cell: (info) => (
          <Checkbox
            checked={!info.getValue()}
            onCheckedChange={() => handleDisableToggle(info.row.original.key)}
          />
        ),
      }),
    ],
    [],
  );

  const handleJsonTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setJsonText(event.target.value);
    setJsonError("");
  };

  const applyJsonChanges = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      const flattened = flattenObject(parsedData, schemaData!.data);
      setFlattenedData(flattened);
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON: " + (error as Error).message);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  if (isSchemaLoading) {
    return <SkeletonLoader />;
  }

  const filters: CrudFilters = [];

  if (searchTerm) {
    filters.push({
      field: "key",
      operator: "contains",
      value: searchTerm,
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search settings..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-secondary"
          />
        </div>
        <DataTable columns={columns} resource={"settings"} filters={filters} />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">JSON Editor</h2>
        <Textarea
          value={jsonText}
          onChange={handleJsonTextChange}
          className="font-mono h-[calc(100vh-200px)] min-h-[300px] w-full"
        />
        {jsonError && (
          <Alert variant="destructive">
            <AlertDescription>{jsonError}</AlertDescription>
          </Alert>
        )}
        <Button onClick={applyJsonChanges} className="w-full">
          Apply JSON Changes
        </Button>
      </div>
    </div>
  );
};
