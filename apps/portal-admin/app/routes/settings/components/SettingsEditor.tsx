import React, { useEffect, useState } from "react";
import { cn } from "portal-shared/util/cn";
import { TrashIcon } from "portal-shared/components/icons";
import { Button } from "portal-shared/components/ui/button";
import { Checkbox } from "portal-shared/components/ui/checkbox";
import { Input } from "portal-shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "portal-shared/components/ui/popover";
import { Switch } from "portal-shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "portal-shared/components/ui/table";
import { Textarea } from "portal-shared/components/ui/textarea";
import { useUpdate } from "@refinedev/core";
import { Alert, AlertDescription } from "portal-shared/components/ui/alert";
import { SearchIcon } from "lucide-react";

interface FlattenedField {
  key: string;
  value: any;
  type: string;
  isEdited: boolean;
  isDisabled: boolean;
  schema: any;
}

interface EnhancedSettingsTableProps {
  schema: any;
  initialData: Record<string, any>;
  hiddenFields: string[];
  onDataChange: (data: Record<string, any>) => void;
  onSearch: (searchTerm: string) => void;
}

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

const renderEditableValue = (
  field: FlattenedField,
  onChange: (newValue: any, isEdited: boolean) => void,
) => {
  switch (field.type) {
    case "string":
      return (
        <Input
          value={field.value}
          className="h-9 border border-border/30 bg-background"
          onChange={(e) => onChange(e.target.value, true)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={field.value}
          className="h-9 border border-border/30 bg-background"
          onChange={(e) => onChange(Number(e.target.value), true)}
        />
      );
    case "boolean":
      return (
        <Checkbox
          checked={field.value}
          onCheckedChange={(value) => onChange(value, true)}
        />
      );
    case "array":
      return <ArrayEditor field={field} onChange={onChange} />;
    default:
      return (
        <span className="text-foreground">{JSON.stringify(field.value)}</span>
      );
  }
};

const SettingsTable: React.FC<EnhancedSettingsTableProps> = ({
  schema,
  initialData,
  hiddenFields,
  onDataChange,
  onSearch,
}) => {
  const [flattenedData, setFlattenedData] = useState<FlattenedField[]>([]);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { mutate: updateSetting } = useUpdate({
    resource: "settings",
  });

  useEffect(() => {
    const flattened = flattenObject(initialData, schema);
    setFlattenedData(flattened);
    setJsonText(JSON.stringify(initialData, null, 2));
  }, [initialData, schema]);

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

  const handleFieldChange = (
    index: number,
    newValue: any,
    isEdited: boolean,
  ) => {
    const updatedData = [...flattenedData];
    updatedData[index] = { ...updatedData[index], value: newValue, isEdited };

    setFlattenedData(updatedData);
    const unflattenedData = unflattenObject(updatedData);
    onDataChange(unflattenedData);
    setJsonText(JSON.stringify(unflattenedData, null, 2));

    // Update individual setting
    updateSetting({
      resource: "settings",
      id: updatedData[index].key,
      values: { value: newValue },
    });
  };

  const handleDisableToggle = (index: number) => {
    const updatedData = [...flattenedData];
    const currentField = updatedData[index];
    const newDisabledState = !currentField.isDisabled;

    currentField.isDisabled = newDisabledState;

    const prefix = currentField.key + ".";
    updatedData.forEach((field, i) => {
      if (field.key.startsWith(prefix)) {
        updatedData[i] = { ...field, isDisabled: newDisabledState };
      }
    });

    setFlattenedData(updatedData);
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

  const renderEditableCell = (field: FlattenedField, index: number) => {
    if (field.isDisabled) {
      return (
        <span className="text-foreground">{JSON.stringify(field.value)}</span>
      );
    }

    return renderEditableValue(field, (newValue, isEdited) =>
      handleFieldChange(index, newValue, isEdited),
    );
  };

  const handleJsonTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setJsonText(event.target.value);
    setJsonError("");
  };

  const applyJsonChanges = () => {
    try {
      const parsedData = JSON.parse(jsonText);
      const flattened = flattenObject(parsedData, schema);
      setFlattenedData(flattened);
      onDataChange(parsedData);
      setJsonError("");

      // Update all settings
      Object.entries(parsedData).forEach(([key, value]) => {
        updateSetting({
          resource: "settings",
          id: key,
          values: { value },
        });
      });
    } catch (error) {
      setJsonError("Invalid JSON: " + (error as Error).message);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const filteredData = flattenedData.filter(
    (field) =>
      field.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(field.value)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

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
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-bold">Setting</TableHead>
                <TableHead className="font-bold">Value</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map(
                (field, index) =>
                  !hiddenFields.includes(field.key) && (
                    <TableRow
                      key={field.key}
                      className={cn(
                        "hover:bg-muted/50",
                        index % 2 === 0 ? "bg-background" : "bg-muted/30",
                      )}>
                      <TableCell>{field.key}</TableCell>
                      <TableCell>{renderEditableCell(field, index)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {field.type}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <Switch
                          checked={!field.isDisabled}
                          onCheckedChange={() => handleDisableToggle(index)}
                        />
                      </TableCell>
                    </TableRow>
                  ),
              )}
            </TableBody>
          </Table>
        </div>
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

export default SettingsTable;
