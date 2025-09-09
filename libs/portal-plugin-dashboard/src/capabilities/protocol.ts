import type { BaseCapability } from "@lumeweb/portal-framework-core";

export interface ProtocolCapability extends BaseCapability<"core:protocol"> {
  /**
   * Get the protocol description for display in UI
   */
  getDescription(): string;

  /**
   * Get the icon component for display in UI
   */
  getIcon(): React.ComponentType<{ className?: string }>;

  /**
   * Get maximum file size allowed for this protocol
   */
  getMaxFileSize(): number;

  /**
   * Get the protocol name for display in UI
   */
  getName(): string;

  /**
   * Get supported file types/extensions for this protocol
   */
  getSupportedFileTypes(): string[];

  /**
   * Basic file validation method to check if a file is valid for this protocol
   */
  validateFile(file: File): boolean;
}
