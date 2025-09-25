/**
 * Dialog Component Setup:
 *
 * 1. Wrap your application with DialogProvider:
 *
 * ```tsx
 * import { DialogProvider } from "./dialog";
 *
 * function App() {
 *   return (
 *     <DialogProvider>
 *       <YourAppContent />
 *       <DialogRenderer />
 *     </DialogProvider>
 *   );
 * }
 * ```
 *
 * 2. Place DialogRenderer once at the root level where dialogs should appear
 * 3. Use useDialog() hook in any component to access dialog controls
 *
 * Basic Usage:
 *
 * ```tsx
 * import { useDialog } from "./dialog";
 *
 * function MyComponent() {
 *   const { openDialog } = useDialog();
 *
 *   const handleDelete = () => {
 *     /* deletion logic *\/
 *   };
 *
 *   return (
 *     <button onClick={() =>
 *       openDialog({
 *         type: 'confirm',
 *         title: 'Delete Item',
 *         description: 'Are you sure? This cannot be undone.',
 *         cancelText: 'Cancel',
 *         confirmText: 'Delete',
 *         variant: 'destructive',
 *         position: 'top',
 *         size: 'md',
 *         onConfirm: handleDelete
 *       })
 *     }>
 *       Delete Item
 *     </button>
 *   );
 * }
 * ```
 *
 * Dialog Type Examples:
 *
 * 1. Alert Dialog:
 * ```tsx
 * openDialog({
 *   type: 'alert',
 *   title: 'Update Successful',
 *   description: 'Your changes have been saved',
 *   status: 'success',
 *   position: 'top-right'
 * });
 * ```
 *
 * 2. Form Dialog:
 * ```tsx
 * openDialog({
 *   type: 'form',
 *   title: 'Create User',
 *   size: 'lg',
 *   formConfig: {
 *     fields: [
 *       { name: 'email', type: FormFieldType.TEXT, label: 'Email' }
 *     ],
 *     onSubmit: (values) => console.log(values)
 *   },
 *   actionButtonsLayout: 'vertical',
 *   onCancel: () => console.log('Form cancelled')
 * });
 * ```
 *
 * 3. Field Dependency Example:
 * ```tsx
 * openDialog({
 *   type: 'form',
 *   title: 'Newsletter Preferences',
 *   formConfig: {
 *     fields: [
 *       {
 *         name: 'subscribeNewsletter',
 *         type: FormFieldType.SWITCH,
 *         label: 'Subscribe to newsletter'
 *       },
 *       {
 *         name: 'newsletterFrequency',
 *         type: FormFieldType.SELECT,
 *         label: 'Frequency',
 *         options: ['weekly', 'monthly'],
 *         requires: {
 *           'subscribeNewsletter': true
 *         }
 *       }
 *     ],
 *     onSubmit: (values) => handleNewsletterUpdate(values)
 *   }
 * });
 * ```
 *
 * 4. Multi-Step Form Example:
 * ```tsx
 * openDialog({
 *   type: 'form',
 *   title: 'User Registration',
 *   size: 'lg',
 *   formConfig: {
 *     steps: [
 *       {
 *         title: 'Personal Info',
 *         fields: [
 *           { name: 'firstName', type: FormFieldType.TEXT, label: 'First Name' },
 *           { name: 'email', type: FormFieldType.TEXT, label: 'Email' }
 *         ]
 *       },
 *       {
 *         title: 'Preferences',
 *         fields: [
 *           { name: 'theme', type: FormFieldType.SELECT,
 *             options: ['light', 'dark'], label: 'Theme' },
 *           { name: 'newsletter', type: FormFieldType.SWITCH,
 *             label: 'Subscribe to newsletter' }
 *         ]
 *       }
 *     ],
 *     stepBehavior: {
 *       defaultStep: 0,
 *       isBackValidate: true
 *     },
 *     onSubmit: (values) => completeRegistration(values)
 *   }
 * });
 * ```
 *
 * 5. Custom Dialog:
 * ```tsx
 * openDialog({
 *   type: 'custom',
 *   title: 'Custom Content',
 *   content: <MyCustomComponent />,
 *   footer: <CustomFooter />,
 *   position: 'bottom-right',
 *   classNames: {
 *     content: 'bg-blue-50'
 *   }
 * });
 * ```
 *
 * Required Fields by Type:
 * - confirm: type, title, cancelText, confirmText, onConfirm
 * - alert: type, title
 * - form: type, title, formConfig, onSubmit
 * - custom: type, title, content
 *
 * Additional Configuration Options:
 * - position: 'center' | 'top' | 'top-right' | 'bottom' etc.
 * - size: 'sm' | 'md' | 'lg'
 * - status: 'success' | 'error' for status icons
 * - actionButtons: Custom button configurations
 * - classNames: Custom CSS classes for header/content/footer
 * - preventCloseOnOutsideClick: Block closing on click outside
 * - status: Show success/error status icon
 */
export * from "./Dialog.context";
export * from "./Dialog.renderer";
export * from "./Dialog.types";
export * from "./utils";
