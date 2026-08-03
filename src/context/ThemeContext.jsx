import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const MANUAL_THEME_KEY = 'nova_study_manual_theme_v1';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [isAuto, setIsAuto] = useState(true);

  // Determine current theme based on timezone local time
  const getAutoTheme = () => {
    try {
      const now = new Date();
      // Get hour in local timezone (e.g. Tashkent GMT+5 or Seoul GMT+9)
      const currentHour = now.getHours();
      // Day time: 7:00 AM (07) to 7:00 PM (19) -> Light theme
      // Night time: 7:00 PM (19) to 7:00 AM (07) -> Dark theme
      if (currentHour >= 7 && currentHour < 19) {
        return 'light';
      } else {
        return 'dark';
      }
    } catch (e) {
      return 'dark';
    }
  };

  const evaluateTheme = () => {
    const stored = localStorage.getItem(MANUAL_THEME_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        // Check if 6 hours expired
        if (parsed.expiresAt && now < parsed.expiresAt) {
          setTheme(parsed.theme);
          setIsAuto(false);
          document.body.className = parsed.theme + '-theme';
          return;
        } else {
          // Expired -> remove manual override
          localStorage.removeItem(MANUAL_THEME_KEY);
        }
      } catch (e) {
        localStorage.removeItem(MANUAL_THEME_KEY);
      }
    }

    // Default: Automatic Timezone-based theme
    const autoTheme = getAutoTheme();
    setTheme(autoTheme);
    setIsAuto(true);
    document.body.className = autoTheme + '-theme';
  };

  useEffect(() => {
    evaluateTheme();

    // Re-evaluate every 10 minutes to auto-switch at 7:00 AM / 7:00 PM
    const interval = setInterval(evaluateTheme, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const expiresAt = Date.now() + SIX_HOURS_MS;

    const manualData = {
      theme: nextTheme,
      expiresAt: expiresAt
    };

    localStorage.setItem(MANUAL_THEME_KEY, JSON.stringify(manualData));
    setTheme(nextTheme);
    setIsAuto(false);
    document.body.className = nextTheme + '-theme';
  };

  return (
    <ThemeContext.Provider value={{ theme, isAuto, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
