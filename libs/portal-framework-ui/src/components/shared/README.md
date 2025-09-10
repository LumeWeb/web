# Unified Footer & Header System

## Overview

This document describes the unified footer and header system that provides consistent patterns for forms and dialogs throughout the portal framework. The system uses composed types, React context, and a registry pattern to ensure type safety and extensibility.

## Architecture

### Core Principles

1. **Composed Types**: Small, focused interfaces that can be combined as needed
2. **Function-Based Builders**: Pure functions for creating environment objects
3. **React Context**: Proper state management without prop drilling
4. **Registry Pattern**: Extensible component registration system
5. **Type Safety**: Discriminated unions and comprehensive type guards

### Type System

#### Footer Types

The footer system uses orthogonal properties instead of combined modes to avoid combinatorial explosion:

```typescript
interface FooterEnvironment<T> {
  container: AnyContainerEnvironment; // WHERE is this footer rendered?
  form: AnyFormEnvironment; // WHAT kind of form is this?
  step?: StepEnvironment; // Additional environment for multi-step forms
  dialog?: DialogConfig<T>; // Dialog configuration (if applicable)
}
```

**Container Environment:**

- `DialogContainerEnvironment`: Footer rendered in a dialog
- `StandaloneContainerEnvironment`: Footer rendered standalone

**Form Environment:**

- `SimpleFormEnvironment`: Single-step form
- `WizardFormEnvironment`: Multi-step wizard form
- `StepFormEnvironment`: Multi-step form (non-wizard)

#### Header Types

Similar to footer types but focused on content and navigation:

```typescript
interface HeaderEnvironment<T> {
  container: AnyContainerEnvironment; // WHERE is this header rendered?
  content: HeaderContent; // WHAT content to display?
  navigation: AnyNavigationEnvironment; // WHAT navigation to show?
}
```

## Usage

### Footer System

#### Basic Usage

```typescript
import { UnifiedFooter, createDialogFooterEnvironment } from '../shared';

// In a dialog component
const footerEnvironment = createDialogFooterEnvironment(
  dialogConfig,
  formMethods,
  formMethods?.formState?.isSubmitting || false
);

<UnifiedFooter
  config={formConfig}
  environment={footerEnvironment}
  className="mt-4"
/>
```

#### Wizard Footer

```typescript
import { UnifiedFooter, createDialogWizardFooterEnvironment, createStepEnvironment } from '../shared';
import { useStepControlContext } from '../form/StepControlContext';

const stepControl = useStepControlContext();
const footerEnvironment = createDialogWizardFooterEnvironment(
  dialogConfig,
  formMethods,
  formMethods?.formState?.isSubmitting || false,
  createStepEnvironment(
    stepControl.currentStep,
    stepControl.totalSteps,
    stepControl.isFirstStep,
    stepControl.isLastStep,
    stepControl.handlePrevious,
    stepControl.handleNext
  )
);

<UnifiedFooter
  config={wizardConfig}
  environment={footerEnvironment}
/>
```

### Header System

#### Basic Usage

```typescript
import { UnifiedHeader, createDialogHeaderEnvironment } from '../shared';

const headerEnvironment = createDialogHeaderEnvironment(
  dialogConfig,
  "Form Title",
  "Form description goes here",
  dialogConfig.actions
);

<UnifiedHeader
  config={formConfig}
  environment={headerEnvironment}
/>
```

#### Wizard Header

```typescript
import { UnifiedHeader, createDialogWizardHeaderEnvironment } from '../shared';
import { useStepControlContext } from '../form/StepControlContext';

const stepControl = useStepControlContext();
const headerEnvironment = createDialogWizardHeaderEnvironment(
  dialogConfig,
  "Wizard Title",
  "Wizard description",
  stepControl.currentStep,
  stepControl.totalSteps,
  'timeline', // progress style: 'timeline' | 'stepper' | 'dots'
  dialogConfig.actions
);

<UnifiedHeader
  config={wizardConfig}
  environment={headerEnvironment}
/>
```

## Component Registry

### Footer Types

The system supports different footer types through a registry:

```typescript
export enum FooterType {
  ACTIONS = "actions", // Actions dropdown footer
  DEFAULT = "default", // Default footer with cancel/submit
  FORM = "form", // Form-specific footer
  WIZARD_FORM = "wizard_form", // Wizard form footer
  STEP_FORM = "step_form", // Step form footer
  CUSTOM = "custom", // Custom footer
}
```

### Header Types

```typescript
export enum HeaderType {
  DEFAULT = "default", // Default header
  FORM = "form", // Form-specific header
  WIZARD = "wizard", // Wizard header with progress
  CUSTOM = "custom", // Custom header
}
```

### Registering Custom Components

```typescript
import { footerRegistry, headerRegistry } from "../shared";

// Register a custom footer component
footerRegistry.register(FooterType.CUSTOM, CustomFooterComponent);

// Register a custom header component
headerRegistry.register(HeaderType.CUSTOM, CustomHeaderComponent);
```

## Environment Builders

### Footer Environment Builders

```typescript
// Dialog form environment
createDialogFooterEnvironment(dialogConfig, formMethods, isSubmitting);

// Dialog wizard environment
createDialogWizardFooterEnvironment(dialogConfig, formMethods, isSubmitting, stepEnvironment);

// Standalone form environment
createStandaloneFooterEnvironment(formMethods, isSubmitting);

// Standalone wizard environment
createStandaloneWizardFooterEnvironment(formMethods, isSubmitting, stepEnvironment);
```

### Header Environment Builders

```typescript
// Dialog header environment
createDialogHeaderEnvironment(dialogConfig, title, description, actions);

// Dialog wizard header environment
createDialogWizardHeaderEnvironment(dialogConfig, title, description, current, total, progressStyle, actions);

// Standalone header environment
createStandaloneHeaderEnvironment(title, description, actions);

// Standalone wizard header environment
createStandaloneWizardHeaderEnvironment(title, description, current, total, progressStyle, actions);
```

## Type Guards

The system provides comprehensive type guards for type safety:

```typescript
import { isDialogContainer, isWizardForm, hasStepEnvironment, isWizardNavigation } from "../shared";

if (isDialogContainer(environment.container)) {
  // Safe to access environment.container.onClose
}

if (isWizardForm(environment.form) && hasStepEnvironment(environment)) {
  // Safe to access wizard and step-specific properties
}
```

## Migration Guide

### From Legacy Footer System

1. **Replace Footer Components**: Use `UnifiedFooter` instead of specific footer components
2. **Environment Creation**: Use environment builders instead of passing individual props
3. **Registry Usage**: The system automatically determines the appropriate footer type

**Before:**

```typescript
<DefaultDialogFooter
  closeDialog={closeDialog}
  currentDialog={currentDialog}
  formMethods={formMethods}
  onConfirm={onConfirm}
/>
```

**After:**

```typescript
const footerEnvironment = createDialogFooterEnvironment(
  currentDialog,
  formMethods,
  formMethods?.formState?.isSubmitting || false
);

<UnifiedFooter
  config={currentDialog.formConfig || currentDialog}
  environment={footerEnvironment}
/>
```

### From Legacy Header System

1. **Replace Header Components**: Use `UnifiedHeader` instead of specific header components
2. **Environment Creation**: Use environment builders for consistent header creation

**Before:**

```typescript
<div className="space-y-2">
  <h2 className="text-lg font-semibold">{title}</h2>
  <p className="text-sm text-muted-foreground">{description}</p>
</div>
```

**After:**

```typescript
const headerEnvironment = createDialogHeaderEnvironment(
  dialogConfig,
  title,
  description,
  actions
);

<UnifiedHeader
  config={formConfig}
  environment={headerEnvironment}
/>
```

## Best Practices

### 1. Use Environment Builders

Always use the provided environment builders to ensure type safety:

```typescript
// ✅ Good
const environment = createDialogFooterEnvironment(dialogConfig, formMethods, isSubmitting);

// ❌ Avoid - manual environment creation
const environment = {
  container: { type: "dialog", onClose, dialogConfig },
  form: { type: "simple", methods: formMethods, isSubmitting },
};
```

### 2. Handle Wizard Environment Gracefully

Wizard components should gracefully handle cases where step control is not available:

```typescript
try {
  const stepControl = useStepControlContext();
  // Use step control for wizard environment
} catch {
  // Fallback to simple environment
}
```

### 3. Leverage Type Guards

Use type guards for safe property access:

```typescript
if (isDialogContainer(environment.container)) {
  // Safe to use environment.container.onClose
}
```

### 4. Custom Components

When registering custom components, follow the established patterns:

```typescript
const CustomFooter: React.FC<BaseFooterProps> = ({
  environment,
  actions,
  submitLabel,
  onClose
}) => {
  // Use environment properties safely with type guards
  if (isDialogContainer(environment.container)) {
    // Dialog-specific logic
  }

  return (
    <div className="custom-footer">
      {/* Custom footer implementation */}
    </div>
  );
};
```

## Performance Considerations

1. **Memoization**: The unified components use React.memo and useMemo for optimal performance
2. **Context Providers**: Context providers are placed at the appropriate level to avoid unnecessary re-renders
3. **Registry**: Component lookup is O(1) and cached for performance

## Testing

The system is designed to be testable:

```typescript
// Test environment creation
const environment = createDialogFooterEnvironment(dialogConfig, formMethods, false);
expect(environment.container.type).toBe("dialog");
expect(environment.form.type).toBe("simple");

// Test type guards
expect(isDialogContainer(environment.container)).toBe(true);
expect(isWizardForm(environment.form)).toBe(false);
```

## Future Extensibility

The system is designed to be easily extended:

1. **New Container Types**: Add new container types by extending the unions
2. **New Form Types**: Add new form types by extending the form environment
3. **Custom Components**: Register custom components for specific use cases
4. **New Navigation Types**: Extend navigation environment for new patterns

The composed type system ensures that adding new types doesn't create combinatorial explosions or breaking changes.
