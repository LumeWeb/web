import type React from "react";
import { useEffect, useState } from "react";
import { cn } from "~/util/cn";
import { TrashIcon } from "./icons";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface FlattenedField {
  key: string;
  value: any;
  type: string;
  isEdited: boolean;
  isDisabled: boolean;
  schema: any;
}

interface JsonSchemaTableProps {
  schema: any;
  initialData: Record<string, any>;
  hiddenFields: string[];
  onDataChange: (data: Record<string, any>) => void;
}

const ArrayEditor: React.FC<{
  field: FlattenedField;
  onChange: (newValue: any[], isEdited: boolean) => void;
}> = ({ field, onChange }) => {
  const [newItemValue, setNewItemValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleItemChange = (newValue: any) => {
    onChange(newValue, true);
  };

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
            <Button
              onClick={(e) => {
                e.preventDefault();
                addItem();
              }}>
              Add
            </Button>
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

const JsonSchemaTable: React.FC<JsonSchemaTableProps> = ({
  schema,
  initialData,
  hiddenFields,
  onDataChange,
}) => {
  const [flattenedData, setFlattenedData] = useState<FlattenedField[]>([]);

  useEffect(() => {
    const flattened = flattenObject(initialData, schema);
    setFlattenedData(flattened);
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

    const parts = updatedData[index].key.split(".");
    while (parts.length > 1) {
      parts.pop();
      const parentKey = parts.join(".");
      const parentIndex = updatedData.findIndex(
        (field) => field.key === parentKey,
      );
      if (parentIndex !== -1) {
        updatedData[parentIndex] = {
          ...updatedData[parentIndex],
          isEdited: true,
        };
      }
    }

    setFlattenedData(updatedData);
    onDataChange(unflattenObject(updatedData));
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

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold">Command</TableHead>
            <TableHead className="font-bold">Keybinding</TableHead>
            <TableHead className="font-bold">When</TableHead>
            <TableHead className="font-bold">Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flattenedData.map(
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
  );
};

export default JsonSchemaTable;
