/**
 * Action System Documentation
 * 
 * The action system provides a consistent way to handle user interactions in dialogs and forms.
 * 
 * Basic Usage:
 * 
 * 1. First register the action items you need:
 * 
 * ```ts
 * // In your app initialization
 * import { registerAllActionItems } from './actions';
 * 
 * registerAllActionItems();
 * ```
 * 
 * 2. Use ActionListRenderer with your action configurations:
 * 
 * ```tsx
 * <ActionListRenderer
 *   actions={[
 *     {
 *       type: ActionItemType.CANCEL,
 *       label: 'Close',
 *       className: 'mr-auto'
 *     },
 *     {
 *       type: ActionItemType.SUBMIT,
 *       label: 'Save Changes',
 *       disabled: isSubmitting
 *     }
 *   ]}
 *   layout="horizontal"
 * />
 * ```
 * 
 * Action Item Configuration Examples:
 * 
 * // Submit action with loading state
 * {
 *   type: ActionItemType.SUBMIT,
 *   label: 'Save',
 *   disabled: formState.isSubmitting
 * }
 * 
 * // Cancel button that closes dialog
 * {
 *   type: ActionItemType.CANCEL,
 *   label: 'Cancel',
 *   onClick: () => console.log('Custom cancel handler')
 * }
 * 
 * // Custom action with click handler
 * {
 *   type: ActionItemType.CUSTOM,
 *   label: 'Preview',
 *   onClick: showPreview,
 *   className: 'bg-blue-100'
 * }
 * 
 * // Link action navigating to external URL
 * {
 *   type: ActionItemType.LINK,
 *   label: 'View Docs',
 *   to: 'https://docs.example.com',
 *   target: '_blank'
 * }
 */
export * from "./ActionListRenderer";
export * from "./register";
export * from "./registry";
export * from "./types";
