import { useEffect } from "react";
import { ThemeIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useAppStore } from "~/stores/app";

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

export const useTheme = () => {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  useEffect(() => {
    document.documentElement.classList.forEach((item) => {
      if (item.startsWith("theme-")) {
        document.documentElement.classList.remove(item);
      }
    });
    document.documentElement.classList.add(theme);
  }, [theme]);

  return {
    theme,
    setTheme,
  };
};
