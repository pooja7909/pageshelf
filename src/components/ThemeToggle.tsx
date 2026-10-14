import React, { useEffect, useState } from 'react';
import { ThemeMode } from '../types';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ps.theme') as ThemeMode) || 'auto';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('ps.theme', theme);
  }, [theme]);

  return (
    <div className="theme" role="group" aria-label="Colour theme">
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme('auto')}
        aria-pressed={theme === 'auto'}
      >
        Auto
      </button>
    </div>
  );
};
