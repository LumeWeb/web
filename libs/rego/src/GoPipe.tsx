import React from "react";

/**
 * GoPipe - Pipeline chaining component
 *
 * Chains multiple template transformations using Go template pipeline syntax
 * Outputs: {{value | func1 | func2 | func3}}
 *
 * @example with GoVar
 * <GoPipe>
 *   <GoVar name="description" />
 *   <GoTruncate length="100" />
 *   <GoUpperCase />
 * </GoPipe>
 * // Outputs: {{.Description | truncate 100 | upper}}
 *
 * @example with local variable
 * <GoRange items="items" elementName="item">
 *   <GoPipe>
 *     <GoVar name="$item.title" />
 *     <GoTruncate length="50" />
 *     <GoUpperCase />
 *   </GoPipe>
 * </GoRange>
 * // Outputs: {{range $item := .items}}{{$item.Title | truncate 50 | upper}}{{end}}
 *
 * @example with GoLet
 * <GoLet name="processedText">
 *   <GoPipe>
 *     <GoVar name="rawText" />
 *     <GoTruncate length="100" />
 *     <GoTrim />
 *   </GoPipe>
 * </GoLet>
 * // Outputs: {{$processedText := .RawText | truncate 100 | trim}}
 *
 * @note
 * The first child should be a GoVar or GoFormat. Subsequent children should be transformation components
 * like GoTruncate, GoUpperCase, GoTrim, etc. These must be registered as Go template functions.
 */
export interface GoPipeProps {
  /** Pipeline transformations */
  children: React.ReactNode;
}

export const GoPipe: React.FC<GoPipeProps> = ({ children }) => {
  const childArray = React.Children.toArray(children);

  if (childArray.length === 0) {
    return null;
  }

  // Get the first child (the value)
  const firstChild = childArray[0];

  // Extract the value from the first child
  let value: string | null = null;

  if (React.isValidElement(firstChild)) {
    // Check if it's a GoVar
    if ((firstChild.type as any)?.name === "GoVar") {
      const varName = firstChild.props.name;
      const isLocalVar = varName.startsWith("$");
      value = isLocalVar ? varName : "." + varName;
    }
    // Check if it's a GoFormat
    else if ((firstChild.type as any)?.name === "GoFormat") {
      // GoFormat outputs: {{"%s %s" | printf .Arg1 .Arg2}}
      // We need to extract just the value part
      const format = firstChild.props.format;
      const formatArgs = React.Children.toArray(
        firstChild.props.children || [],
      );

      // Build printf call
      const args = formatArgs.map((arg) => {
        if (React.isValidElement(arg) && (arg.type as any)?.name === "GoVar") {
          const varName = arg.props.name;
          const isLocalVar = varName.startsWith("$");
          return isLocalVar ? varName : "." + varName;
        }
        return arg;
      });

      value = `printf "${format}" ${args.join(" ")}`;
    }
  }

  if (!value) {
    return null;
  }

  // Process remaining children as transformations
  const transformations: string[] = [];
  for (let i = 1; i < childArray.length; i++) {
    const child = childArray[i];
    if (React.isValidElement(child)) {
      const childType = child.type as any;

      // Handle transformation components
      if (childType?.name === "GoTruncate") {
        transformations.push(`truncate ${child.props.length}`);
      } else if (childType?.name === "GoUpperCase") {
        transformations.push("upper");
      } else if (childType?.name === "GoLowerCase") {
        transformations.push("lower");
      } else if (childType?.name === "GoTrim") {
        transformations.push("trim");
      } else if (childType?.name === "GoTitle") {
        transformations.push("title");
      } else if (childType?.name === "GoDate") {
        transformations.push(`formatDate "${child.props.format}"`);
      } else if (childType?.name === "GoCurrency") {
        transformations.push(`formatCurrency "${child.props.currency}"`);
      }
    }
  }

  // Build the pipeline
  let pipeline = value;
  transformations.forEach((transform) => {
    pipeline += ` | ${transform}`;
  });

  return <>{`{{${pipeline}}}`}</>;
};
