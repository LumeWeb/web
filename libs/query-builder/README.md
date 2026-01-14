# @lumeweb/query-builder

A flexible query parameter parser and serializer for building complex filters, sorting, and pagination in web applications. Extended from Refine's CRUD operators to support Go backend compatibility.

## Features

- **Query Parsing** - Parse URL query parameters into structured filter, sort, and pagination objects
- **Query Serialization** - Convert structured query objects back to URL-friendly parameters
- **Rich Filter Operators** - Support for comparison operators (eq, ne, lt, gt, contains, etc.) and logical operators (and, or, not)
- **Type-Safe** - Full TypeScript support with exported types
- **Refine Compatible** - Works seamlessly with @refinedev/core types
- **Go Backend Compatible** - Extended operators include "not" for Go queryutil compatibility

## Installation

```bash
pnpm add @lumeweb/query-builder
```

## Usage

### Parsing Query Parameters

```typescript
import { parseQueryParams } from "@lumeweb/query-builder";

const params = {
  "filters[0][field]": "name",
  "filters[0][operator]": "contains",
  "filters[0][value]": ["John", "Doe"],
  "filters[1][field]": "status",
  "filters[1][operator]": "eq",
  "filters[1][value]": "active",
  "filters[2][operator]": "or",
  "filters[2][value][0][field]": "department",
  "filters[2][value][0][operator]": "eq",
  "filters[2][value][0][value]": "sales",
  "filters[2][value][1][field]": "engineering",
  "filters[2][value][1][operator]": "eq",
  "filters[2][value][1][value]": true,
  "_sort": "createdAt",
  "_order": "desc",
  "_start": "0",
  "_end": "20"
};

const parsed = parseQueryParams(params);
// Returns ParsedQuery with filters, sorters, and pagination
```

### Serializing Query Parameters

```typescript
import { serializeQueryParams } from "@lumeweb/query-builder";

const query = {
  filters: [
    {
      field: "status",
      operator: "eq",
      value: "active"
    }
  ],
  sorters: [
    {
      field: "createdAt",
      order: "desc"
    }
  ],
  pagination: {
    start: 0,
    end: 20
  }
};

const params = serializeQueryParams(query);
// Returns URL-friendly query parameters
```

### Filter Operations

```typescript
import {
  createEqFilter,
  createContainsFilter,
  createInFilter,
  addFilter,
  mergeFilters
} from "@lumeweb/query-builder";

// Create individual filters
const nameFilter = createEqFilter("name", "John");
const titleFilter = createContainsFilter("title", "Manager");
const statusFilter = createInFilter("status", ["active", "pending"]);

// Add filters to a collection
let filters: CrudFilter[] = [];
filters = addFilter(filters, nameFilter);

// Merge multiple filters
const merged = mergeFilters([nameFilter, statusFilter]);
```

### Sort Operations

```typescript
import {
  createAscSort,
  createDescSort,
  toggleSort,
  addSorter
} from "@lumeweb/query-builder";

// Create sort configurations
const nameAsc = createAscSort("name");
const createdDesc = createDescSort("createdAt");

// Toggle sort direction
const toggled = toggleSort(nameAsc); // becomes desc

// Add to sorters array
let sorters: CrudSort[] = [];
sorters = addSorter(sorters, nameAsc);
```

### Pagination

```typescript
import {
  calculatePagination,
  getTotalPages,
  getNextPage,
  getPrevPage,
  hasNextPage,
  hasPrevPage
} from "@lumeweb/query-builder";

const pagination = calculatePagination(2, 25); // page 2, 25 per page
// Returns: { start: 25, end: 50, page: 2, pageSize: 25 }

const totalItems = 100;
const pageSize = 20;

// Get total pages
const total = getTotalPages(totalItems, pageSize); // 5

// Navigate using pagination object
const next = getNextPage(pagination); // 3 (next page number)
const prev = getPrevPage(pagination); // 1 (previous page number)

// Check if more pages exist
const hasNext = hasNextPage(totalItems, pagination); // true
const hasPrev = hasPrevPage(pagination); // true
```

## API Documentation

### Types

- `QueryParams` - URL query parameter structure
- `ParsedQuery` - Parsed result with filters, sorters, and pagination
- `CrudFilter` - Union type for LogicalFilter and ConditionalFilter
- `LogicalOperator` - "and" | "or" | "not"
- `FieldOperator` - Comparison operators (eq, ne, lt, lte, gt, gte, contains, etc.)
- `Pagination` - Pagination parameters
- `CrudSort` - Sort configuration (re-exported from @refinedev/core)

### Constants

- `GLOBAL_SEARCH_FIELD` - "q"
- `FILTER_PREFIX` - "filters"
- `SORT_PARAM` - "_sort"
- `ORDER_PARAM` - "_order"
- `START_PARAM` - "_start"
- `END_PARAM` - "_end"

### Operators

Comparison operators: `eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `ina`, `nina`, `contains`, `ncontains`, `containss`, `ncontainss`, `between`, `nbetween`, `null`, `nnull`, `startswith`, `nstartswith`, `startswiths`, `nstartswiths`, `endswith`, `nendswith`, `endswiths`, `nendswiths`

Logical operators: `and`, `or`, `not`

## Development

```bash
# Build
pnpm run build

# Run tests
pnpm run test

# Type check
pnpm run lint
```

## Contributing

Contributions are welcome! Please submit pull requests to the main repository.

## License

See LICENSE file for details.
