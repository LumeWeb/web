import React, { useState, useMemo, useCallback } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { CrudFilters, useOne } from "@refinedev/core";
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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "portal-shared/components/ui/form";
import { TrashIcon, SearchIcon, XIcon } from "lucide-react";
import { SkeletonLoader } from "portal-shared/components/SkeletonLoader";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { z } from "zod";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormReturn } from "react-hook-form";

interface SettingField {
  key: string;
  value: any;
  type: string;
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

  const { data: schemaData, isLoading: isSchemaLoading } = useOne<{
    properties: Record<string, any>;
  }>({
    resource: "settings",
    id: "schema",
  });

  const getSchemaForKey = useCallback(
    (key: string) => {
      if (!schemaData?.data) return null;
      const parts = key.split(".");
      let currentSchema: any = schemaData.data;

      for (const part of parts) {
        if (
          currentSchema.type === "object" &&
          currentSchema.properties &&
          part in currentSchema.properties
        ) {
          currentSchema = currentSchema.properties[part];
        } else if (currentSchema.type === "array" && currentSchema.items) {
          currentSchema = Array.isArray(currentSchema.items)
            ? currentSchema.items[0]
            : currentSchema.items;
        } else {
          return null;
        }
      }

      return currentSchema;
    },
    [schemaData],
  );

  const getZodSchemaForKey = useCallback(
    (key: string) => {
      const jsonSchema = getSchemaForKey(key);
      if (!jsonSchema) return z.any();
      return jsonSchemaToZod(jsonSchema);
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
          const { key, type } = row.original;

          switch (type) {
            case "string":
              return (
                <FormField
                  control={form.control}
                  name={key}
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
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{key}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              );
            case "array":
              return (
                <ArrayEditor field={row.original} form={form} name={key} />
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

  if (isSchemaLoading) {
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
              value={JSON.stringify(form.getValues(), null, 2)}
              className="font-mono h-[calc(100vh-200px)] min-h-[300px] w-full"
              readOnly
            />
            <Button type="submit" className="w-full" disabled={formLoading}>
              {formLoading ? "Loading..." : "Apply Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
