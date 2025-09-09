// Define the structure for background images within a theme
export interface BackgroundImages {
  login: string;
  register: string;
  reset_password: string;
  // Add other potential background image keys here
}

// Define the structure for an HSL color
export interface Color {
  hue: number; // 0-360
  lightness: number; // 0-100
  saturation: number; // 0-100
}

// Define the structure for system colors within a theme
export interface SystemColors {
  active_ui_element: Color;
  background: Color;
  borders: Color;
  high_contrast_text: Color;
  hovered_element_border: Color;
  hovered_solid_bg: Color;
  hovered_ui_element: Color;
  low_contrast_text: Color;
  solid_background: Color;
  subtle_background: Color;
  ui_element_background: Color;
  ui_element_border: Color;
}

// Define the overall Theme structure
export interface Theme {
  background_images: BackgroundImages;
  default?: boolean;
  id: string;
  name: string;
  system_colors: SystemColors;
  // Add other theme properties here if needed
}
