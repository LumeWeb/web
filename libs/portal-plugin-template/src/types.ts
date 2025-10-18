// Plugin-specific type definitions

export interface TemplateConfig {
  // Add your plugin configuration types here
  enabled: boolean;
  settings?: {
    // Plugin settings
  };
}

export interface TemplateState {
  // Add your plugin state types here
  isLoading: boolean;
  error?: string;
}