import React, { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";
import { Checkbox } from "portal-shared/components/ui/checkbox";
import { Button } from "portal-shared/components/ui/button";
import GoDurationInput from "@/routes/settings/components/GoDurationInput";
import ArrayEditor from "./ArrayEditor";
import { DisabledSetting } from "./DisabledSetting";

interface SettingRowProps {
  setting: {
    key: string;
    value: any;
    type: string;
    editable: boolean;
  };
  onUpdate?: (key: string, value: any) => void;
}

export default function SettingRow({ setting, onUpdate }: SettingRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    refineCoreProps: {
      resource: "settings",
      action: "edit",
      id: setting.key,
    },
    defaultValues: {
      value: setting.value,
    },
  });

  const {
    refineCore: { onFinish },
    handleSubmit,
    control,
  } = form;

  const handleFormSubmit = async (data: { value: any }) => {
    try {
      await onFinish(data);
      onUpdate?.(setting.key, data.value);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to update setting. Please try again.");
      console.error("Error updating setting:", err);
    }
  };

  const renderInput = () => {
    switch (setting.type) {
      case "string":
        return (
          <FormField
            control={control}
            name="value"
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
            control={control}
            name="value"
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
            control={control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "array":
        return <ArrayEditor control={control} name="value" />;
      case "duration":
        return (
          <FormField
            control={control}
            name="value"
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
        return <DisabledSetting value={setting.value} type={setting.type} />;
    }
  };

  if (!setting.editable) {
    return <DisabledSetting value={setting.value} type={setting.type} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {isEditing ? (
          <>
            {renderInput()}
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit">Save</Button>
            <Button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <DisabledSetting value={setting.value} type={setting.type} />
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
