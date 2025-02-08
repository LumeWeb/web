import type { CrudFilters } from "@refinedev/core";
import { mapOperator } from "./mapOperator";

const processCondition = (
  condition: any,
): { path: string[]; value: string } | null => {
  if (condition.field === "q") {
    return { path: ["q"], value: encodeURIComponent(String(condition.value)) };
  }

  const operator = mapOperator(condition.operator);
  let value: any = condition.value;

  if (Array.isArray(value)) {
    value = value.map((v: any) => String(v)).join(",");
    value = encodeURIComponent(value);
  } else if (condition.operator === "null" || condition.operator === "nnull") {
    value = "";
  } else {
    value = encodeURIComponent(String(value));
  }

  if (!condition.field) {
    return null;
  }

  const path = [condition.field];
  if (operator) {
    path.push(operator);
  }

  return { path: path, value: value };
};

const processOrCondition = (
  filter: CrudFilters[number],
  basePath: string[],
  query: Record<string, string>,
) => {
  if (filter.operator === "or" && Array.isArray(filter.value)) {
    filter.value.forEach((condition, index) => {
      const conditionPath = [...basePath, "or", String(index)];
      if (
        "operator" in condition &&
        condition.operator === "and" &&
        Array.isArray(condition.value)
      ) {
        condition.value.forEach((subCondition, subIndex) => {
          const subConditionPath = [...conditionPath, "and", String(subIndex)];
          const processedCondition = processCondition(subCondition);
          if (processedCondition) {
            const finalPath = [...subConditionPath, ...processedCondition.path];
            const key = finalPath.reduce((acc, segment) => {
              return acc ? `${acc}[${segment}]` : segment;
            }, "");
            query[key] = processedCondition.value;
          }
        });
      } else {
        const processedCondition = processCondition(condition);
        if (processedCondition) {
          const finalPath = [...conditionPath, ...processedCondition.path];
          const key = finalPath.reduce((acc, segment) => {
            return acc ? `${acc}[${segment}]` : segment;
          }, "");
          query[key] = processedCondition.value;
        }
      }
    });
  }
};

export const generateFilter = (
  filters?: CrudFilters,
): Record<string, string> => {
  const query: Record<string, string> = {};
  let hasGlobalSearch = false;

  filters?.forEach((filter) => {
    if (filter.operator === "or") {
      processOrCondition(filter, ["filters"], query);
    } else {
      if ("field" in filter && filter.field === "q") {
        if (hasGlobalSearch) {
          console.warn("Only one global search (q) filter allowed");
          return;
        }
        hasGlobalSearch = true;
        const processedCondition = processCondition(filter);
        if (processedCondition) {
          query[processedCondition.path.join("")] = processedCondition.value; // Simpler for global search
        }
      } else {
        const processedCondition = processCondition(filter);
        if (processedCondition) {
          const finalPath = ["filters", ...processedCondition.path];
          const key = finalPath.reduce((acc, segment) => {
            return acc ? `${acc}[${segment}]` : segment;
          }, "");
          query[key] = processedCondition.value;
        }
      }
    }
  });

  return query;
};
