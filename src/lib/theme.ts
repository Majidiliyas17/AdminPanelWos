import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "wos.admin.theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem(KEY) === "dark" ? "dark" : "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      "content",
    theme === "dark" ? "#070b13" : "#F5F6FA",
    );
  }, [theme]);
  return { theme, toggleTheme: () => setTheme((current) => current === "light" ? "dark" : "light") };
}
