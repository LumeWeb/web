/**
 * Template plugin configuration interface
 */
export interface TemplateConfig {
  /**
   * Whether the template feature is enabled
   */
  enabled: boolean;

  /**
   * Template-specific settings
   */
  settings?: {
    /**
     * Custom setting example
     */
    customSetting?: string;
    
    /**
     * Maximum items allowed
     */
    maxItems?: number;
  };
}

/**
 * Template plugin state interface
 */
export interface TemplateState {
  /**
   * Whether the plugin is currently loading
   */
  isLoading: boolean;

  /**
   * Error message if something went wrong
   */
  error?: string;

  /**
   * Current template data
   */
  data?: unknown;
}

/**
 * Template plugin capability interface
 */
export interface TemplateCapability {
  /**
   * Capability identifier
   */
  id: string;

  /**
   * Capability type
   */
  type: string;

  /**
   * Initialize the capability
   */
  initialize(): Promise<void>;

  /**
   * Cleanup the capability
   */
  destroy(): Promise<void>;
}

/**
 * Template plugin feature interface
 */
export interface TemplateFeature {
  /**
   * Feature identifier
   */
  id: string;

  /**
   * Feature name
   */
  name: string;

  /**
   * Feature description
   */
  description?: string;

  /**
   * Initialize the feature
   */
  initialize(): Promise<void>;

  /**
   * Cleanup the feature
   */
  destroy(): Promise<void>;
}