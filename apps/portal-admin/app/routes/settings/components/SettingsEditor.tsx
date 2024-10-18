import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "@refinedev/react-hook-form";
import { CrudFilters, useList, useOne, useUpdate } from "@refinedev/core";
import { DataTable } from "portal-shared/components/DataTable";
import { Input } from "portal-shared/components/ui/input";
import { Checkbox } from "portal-shared/components/ui/checkbox";
import { Button } from "portal-shared/components/ui/button";
import { Textarea } from "portal-shared/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "portal-shared/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import { SearchIcon, TrashIcon, XIcon } from "lucide-react";
import { SkeletonLoader } from "portal-shared/components/SkeletonLoader";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { z } from "zod";
import { createColumnHelper } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormReturn } from "react-hook-form";
import { flatten, unflatten } from "flat";
import Ajv, { JSONSchemaType } from "ajv/dist/2020";
import type { AnySchema } from "ajv/lib/types";
import { JsonSchema } from "json-schema-to-zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "portal-shared/components/ui/dialog";
import { DialogHeader } from "apps/web3.news/app/components/ui/dialog";
import GoDurationInput from "@/routes/settings/components/GoDurationInput";

interface SettingField {
  key: string;
  value: any;
  type: string;
}

interface SettingsItem {
  key: string;
  value: any;
  editable: boolean;
}

interface ArrayEditorProps {
  field: SettingField;
  form: UseFormReturn<any>;
  name: string;
}

const ArrayEditor: React.FC<ArrayEditorProps> = ({ field, form, name }) => {
  const [newItemValue, setNewItemValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
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
                  {field.value.map((item: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between">
                      <span>{item}</span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newArray = field.value.filter(
                            (v: string) => v !== item,
                          );
                          field.onChange(newArray);
                        }}>
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
                    <Button
                      onClick={() => {
                        if (newItemValue) {
                          const newArray = [...field.value, newItemValue];
                          field.onChange(newArray);
                          setNewItemValue("");
                        }
                      }}>
                      Add
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const SettingsEditor: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CrudFilters>([]);
  const [jsonData, setJsonData] = useState<any>({});
  const [jsonEditorValue, setJsonEditorValue] = useState("");
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set());
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const ajv = useRef(new Ajv());

  const { data: schemaData, isLoading: isSchemaLoading } = useOne<{
    properties: Record<string, any>;
  }>({
    resource: "settings",
    id: "schema",
  });

  const { data: settingsData, refetch: refetchSettings } =
    useList<SettingsItem>({
      resource: "settings",
      pagination: {
        pageSize: totalCount || 10, // Use totalCount when available, otherwise use a default value
        mode: "server",
      },
    });

  const { mutate: updateSetting } = useUpdate({
    resource: "settings",
  });

  useEffect(() => {
    if (settingsData?.data && settingsData.data.length === totalCount) {
      const settings = settingsData.data.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      const unflattened = unflatten(settings);
      setJsonData(unflattened);
      setJsonEditorValue(JSON.stringify(unflattened, null, 2));

      const editableKeys = settingsData.data
        .filter((setting) => setting.editable)
        .map((setting) => setting.key);
      setEditableFields(new Set(editableKeys));

      setIsDataLoaded(true);
    }
  }, [settingsData?.data, totalCount]);

  useEffect(() => {
    if (schemaData?.data) {
      ajv.current.removeSchema();
      ajv.current.addSchema(
        schemaData.data as unknown as AnySchema,
        "settings",
      );
    }
  }, [isSchemaLoading]);

  useEffect(() => {
    if (settingsData?.total) {
      setTotalCount(settingsData.total);
    }
  }, [settingsData?.total]);

  const getSchemaForKey = useCallback(
    (key: string): JSONSchemaType<unknown> | null => {
      const ret = ajv.current.getSchema("settings");
      if (!ret) {
        return null;
      }
      const schema = ret!.schema;
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

  const getZodSchemaForKey = useCallback(
    (key: string) => {
      const jsonSchema = getSchemaForKey(key);
      if (!jsonSchema) return z.any();
      return jsonSchemaToZod(jsonSchema as JsonSchema);
    },
    [getSchemaForKey],
  );

  const formSchema = useMemo(() => {
    if (!schemaData?.data) return z.object({});
    const schemaEntries = Object.entries(schemaData.data.properties).map(
      ([key]) => [key, getZodSchemaForKey(key)],
    );
    return z.object(Object.fromEntries(schemaEntries));
  }, [schemaData, getZodSchemaForKey]);

  const {
    refineCore: { onFinish, formLoading },
    ...form
  } = useForm({
    refineCoreProps: {
      resource: "settings",
      action: "edit",
    },
    resolver: zodResolver(formSchema),
  });

  const columnHelper = createColumnHelper<SettingField>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("key", {
        header: "Setting",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("value", {
        header: "Value",
        cell: ({ row }) => {
          const { key } = row.original;

          const fieldSchema = getSchemaForKey(key);
          let type = fieldSchema?.type || typeof row.original.value;

          if (type === "string" && isGoDuration(row.original.value)) {
            type = "duration";
          }

          switch (type) {
            case "string":
              return (
                <FormField
                  control={form.control}
                  name={key}
                  disabled={!editableFields.has(key)}
                  defaultValue={row.original.value}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-9 border border-border/30 bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            case "number":
              return (
                <FormField
                  control={form.control}
                  name={key}
                  disabled={!editableFields.has(key)}
                  defaultValue={row.original.value}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          className="h-9 border border-border/30 bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            case "boolean":
              return (
                <FormField
                  control={form.control}
                  name={key}
                  disabled={!editableFields.has(key)}
                  defaultValue={row.original.value}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              );
            case "array":
              return (
                <ArrayEditor field={row.original} form={form} name={key} />
              );
            case "duration":
              return (
                <FormField
                  control={form.control}
                  name={key}
                  disabled={!editableFields.has(key)}
                  defaultValue={row.original.value}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <GoDurationInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            default:
              return <span>{JSON.stringify(row.original.value)}</span>;
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
    [form],
  );

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
  }, [updateFilters]);

  const handleJsonEditorChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setJsonEditorValue(e.target.value);
  };

  const applyJsonChanges = () => {
    try {
      const newJsonData = JSON.parse(jsonEditorValue);
      const valid = ajv.current.validate("settings", newJsonData);

      if (!valid) {
        console.error("JSON validation failed:", ajv.current.errors);
        setErrorMessage(JSON.stringify(ajv.current.errors, null, 2));
        setIsErrorModalOpen(true);
        return;
      }

      type FlattenData = Record<string, any>;

      const flattenedNewData = flatten<any, FlattenData>(newJsonData);
      const flattenedOldData = flatten<any, FlattenData>(jsonData);

      const changedKeys = Object.keys(flattenedNewData).filter(
        (key) =>
          flattenedNewData[key] !== flattenedOldData[key] &&
          editableFields.has(key),
      );

      changedKeys.forEach((key) => {
        updateSetting(
          {
            id: key,
            values: { value: flattenedNewData[key] },
          },
          {
            onSuccess: () => {
              console.log(`Successfully updated ${key}`);
            },
            onError: (error) => {
              console.error(`Failed to update ${key}:`, error);
            },
          },
        );
      });

      // Update jsonData with only the editable fields
      const editableNewData = Object.fromEntries(
        Object.entries(flattenedNewData).filter(([key]) =>
          editableFields.has(key),
        ),
      );
      const editableOldData = Object.fromEntries(
        Object.entries(flattenedOldData).filter(
          ([key]) => !editableFields.has(key),
        ),
      );
      const updatedData = { ...editableOldData, ...editableNewData };
      const unflattened = unflatten(updatedData);

      setJsonData(unflattened);
      setJsonEditorValue(JSON.stringify(unflattened, null, 2));
      refetchSettings();
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      setErrorMessage(`Failed to parse JSON: ${error?.message}`);
      setIsErrorModalOpen(true);
    }
  };

  if (isSchemaLoading || !isDataLoaded) {
    return <SkeletonLoader />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFinish)}>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
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
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">JSON Editor</h2>
            <Textarea
              value={jsonEditorValue}
              onChange={handleJsonEditorChange}
              className="font-mono h-[calc(100vh-200px)] min-h-[300px] w-full"
            />
            <Button
              onClick={applyJsonChanges}
              className="w-full"
              disabled={formLoading}>
              {formLoading ? "Loading..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      </form>
      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>JSON Error</DialogTitle>
            <DialogDescription>
              There was an error processing your JSON input:
            </DialogDescription>
          </DialogHeader>
          {errorMessage}
          <Button onClick={() => setIsErrorModalOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
const isGoDuration = (value) => {
  // This regex matches common Go duration patterns
  const goDurationRegex = /^(\d+(\.\d+)?[nµumsh])+$/;
  return typeof value === "string" && goDurationRegex.test(value);
};
