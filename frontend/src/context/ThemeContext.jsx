import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('academix-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    // Use data-theme attribute on <html> — cleaner than class-based toggles
    // and works with both CSS variables and Tailwind's darkMode: 'class'
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('academix-theme', theme);
    } catch {
      // storage not available
    }
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
