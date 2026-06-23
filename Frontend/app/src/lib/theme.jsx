import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { preferences } from "../api/endpoints.js";
import { tokenStore } from "../api/client.js";

const ThemeCtx = createContext(null);
const KEY = "sp.theme";

function apply(theme) {
  if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(KEY);
    return saved === "dark" ? "dark" : "light";
  });

  // apply on mount + whenever it changes
  useEffect(() => { apply(theme); }, [theme]);

  // set + persist locally and (best-effort) to the user's server preferences
  const setTheme = useCallback((t, { persist = true } = {}) => {
    setThemeState(t);
    localStorage.setItem(KEY, t);
    apply(t);
    if (persist && tokenStore.get()) {
      preferences.update({ theme: t }).catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  // sync from server preference without re-persisting (call after login)
  const syncFromServer = useCallback((t) => {
    if (t && t !== localStorage.getItem(KEY)) { setThemeState(t); localStorage.setItem(KEY, t); apply(t); }
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggle, syncFromServer }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
