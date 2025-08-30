import {
  cn,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Spinner,
} from "@lumeweb/portal-framework-ui-core";
import { get } from "lodash/get";
import React, { useEffect, useMemo, useState } from "react";
import {
  FieldValues,
  Path as ReactHookFormPath,
  useFormContext as useRHFContext,
} from "react-hook-form";

import { adapters } from "./adapters";
import { useFormContext } from "./context";
import { getAutocompleteValue } from "./autocomplete";
import { FormFieldType, getFormComponent } from "./fields";
import { FormGroup } from "./FormGroup";
import { type FormFieldConfig, type FormGroupType, GroupOrder } from "./types";

interface FieldRendererProps<TFieldValues extends FieldValues> {
  field: FormFieldConfig<TFieldValues>;
}

export function FormRenderer<TRequest extends FieldValues = FieldValues>({
  fields = [],
  groups = [],
}: {
  fields?: FormFieldConfig<TRequest>[];
  groups?: FormGroupType[];
}) {
  // Group fields by their group ID
  const { groupedFields, ungroupedFields } = React.useMemo(() => {
    const grouped: Record<string, FormFieldConfig<TRequest>[]> = {};
    const ungrouped: FormFieldConfig<TRequest>[] = [];

    // Initialize groups
    groups?.forEach((group) => {
      grouped[group.id] = [];
    });

    // Distribute fields
    fields.forEach((field) => {
      if (field.group && grouped[field.group]) {
        grouped[field.group].push(field);
      } else {
        ungrouped.push(field);
      }
    });

    return { groupedFields: grouped, ungroupedFields: ungrouped };
  }, [fields, groups]);
  const { adapter: adapterName, config } = useFormContext();
  const adapter = adapters[adapterName];

  if (!adapter) {
    throw new Error(`Form adapter "${String(adapterName)}" is not registered`);
  }

  const groupOrder = config.groupOrder ?? GroupOrder.UNGROUPED_FIRST;

  const renderGroups = () => (
    <>
      {groups?.map((group) => {
        const groupFields = groupedFields[group.id];
        if (!groupFields?.length) return null;

        return (
          <FormGroup
            className={group.className}
            description={group.description}
            key={group.id}
            title={group.title}>
            {groupFields.map((field) => (
              <FieldRenderer field={field} key={field.name as string} />
            ))}
          </FormGroup>
        );
      })}
    </>
  );

  const renderUngrouped = () => (
    <>
      {ungroupedFields.map((field) => (
        <FieldRenderer field={field} key={field.name as string} />
      ))}
    </>
  );

  return (
    <>
      {groupOrder === GroupOrder.GROUPS_FIRST ? (
        <>
          {renderGroups()}
          {renderUngrouped()}
        </>
      ) : (
        <>
          {renderUngrouped()}
          {renderGroups()}
        </>
      )}
    </>
  );
}

function FieldRenderer<TFieldValues extends FieldValues = FieldValues>({
  field,
}: FieldRendererProps<TFieldValues>) {
  const rhfMethods = useRHFContext<TFieldValues>();
  const { control, getValues, watch } = rhfMethods;
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const dependencies = useMemo(
    () => field.dependencies || [],
    [field.dependencies],
  );
  useEffect(() => {
    // Subscribe to form changes and check visibility when relevant fields change
    const subscription = watch((values, { name }) => {
      // Only check visibility if dependencies are empty (watch all) or changed field is in dependencies
      if (!dependencies.length || (name && dependencies.includes(name))) {
        checkVisibility();
      }
    });

    const checkVisibility = async () => {
      if (!getValues) return;

      const currentValues = getValues();
      let shouldShow = true;

      if (field.requires) {
        for (const requiredFieldPath in field.requires) {
          if (
            Object.prototype.hasOwnProperty.call(
              field.requires,
              requiredFieldPath,
            )
          ) {
            const requirement = field.requires[requiredFieldPath];
            const actualValue = get(currentValues as object, requiredFieldPath);

            let requirementMet = false;
            if (typeof requirement === "function") {
              requirementMet = requirement(actualValue);
            } else {
              requirementMet = actualValue === requirement;
            }

            if (!requirementMet) {
              shouldShow = false;
              break;
            }
          }
        }
      }

      if (shouldShow && field.show) {
        try {
          const showPromiseOrValue = field.show(currentValues);
          if (showPromiseOrValue instanceof Promise) {
            setIsLoading(true);
            shouldShow = await showPromiseOrValue;
            if (isLoading) setIsLoading(false);
          } else {
            shouldShow = showPromiseOrValue;
            if (isLoading) setIsLoading(false);
          }
        } catch (error) {
          console.error(
            `Error checking show status for field ${String(field.name)}:`,
            error,
          );
          shouldShow = false;
          if (isLoading) setIsLoading(false);
        }
      } else if (!field.show) {
        if (isLoading) setIsLoading(false);
      } else {
        if (isLoading) setIsLoading(false);
      }

      setIsVisible((prev) => {
        if (prev !== shouldShow) return shouldShow;
        return prev;
      });
    };

    checkVisibility(); // Initial check

    return () => subscription.unsubscribe();
  }, [dependencies, field, getValues, isLoading, watch]);

  if (isLoading) {
    return (
      <FormItem className={cn(field.className, field.itemClassName)}>
        {field.label && <FormLabel>{field.label}</FormLabel>}
        <FormControl>
          <div className="flex items-center justify-center h-14">
            <Spinner size="small" />
          </div>
        </FormControl>
        {field.description && (
          <FormDescription>{field.description}</FormDescription>
        )}
      </FormItem>
    );
  }

  if (!isVisible) {
    return null;
  }

  const componentEntry = getFormComponent(field.type);
  const RegisteredComponent = componentEntry?.component;
  if (!componentEntry && field.type !== FormFieldType.CUSTOM) {
    console.warn(`No component registered for form field type: ${field.type}`);
    return null;
  }

  return (
    <FormField<TFieldValues>
      control={control}
      key={field.name as string}
      name={field.name as ReactHookFormPath<TFieldValues>}
      render={({ field: formFieldRenderProps }) => (
        <FormItem className={cn(field.className, field.itemClassName)}>
          {field.label && !componentEntry?.handlesLabel && (
            <FormLabel className={field.labelClassName}>
              {field.label}
              {field.required && isVisible && (
                <span className="text-destructive">*</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            {RegisteredComponent ? (
              <RegisteredComponent
                {...formFieldRenderProps}
                {...field.inputProps}
                inputClassName={field.inputClassName}
                label={componentEntry?.handlesLabel ? field.label : undefined}
                options={field.options}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type}
                // Derive and include autocomplete
                autocomplete={useMemo(() => {
                  return field.autocomplete ?? // Explicit field config wins
                    getAutocompleteValue(field, { formPurpose: config.action }) ?? // Then try derivation
                    field.inputProps?.autocomplete // Finally, any inputProps value
                }, [field.autocomplete, field.name, field.type, field.inputProps?.autocomplete, field.inputProps?.autoComplete, config.action])}
              />
            ) : field.component ? (
              <field.component {...formFieldRenderProps} />
            ) : null}
          </FormControl>
          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
