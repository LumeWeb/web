import React from "react";
import { generateLetSyntax } from "./template-generators";

/**
 * GoLet - Variable assignment component
 *
 * Assigns a value to a variable in Go template syntax
 * Supports multiple assignment patterns:
 *
 * 1. Simple variable reference:
 *    <GoLet name="currentUser" value="user">
 *      <Text><GoVar name="$currentUser.name" /></Text>
 *    </GoLet>
 *    // Outputs: {{$currentUser := .user}}
 *
 * 2. Pipeline-based:
 *    <GoLet name="processedText">
 *      <GoPipe>
 *        <GoVar name="rawText" />
 *        <GoTruncate length="100" />
 *      </GoPipe>
 *    </GoLet>
 *    // Outputs: {{$processedText := .RawText | truncate 100}}
 *
 * 3. Format-based (via GoFormat):
 *    <GoLet name="displayName">
 *      <GoFormat format="%s %s">
 *        <GoVar name="user.firstName" />
 *        <GoVar name="user.lastName" />
 *      </GoFormat>
 *    </GoLet>
 *    // Outputs: {{$displayName := printf "%s %s" .User.FirstName .User.LastName}}
 *
 * @example simple reference
 * <GoLet name="currentUser" value="user">
 *   <Text>Hello, <GoVar name="$currentUser.name" /></Text>
 * </GoLet>
 *
 * @example with pipeline
 * <GoLet name="shortTitle">
 *   <GoPipe>
 *     <GoVar name="title" />
 *     <GoTruncate length="50" />
 *     <GoUpperCase />
 *   </GoPipe>
 * </GoLet>
 * <Text>Short title: <GoVar name="$shortTitle" /></Text>
 */
export interface GoLetProps {
  /** Variable name (without $ prefix) */
  name: string;
  /** Optional simple variable reference (for pattern 1) */
  value?: string;
  /** Content to render with the variable in scope */
  children: React.ReactNode;
}

export const GoLet: React.FC<GoLetProps> = ({ name, value, children }) => {
  const childArray = React.Children.toArray(children);

  // Determine assignment type
  let assignment: string | null = null;

  // Pattern 1: Simple value reference (with or without children)
  if (value) {
    const isLocalVar = value.startsWith("$");
    assignment = isLocalVar ? value : "." + value;
  }
  // Pattern 2: Child-based (GoPipe or GoFormat) - only if no simple value
  else if (childArray.length > 0) {
    const firstChild = childArray[0];

    if (React.isValidElement(firstChild)) {
      const childType = firstChild.type as any;

      // Check for GoPipe
      if (childType?.name === "GoPipe") {
        // Extract the pipeline from GoPipe
        // GoPipe outputs: {{value | func1 | func2}}
        // We need to extract just: value | func1 | func2
        const pipeOutput = React.Children.toArray(firstChild.props.children);
        if (pipeOutput.length > 0) {
          const firstPipeChild = pipeOutput[0];
          if (React.isValidElement(firstPipeChild)) {
            if ((firstPipeChild.type as any)?.name === "GoVar") {
              const varName = firstPipeChild.props.name;
              const isLocalVar = varName.startsWith("$");
              let value = isLocalVar ? varName : "." + varName;

              // Process transformations
              const transformations: string[] = [];
              for (let i = 1; i < pipeOutput.length; i++) {
                const pipeChild = pipeOutput[i];
                if (React.isValidElement(pipeChild)) {
                  const pipeChildType = pipeChild.type as any;

                  if (pipeChildType?.name === "GoTruncate") {
                    transformations.push(`truncate ${pipeChild.props.length}`);
                  } else if (pipeChildType?.name === "GoUpperCase") {
                    transformations.push("upper");
                  } else if (pipeChildType?.name === "GoLowerCase") {
                    transformations.push("lower");
                  } else if (pipeChildType?.name === "GoTrim") {
                    transformations.push("trim");
                  } else if (pipeChildType?.name === "GoTitle") {
                    transformations.push("title");
                  } else if (pipeChildType?.name === "GoDate") {
                    transformations.push(
                      `formatDate "${pipeChild.props.format}"`,
                    );
                  } else if (pipeChildType?.name === "GoCurrency") {
                    transformations.push(
                      `formatCurrency "${pipeChild.props.currency}"`,
                    );
                  }
                }
              }

              transformations.forEach((transform) => {
                value += ` | ${transform}`;
              });

              assignment = value;
            }
          }
        }
      }
      // Check for GoFormat
      else if (childType?.name === "GoFormat") {
        const format = firstChild.props.format;
        const formatArgs = React.Children.toArray(
          firstChild.props.children || [],
        );

        const args = formatArgs.map((arg) => {
          if (
            React.isValidElement(arg) &&
            (arg.type as any)?.name === "GoVar"
          ) {
            const varName = arg.props.name;
            const isLocalVar = varName.startsWith("$");
            return isLocalVar ? varName : "." + varName;
          }
          return arg;
        });

        assignment = `printf "${format}" ${args.join(" ")}`;
      }
    }
  }

  if (!assignment) {
    return <>{children}</>;
  }

  return (
    <>
      {generateLetSyntax(name, assignment)}
      {children}
    </>
  );
};
