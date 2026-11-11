import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`} className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-ink-700 shadow-sm hover:bg-surface-2">
    {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
  </button>;
}
