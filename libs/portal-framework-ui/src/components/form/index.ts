/**
 * Form System Documentation
 *
 * This module provides a flexible form system with support for multiple form adapters, automatic form rendering,
 * and integration with validation libraries like Zod. The system is built on top of React Hook Form and provides
 * Refine integration.
 *
 * Key Components:
 * - SchemaForm: Automatically renders forms based on configuration
 * - FormRenderer: Core component that handles field rendering
 * - Form adapters: Support for different form handling strategies (RHF, Refine)
 * - Form component registry: Central registration for all form input components
 *
 * Basic Usage:
 *
 * 1. Import SchemaForm and define your form configuration:
 *
 * ```tsx
 * import { SchemaForm, FormFieldType } from '@lumeweb/portal-framework-ui';
 *
 * const formConfig = {
 *   fields: [
 *     {
 *       name: 'email',
 *       type: FormFieldType.TEXT,
 *       label: 'Email',
 *       required: true
 *     }
 *   ],
 *   onSubmit: (values) => console.log(values)
 * };
 *
 * <SchemaForm config={formConfig} />
 * ```
 *
 * 2. Register form components (typically in your app initialization):
 *
 * ```ts
 * import { registerAllFormComponents } from '@lumeweb/portal-framework-ui';
 *
 * registerAllFormComponents();
 * ```
 *
 * Validation Example with Zod:
 *
 * ```ts
 * import { z } from 'zod';
 *
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * const = {
 *   = {
 *   validationSchema: schema,
 *   // ...other config
 * };
 * ```
 *
 * Complex Example with All Features:
 *
 * ```tsx
 * import { SchemaForm, FormFieldType } from '@lumeweb/portal-framework-ui';
 * import { z } from 'zod';
 * import { CustomImageUploader } from './components/CustomImageUploader';
 *
 * // Zod schema with complex validation
 * const userSchema = z.object({
 *   username: z.string().min(3).max(20),
 *   email: z.string().email(),
 *   password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
 *   role: z.enum(['user', 'admin', 'moderator']),
 *   newsletter: z.boolean().optional(),
 *   newsletterType: z.enum(['daily', 'weekly']).optional(),
 *   bio: z.string().max(500).optional(),
 *   avatar: z.instanceof(File).optional(),
 *   terms: z.boolean().refine(v => v, "Must accept terms"),
 *   preferences: z.object({
 *     darkMode: z.boolean(),
 *     notifications: z.enum(['all', 'none', 'mentions'])
 *   })
 * });
 *
 * const formConfig = {
 *   layout: 'grid',
 *   formClassName: 'grid grid-cols-2 gap-4',
 *   adapter: 'refine',
 *   resource: 'users',
 *   validationSchema: userSchema,
 *   refineCoreProps: {
 *     meta: { audit: true },
 *     successNotification: (data) => ({
 type: type: 'success',
 *       message: `User ${data.username} created successfully`
 *     })
 *   },
 *   fields: [
 *     {
 *       name: 'username',
 *       type: FormFieldType.TEXT,
 *       label: 'Username',
 *       required: true,
 *       description: '3-20 characters, letters and numbers only',
 *       inputClassName: 'col-span-1'
 *     },
 *     {
 *       name: 'email',
 *       type: FormFieldType.TEXT,
 *       label: 'Email',
 *       inputType: 'email',
 *       required: true
 *     },
 *     {
 *       name: 'password',
 *       type: FormFieldType.TEXT,
 *       label: 'Password',
 *       inputType: 'password',
 *       required: true,
 *       description: 'Minimum 8 characters with 1 uppercase letter and 1 number'
 *     },
 *     {
 *       name: 'role',
 *       type: FormFieldType.SELECT,
 *       label: 'User Role',
 *       options: ['user', 'admin', 'moderator'],
 *       required: true,
 *       className: 'col-span-2'
 *     },
 *     {
 *       name: 'newsletter',
 *       type: FormFieldType.SWITCH,
 *       label: 'Subscribe to newsletter',
 *       description: 'Receive our weekly updates'
 *     },
 *     {
: 'news: 'newsletterType',
 *       type: FormFieldType.RADIO,
 *       label: 'Newsletter Frequency',
 *       options: ['daily', 'weekly'],
 *       dependencies: ['newsletter'],
 *       hidden: (values) => !values.newsletter
 *     },
 *     {
 *       name: 'bio',
 *       type: FormFieldType.TEXTAREA,
 *       label: 'Biography',
 *       placeholder: 'Tell us about yourself...',
 *       className: 'col-span-2'
 *     },
 *     {
 *       name: 'avatar',
 *       type: FormFieldType.CUSTOM,
 *       component: CustomImageUploader,
 *       label: 'Profile Picture',
 *       description: 'Upload a JPEG or PNG image',
 *       className: 'col-span-2'
 *     },
 *     {
 *       name: 'preferences.darkMode',
 *       type: FormFieldType.SWITCH,
 *       label: 'Dark Mode'
 *     },
 *     {
 *       name: 'preferences.notifications',
 *       type: FormFieldType.SELECT,
 *       label: 'Notification Settings',
 *       options: ['all', 'none', 'mentions']
 *     },
 *     {
 *       name: 'terms',
 *       type: FormFieldType.CHECKBOX,
 *       label: 'I accept the terms and conditions',
 *       required: true,
 *       className: 'col-span-2'
 *     }
 *   ],
 *   footer: (methods, closeDialog) => (
 *     <div className="flex gap-4 justify-end col-span-2 mt-6">
 *       <Button variant="outline" onClick={closeDialog}>
 *         Cancel
 *       </Button>
 *       <Button
 *         loading={methods.formState.isSubmitting}
 *         type="submit"
 *       >
 *         Create User
 *       </Button>
 *     </div>
 *   ),
 *   actionButtonsLayout: 'horizontal',
 *   onSuccess: (values) => console.log('Form submitted:', values),
 *   onError: (error) => console.error('Form error:', error),
 *   closeOnSubmit: false
 * };
 *
 * <SchemaForm config={formConfig} />
 * ```
 *
 * Field Dependency Example:
 *
 * ```ts
 * // Show newsletter frequency only when newsletter is subscribed
 * {
 *   name: 'newsletter',
 *   type: FormFieldType.SWITCH,
 *   label: 'Subscribe to newsletter'
 * },
 * {
 *   name: 'frequency',
 *   type: FormFieldType.SELECT,
 *   label: 'Newsletter frequency',
 *   options: ['weekly', 'monthly'],
 *   requires: {
 *     'newsletter': true // Only show if newsletter is checked
 *   },
 *   show: (values) => values.newsletter === true // Alternative conditional
 * }
 * ```
 *
 * Multi-Step Form Example:
 *
 * ```tsx
 * const multiStepConfig = {
 *   type: 'form',
 *   title: 'Registration',
 *   formConfig: {
 *     steps: [
 *       {
 *         title: 'Personal Information',
 *         fields: [
 *           { name: 'firstName', type: FormFieldType.TEXT, label: 'First Name' },
 *           { name: 'email', type: FormFieldType.TEXT, label: 'Email' }
 *         ]
 *       },
 *       {
 *         title: 'Preferences',
 *         fields: [
 *           { name: 'newsletter', type: FormFieldType.SWITCH, label: 'Subscribe' },
 *           { name: 'theme', type: FormFieldType.SELECT,
 *             options: ['light', 'dark'], label: 'Theme' }
 *         ]
 *       }
 *     ],
 *     stepBehavior: {
 *       defaultStep: 0,
 *       isBackValidate: true // Validate when going back steps
 *     },
 *     onSubmit: (values) => handleRegistration(values)
 *   }
 * };
 *
 * openDialog(multiStepConfig);
 * ```
 *
 * Adapters:
 * - 'rhf': Default React Hook Form adapter
 * - 'refine': Form adapter for Refine integration
 *
 * Component Registration:
 * All form components must be registered before use. Use either:
 * - registerAllFormComponents() - registers all built-in components
 * - Individual component registrars (registerInput(), registerSelect(), etc)
 */
export * from "./adapters";
export * from "./context";
export * from "./fields";
export * from "./FormGroup";
export * from "./FormRenderer";
export * from "./register";
export * from "./SchemaForm";
export * from "./StepControlContext";
export * from "./StepSchemaForm";
export * from "./types";
