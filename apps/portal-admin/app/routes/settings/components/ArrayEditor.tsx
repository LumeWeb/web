import { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";
import { Button } from "portal-shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "portal-shared/components/ui/popover";
import { TrashIcon } from "lucide-react";

interface ArrayEditorProps {
  control: Control<any>;
  name: string;
}

export default function ArrayEditor({ control, name }: ArrayEditorProps) {
  const [newItemValue, setNewItemValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FormField
      control={control}
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
}
