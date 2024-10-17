import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { CrudFilters, useOne } from "@refinedev/core";
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
import { TrashIcon, SearchIcon, XIcon } from "lucide-react";
import { SkeletonLoader } from "portal-shared/components/SkeletonLoader";
import Ajv, { JSONSchemaType } from "ajv/dist/2020";
import type { AnySchema } from "ajv/lib/types";

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
  const [filters, setFilters] = useState<CrudFilters>([]);
  const ajv = useRef(new Ajv());

  const { data: schemaData, isLoading: isSchemaLoading } = useOne<AnySchema>({
    resource: "settings",
    id: "schema",
  });

  /*  const flattenObject = useCallback(
    (obj: any, schema: any, prefix = ""): FlattenedField[] => {
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
    },
    [],
  );*/

  /*const unflattenObject = useCallback(
    (flatData: FlattenedField[]): Record<string, any> => {
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
    },
    [],
  );*/

  /*  const handleFieldChange = useCallback(
    (key: string, newValue: any, isEdited: boolean) => {
      setFlattenedData((prevData) =>
        prevData.map((field) =>
          field.key === key ? { ...field, value: newValue, isEdited } : field,
        ),
      );
      setJsonText(() => {
        const updatedData = unflattenObject(
          flattenedData.map((field) =>
            field.key === key ? { ...field, value: newValue, isEdited } : field,
          ),
        );
        return JSON.stringify(updatedData, null, 2);
      });
    },
    [flattenedData, unflattenObject],
  );*/

  const updateFilters = useCallback((term: string) => {
    if (term) {
      setFilters([
        {
          field: "key",
          operator: "contains",
          value: term,
        },
      ]);
    } else {
      setFilters([]);
    }
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      updateFilters(term);
    },
    [updateFilters],
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    updateFilters("");
  }, [updateFilters]); /*

  const handleJsonTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setJsonText(event.target.value);
      setJsonError("");
    },
    [],
  );

  const applyJsonChanges = useCallback(() => {
    try {
      const parsedData = JSON.parse(jsonText);
      const flattened = flattenObject(parsedData, schemaData!.data);
      setFlattenedData(flattened);
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON: " + (error as Error).message);
    }
  }, [jsonText, schemaData, flattenObject]);*/

  const getSchemaForKey = useCallback(
    (key: string): JSONSchemaType<unknown> | null => {
      const schema = ajv.current.getSchema("settings")!.schema;
      const parts = key.split(".");
      let currentSchema: JSONSchemaType<unknown> = schema!;

      for (const part of parts) {
        if (
          currentSchema.type === "object" &&
          currentSchema.properties &&
          part in currentSchema.properties
        ) {
          currentSchema = currentSchema.properties[
            part
          ] as JSONSchemaType<unknown>;
        } else if (currentSchema.type === "array" && currentSchema.items) {
          // If it's an array, we need to handle numeric indices
          if (/^\d+$/.test(part)) {
            // If the part is a number, it's an array index, so we stay on the items schema
            currentSchema = Array.isArray(currentSchema.items)
              ? (currentSchema.items[
                  Number(part)
                ] as JSONSchemaType<unknown>) || currentSchema.items[0]
              : currentSchema.items;
          } else {
            // If it's not a number, we're dealing with an object inside the array
            currentSchema = currentSchema.items;
          }
        } else {
          return null;
        }
      }

      return currentSchema;
    },
    [],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("key", {
        header: "Setting",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("value", {
        header: "Value",
        cell: (info) => {
          const { key, value } = info.row.original;
          const fieldSchema = getSchemaForKey(key);
          const fieldType = fieldSchema?.type || typeof value;

          switch (fieldType) {
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
      columnHelper.accessor(
        (row) => {
          const fieldSchema = getSchemaForKey(row.key);
          return fieldSchema?.type || typeof row.value;
        },
        {
          id: "type",
          header: "Type",
          cell: (info) => info.getValue(),
        },
      ),
    ],
    [getSchemaForKey],
  );

  useEffect(() => {
    if (schemaData?.data) {
      ajv.current.addSchema(
        schemaData.data as unknown as AnySchema,
        "settings",
      );
    }
  }, [isSchemaLoading]);

  if (isSchemaLoading) {
    return <SkeletonLoader />;
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
            className="w-full pl-10 pr-10 py-2 rounded-md bg-secondary"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={clearSearch}>
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTable
          columns={columns}
          resource="settings"
          filters={filters}
          pagination={{ pageSize: 20 }}
        />
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">JSON Editor</h2>
        <Textarea
          value={jsonText}
          /*          onChange={handleJsonTextChange}*/
          className="font-mono h-[calc(100vh-200px)] min-h-[300px] w-full"
        />
        {jsonError && (
          <Alert variant="destructive">
            <AlertDescription>{jsonError}</AlertDescription>
          </Alert>
        )}
        <Button
          /*          onClick={applyJsonChanges}*/
          className="w-full">
          Apply JSON Changes
        </Button>
      </div>
    </div>
  );
};
