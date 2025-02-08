import { useUIStore } from "@/store/uiStore";
import { getThemeById } from "@/utils/theme";
import React, { useEffect } from "react";

// Import Theme from the new types file
import type { Theme } from "../types/theme";

import { applyThemeStyles } from "../utils/theme";
import { usePluginMeta } from "./usePluginMeta";
/**
 * Higher-Order Component (HoC) for managing theme application at the root level.
 *
 * This HoC is used to control the theme for the Root component, ensuring proper
 * theme management throughout the application. It's an alternative to using
 * React Context, which is the current best practice, but we've chosen a different
 * approach here with global state management.
 *
 * Wrapping a component in this HoC will ensure that the theme is applied to the
 * <html> element of the page, so this HoC should be used for the Root component
 * only.
 *
 * The HoC:
 * 1. Retrieves the current theme ID from the global app store using useThemeIdAndSetter.
 * 2. Retrieves the list of available themes from plugin metadata using usePluginMeta.
 * 3. Uses an effect to find the selected or default theme and apply it using the utility function.
 * 4. Wraps the provided component, passing through all props.
 *
 * @param Component - The React component to be wrapped.
 * @returns A new component with theme management capabilities.
 */

/**
 * Hook to get the currently selected theme ID and the setter function.
 * This hook directly uses the UI store.
 */
export const useThemeIdAndSetter = () => {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  return {
    setTheme,
    theme, // This is the theme ID string
  };
};

/**
 * Hook to get the full Theme object based on the selected theme ID and available themes from meta.
 */
export const useTheme = (): Theme | undefined => {
  const { theme: selectedThemeId } = useThemeIdAndSetter(); // Use the correct hook
  const themes = usePluginMeta<Theme[]>("dashboard", "themes"); // Get available themes

  // Find the theme object based on the selected ID or fallback logic
  if (!themes || themes.length === 0) {
    return undefined; // No themes available yet or array is empty
  }

  let theme = getThemeById(themes, selectedThemeId);

  if (!theme) {
    theme = themes.find((t) => t.default);
  }

  if (!theme && themes.length > 0) {
    theme = themes[0];
  }

  return theme; // Return the found theme object
};

export const withTheme = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function WithTheme(props: P) {
    const { theme: selectedThemeId } = useThemeIdAndSetter();

    const themes = usePluginMeta<Theme[]>("dashboard", "themes");

    useEffect(() => {
      if (!themes) {
        return;
      }

      const themeToApply =
        getThemeById(themes, selectedThemeId) ||
        themes.find((t) => t.default) ||
        (themes.length > 0 ? themes[0] : null);

      if (themeToApply) {
        applyThemeStyles(themeToApply);
      } else {
        console.warn("No theme found to apply.");
      }
    }, [selectedThemeId, themes]);

    return <Component {...props} />;
  };
};
