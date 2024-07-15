import { useEffect } from "react";
import { ThemeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBaseStore } from "@/store/baseStore";
import usePluginMeta from "@/hooks/usePluginMeta";

export interface Color {
  hue: number;
  saturation: number;
  lightness: number;
}

export interface SystemColors {
  background: Color;
  subtle_background: Color;
  ui_element_background: Color;
  hovered_ui_element: Color;
  active_ui_element: Color;
  borders: Color;
  ui_element_border: Color;
  hovered_element_border: Color;
  solid_background: Color;
  hovered_solid_bg: Color;
  low_contrast_text: Color;
  high_contrast_text: Color;
}

export interface BackgroundImages {
  register: string;
  reset_password: string;
  login: string;
}

export interface Theme {
  name: string;
  id: string;
  system_colors: SystemColors;
  background_images: BackgroundImages;
  default?: boolean;
}

export const ThemeSwitcher: React.FC = () => {
  const { setTheme } = useTheme();

  const themes: Theme[] = usePluginMeta("dashboard", "themes")!;

  if (!themes) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <ThemeIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col space-y-2">
          {themes.map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              onClick={() => setTheme(t.id)}
              className="text-left">
              {t.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
 * 1. Retrieves the current theme from the global app store.
 * 2. Uses an effect to apply the theme by manipulating the document's root element classes.
 * 3. Wraps the provided component, passing through all props.
 *
 * @param Component - The React component to be wrapped.
 * @returns A new component with theme management capabilities.
 */
export const withTheme = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function WithTheme(props: P) {
    const { theme } = useTheme();
    const themes: Theme[] = usePluginMeta("dashboard", "themes")!;

    useEffect(() => {
      if (!themes) {
        return;
      }
      const selectedTheme = themes.find((t) => t.id === theme);
      if (selectedTheme) {
        applyTheme(selectedTheme);
      } else {
        const defaultTheme = themes.find((t) => t.default);
        if (defaultTheme) {
          applyTheme(defaultTheme);
        } else if (themes.length > 0) {
          applyTheme(themes[0]);
        }
      }
    }, [theme, themes]);

    return <Component {...props} />;
  };
};

export const useTheme = () => {
  const theme = useBaseStore((state) => state.theme);
  const setTheme = useBaseStore((state) => state.setTheme);

  return {
    theme,
    setTheme,
  };
};

function colorToHSL(color: Color): string {
  return `${color.hue} ${color.saturation}% ${color.lightness}%`;
}

function generateThemeCSS(theme: Theme): string {
  const { system_colors, background_images } = theme;

  const colorVariables = Object.entries(system_colors)
    .map(([key, value]) => {
      return `--${key}: ${colorToHSL(value)};`;
    })
    .join("\n  ");

  const backgroundImageVariables = Object.entries(background_images)
    .map(([key, value]) => {
      return `--lume-bg-${key}: url("${value}");`;
    })
    .join("\n  ");

  return `
:root.theme-${theme.id} {
  ${colorVariables}
  ${backgroundImageVariables}
}
`;
}

export function applyTheme(theme: Theme) {
  const css = generateThemeCSS(theme);

  // Create a new style element
  const style = document.createElement("style");
  style.textContent = css;

  // Remove any existing theme styles
  const existingStyle = document.head.querySelector("style[data-theme]");
  if (existingStyle) {
    document.head.removeChild(existingStyle);
  }

  // Add the new style element to the head
  style.setAttribute("data-theme", theme.id);
  document.head.appendChild(style);

  // Set the theme class on the html element
  document.documentElement.className = `theme-${theme.id}`;
}
