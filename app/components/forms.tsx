import { Label } from "@radix-ui/react-label"
import { Input } from "./ui/input"
import { type FieldName, useInputControl } from "@conform-to/react"
import { useId } from "react"
import { cn } from "~/utils"
import { Checkbox } from "~/components/ui/checkbox"
import { Textarea } from "./ui/textarea"

export const Field = ({
  inputProps,
  labelProps,
  errors,
  className
}: {
  inputProps: {
    name: FieldName<string>
  } & React.HTMLProps<HTMLInputElement>
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
  errors?: ListOfErrors
  className?: string
}) => {
  const fallbackId = useId()
  const id = inputProps.id ?? fallbackId
  const errorId = errors?.length ? `${id}-error` : undefined
  return (
    <div className={className}>
      <Label {...labelProps} htmlFor={id} className="font-semibold text-sm" />
      <Input
        {...inputProps}
        className="mt-4"
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
      />
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </div>
  )
}

export const FieldCheckbox = ({
  inputProps,
  labelProps,
  errors,
  className
}: {
  inputProps: {
    name: string
    form: string
    value?: string
  } & React.ComponentPropsWithoutRef<typeof Checkbox>
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
  errors?: ListOfErrors
  className?: string
}) => {
  const { key, defaultChecked, ...checkboxProps } = inputProps
  const checkedValue = inputProps.value ?? "on"
  const input = useInputControl({
    key,
    name: inputProps.name,
    formId: inputProps.form,  
    initialValue: defaultChecked ? checkedValue : undefined
  })
  const fallbackId = useId()
  const id = inputProps.id ?? fallbackId
  const errorId = errors?.length ? `${id}-error` : undefined
  return (
    <>
      <div
        className={cn("space-x-2 flex items-center text-primary-2", className)}
      >
        <Checkbox
          {...checkboxProps}
          id={id}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          checked={input.value === checkedValue}
          onCheckedChange={(state) => {
            input.change(state.valueOf() ? checkedValue : "")
            inputProps.onCheckedChange?.(state)
          }}
          onFocus={(event) => {
            input.focus()
            inputProps.onFocus?.(event)
          }}
          onBlur={(event) => {
            input.blur()
            inputProps.onBlur?.(event)
          }}
          type="button"
        />
        <Label {...labelProps} htmlFor={id} />
      </div>
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
      </div>
    </>
  )
}

export function TextareaField({
	labelProps,
	textareaProps,
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	return (
		<div className={className}>
			<Label htmlFor={id} {...labelProps} />
			<Textarea
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...textareaProps}
			/>
			<div className="min-h-[32px] pb-1 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}

export type ListOfErrors = Array<string | null | undefined> | null | undefined
export function ErrorList({
  id,
  errors
}: {
  errors?: ListOfErrors
  id?: string
}) {
  const errorsToRender = errors?.filter(Boolean)
  if (!errorsToRender?.length) return null
  return (
    <ul id={id} className="flex flex-col gap-1">
      {errorsToRender.map((e) => (
        <li key={e} className="text-[12px] text-destructive-foreground">
          {e}
        </li>
      ))}
    </ul>
  )
}
