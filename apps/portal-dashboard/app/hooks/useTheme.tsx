import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { ThemeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore } from "@/stores/app";

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <ThemeIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-2">
          <Button
            variant={theme === "theme-blue" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setTheme("theme-blue")}>
            Blue {theme === "theme-blue" && "•"}
          </Button>
          <Button
            variant={theme === "theme-eclipse" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setTheme("theme-eclipse")}>
            Eclipse {theme === "theme-eclipse" && "•"}
          </Button>
          {/* <Button
            variant={theme === "theme-custom" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setTheme("theme-custom")}>
            Custom {theme === "theme-custom" && "•"}
          </Button> */}
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

    useEffect(() => {
      // Remove any existing theme classes
      for (const item of Array.from(document.documentElement.classList)) {
        if (item.startsWith("theme-")) {
          document.documentElement.classList.remove(item);
        }
      }
      // Add the current theme class
      document.documentElement.classList.add(theme);
    }, [theme]);

    return <Component {...props} />;
  };
};

export const useTheme = () => {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  return {
    theme,
    setTheme,
  };
};
