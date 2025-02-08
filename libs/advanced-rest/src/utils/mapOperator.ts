import type { CrudOperators } from "@refinedev/core";

export const mapOperator = (operator: CrudOperators): string => {
  const mapping: Record<CrudOperators, string> = {
    and: "and",
    eq: "",
    ne: "ne",
    lt: "lt",
    gt: "gt",
    lte: "lte",
    gte: "gte",
    in: "in",
    nin: "nin",
    contains: "contains",
    ncontains: "ncontains",
    containss: "containss",
    ncontainss: "ncontainss",
    between: "between",
    nbetween: "nbetween",
    null: "null",
    nnull: "nnull",
    startswith: "startswith",
    nstartswith: "nstartswith",
    startswiths: "startswiths",
    nstartswiths: "nstartswiths",
    endswith: "endswith",
    nendswith: "nendswith",
    endswiths: "endswiths",
    nendswiths: "nendswiths",
    ina: "ina",
    nina: "nina",
    or: "",
  };

  const mapped = mapping[operator];
  if (mapped === undefined) {
    throw new Error(`Unsupported operator: ${operator}`);
  }
  return mapped;
};
