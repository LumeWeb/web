# @lumeweb/rego

React-to-Go Template DSL for Email Generation

## Overview

`@lumeweb/rego` provides a thin React DSL layer that wraps React Email components and outputs Go template syntax. The generated HTML contains Go template tags that can be executed by Go at runtime.

### What it is NOT

- ❌ NOT runtime execution of Go in JavaScript
- ❌ NOT a complex transpilation system

### What it IS

- ✅ A React-based DSL that generates Go templates
- ✅ React generates HTML with embedded Go template syntax
- ✅ Go executes the templates with runtime data
- ✅ Clean separation: React for design, Go for runtime parameterization

## Architecture

This library is middleware that sits between React Email and Go templates:

```
React Email Components
    ↓ (styled with Tailwind)
    @lumeweb/rego (adds Go template syntax)
    ↓ (renders to)
HTML + Go Template Syntax
    ↓ (executed by)
Go Templates with Data (Runtime)
    ↓ (outputs)
Final Email HTML
```

## Installation

```bash
npm install @lumeweb/rego
```

## Quick Start

```tsx
import React from 'react'
import {
  Head,
  Body,
  Container,
  Text,
  Heading,
  Html,
  Button,
  Link,
} from '@react-email/components'
import {
  GoVar,
  GoIf,
  GoElse,
  GoRange,
  goVar,
  goUrl,
} from '@lumeweb/rego'

const WelcomeEmail = () => {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Hello, <GoVar name="UserName" />!</Heading>
          <Text>Welcome to our app!</Text>

          <GoIf condition="IsPremium">
            <Text>You're a premium member!</Text>
          </GoIf>

          <GoRange items="RecentItems" empty={<Text>No recent items</Text>}>
            <Text>• <GoVar name="Title" /></Text>
          </GoRange>

          {/* Helper functions for JSX attributes */}
          <Button href={goVar("DashboardURL")}>
            Go to Dashboard
          </Button>

          <Link href={goUrl({ path: "/settings", params: ["tab"] })}>
            Settings
          </Link>
        </Container>
      </Body>
    </Html>
  )
}
```

## Core Components

### GoVar - Variable Interpolation

Outputs Go template variable syntax. Supports both field access and local variables:

- Field access: `{{.VarName}}`
- Local variables: `{{$VarName}}` (e.g., from GoRange)

```tsx
// Field access
<GoVar name="userName" />
// Outputs: {{.userName}}

// Local variable (from GoRange)
<GoRange items="items" elementName="item">
  <GoVar name="$item.Name" />
</GoRange>
// Outputs: {{range $item := .items}}{{$item.Name}}{{end}}
```

**Note:** For default values, use `GoIf` component instead:
```tsx
<GoIf condition="userName">
  <GoVar name="userName" />
  <GoElse>
    <Text>Guest</Text>
  </GoElse>
</GoIf>
```

### Helper Functions for JSX Attributes

When you need to use Go template syntax in JSX attributes (like `href`, `src`, etc.), you can use helper functions instead of components:

#### goVar(), goLocalVar(), goFieldVar()

```tsx
// In JSX attributes - use helper function
<Button href={goVar("DashboardURL")}>Go to Dashboard</Button>
// Outputs: href="{{.DashboardURL}}"

// With local variable
<GoRange items="items" elementName="item">
  <Link href={goLocalVar("item.url")}>View</Link>
</GoRange>
// Outputs: href="{{$item.Url}}"

// Always field access
<Link href={goFieldVar("settingsUrl")}>Settings</Link>
// Outputs: href="{{.SettingsUrl}}"
```

#### goUrl()

```tsx
// Simple path
<Button href={goUrl("/dashboard")}>Dashboard</Button>
// Outputs: href="{{"/dashboard"}}"

// With variable
<Button href={goUrl({ var: "dashboardUrl" })}>Dashboard</Button>
// Outputs: href="{{.DashboardUrl}}"

// With query parameters
<Link href={goUrl({ path: "/verify", params: ["token", "email"] })}>
  Verify Email
</Link>
// Outputs: href="{{"/verify" | addQueryParams .Token .Email}}"
```

#### goDate()

```tsx
<Text>Due: {goDate("dueDate", "Jan 2, 2006")}</Text>
// Outputs: Due: {{.DueDate | formatDate "Jan 2, 2006"}}
```

#### goCurrency()

```tsx
<Text>Total: {goCurrency("total", "USD")}</Text>
// Outputs: Total: {{.Total | formatCurrency "USD"}}
```

#### goFunc()

```tsx
<Text>{goFunc("pluralize", { var: "itemCount", args: ["item", "items"] })}</Text>
// Outputs: {{pluralize .ItemCount "item" "items"}}
```

### GoIf - Conditional Rendering

Outputs Go template conditional syntax: `{{if .Condition}}...{{end}}`

```tsx
<GoIf condition="isLoggedIn">
  <Text>Welcome back!</Text>
  <GoElse>
    <Text>Please log in</Text>
  </GoElse>
</GoIf>

// Outputs:
// {{if .isLoggedIn}}
// <Text>Welcome back!</Text>
// {{else}}
// <Text>Please log in</Text>
// {{end}}
```

### GoRange - Loop Iteration

Outputs Go template range syntax with variable assignment support:

- `{{range .Items}}` - dot (.) becomes the element
- `{{$item := range .Items}}` - element assigned to local variable
- `{{$i, $item := range .Items}}` - index and element assigned

```tsx
// Basic: dot becomes element
<GoRange items="cartItems">
  <div>Item: <GoVar name="Name" /></div>
</GoRange>
// Outputs: {{range .cartItems}}<div>Item: {{.Name}}</div>{{end}}

// With element name
<GoRange items="items" elementName="item">
  <div>{{$item.Name}}</div>
</GoRange>
// Outputs: {{range $item := .items}}<div>{{$item.Name}}</div>{{end}}

// With index and element
<GoRange items="items" indexName="i" elementName="item">
  <div>{{$i}}: {{$item.Name}}</div>
</GoRange>
// Outputs: {{range $i, $item := .items}}<div>{{$i}}: {{$item.Name}}</div>{{end}}

// With empty state
<GoRange items="cartItems" empty={<Text>Your cart is empty</Text>}>
  <div>Item: <GoVar name="Name" /></div>
</GoRange>
// Outputs:
// {{range .cartItems}}
// <div>Item: {{.Name}}</div>
// {{else}}
// <Text>Your cart is empty</Text>
// {{end}}
```

### GoWith - Context Switching

Outputs Go template with syntax: `{{with .Value}}...{{end}}`

Changes the dot (.) to the specified value within the block.

```tsx
<GoWith value="user" fallback="No user found">
  <div>Name: <GoVar name="Name" /></div>
  <div>Email: <GoVar name="Email" /></div>
</GoWith>

// Outputs:
// {{with .user}}
// <div>Name: {{.Name}}</div>
// <div>Email: {{.Email}}</div>
// {{else}}
// No user found
// {{end}}
```

## Template Composition

### GoDefine - Template Definition

Defines a named template that can be reused with GoUseTemplate.

```tsx
<GoDefine name="email-header">
  <Header>
    <Logo src="logo.png" />
    <Text>Welcome!</Text>
  </Header>
</GoDefine>

// Outputs: {{define "email-header"}}...{{end}}
```

### GoUseTemplate - Template Invocation

Invokes a previously defined template.

```tsx
<GoDefine name="email-header">
  <Header><Text>Welcome!</Text></Header>
</GoDefine>

<GoUseTemplate name="email-header" />
// Outputs: {{template "email-header"}}

// With data
<GoDefine name="user-info">
  <div>
    <Text>Name: <GoVar name="Name" /></Text>
    <Text>Email: <GoVar name="Email" /></Text>
  </div>
</GoDefine>

<GoUseTemplate name="user-info" data="currentUser" />
// Outputs: {{template "user-info" .currentUser}}
```

### GoBlock - Template Block

Defines a template block that can be overridden in child templates.

```tsx
<GoBlock name="email-content">
  <Text>Default content</Text>
</GoBlock>
// Outputs: {{block "email-content" .}}<Text>Default content</Text>{{end}}
```

## Data Transformation Helpers

### GoDate - Date Formatting

Formats a date variable using Go template pipeline syntax.

```tsx
<GoDate var="createdAt" format="Jan 2, 2006" />
// Outputs: {{.CreatedAt | formatDate "Jan 2, 2006"}}

// With local variable
<GoRange items="items" elementName="item">
  <GoDate var="$item.createdAt" format="Jan 2, 2006" />
</GoRange>
// Outputs: {{range $item := .items}}{{$item.CreatedAt | formatDate "Jan 2, 2006"}}{{end}}
```

**Note:** Register the `formatDate` function in Go:
```go
funcMap := template.FuncMap{
  "formatDate": formatDate,
}

func formatDate(date time.Time, layout string) string {
  return date.Format(layout)
}
```

### GoCurrency - Currency Formatting

Formats a number as currency.

```tsx
<GoCurrency var="total" currency="USD" />
// Outputs: {{.Total | formatCurrency "USD"}}
```

**Note:** Register the `formatCurrency` function in Go:
```go
funcMap := template.FuncMap{
  "formatCurrency": formatCurrency,
}

func formatCurrency(amount float64, currency string) string {
  return fmt.Sprintf("%s %.2f", currency, amount)
}
```

### GoTruncate - Text Truncation

Truncates a string to a specified length.

```tsx
<GoTruncate var="description" length="100" />
// Outputs: {{.Description | truncate 100}}
```

**Note:** Register the `truncate` function in Go:
```go
funcMap := template.FuncMap{
  "truncate": truncate,
}

func truncate(text string, length int) string {
  if len(text) <= length {
    return text
  }
  return text[:length] + "..."
}
```

## Conditional Helpers

### GoEqual - Equality Check

Checks if two values are equal.

```tsx
<GoEqual var1="status" var2="active">
  <Text>Status is active</Text>
</GoEqual>
// Outputs: {{if eq .Status "active"}}<Text>Status is active</Text>{{end}}

// With else
<GoEqual var1="status" var2="active">
  <Text>Status is active</Text>
  <GoElse>
    <Text>Status is not active</Text>
  </GoElse>
</GoEqual>
// Outputs: {{if eq .Status "active"}}<Text>Status is active</Text>{{else}}<Text>Status is not active</Text>{{end}}

// Comparing two variables
<GoEqual var1="count" var2="maxCount">
  <Text>Reached maximum</Text>
</GoEqual>
// Outputs: {{if eq .Count .MaxCount}}<Text>Reached maximum</Text>{{end}}
```

### GoEmpty - Empty Check

Checks if a value is empty (nil, zero value, empty string, etc.).

```tsx
<GoEmpty var="items">
  <Text>No items found</Text>
</GoEmpty>
// Outputs: {{if not .Items}}<Text>No items found</Text>{{end}}

// With else
<GoEmpty var="items">
  <Text>No items found</Text>
  <GoElse>
    <GoRange items="items">
      <Text><GoVar name="Name" /></Text>
    </GoRange>
  </GoElse>
</GoEmpty>
// Outputs: {{if not .Items}}<Text>No items found</Text>{{else}}{{range .Items}}<Text>{{.Name}}</Text>{{end}}{{end}}
```

## Using with React Email

This library is middleware - it doesn't wrap React Email components. Import React Email components directly:

```tsx
import {
  Head,
  Body,
  Container,
  Link,
  Text,
  Heading,
  Button,
  Img,
  Hr,
  Section,
  Row,
  Column,
  Font,
} from '@react-email/components'
import {
  GoVar,
  GoIf,
  GoRange,
  GoWith,
} from '@lumeweb/rego'
```

## Pipeline Chaining

### GoPipe - Pipeline Composition

Chains multiple template transformations using Go template pipeline syntax.

```tsx
<GoPipe>
  <GoVar name="description" />
  <GoTruncate length="100" />
  <GoUpperCase />
</GoPipe>
// Outputs: {{.Description | truncate 100 | upper}}

// With local variable
<GoRange items="items" elementName="item">
  <GoPipe>
    <GoVar name="$item.title" />
    <GoTruncate length="50" />
    <GoUpperCase />
  </GoPipe>
</GoRange>
// Outputs: {{range $item := .items}}{{$item.Title | truncate 50 | upper}}{{end}}
```

### GoLet - Variable Assignment

Assigns values to variables in Go template syntax.

```tsx
// Simple variable reference
<GoLet name="currentUser" value="user">
  <Text>Hello, <GoVar name="$currentUser.name" /></Text>
</GoLet>
// Outputs: {{$currentUser := .user}}

// Pipeline-based assignment
<GoLet name="processedText">
  <GoPipe>
    <GoVar name="rawText" />
    <GoTruncate length="100" />
    <GoTrim />
  </GoPipe>
</GoLet>
// Outputs: {{$processedText := .RawText | truncate 100 | trim}}

// Format-based assignment
<GoLet name="displayName">
  <GoFormat format="%s %s">
    <GoVar name="user.firstName" />
    <GoVar name="user.lastName" />
  </GoFormat>
</GoLet>
// Outputs: {{$displayName := printf "%s %s" .User.FirstName .User.LastName}}
```

### GoFormat - String Formatting

Uses Go's printf syntax for string formatting.

```tsx
<GoFormat format="%s (%s)">
  <GoVar name="name" />
  <GoVar name="email" />
</GoFormat>
// Outputs: {{"%s (%s)" | printf .Name .Email}}

// With local variables
<GoRange items="items" elementName="item">
  <GoFormat format="Item #%d: %s">
    <GoVar name="$item.id" />
    <GoVar name="$item.name" />
  </GoFormat>
</GoRange>
// Outputs: {{range $item := .items}}{{"Item #%d: %s" | printf $item.Id $item.Name}}{{end}}
```

## String Transformations

### GoUpperCase - Uppercase

Converts text to uppercase.

```tsx
<GoUpperCase>
  <GoVar name="name" />
</GoUpperCase>
// Outputs: {{.Name | upper}}

// In pipeline
<GoPipe>
  <GoVar name="title" />
  <GoTruncate length="50" />
  <GoUpperCase />
</GoPipe>
```

### GoLowerCase - Lowercase

Converts text to lowercase.

```tsx
<GoLowerCase>
  <GoVar name="name" />
</GoLowerCase>
// Outputs: {{.Name | lower}}
```

### GoTrim - Trim Whitespace

Removes leading and trailing whitespace.

```tsx
<GoTrim>
  <GoVar name="description" />
</GoTrim>
// Outputs: {{.Description | trim}}
```

## Function Invocation

### GoFunc - Custom Functions

Invokes custom Go template functions.

```tsx
// With variable and arguments
<GoFunc name="pluralize" var="itemCount" args={["item", "items"]} />
// Outputs: {{pluralize .ItemCount "item" "items"}}

// With multiple variables
<GoFunc name="formatFullName" vars={["firstName", "lastName"]} />
// Outputs: {{formatFullName .FirstName .LastName}}

// With local variable
<GoRange items="items" elementName="item">
  <GoFunc name="formatPrice" var="$item.price" args={["USD"]} />
</GoRange>
// Outputs: {{range $item := .items}}{{formatPrice $item.Price "USD"}}{{end}}

// With literal arguments
<GoFunc name="repeat" var="text" args={[3]} />
// Outputs: {{repeat .Text 3}}
```

## URL Generation

### GoUrl - URL Generation

Generates URLs with optional query parameters.

```tsx
// Simple static path
<GoUrl path="/dashboard" />
// Outputs: {{"/dashboard"}}

// With variable path
<GoUrl var="dashboardUrl" />
// Outputs: {{.DashboardUrl}}

// With query parameters
<GoUrl path="/verify" params={["token", "email"]} />
// Outputs: {{"/verify" | addQueryParams .Token .Email}}

// With variable path and parameters
<GoUrl var="profileUrl" params={["id", "tab"]} />
// Outputs: {{.ProfileUrl | addQueryParams .Id .Tab}}

// With local variable
<GoRange items="items" elementName="item">
  <GoUrl var="$item.url" params={["ref", "source"]} />
</GoRange>
// Outputs: {{range $item := .items}}{{$item.Url | addQueryParams .Ref .Source}}{{end}}

// With literal values
<GoUrl path="/search" params={["q", "page"]} literalValues={["", "1"]} />
// Outputs: {{"/search" | addQueryParams "" "1"}}
```

**Note:** Register the `addQueryParams` function in Go:
```go
func addQueryParams(baseURL string, params ...string) string {
    if len(params) == 0 {
        return baseURL
    }
    values := url.Values{}
    for i := 0; i < len(params); i += 2 {
        if i+1 < len(params) && params[i+1] != "" {
            values.Set(params[i], params[i+1])
        }
    }
    if len(values) > 0 {
        return baseURL + "?" + values.Encode()
    }
    return baseURL
}
```

## Array Operations

### GoChunk - Array Chunking

Splits an array into chunks of a specified size. Useful for creating grid layouts.

```tsx
// Basic chunking
<GoChunk items="items" size="3" elementName="chunk">
  <Row>
    <GoRange items="$chunk" elementName="item">
      <Column>
        <Text><GoVar name="$item.name" /></Text>
      </Column>
    </GoRange>
  </Row>
</GoChunk>
// Outputs: {{$chunk := chunk .Items 3}}
//         <Row>{{range $item := $chunk}}<Column><Text>{{$item.Name}}</Text></Column>{{end}}</Row>

// With chunk index
<GoChunk items="products" size="2" elementName="productRow" indexName="chunkIndex">
  <div style="row">
    <Text>Row #<GoVar name="$chunkIndex" /></Text>
    <GoRange items="$productRow" elementName="product">
      <div style="col">
        <Text><GoVar name="$product.name" /></Text>
      </div>
    </GoRange>
  </div>
</GoChunk>
// Outputs: {{$chunkIndex, $productRow := chunk .Products 2}}
//         <div style="row"><Text>Row #{{$chunkIndex}}</Text>{{range $product := $productRow}}<div style="col"><Text>{{$product.Name}}</Text></div>{{end}}</div>

// With local variable
<GoRange items="categories" elementName="category">
  <GoChunk items="$category.items" size="4" elementName="itemChunk">
    <Row>
      <GoRange items="$itemChunk" elementName="item">
        <Column><Text><GoVar name="$item.name" /></Text></Column>
      </GoRange>
    </Row>
  </GoChunk>
</GoRange>
```

**Note:** Register the `chunk` function in Go:

**Option 1: Using `any` (Go 1.18+)**
```go
func chunk(slice any, size int) [][]any {
    v := reflect.ValueOf(slice)
    if v.Kind() != reflect.Slice {
        return nil
    }

    length := v.Len()
    var result [][]any

    for i := 0; i < length; i += size {
        end := i + size
        if end > length {
            end = length
        }

        var chunk []any
        for j := i; j < end; j++ {
            chunk = append(chunk, v.Index(j).Interface())
        }
        result = append(result, chunk)
    }

    return result
}
```

**Option 2: Using `samber/lo` library**
```go
import "github.com/samber/lo"

func chunk(slice any, size int) [][]any {
    return lo.Chunk(slice, size)
}
```
```

## Comments

### GoComment - Template Comments

Adds comments to Go templates (ignored during execution).

```tsx
<GoComment>This section shows user profile information</GoComment>
// Outputs: {{/* This section shows user profile information */}}

// Multiline
<GoComment>
  This is a longer comment
  that spans multiple lines
</GoComment>
```

## Usage with Go

### 1. Generate the Template

Render your React component to HTML with embedded Go template syntax. You can use React Email's preview server or a custom SSR script to render your components:

**Option 1: Using React Email Preview Server**
```bash
# Start the preview server
npx email preview

# View your component at http://localhost:3000
# Copy the rendered HTML from the browser or use the API
```

**Option 2: Build the library**
```bash
npm run build
```

The output will be in `dist/` directory as compiled JavaScript/TypeScript. To get the actual HTML with Go template syntax, you need to render your components using a server-side renderer.

**Option 3: Custom SSR Example**
```tsx
// render-email.ts
import { render } from '@react-email/components'
import { WelcomeEmail } from './WelcomeEmail'

const html = await render(<WelcomeEmail />)
console.log(html)
```

The rendered HTML will contain Go template syntax that can be executed by Go.

### 2. Use in Go

```go
package main

import (
    "os"
    "text/template"
)

type EmailData struct {
    UserName      string
    IsLoggedIn    bool
    CartItems     []CartItem
    IsPremium     bool
}

type CartItem struct {
    Name  string
    Price string
}

func main() {
    // Read the generated template
    tmplContent, err := os.ReadFile("welcome-email.html")
    if err != nil {
        panic(err)
    }

    // Parse the template
    tmpl, err := template.New("welcome").Parse(string(tmplContent))
    if err != nil {
        panic(err)
    }

    // Prepare data
    data := EmailData{
        UserName:   "John Doe",
        IsLoggedIn: true,
        IsPremium:  true,
        CartItems: []CartItem{
            {Name: "Product A", Price: "$10.00"},
            {Name: "Product B", Price: "$20.00"},
        },
    }

    // Execute template
    err = tmpl.Execute(os.Stdout, data)
    if err != nil {
        panic(err)
    }
}
```

### Registering Go Functions

If you use data transformation helpers (GoDate, GoCurrency, GoTruncate, GoUrl, GoChunk, etc.), you need to register custom functions in your Go template:

```go
funcMap := template.FuncMap{
    // Data transformations
    "formatDate":     formatDate,
    "formatCurrency": formatCurrency,
    "truncate":       truncate,
    // String transformations
    "upper":          strings.ToUpper,
    "lower":          strings.ToLower,
    "trim":           strings.TrimSpace,
    // URL generation
    "addQueryParams": addQueryParams,
    // Array operations
    "chunk":          chunk,
}

tmpl := template.New("email").Funcs(funcMap).Parse(string(tmplContent))
```

See the individual component documentation for the required function signatures.

## Examples

See the `examples/` directory for complete examples:

- `WelcomeEmail.tsx` - Basic welcome email with conditionals and loops
- `OrderConfirmation.tsx` - Complex email with nested context and arrays
- `TemplateCompositionExample.tsx` - Template reusability with GoDefine, GoUseTemplate, GoBlock
- `DataTransformationExample.tsx` - Date, currency, and text formatting
- `ConditionalHelpersExample.tsx` - GoEqual and GoEmpty for common conditions
- `PipelineExample.tsx` - Pipeline chaining, variable assignment, and helper functions
- `HelperFunctionsExample.tsx` - Using helper functions in JSX attributes
- `ChunkExample.tsx` - Array chunking for grid layouts

## Data Structure

Your Go data structure should match the variable names used in your template:

```go
type TemplateData struct {
    UserName      string
    IsLoggedIn    bool
    IsPremium     bool
    CartItems     []struct {
        Name  string
        Price string
    }
    RecentItems   []struct {
        Title string
        Date  string
    }
    HasRecentActivity bool
    DashboardURL     string
}
```

## Why This Approach?

### The Problem
Building email templates is hard:
- **HTML emails** require compatibility across many email clients
- **React Email** provides great components and Tailwind styling
- **Go templates** provide powerful runtime parameterization

### The Solution
Use each tool for what it's best at:
- **React + Tailwind** for design and styling
- **Go templates** for runtime data and logic
- **@lumeweb/rego** as the bridge

This gives you:
- ✅ Beautiful, styled emails using React Email
- ✅ Powerful Go template features (conditionals, loops, functions)
- ✅ Type-safe TypeScript development
- ✅ Easy maintenance and iteration

## License

MIT
