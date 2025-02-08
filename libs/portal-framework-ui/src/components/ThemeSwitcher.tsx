import { usePluginMeta } from "@/hooks/usePluginMeta";
// Import the hook that provides the setter
import { useThemeIdAndSetter } from "@/hooks/useTheme";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ThemeIcon,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

// Import Theme from the types file
import type { Theme } from "../types/theme";

export const ThemeSwitcher: React.FC = () => {
  // Get setTheme from the correct hook
  const { setTheme } = useThemeIdAndSetter();

  // Get themes list using the Theme type
  const themes = usePluginMeta<Theme[]>("dashboard", "themes");

  if (!themes) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <ThemeIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="flex flex-col space-y-2">
          {themes.map((t) => (
            <Button
              className="text-left"
              key={t.id}
              onClick={() => setTheme(t.id)}
              variant="ghost">
              {t.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
