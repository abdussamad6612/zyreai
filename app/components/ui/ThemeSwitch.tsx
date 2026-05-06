import { memo, useEffect, useState } from 'react';
import { IconButton } from './IconButton';

interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch = memo(({ className }: ThemeSwitchProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [domLoaded, setDomLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (stored) setTheme(stored);
    setDomLoaded(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    domLoaded && (
      <IconButton
        className={className}
        icon={theme === 'dark' ? 'i-ph-sun-dim-duotone' : 'i-ph-moon-stars-duotone'}
        size="xl"
        title="Toggle Theme"
        onClick={toggleTheme}
      />
    )
  );
});
