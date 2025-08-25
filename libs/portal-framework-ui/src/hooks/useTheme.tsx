import React, { useEffect } from "react";

import { useUIStore } from "@/store/uiStore";
import { getThemeById } from "@/utils/theme";

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
  const { theme: selectedThemeId } = useThemeIdAndSetter();
  const themes = usePluginMeta<Theme[]>("dashboard", "themes");

  // First, try to use the persisted theme from the store
  if (selectedThemeId && Array.isArray(themes) && themes.length > 0) {
    const persistedTheme = getThemeById(themes, selectedThemeId);
    if (persistedTheme) {
      return persistedTheme;
    }
  }

  // Fallback to original logic if no persisted theme found or selectedThemeId is not set yet
  if (!themes || themes.length === 0) {
    return undefined;
  }

  let theme = getThemeById(themes, selectedThemeId);

  if (!theme) {
    theme = themes.find((t) => t.default);
  }

  if (!theme && themes.length > 0) {
    theme = themes[0];
  }

  return theme;
};

export const withTheme = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function WithTheme(props: P) {
    const { theme: selectedThemeId } = useThemeIdAndSetter();
    const themes = usePluginMeta<Theme[]>("dashboard", "themes");

    useEffect(() => {
      if (!themes || !Array.isArray(themes) || themes.length === 0) {
        return;
      }

      // First, try to use the persisted theme
      if (selectedThemeId) {
        const persistedTheme = getThemeById(themes, selectedThemeId);
        if (persistedTheme) {
          applyThemeStyles(persistedTheme);
          return;
        }
      }

      // Fallback to original logic if no persisted theme found
      const themeToApply =
        getThemeById(themes, selectedThemeId) ||
        themes.find((t) => t.default) ||
        themes[0];

      if (themeToApply) {
        applyThemeStyles(themeToApply);
      } else {
        console.warn("No theme found to apply.");
      }
    }, [selectedThemeId, themes]);

    return <Component {...props} />;
  };
};
