import { cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Check = lazyIcon("Check");
const X = lazyIcon("X");


interface FeatureItemProps {
  text: string;
  included?: boolean;
}

export function FeatureItem({ text, included = true }: FeatureItemProps) {
  return (
    <li className="flex items-start gap-2">
      {included ? (
        <Check className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
      ) : (
        <X className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      )}
      <span className={cn("text-sm", included ? "text-foreground" : "text-muted-foreground")}>
        {text}
      </span>
    </li>
  );
}
