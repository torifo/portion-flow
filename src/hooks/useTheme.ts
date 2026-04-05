import { useState, useEffect } from 'react';
import type { ThemeName } from '../types';
import { applyTheme } from '../theme';

const LS_THEME_KEY = 'portion-flow-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(LS_THEME_KEY) as ThemeName | null;
    return saved ?? 'standard';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(LS_THEME_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
  };

  return { theme, setTheme };
}
