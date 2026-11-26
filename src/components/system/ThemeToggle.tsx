import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { THEME_STORAGE_KEY } from '@/lib/site';

type Theme = 'dark' | 'warm';

/** Dusk ⇄ golden hour. Same storage key as the legacy toggle so the choice carries over. */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>('dark');
  React.useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'warm' ? 'warm' : 'dark');
  }, []);

  const flip = () => {
    const next: Theme = theme === 'dark' ? 'warm' : 'dark';
    setTheme(next);
    if (next === 'warm') document.documentElement.dataset.theme = 'warm';
    else delete document.documentElement.dataset.theme;
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <Button variant="chrome" onClick={flip} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? <Moon className="size-3" /> : <Sun className="size-3" />}
      {theme === 'dark' ? 'dusk' : 'golden hour'}
    </Button>
  );
}
