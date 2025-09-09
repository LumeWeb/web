// Import the theme types from the new types file
import { BackgroundImages, Color, SystemColors, Theme } from "../types/theme";

/**
 * Adjusts the hue of a color by a given number of degrees.
 * Hue wraps around at 360.
 * @param color The Color object.
 * @param degrees The number of degrees to adjust the hue by.
 * @returns A new Color object.
 */
export function adjustHue(color: Color, degrees: number): Color {
  let newHue = color.hue + degrees;
  // Ensure hue wraps around 0-360
  newHue = newHue % 360;
  if (newHue < 0) {
    newHue += 360;
  }
  return { ...color, hue: newHue };
}

/**
 * Applies the styles from a Theme object to the DOM.
 * This function manipulates the document head and root element class.
 * @param theme The Theme object to apply.
 */
export function applyThemeStyles(theme: Theme): void {
  const css = generateThemeCSS(theme);
  const style = document.createElement("style");
  style.textContent = css;
  const existingStyle = document.head.querySelector("style[data-theme]");

  if (existingStyle) {
    document.head.removeChild(existingStyle);
  }
  style.setAttribute("data-theme", theme.id);
  document.head.appendChild(style);

  document.documentElement.className = `theme-${theme.id}`;
}

/**
 * Creates default system colors for a light theme.
 */
export function createDefaultSystemColors(): SystemColors {
  return {
    active_ui_element: { hue: 0, lightness: 80, saturation: 0 },
    background: { hue: 0, lightness: 100, saturation: 0 },
    borders: { hue: 0, lightness: 70, saturation: 0 },
    high_contrast_text: { hue: 0, lightness: 10, saturation: 0 },
    hovered_element_border: { hue: 0, lightness: 50, saturation: 0 },
    hovered_solid_bg: { hue: 0, lightness: 35, saturation: 0 },
    hovered_ui_element: { hue: 0, lightness: 85, saturation: 0 },
    low_contrast_text: { hue: 0, lightness: 30, saturation: 0 },
    solid_background: { hue: 0, lightness: 40, saturation: 0 },
    subtle_background: { hue: 0, lightness: 95, saturation: 0 },
    ui_element_background: { hue: 0, lightness: 90, saturation: 0 },
    ui_element_border: { hue: 0, lightness: 60, saturation: 0 },
  };
}

/**
 * Creates a default theme object.
 * This can be used as a fallback or starting point.
 */
export function createDefaultTheme(): Theme {
  return {
    background_images: {
      login: "",
      register: "",
      reset_password: "",
    },
    id: "default",
    name: "Default Theme",
    system_colors: createDefaultSystemColors(),
  };
}

/**
 * Creates a system colors object with all values at zero.
 * Useful for testing and reset operations.
 */
export function createZeroSystemColors(): SystemColors {
  return {
    active_ui_element: { hue: 0, lightness: 0, saturation: 0 },
    background: { hue: 0, lightness: 0, saturation: 0 },
    borders: { hue: 0, lightness: 0, saturation: 0 },
    high_contrast_text: { hue: 0, lightness: 0, saturation: 0 },
    hovered_element_border: { hue: 0, lightness: 0, saturation: 0 },
    hovered_solid_bg: { hue: 0, lightness: 0, saturation: 0 },
    hovered_ui_element: { hue: 0, lightness: 0, saturation: 0 },
    low_contrast_text: { hue: 0, lightness: 0, saturation: 0 },
    solid_background: { hue: 0, lightness: 0, saturation: 0 },
    subtle_background: { hue: 0, lightness: 0, saturation: 0 },
    ui_element_background: { hue: 0, lightness: 0, saturation: 0 },
    ui_element_border: { hue: 0, lightness: 0, saturation: 0 },
  };
}

/**
 * Darkens a color by a given percentage.
 * @param color The Color object.
 * @param amount The percentage amount to darken by (0-100).
 * @returns A new Color object.
 */
export function darkenColor(color: Color, amount: number): Color {
  const newLightness = clamp(color.lightness - amount, 0, 100);
  return { ...color, lightness: newLightness };
}

/**
 * Desaturates a color by a given percentage.
 * @param color The Color object.
 * @param amount The percentage amount to desaturate by (0-100).
 * @returns A new Color object.
 */
export function desaturateColor(color: Color, amount: number): Color {
  const newSaturation = clamp(color.saturation - amount, 0, 100);
  return { ...color, saturation: newSaturation };
}

/**
 * Attempts to adjust theme colors to meet WCAG contrast requirements.
 * It iterates through common color pairs and adjusts lightness if contrast is insufficient.
 * Returns a new Theme object if changes were made, otherwise returns the original theme.
 * @param theme The Theme object to check and potentially adjust.
 * @param textLevel The desired WCAG level for text contrast ('AA' or 'AAA'). Defaults to 'AA'.
 * @param nonTextLevel The desired WCAG level for non-text contrast ('AA'). Defaults to 'AA'.
 * @returns A new Theme object with adjusted colors if needed, or the original theme.
 */
export function ensureWcagContrast(
  theme: Theme,
  textLevel: "AA" | "AAA" = "AA",
  nonTextLevel: "AA" = "AA", // Non-text only has AA (3:1) requirement
): Theme {
  const modifiedTheme = { ...theme, systemColors: { ...theme.system_colors } };
  let changesMade = false;

  const colors = modifiedTheme.systemColors;

  // Define color pairs and their check type (text/non-text) and text size (normal/large)
  // For simplicity, assume all text is 'normal' for now. Large text check can be added later if needed.
  const colorPairs: {
    bgKey: keyof SystemColors;
    fgKey: keyof SystemColors;
    type: "non-text" | "text";
  }[] = [
    { bgKey: "background", fgKey: "high_contrast_text", type: "text" },
    { bgKey: "background", fgKey: "low_contrast_text", type: "text" },
    {
      bgKey: "ui_element_background",
      fgKey: "high_contrast_text",
      type: "text",
    },
    {
      bgKey: "ui_element_background",
      fgKey: "low_contrast_text",
      type: "text",
    },
    {
      bgKey: "ui_element_background",
      fgKey: "ui_element_border",
      type: "non-text",
    },
    {
      bgKey: "hovered_ui_element",
      fgKey: "hovered_element_border",
      type: "non-text",
    },
    {
      bgKey: "ui_element_background",
      fgKey: "active_ui_element",
      type: "non-text",
    },
    { bgKey: "background", fgKey: "hovered_ui_element", type: "non-text" },
    { bgKey: "background", fgKey: "solid_background", type: "non-text" },
    { bgKey: "solid_background", fgKey: "hovered_solid_bg", type: "non-text" },
  ];

  for (const { bgKey, fgKey, type } of colorPairs) {
    const fgColor = colors[fgKey];
    const bgColor = colors[bgKey];

    let needsAdjustment = false;
    let requiredRatio: number;

    if (type === "text") {
      requiredRatio = textLevel === "AAA" ? 7.0 : 4.5;
      if (!meetsWcagTextContrast(fgColor, bgColor, textLevel, false)) {
        // Assume normal text for now
        needsAdjustment = true;
      }
    } else {
      // non-text
      requiredRatio = 3.0; // WCAG 2.1 SC 1.4.11 AA
      if (!meetsWcagNonTextContrast(fgColor, bgColor)) {
        needsAdjustment = true;
      }
    }

    if (needsAdjustment) {
      changesMade = true;
      console.warn(
        `WCAG Contrast Warning: Pair ${fgKey} vs ${bgKey} (Current Ratio: ${getContrastRatio(fgColor, bgColor)}) does not meet required ratio ${requiredRatio} for ${type === "text" ? textLevel + " Text" : "Non-text"}. Attempting to adjust.`,
      );

      // Simple adjustment strategy: Adjust foreground lightness first, then background lightness.
      // Determine direction of adjustment for foreground
      const fgLuminance = rgbToLuminance(...hslToRgb(fgColor));
      const bgLuminance = rgbToLuminance(...hslToRgb(bgColor));

      let adjustedFg = { ...fgColor };
      let adjustedBg = { ...bgColor };
      let currentRatio = getContrastRatio(adjustedFg, adjustedBg);
      const step = 1; // Adjust lightness by 1% at a time
      const maxAttempts = 200; // Total attempts limit

      let attempts = 0;
      let adjustingFg = true; // Start by adjusting foreground

      while (currentRatio < requiredRatio && attempts < maxAttempts) {
        attempts++;
        const currentFgLuminance = rgbToLuminance(...hslToRgb(adjustedFg));
        const currentBgLuminance = rgbToLuminance(...hslToRgb(adjustedBg));

        let adjustedThisIteration = false;

        if (adjustingFg) {
          // Determine ideal direction for FG adjustment
          // Determine ideal direction for FG adjustment to increase contrast:
          // If FG is darker than BG, darkening FG increases contrast (direction -1)
          // If FG is lighter than BG, lightening FG increases contrast (direction +1)
          const fgAdjustmentDirection =
            currentFgLuminance < currentBgLuminance ? -1 : 1;
          const nextFgLightness = clamp(
            adjustedFg.lightness + fgAdjustmentDirection * step,
            0,
            100,
          );

          if (adjustedFg.lightness === nextFgLightness) {
            adjustingFg = false; // Switch to adjusting background
            // Fall through to BG adjustment logic in the same iteration
          } else {
            // Adjust FG lightness
            adjustedFg = { ...adjustedFg, lightness: nextFgLightness };
            currentRatio = getContrastRatio(adjustedFg, adjustedBg);
            adjustedThisIteration = true;
          }
        }

        // If we are here and haven't adjusted FG, try adjusting BG
        if (!adjustedThisIteration && !adjustingFg) {
          // Determine ideal direction for BG adjustment relative to the *current* FG
          // If BG is darker than FG, lightening BG increases contrast (direction +1)
          // If BG is lighter than FG, darkening BG increases contrast (direction -1)
          const bgAdjustmentDirection =
            currentBgLuminance < currentFgLuminance ? 1 : -1;
          const nextBgLightness = clamp(
            adjustedBg.lightness + bgAdjustmentDirection * step,
            0,
            100,
          );

          if (adjustedBg.lightness === nextBgLightness) {
            // BG hit a boundary and couldn't move further, stop
            break; // Cannot adjust further
          } else {
            // Adjust BG lightness
            adjustedBg = { ...adjustedBg, lightness: nextBgLightness };
            currentRatio = getContrastRatio(adjustedFg, adjustedBg);
            adjustedThisIteration = true;
          }
        }

        // If neither color could be adjusted in this iteration, break to prevent infinite loops
        if (!adjustedThisIteration) {
          console.warn(
            `  WCAG Contrast Warning: Neither FG nor BG could be adjusted further for ${fgKey} vs ${bgKey}. Current Ratio: ${currentRatio}. Required: ${requiredRatio}. Stopping.`,
          );
          break;
        }
      }

      // Update the colors in the modified theme
      modifiedTheme.systemColors[fgKey] = adjustedFg;
      modifiedTheme.systemColors[bgKey] = adjustedBg;

      if (getContrastRatio(adjustedFg, adjustedBg) < requiredRatio) {
        console.warn(
          `WCAG Contrast Warning: Pair ${fgKey} vs ${bgKey} could not meet required ratio ${requiredRatio} after ${attempts} attempts. Final Ratio: ${getContrastRatio(adjustedFg, adjustedBg)}.`,
        );
      }
    }
  }

  // Return the modified theme if changes were made, otherwise return the original
  return changesMade ? modifiedTheme : theme;
}

/**
 * Generates CSS variable declarations for a given theme.
 * @param theme The Theme object.
 * @returns A CSS string with variable declarations.
 */
export function generateThemeCSS(theme: Theme): string {
  // Ensure systemColors and backgroundImages are objects before accessing entries.
  // This handles cases where they might be null, undefined, or other non-object types.
  const systemColors =
    theme?.system_colors &&
    typeof theme.system_colors === "object" &&
    !Array.isArray(theme.system_colors)
      ? theme.system_colors
      : {};
  const backgroundImages =
    theme?.background_images &&
    typeof theme.background_images === "object" &&
    !Array.isArray(theme.background_images)
      ? theme.background_images
      : {};

  const colorVariables = Object.entries(systemColors)
    .map(([key, value]) => {
      // Ensure value is a valid Color before converting
      if (!isValidColor(value)) {
        console.warn(
          `Skipping invalid color for key "${key}" in theme "${theme?.id}"`,
        );
        return ""; // Skip invalid color entries
      }
      // Convert snake_case keys to kebab-case for CSS variables
      return `--theme-${key.replace(/_/g, "-")}: ${hslToRawString(value)};`;
    })
    .filter((line) => line !== "") // Remove empty lines from skipped colors
    .join("\n  ");

  const backgroundImageVariables = Object.entries(backgroundImages)
    .map(([key, value]) => {
      // Ensure value is a string before using
      if (typeof value !== "string") {
        console.warn(
          `Skipping invalid background image URL for key "${key}" in theme "${theme?.id}"`,
        );
        return ""; // Skip invalid image entries
      }
      // Convert snake_case keys to kebab-case for CSS variables
      return `--lume-bg-${key.replace(/_/g, "-")}: url("${value}");`;
    })
    .filter((line) => line !== "") // Remove empty lines from skipped images
    .join("\n  ");

  // Add a check for theme.id in case theme itself is null/undefined, although the initial checks handle this.
  const themeId = theme?.id || "unknown";

  return `
:root.theme-${themeId} {
  ${colorVariables}
  ${backgroundImageVariables}
}
`;
}

/**
 * Calculates the contrast ratio between two colors.
 * Based on WCAG 2.x guidelines.
 * @param color1 The first Color object.
 * @param color2 The second Color object.
 * @returns The contrast ratio (1 to 21).
 */
export function getContrastRatio(color1: Color, color2: Color): number {
  const [r1, g1, b1] = hslToRgb(color1);
  const [r2, g2, b2] = hslToRgb(color2);

  const luminance1 = rgbToLuminance(r1, g1, b1);
  const luminance2 = rgbToLuminance(r2, g2, b2);

  // Add 0.05 to the luminance values to account for ambient light
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  // Calculate the contrast ratio
  const ratio = (lighter + 0.05) / (darker + 0.05);

  // Return ratio rounded to 2 decimal places
  return Math.round(ratio * 100) / 100;
}

/**
 * Finds a specific theme by its ID from a list of themes.
 * @param themes The array of available themes.
 * @param themeId The ID of the theme to find.
 * @returns The found Theme object or undefined if not found.
 */
export function getThemeById(
  themes: Theme[],
  themeId: string,
): Theme | undefined {
  return themes.find((t) => t.id === themeId);
}

/**
 * Converts a Hex color string (#RRGGBB or #RGB) to an HSL Color object.
 * @param hex The hex color string.
 * @returns An HSL Color object or undefined if the hex string is invalid.
 */
export function hexToHsl(hex: string): Color | undefined {
  // Validate hex string format (must start with # and be 3 or 6 hex characters)
  const hexMatch = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);

  if (!hexMatch) {
    console.error(`Invalid hex color format: ${hex}`);
    return undefined;
  }

  let cleanHex = hexMatch[1]; // Get the hex part without '#'

  // Expand 3-digit hex to 6-digit hex
  if (cleanHex.length === 3) {
    cleanHex =
      cleanHex[0] +
      cleanHex[0] +
      cleanHex[1] +
      cleanHex[1] +
      cleanHex[2] +
      cleanHex[2];
  }

  // Parse R, G, B values from the hex string
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Convert RGB to HSL using the rgbToHsl function
  // rgbToHsl already handles clamping, but parseInt should give valid numbers here
  return rgbToHsl(r, g, b);
}

/**
 * Converts a Color object to raw HSL values as a string.
 * @param color The Color object.
 * @returns A string in the format "hue, saturation%, lightness%".
 */
export function hslToRawString(color: Color): string {
  return `${color.hue}, ${color.saturation}%, ${color.lightness}%`;
}

/**
 * Converts an HSL Color object to RGB values (0-255).
 * Needed for calculating luminance for contrast ratio.
 * @param color The HSL Color object.
 * @returns An array [r, g, b] with values in the range [0, 255].
 */
export function hslToRgb(color: Color): [number, number, number] {
  const h = color.hue / 360;
  const s = color.saturation / 100;
  const l = color.lightness / 100;

  let b, g, r;

  if (s === 0) {
    r = g = b = l; // Achromatic (gray)
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts a Color object to a CSS HSL string.
 * @param color The Color object.
 * @returns A string in the format "hsl(hue, saturation%, lightness%)".
 */
export function hslToString(color: Color): string {
  return `hsl(${hslToRawString(color)})`;
}

/**
 * Checks if an object conforms to the BackgroundImages interface structure.
 * @param data The object to validate.
 * @returns True if the object is valid BackgroundImages, false otherwise.
 */
export function isValidBackgroundImages(data: any): data is BackgroundImages {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  // Get expected keys from the BackgroundImages interface
  const expectedKeys: (keyof BackgroundImages)[] = [
    "login",
    "register",
    "reset_password",
  ];

  // Check if all expected keys are present and their values are strings
  for (const key of expectedKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(data, key) ||
      typeof data[key] !== "string"
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if an object conforms to the Color interface structure.
 * @param data The object to validate.
 * @returns True if the object is a valid Color, false otherwise.
 */
export function isValidColor(data: any): data is Color {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.hue === "number" &&
    typeof data.saturation === "number" &&
    typeof data.lightness === "number"
    // Note: Range validation (0-360, 0-100) is typically done on the backend
    // or during configuration loading, not strictly required by the TS interface structure.
  );
}

/**
 * Checks if an object conforms to the SystemColors interface structure.
 * @param data The object to validate.
 * @returns True if the object is valid SystemColors, false otherwise.
 */
export function isValidSystemColors(data: any): data is SystemColors {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  // Get expected keys from the SystemColors interface
  const expectedKeys: (keyof SystemColors)[] = [
    "active_ui_element",
    "background",
    "borders",
    "high_contrast_text",
    "hovered_element_border",
    "hovered_solid_bg",
    "hovered_ui_element",
    "low_contrast_text",
    "solid_background",
    "subtle_background",
    "ui_element_background",
    "ui_element_border",
  ];

  // Check if all expected keys are present and their values are valid Colors
  for (const key of expectedKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(data, key) ||
      !isValidColor(data[key])
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Lightens a color by a given percentage.
 * @param color The Color object.
 * @param amount The percentage amount to lighten by (0-100).
 * @returns A new Color object.
 */
export function lightenColor(color: Color, amount: number): Color {
  const newLightness = clamp(color.lightness + amount, 0, 100);
  return { ...color, lightness: newLightness };
}

/**
 * Checks if the contrast ratio between two colors meets a specified WCAG level.
 * Assumes normal text size (not large text).
 * WCAG AA requires 4.5:1. WCAG AAA requires 7:1.
 * @param color1 The first Color object.
 * @param color2 The second Color object.
 * @param level The WCAG level to check against ('AA' or 'AAA').
 * @returns True if the contrast ratio meets the level, false otherwise.
 */
export function meetsWcagContrast(
  color1: Color,
  color2: Color,
  level: "AA" | "AAA",
): boolean {
  // This function is kept for backward compatibility but meetsWcagTextContrast is preferred
  // It assumes normal text size.
  return meetsWcagTextContrast(color1, color2, level, false);
}

/**
 * Checks if the contrast ratio between two colors meets the WCAG 2.1 SC 1.4.11 Non-text Contrast (AA) requirement.
 * This applies to graphical objects and user interface components.
 * @param color1 The first Color object (e.g., icon color, border color).
 * @param color2 The second Color object (e.g., adjacent background color).
 * @returns True if the contrast ratio is 3:1 or higher, false otherwise.
 */
export function meetsWcagNonTextContrast(
  color1: Color,
  color2: Color,
): boolean {
  const ratio = getContrastRatio(color1, color2);
  const requiredRatio = 3.0; // WCAG 2.1 SC 1.4.11 requires 3:1

  return ratio >= requiredRatio;
}

/**
 * Checks if the contrast ratio between two colors meets a specified WCAG level for text.
 * WCAG 2.x/2.1 SC 1.4.3 (Minimum) and SC 1.4.6 (Enhanced).
 * @param color1 The first Color object (e.g., text color).
 * @param color2 The second Color object (e.g., background color).
 * @param level The WCAG level to check against ('AA' or 'AAA').
 * @param isLargeText True if the text is considered "large text" by WCAG definition.
 * @returns True if the contrast ratio meets the level for the given text size, false otherwise.
 */
export function meetsWcagTextContrast(
  color1: Color,
  color2: Color,
  level: "AA" | "AAA",
  isLargeText: boolean,
): boolean {
  const ratio = getContrastRatio(color1, color2);

  let requiredRatio: number;
  if (isLargeText) {
    requiredRatio = level === "AAA" ? 4.5 : 3.0; // WCAG 2.x requirements for large text
  } else {
    requiredRatio = level === "AAA" ? 7.0 : 4.5; // WCAG 2.x requirements for normal text
  }

  return ratio >= requiredRatio;
}

/**
 * Merges properties from an overrides object into a base theme object.
 * Performs a deep merge for systemColors and backgroundImages.
 * @param base The base Theme object.
 * @param overrides The partial Theme object with overrides.
 * @returns A new Theme object with overrides applied.
 */
export function mergeThemes(
  base: Theme,
  overrides: Partial<Theme & { system_colors?: Partial<SystemColors> }>,
): Theme {
  // Start with a shallow copy of the base theme
  const mergedTheme: Theme = { ...base };

  // Apply top-level overrides (like name, default). ID should probably not be overridden.
  if (overrides.name !== undefined) mergedTheme.name = overrides.name;
  if (overrides.default !== undefined) mergedTheme.default = overrides.default;
  // Add any other top-level properties from overrides if needed, excluding 'id'

  // Deep merge systemColors
  if (overrides.system_colors) {
    mergedTheme.system_colors = {
      ...base.system_colors, // Start with base colors
      ...overrides.system_colors, // Apply overrides, including new ones
    };
  }
  // If overrides.systemColors is undefined, keep base.systemColors

  // Deep merge backgroundImages
  if (overrides.background_images) {
    mergedTheme.background_images = {
      ...base.background_images, // Start with base images
      ...overrides.background_images, // Apply overrides, including new ones
    };
  }

  return mergedTheme;
}

/**
 * Converts RGB values (0-255) to an HSL Color object.
 * @param r Red value (0-255).
 * @param g Green value (0-255).
 * @param b Blue value (0-255).
 * @returns An HSL Color object.
 */
export function rgbToHsl(r: number, g: number, b: number): Color {
  // Clamp R, G, B values to the range [0, 255]
  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);

  // Normalize R, G, B values to the range [0, 1]
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);

  let h = 0; // Hue
  let s = 0; // Saturation
  const l = (max + min) / 2; // Lightness

  // If max == min, the color is a shade of gray (achromatic)
  if (max !== min) {
    const d = max - min;
    // Calculate saturation
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    // Calculate hue
    switch (max) {
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
    }

    h /= 6; // Normalize hue to the range [0, 1]
  }

  // Convert H, S, L to the desired ranges (0-360 for H, 0-100 for S and L)
  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return { hue, lightness, saturation };
}

/**
 * Calculates the relative luminance of an RGB color.
 * Based on WCAG 2.x guidelines.
 * @param r Red value (0-255).
 * @param g Green value (0-255).
 * @param b Blue value (0-255).
 * @returns The relative luminance (0-1).
 */
export function rgbToLuminance(r: number, g: number, b: number): number {
  const channelLuminance = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };

  const lumR = channelLuminance(r);
  const lumG = channelLuminance(g);
  const lumB = channelLuminance(b);

  return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB;
}

/**
 * Saturates a color by a given percentage.
 * @param color The Color object.
 * @param amount The percentage amount to saturate by (0-100).
 * @returns A new Color object.
 */
export function saturateColor(color: Color, amount: number): Color {
  const newSaturation = clamp(color.saturation + amount, 0, 100);
  return { ...color, saturation: newSaturation };
}

/**
 * Validates if an object conforms to the Theme interface structure.
 * @param data The object to validate.
 * @returns True if the object is a valid Theme, false otherwise.
 */
export function validateTheme(data: any): data is Theme {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  // Check required top-level properties
  if (typeof data.id !== "string" || typeof data.name !== "string") {
    return false;
  }

  // Check nested structures
  if (!isValidSystemColors(data.systemColors)) {
    return false;
  }

  if (!isValidBackgroundImages(data.backgroundImages)) {
    return false;
  }

  // Optional properties like 'default' can be checked here if needed,
  // but the interface allows them to be missing or undefined.
  if (data.default !== undefined && typeof data.default !== "boolean") {
    return false;
  }

  return true;
}

/**
 * Clamps a value between a minimum and maximum.
 * @param value The value to clamp.
 * @param min The minimum allowed value.
 * @param max The maximum allowed value.
 * @returns The clamped value.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// Add other theme utility functions here as needed

/**
 * Merges properties from an overrides object into a base theme object.
 * Useful for applying partial theme customizations.
 * export function mergeThemes(base: Theme, overrides: Partial<Theme>): Theme { ... }
 */

/**
 * Validates if an object conforms to the Theme interface structure.
 * export function function validateTheme(theme: any): theme is Theme { ... }
 */
