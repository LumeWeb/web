import { type FieldName, useInputControl } from "@conform-to/react";
import {
  Checkbox,
  cn,
  Input,
  Label,
  Textarea,
} from "@lumeweb/portal-framework-ui-core";
import React, { useId } from "react";

export const Field = ({
  className,
  errors,
  inputProps,
  labelProps,
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: React.HTMLProps<HTMLInputElement> & {
    name: FieldName<string>;
  };
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) => {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label
        {...labelProps}
        className="text-secondary-foreground text-sm font-semibold"
        htmlFor={id}
      />
      <Input
        {...inputProps}
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        className="bg-input border-border placeholder-input-placeholder mt-4"
        id={id}
      />
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
};

export const FieldCheckbox = ({
  className,
  errors,
  inputProps,
  labelProps,
}: {
  className?: string;
  errors?: ListOfErrors;
  inputProps: React.ComponentPropsWithoutRef<typeof Checkbox> & {
    form: string;
    name: string;
    value?: string;
  };
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
}) => {
  const { defaultChecked, key, ...checkboxProps } = inputProps;
  const checkedValue = inputProps.value ?? "on";
  const input = useInputControl({
    formId: inputProps.form,
    initialValue: defaultChecked ? checkedValue : undefined,
    key,
    name: inputProps.name,
  });
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <>
      <div
        className={cn(
          "text-foreground flex items-center space-x-2",
          className,
        )}>
        <Checkbox
          {...checkboxProps}
          aria-describedby={errorId}
          aria-invalid={errorId ? true : undefined}
          checked={input.value === checkedValue}
          id={id}
          onBlur={(event) => {
            input.blur();
            inputProps.onBlur?.(event);
          }}
          onCheckedChange={(state) => {
            input.change(state.valueOf() ? checkedValue : "");
            inputProps.onCheckedChange?.(state);
          }}
          onFocus={(event) => {
            input.focus();
            inputProps.onFocus?.(event);
          }}
          type="button"
        />
        <Label {...labelProps} htmlFor={id} />
      </div>
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </>
  );
};

export type ListOfErrors = (null | string | undefined)[] | null | undefined;

export function ErrorList({
  errors,
  id,
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul className="flex flex-col gap-1" id={id}>
      {errorsToRender.map((e) => (
        <li className="text-destructive-foreground text-[12px]" key={e}>
          {e}
        </li>
      ))}
    </ul>
  );
}
export function TextareaField({
  className,
  errors,
  labelProps,
  textareaProps,
}: {
  className?: string;
  errors?: ListOfErrors;
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}) {
  const fallbackId = useId();
  const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Textarea
        aria-describedby={errorId}
        aria-invalid={errorId ? true : undefined}
        id={id}
        {...textareaProps}
      />
      <div className="min-h-[32px] pb-1 pt-1">
        {errorId ? <ErrorList errors={errors} id={errorId} /> : null}
      </div>
    </div>
  );
}
